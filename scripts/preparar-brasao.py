# -*- coding: utf-8 -*-
"""Prepara o brasão da paróquia para uso no site.

Fonte: PNG enviado pela secretaria. O arquivo NÃO tem transparência real —
o fundo "xadrez" que aparece ao abrir em um visualizador está gravado nos
próprios pixels (branco ~255 e cinza ~198 alternados), não é canal alfa.
Por isso removemos o fundo por preenchimento a partir das bordas, capturando
as duas tonalidades do quadriculado, e preservamos os brancos internos do
desenho (fita, base do escudo) que não tocam a borda da imagem.

Sobram as bolsas de xadrez cercadas pelo próprio desenho — a maior fica entre
a base do escudo e a fita, fechada pelo contorno dourado em cima e pela fita
embaixo, onde o preenchimento vindo da borda nunca chega. Uma segunda passada
cuida delas (ver `remover_bolsas_de_xadrez`).

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


# Um trecho de xadrez tem os DOIS tons em quantidade parecida; um trecho do
# desenho, não. A prata do escudo e a fita ficam em tons médios (~211 a ~234)
# e quase não tocam o 198; a hóstia do IHS é branco puro. Medido no brasão
# real: as bolsas de xadrez têm 33% a 44% de cada tom, e nenhuma outra região
# passa de 0,7% no tom escuro. O corte em 15% fica folgado dos dois lados.
TOM_ESCURO, TOM_CLARO = 198, 255
TOLERANCIA_TOM = 6
FRACAO_MINIMA_DE_CADA_TOM = 0.15
MENOR_BOLSA = 200  # em pixels; abaixo disso é ruído de borda, não bolsa


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

    remover_bolsas_de_xadrez(px, ap, w, h)

    saida = imagem_rgb.convert("RGBA")
    # O desfoque vem depois das duas passadas, para suavizar também a borda
    # das bolsas removidas.
    alfa = alfa.filter(ImageFilter.GaussianBlur(0.7))
    saida.putalpha(alfa)
    return saida


def remover_bolsas_de_xadrez(px, ap, w: int, h: int) -> None:
    """Apaga o xadrez que ficou cercado pelo desenho e o preenchimento vindo
    da borda não alcançou.

    Não basta procurar "cinza claro": a metade de baixo do escudo é prateada
    e cairia na mesma peneira. O que distingue o quadriculado é ser bimodal —
    ele alterna dois tons fixos, enquanto o desenho é degradê. Por isso a
    decisão é por região inteira, e não pixel a pixel.
    """
    visitado = bytearray(w * h)
    removidas = 0

    for inicio_y in range(h):
        for inicio_x in range(w):
            if visitado[inicio_y * w + inicio_x]:
                continue
            if ap[inicio_x, inicio_y] == 0 or not eh_fundo(*px[inicio_x, inicio_y][:3]):
                continue

            # Junta a região conectada. Casas claras e escuras do xadrez se
            # tocam pelas laterais, então a bolsa inteira vem numa peça só.
            fila = deque([(inicio_x, inicio_y)])
            visitado[inicio_y * w + inicio_x] = 1
            regiao = []
            escuros = claros = 0

            while fila:
                x, y = fila.popleft()
                regiao.append((x, y))

                tom = min(px[x, y][:3])
                if abs(tom - TOM_ESCURO) <= TOLERANCIA_TOM:
                    escuros += 1
                elif tom >= TOM_CLARO - TOLERANCIA_TOM:
                    claros += 1

                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h:
                        i = ny * w + nx
                        if visitado[i] or ap[nx, ny] == 0:
                            continue
                        if eh_fundo(*px[nx, ny][:3]):
                            visitado[i] = 1
                            fila.append((nx, ny))

            total = len(regiao)
            if total < MENOR_BOLSA:
                continue

            limite = FRACAO_MINIMA_DE_CADA_TOM * total
            if escuros >= limite and claros >= limite:
                for x, y in regiao:
                    ap[x, y] = 0
                removidas += 1
                print(
                    f"  bolsa de xadrez removida: {total} px "
                    f"({escuros / total:.0%} escuro, {claros / total:.0%} claro)"
                )

    if not removidas:
        print("  nenhuma bolsa de xadrez encontrada")


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
