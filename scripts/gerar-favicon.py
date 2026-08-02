# -*- coding: utf-8 -*-
"""Gera o favicon do site a partir do escudo do brasão oficial."""
from pathlib import Path
from PIL import Image

ORIGEM = Path("public/fotos/brasao-escudo.webp")
DESTINO = Path("app/icon.png")
LADO = 128

escudo = Image.open(ORIGEM).convert("RGBA")

# Fundo quadrado azul (cor "principal" do site) com o escudo centralizado,
# para ficar legível como ícone pequeno na aba do navegador.
fundo = Image.new("RGBA", (LADO, LADO), (36, 70, 111, 255))

escala = (LADO * 0.86) / max(escudo.size)
novo_tam = (round(escudo.width * escala), round(escudo.height * escala))
escudo_redim = escudo.resize(novo_tam, Image.LANCZOS)

pos = ((LADO - novo_tam[0]) // 2, (LADO - novo_tam[1]) // 2)
fundo.paste(escudo_redim, pos, escudo_redim)

DESTINO.parent.mkdir(parents=True, exist_ok=True)
fundo.save(DESTINO, "PNG")
print(f"gerado: {DESTINO} ({DESTINO.stat().st_size / 1024:.0f} KB)")
