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
# ⚠️ Se você mudar o arquivo de origem, MEÇA DE NOVO. Estes valores são
# frações, mas foram deduzidos de medidas em pixels de UM desenho específico.
#
# Medidas do brasão atual, já sem fundo e aparado — 1564 x 1932 (11/09/2026).
# Varrendo a coluna central (x=782) de cima para baixo:
#
#   topo   y≈530   — onde as abas do escudo começam a alargar. Acima disso só
#                    há a haste da cruz, com seus ~58 px no centro.
#   ponta  y=1680  — o fim da borda dourada de baixo, que ocupa y=1584..1680.
#                    Abaixo dela vem a fita (cinza, y≈1680..1830) e depois o
#                    remate da haste (dourado de novo, y≈1840 até o fim).
#   lados  x=321 a 1238 na altura mais larga (y≈672).
#
# A base de 0,875 (y≈1690) cai no vão entre a ponta e a fita.
#
# O valor anterior era 0,8235 — ou seja, y=1591, DENTRO da borda dourada de
# baixo. Era isso que deixava a ponta do escudo cortada reta, como se alguém
# tivesse serrado o brasão. O comentário que estava aqui citava medidas de um
# brasão de 900x1109 que já não é o arquivo de origem: as frações vinham de
# uma régua antiga aplicada a um desenho novo.
ESCUDO_CAIXA = (0.200, 0.270, 0.800, 0.875)  # esquerda, topo, direita, base

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


def larguras_centrais(imagem: Image.Image) -> list[int]:
    """Para cada linha, a largura do trecho contínuo que passa pelo centro."""
    largura, altura = imagem.size
    alfa = imagem.getchannel("A").load()
    meio = largura // 2
    perfil = []

    for y in range(altura):
        if alfa[meio, y] <= 12:
            perfil.append(0)
            continue
        esq = meio
        while esq > 0 and alfa[esq - 1, y] > 12:
            esq -= 1
        dir_ = meio
        while dir_ < largura - 1 and alfa[dir_ + 1, y] > 12:
            dir_ += 1
        perfil.append(dir_ - esq + 1)

    return perfil


# Quantas linhas seguidas de largura idêntica bastam para dizer "isto é haste,
# não escudo". Cinco: menos que isso confunde com um trecho onde a curva do
# escudo passa quase na horizontal.
LINHAS_PARA_DIZER_QUE_E_HASTE = 5
# Abaixo desta fração da largura máxima é fino o bastante para ser haste.
FRACAO_DE_HASTE = 0.20


def cortar_na_ponta(imagem: Image.Image) -> Image.Image:
    """Corta tudo o que sai por baixo da ponta do escudo.

    Por baixo do escudo passa a haste da cruz, e depois dela vem a fita. As
    duas encostam no escudo, então nem `manter_trecho_central` nem
    `manter_maior_peca` as separam — para ambas é tudo uma peça só.

    O que separa é a FORMA, não a posição: o escudo AFINA continuamente até a
    ponta, enquanto a haste é um bastão reto, de largura constante. Medido no
    brasão atual, o escudo vai afinando 73, 69, 67… 31, 29 e então trava em 28
    por 35 linhas seguidas — ali começa a haste.

    Antes disto o corte era um número fixo (0,8235 da altura), medido à mão num
    arquivo de origem que depois mudou. O número envelheceu junto com o
    desenho e passou a cortar a ponta do escudo ao meio, deixando-o com a base
    reta, como se tivesse sido serrado. Uma regra que se mede sozinha não
    envelhece assim.
    """
    perfil = larguras_centrais(imagem)
    if not perfil or max(perfil) == 0:
        return imagem

    mais_largo = perfil.index(max(perfil))
    limite_fino = max(perfil) * FRACAO_DE_HASTE

    for y in range(mais_largo + 1, len(perfil) - LINHAS_PARA_DIZER_QUE_E_HASTE):
        largura = perfil[y]
        if largura == 0 or largura >= limite_fino:
            continue
        # Largura repetida por várias linhas = bastão reto.
        seguintes = perfil[y : y + LINHAS_PARA_DIZER_QUE_E_HASTE]
        if all(l == largura for l in seguintes):
            print(f"  ponta do escudo em y={y} (haste reta de {largura} px abaixo)")
            return imagem.crop((0, 0, imagem.width, y))

    print("  ponta do escudo não localizada — nada cortado por baixo")
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
# A ordem importa: primeiro tira o que está SOLTO ao lado (a fita nos cantos),
# depois corta o que continua POR BAIXO (haste e fita), e só então limpa as
# lascas que sobraram sem encostar em nada.
escudo = manter_trecho_central(escudo)
escudo = cortar_na_ponta(escudo)
escudo = manter_maior_peca(escudo)
salvar(com_margem(recortar_conteudo(escudo, margem=4)), "brasao-escudo.webp", 480)
