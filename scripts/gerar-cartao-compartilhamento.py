# -*- coding: utf-8 -*-
"""Gera app/opengraph-image.jpg — o cartão que aparece ao compartilhar o link
do site no WhatsApp, Facebook etc. Uso: python scripts/gerar-cartao-compartilhamento.py
"""
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageFont

ORIGEM = Path(r"C:\Users\msilv\Documents\PASCOM\fotos site\IMG-20251215-WA0055.jpg")
DESTINO = Path("app/opengraph-image.jpg")
L, A = 1200, 630  # tamanho padrão de cartão de link

# Mesmas cores de app/globals.css (azul mariano + dourado)
AZUL = (36, 70, 111)
DOURADO = (241, 228, 184)  # dourado claro: contraste bom sobre o véu azul

# --- foto: recorta uma faixa horizontal na altura do altar -----------------
foto = Image.open(ORIGEM).convert("RGB")
lf, af = foto.size
nova_altura = int(lf * A / L)
topo = int((af - nova_altura) * 0.30)  # 30% do topo: altar e assembleia visíveis
foto = foto.crop((0, topo, lf, topo + nova_altura)).resize((L, A), Image.LANCZOS)

# --- véu: escurece de baixo para cima + da esquerda (onde fica o texto) ---
# topo e canto direito ficam limpos, então a igreja continua aparecendo
vertical = Image.new("L", (1, A))
for y in range(A):
    p = y / A
    vertical.putpixel((0, y), int(200 * max(0.0, (p - 0.45) / 0.55) ** 1.3))

horizontal = Image.new("L", (L, 1))
for x in range(L):
    p = x / L
    # forte até depois do fim do texto, depois some (a direita fica limpa)
    intensidade = 1.0 if p < 0.45 else max(0.0, (0.80 - p) / 0.35) ** 1.3
    horizontal.putpixel((x, 0), int(200 * intensidade))

mascara = ImageChops.add(
    vertical.resize((L, A)), horizontal.resize((L, A))
).point(lambda v: min(v, 238))

veu = Image.new("RGBA", (L, A), AZUL + (255,))
veu.putalpha(mascara)
cartao = Image.alpha_composite(foto.convert("RGBA"), veu)
d = ImageDraw.Draw(cartao)


def fonte(nome, tamanho):
    return ImageFont.truetype(rf"C:\Windows\Fonts\{nome}", tamanho)


f_titulo = fonte("georgiab.ttf", 62)
f_sub = fonte("georgia.ttf", 30)
f_tag = fonte("georgiab.ttf", 24)

M = 72  # margem
# bloco de texto todo na faixa escura de baixo
y = A - 58 - 38 - 8 - 2 * 74 - 16 - 30

d.text((M, y), "ARQUIDIOCESE DE BRASÍLIA", font=f_tag, fill=DOURADO)
y += 30 + 16

for linha in ["Santa Clara e", "São Francisco de Assis"]:
    d.text((M, y), linha, font=f_titulo, fill=(255, 255, 255))
    y += 74

d.text((M, y + 8), "Jardim Botânico · Brasília-DF", font=f_sub, fill=(238, 230, 216))

DESTINO.parent.mkdir(parents=True, exist_ok=True)
cartao.convert("RGB").save(DESTINO, quality=88, optimize=True)
print(f"gerado: {DESTINO} ({DESTINO.stat().st_size / 1024:.0f} KB)")
