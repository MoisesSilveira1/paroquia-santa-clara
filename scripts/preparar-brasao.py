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

⚠️ DEPOIS DE RODAR ESTE SCRIPT, LIMPE O CACHE DE IMAGENS DO NEXT:

    rm -rf .next/dev/cache/images     (e reinicie o servidor)

O otimizador do Next guarda a imagem processada com a URL como chave, e a URL
não muda quando o arquivo muda. Sem limpar, o navegador continua recebendo a
versão ANTIGA — foi o que aconteceu em 03/09/2026: o arquivo no disco já
estava certo e a tela ainda mostrava o escudo cortado. Conferir o arquivo não
prova nada; o que vale é conferir o que a rota `/_next/image` devolve.

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

# Recorte do escudo sozinho (sem a fita nem a cruz), como fração do brasão
# completo já aparado.
#
# Os quatro valores foram MEDIDOS no brasão de 900x1109, não estimados
# (03/09/2026):
#
#   topo    y=301  — primeira linha com mais de 150 px de largura, ou seja,
#                    onde as abas do escudo começam. Acima disso só há a haste
#                    da cruz, com seus ~35 px no centro.
#   base    y=912  — a ponta. Varrendo o miolo linha a linha, o escudo afina
#                    até 38 px em y=910 e a linha seguinte já alarga para 300:
#                    isso é a fita, não o escudo.
#   lados   x=203 a 695 na altura mais larga (y=420), varrendo do centro para
#                    fora até achar transparência.
#
# A caixa é folgada nas laterais de propósito: com folga entram lascas da
# fita, que `manter_maior_peca` remove por não estarem grudadas no escudo.
# Sem folga, o recorte come a borda dourada.
#
# O valor anterior (0,218 / 0,223 / 0,782 / 0,823) começava 54 px ACIMA do
# escudo, o que trazia junto um toco da haste da cruz, e terminava em cima da
# ponta, sem sobra nenhuma.
ESCUDO_CAIXA = (0.200, 0.270, 0.800, 0.8235)  # esquerda, topo, direita, base

# Margem transparente ao redor da figura, em fração do maior lado.
#
# Precisa ser acrescentada, e não apenas "não cortada": `recortar_conteudo`
# recorta DENTRO da imagem, então quando o desenho encosta na borda não há de
# onde tirar respiro. Sem isso o escudo fica espremido contra o azul do rodapé
# e a borda serrilhada some.
MARGEM_AO_REDOR = 0.03


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


def manter_trecho_central(imagem: Image.Image) -> Image.Image:
    """Em cada linha, fica só com o trecho contínuo que passa pelo centro.

    A fita passa POR TRÁS do escudo e reaparece nos cantos de baixo. Nesses
    pontos ela ENCOSTA no escudo, então `manter_maior_peca` sozinha não
    resolve: as duas viram uma peça só, e o pedaço da fita com as letras
    "…TA CLARA…" ficava no canto inferior esquerdo.

    O escudo, porém, é uma figura cheia em volta do centro. Varrendo cada
    linha do meio para fora até achar transparência, sai exatamente ele — e o
    que estiver separado por qualquer vão some. Onde a fita encosta de fato
    sobram lascas soltas, que `manter_maior_peca` remove logo depois.
    """
    largura, altura = imagem.size
    alfa = imagem.getchannel("A").load()
    pixels = imagem.load()
    meio = largura // 2
    apagados = 0

    for y in range(altura):
        if alfa[meio, y] <= 12:
            # Linha sem escudo no centro: o que houver ali é outra coisa.
            limite_esquerdo, limite_direito = -1, largura
        else:
            limite_esquerdo = meio
            while limite_esquerdo > 0 and alfa[limite_esquerdo - 1, y] > 12:
                limite_esquerdo -= 1
            limite_direito = meio
            while limite_direito < largura - 1 and alfa[limite_direito + 1, y] > 12:
                limite_direito += 1

        for x in range(largura):
            if alfa[x, y] > 12 and (x < limite_esquerdo or x > limite_direito):
                pixels[x, y] = (255, 255, 255, 0)
                apagados += 1

    print(f"  fita fora do escudo removida: {apagados} px")
    return imagem


def manter_maior_peca(imagem: Image.Image) -> Image.Image:
    """Apaga pedaços soltos, deixando só a maior figura conectada.

    O recorte do escudo precisa descer até a ponta de baixo, e nessa altura a
    fita já subiu pelas laterais — então sobram lascas dela nos cantos. Como a
    fita passa POR TRÁS do escudo, essas lascas não encostam nele: saem por
    aqui, sem precisar cortar mais a imagem e mutilar a ponta de novo.
    """
    largura, altura = imagem.size
    alfa = imagem.getchannel("A").load()
    visitado = bytearray(largura * altura)
    maior: list[tuple[int, int]] = []

    for inicio_y in range(altura):
        for inicio_x in range(largura):
            if visitado[inicio_y * largura + inicio_x] or alfa[inicio_x, inicio_y] <= 12:
                continue
            fila = deque([(inicio_x, inicio_y)])
            visitado[inicio_y * largura + inicio_x] = 1
            peca = []
            while fila:
                x, y = fila.popleft()
                peca.append((x, y))
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < largura and 0 <= ny < altura:
                        i = ny * largura + nx
                        if not visitado[i] and alfa[nx, ny] > 12:
                            visitado[i] = 1
                            fila.append((nx, ny))
            if len(peca) > len(maior):
                maior = peca

    manter = set(maior)
    pixels = imagem.load()
    apagados = 0
    for y in range(altura):
        for x in range(largura):
            if alfa[x, y] > 12 and (x, y) not in manter:
                pixels[x, y] = (255, 255, 255, 0)
                apagados += 1
    print(f"  lascas da fita removidas: {apagados} px soltos")
    return imagem


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


def com_margem(imagem: Image.Image, fracao: float = MARGEM_AO_REDOR) -> Image.Image:
    """Cola a figura no meio de uma tela transparente um pouco maior."""
    folga = round(max(imagem.size) * fracao)
    tela = Image.new("RGBA", (imagem.width + folga * 2, imagem.height + folga * 2), (255, 255, 255, 0))
    tela.paste(imagem, (folga, folga), imagem)
    return tela


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
salvar(com_margem(completo), "brasao.webp", 900)

# O escudo ocupa a faixa central; a fita e a haste da cruz somem em miniatura.
l, a = completo.size
esq, topo, dir_, base = ESCUDO_CAIXA
escudo = completo.crop((round(l * esq), round(a * topo), round(l * dir_), round(a * base)))
escudo = manter_maior_peca(manter_trecho_central(escudo))
salvar(com_margem(recortar_conteudo(escudo, margem=4)), "brasao-escudo.webp", 480)
