# -*- coding: utf-8 -*-
"""Gera os ícones do site a partir do escudo do brasão oficial.

Produz três arquivos, que o Next serve pela convenção de nomes em app/:

  app/favicon.ico   — o que o navegador pede sozinho, em /favicon.ico
  app/icon.png      — ícone moderno, usado em abas e atalhos
  app/apple-icon.png— atalho na tela inicial do iPhone/iPad

O favicon.ico PRECISA existir e PRECISA ser o brasão. Enquanto ele não foi
gerado, o Next serviu o arquivo de exemplo que vem com `create-next-app` — o
triângulo preto do próprio Next — e era ISSO que aparecia na aba de quem
visitava o site da paróquia, porque o `.ico` é anunciado antes do `.png`.

Uso: python scripts/gerar-favicon.py

DEPOIS DE RODAR: apague o cache de imagens e reinicie o servidor —
  rm -rf .next/dev/cache/images && npm run dev
O otimizador do Next guarda a imagem processada usando a URL como chave, e a
URL não muda quando o arquivo muda. Sem limpar, você continua vendo o antigo
e jura que o script não funcionou.
"""
from pathlib import Path
from PIL import Image

ORIGEM = Path("public/fotos/brasao-escudo.webp")
PASTA = Path("app")

# Azul mariano — o mesmo `--color-principal` de app/globals.css.
AZUL = (36, 70, 111, 255)

# Quanto do lado do quadrado o escudo ocupa.
#
# O escudo é mais alto que largo (480x542), então a escala é calculada sobre a
# ALTURA. Em 16x16 o que se enxerga é a silhueta; sobra estreita demais e ele
# vira um borrão, sobra larga demais e encosta nas bordas.
OCUPACAO = 0.82

# Tamanhos embutidos no .ico. O navegador escolhe o mais próximo do que precisa:
# 16 e 32 para a aba, 48 para a lista de favoritos, 256 para atalhos grandes.
TAMANHOS_ICO = [16, 32, 48, 64, 128, 256]


def sobre_fundo_azul(lado: int) -> Image.Image:
    """O escudo centralizado num quadrado azul do tamanho pedido."""
    escudo = Image.open(ORIGEM).convert("RGBA")

    escala = (lado * OCUPACAO) / escudo.height
    novo = (max(1, round(escudo.width * escala)), max(1, round(escudo.height * escala)))
    redimensionado = escudo.resize(novo, Image.LANCZOS)

    quadro = Image.new("RGBA", (lado, lado), AZUL)
    quadro.paste(
        redimensionado,
        ((lado - novo[0]) // 2, (lado - novo[1]) // 2),
        redimensionado,
    )
    return quadro


def gravar(caminho: Path, imagem: Image.Image, **opcoes) -> None:
    caminho.parent.mkdir(parents=True, exist_ok=True)
    imagem.save(caminho, **opcoes)
    print(f"gerado: {caminho} ({caminho.stat().st_size / 1024:.0f} KB)")


# O .ico guarda vários tamanhos no mesmo arquivo. Cada um é redesenhado a
# partir do original em vez de reduzido a partir do maior: reduzir de 256 para
# 16 borra a silhueta, redesenhar mantém a borda limpa.
gravar(
    PASTA / "favicon.ico",
    sobre_fundo_azul(256),
    format="ICO",
    sizes=[(n, n) for n in TAMANHOS_ICO],
)

# 512 é o tamanho que o Android pede para o atalho na tela inicial; menor que
# isso ele aumenta a imagem por conta própria e o resultado fica macio.
gravar(PASTA / "icon.png", sobre_fundo_azul(512), format="PNG")

# O iOS não respeita transparência nem cantos: entrega um quadrado cheio, que
# é o que `sobre_fundo_azul` já faz. 180 é o tamanho pedido pela Apple.
gravar(PASTA / "apple-icon.png", sobre_fundo_azul(180), format="PNG")
