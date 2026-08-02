# -*- coding: utf-8 -*-
"""Prepara o brasão da paróquia para uso no site.

Gera duas versões com fundo transparente em public/fotos/:
  brasao.webp        — brasão completo (página "A Paróquia")
  brasao-escudo.webp — só o escudo, que continua legível em tamanho pequeno
                       (cabeçalho, rodapé e favicon)

O fundo é removido por preenchimento a partir das bordas, e não por "apagar
todo pixel branco" — assim os brancos internos (a fita, a metade de baixo do
escudo e as nuvens) são preservados.
"""
from collections import deque
from pathlib import Path
from PIL import Image, ImageFilter

ORIGEM = Path(r"C:\Users\msilv\Documents\PASCOM\fotos site\WhatsApp Image 2026-08-01 at 22.38.44.jpeg")
DESTINO = Path("public/fotos")
LIMITE_CLARO = 232  # a partir daqui o pixel conta como "fundo branco"


def remover_fundo(imagem: Image.Image) -> Image.Image:
    imagem = imagem.convert("RGBA")
    largura, altura = imagem.size
    pixels = imagem.load()

    def eh_fundo(x, y):
        r, g, b, _ = pixels[x, y]
        return r >= LIMITE_CLARO and g >= LIMITE_CLARO and b >= LIMITE_CLARO

    # Preenchimento a partir de todas as bordas
    visitados = bytearray(largura * altura)
    fila = deque()
    for x in range(largura):
        for y in (0, altura - 1):
            if eh_fundo(x, y):
                fila.append((x, y))
                visitados[y * largura + x] = 1
    for y in range(altura):
        for x in (0, largura - 1):
            if eh_fundo(x, y) and not visitados[y * largura + x]:
                fila.append((x, y))
                visitados[y * largura + x] = 1

    while fila:
        x, y = fila.popleft()
        pixels[x, y] = (255, 255, 255, 0)
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < largura and 0 <= ny < altura:
                indice = ny * largura + nx
                if not visitados[indice] and eh_fundo(nx, ny):
                    visitados[indice] = 1
                    fila.append((nx, ny))

    # Suaviza a borda recortada para não ficar serrilhada
    alfa = imagem.getchannel("A").filter(ImageFilter.GaussianBlur(0.6))
    imagem.putalpha(alfa)
    return imagem


def manter_maior_peca(imagem: Image.Image) -> Image.Image:
    """Apaga pedaços soltos, deixando só a maior figura conectada.

    No recorte do escudo sobram pontas da fita que passa por trás dele; como
    não encostam no escudo, saem por aqui sem precisar cortar a imagem.
    """
    largura, altura = imagem.size
    alfa = imagem.getchannel("A").load()
    visitados = bytearray(largura * altura)
    maior: list[tuple[int, int]] = []

    for inicio_y in range(altura):
        for inicio_x in range(largura):
            if visitados[inicio_y * largura + inicio_x] or alfa[inicio_x, inicio_y] <= 8:
                continue
            peca, fila = [], deque([(inicio_x, inicio_y)])
            visitados[inicio_y * largura + inicio_x] = 1
            while fila:
                x, y = fila.popleft()
                peca.append((x, y))
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < largura and 0 <= ny < altura:
                        indice = ny * largura + nx
                        if not visitados[indice] and alfa[nx, ny] > 8:
                            visitados[indice] = 1
                            fila.append((nx, ny))
            if len(peca) > len(maior):
                maior = peca

    manter = set(maior)
    pixels = imagem.load()
    for y in range(altura):
        for x in range(largura):
            if alfa[x, y] > 8 and (x, y) not in manter:
                pixels[x, y] = (255, 255, 255, 0)
    return imagem


def recortar_conteudo(imagem: Image.Image, margem: int = 8) -> Image.Image:
    caixa = imagem.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
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
completo = recortar_conteudo(remover_fundo(Image.open(ORIGEM)))
salvar(completo, "brasao.webp", 900)

# O escudo ocupa a faixa central; a fita e a haste da cruz somem em miniatura.
l, a = completo.size
escudo = completo.crop((round(l * 0.235), round(a * 0.245), round(l * 0.765), round(a * 0.792)))
salvar(recortar_conteudo(manter_maior_peca(escudo), margem=4), "brasao-escudo.webp", 480)
