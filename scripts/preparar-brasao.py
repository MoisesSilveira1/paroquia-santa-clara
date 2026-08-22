# -*- coding: utf-8 -*-
"""Prepara o brasão da paróquia para uso no site.

Fonte: PNG enviado pela secretaria. O arquivo NÃO tem transparência real —
o fundo "xadrez" que aparece ao abrir em um visualizador está gravado nos
próprios pixels (branco ~255 e cinza ~198 alternados), não é canal alfa.
Por isso removemos o fundo por preenchimento a partir das bordas, capturando
as duas tonalidades do quadriculado, e preservamos os brancos internos do
desenho (fita, base do escudo) que não tocam a borda da imagem.

Gera duas versões em public/fotos/:
  brasao.webp        — brasão completo (página "A Paróquia")
  brasao-escudo.webp — só o escudo, que continua legível em tamanho pequeno
                       (cabeçalho, rodapé e favicon)
"""
from collections import deque
from pathlib import Path
from PIL import Image, ImageFilter

ORIGEM = Path(r"C:\Users\msilv\Documents\PASCOM\fotos site\brasão sem fundo.png")
DESTINO = Path("public/fotos")

# Recorte do escudo sozinho (sem a fita nem a cruz), calibrado visualmente
# como fração do brasão completo já aparado.
ESCUDO_CAIXA = (0.218, 0.223, 0.782, 0.795)  # esquerda, topo, direita, base


def eh_fundo(r: int, g: int, b: int) -> bool:
    # tons de cinza claro (quadriculado ~198 e ~255), tolerando leve variação
    cinza = max(r, g, b) - min(r, g, b) <= 10
    return cinza and min(r, g, b) >= 175


def remover_fundo(imagem_rgb: Image.Image) -> Image.Image:
    """Preenchimento a partir das bordas: só remove o fundo que está
    conectado à borda da imagem, preservando brancos internos do desenho."""
    w, h = imagem_rgb.size
    px = imagem_rgb.load()
    alfa = Image.new("L", (w, h), 255)
    ap = alfa.load()

    visitado = bytearray(w * h)
    fila = deque()

    def enfileirar(x, y):
        i = y * w + x
        if not visitado[i] and eh_fundo(*px[x, y][:3]):
            visitado[i] = 1
            fila.append((x, y))

    for x in range(w):
        enfileirar(x, 0)
        enfileirar(x, h - 1)
    for y in range(h):
        enfileirar(0, y)
        enfileirar(w - 1, y)

    while fila:
        x, y = fila.popleft()
        ap[x, y] = 0
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h:
                enfileirar(nx, ny)

    saida = imagem_rgb.convert("RGBA")
    alfa = alfa.filter(ImageFilter.GaussianBlur(0.7))
    saida.putalpha(alfa)
    return saida


def recortar_conteudo(imagem: Image.Image, margem: int = 8) -> Image.Image:
    caixa = imagem.getchannel("A").point(lambda v: 255 if v > 12 else 0).getbbox()
    esq, topo, dir_, base = caixa
    return imagem.crop(
        (
            max(0, esq - margem),
            max(0, topo - margem),
            min(imagem.width, dir_ + margem),
            min(imagem.height, base + margem),
        )
    )


def salvar(imagem: Image.Image, nome: str, largura_maxima: int):
    if imagem.width > largura_maxima:
        altura = round(imagem.height * largura_maxima / imagem.width)
        imagem = imagem.resize((largura_maxima, altura), Image.LANCZOS)
    caminho = DESTINO / nome
    imagem.save(caminho, "WEBP", quality=92, method=6)
    print(f"  {caminho}  {imagem.width}x{imagem.height}  {caminho.stat().st_size / 1024:.0f} KB")


DESTINO.mkdir(parents=True, exist_ok=True)

fonte = Image.open(ORIGEM).convert("RGB")
sem_fundo = remover_fundo(fonte)
completo = recortar_conteudo(sem_fundo)
salvar(completo, "brasao.webp", 900)

# O escudo ocupa a faixa central; a fita e a haste da cruz somem em miniatura.
l, a = completo.size
esq, topo, dir_, base = ESCUDO_CAIXA
escudo = completo.crop((round(l * esq), round(a * topo), round(l * dir_), round(a * base)))
salvar(recortar_conteudo(escudo, margem=4), "brasao-escudo.webp", 480)
