# -*- coding: utf-8 -*-
"""Prepara o brasão da paróquia para uso no site.

Fonte: PNG oficial já com fundo transparente, enviado pela secretaria.
Gera duas versões em public/fotos/:
  brasao.webp        — brasão completo (página "A Paróquia")
  brasao-escudo.webp — só o escudo, que continua legível em tamanho pequeno
                       (cabeçalho, rodapé e favicon)
"""
from pathlib import Path
from PIL import Image

ORIGEM = Path(r"C:\Users\msilv\Documents\PASCOM\fotos site\brasão sem fundo.png")
DESTINO = Path("public/fotos")

# Recorte do escudo sozinho (sem a fita nem a cruz), calibrado visualmente
# como fração do brasão completo já aparado.
ESCUDO_CAIXA = (0.2167, 0.2632, 0.7333, 0.7031)  # esquerda, topo, direita, base


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

fonte = Image.open(ORIGEM).convert("RGBA")
completo = recortar_conteudo(fonte)
salvar(completo, "brasao.webp", 900)

# O escudo ocupa a faixa central; a fita e a haste da cruz somem em miniatura.
l, a = completo.size
esq, topo, dir_, base = ESCUDO_CAIXA
escudo = completo.crop((round(l * esq), round(a * topo), round(l * dir_), round(a * base)))
salvar(recortar_conteudo(escudo, margem=4), "brasao-escudo.webp", 480)
