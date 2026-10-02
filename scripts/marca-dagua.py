# -*- coding: utf-8 -*-
"""Carimba o brasão da paróquia nas fotos da galeria.

Uso: python scripts/marca-dagua.py [--conferir]

  --conferir   não grava nada; só monta uma amostra em marca-dagua-amostra.png
               para você olhar antes de aplicar.

---

POR QUE DUAS MARCAS, E NÃO UMA

  1. CANTO, visível.  É a assinatura: quem vir a foto em qualquer lugar sabe
     de onde ela saiu. Fica discreta para não estragar a foto.

  2. CENTRO, quase invisível.  É a que PROTEGE. Marca de canto some com um
     recorte de dois segundos; a do centro só sai destruindo a foto.

A do centro fica em 7% de opacidade: você precisa procurar para ver, mas ela
aparece em qualquer tentativa de recortar ou reusar a imagem.

---

⚠️ ESTE SCRIPT REGRAVA OS ARQUIVOS NO LUGAR.

Os originais estão no Git — para desfazer:

    git checkout -- public/fotos/galeria

E também em `Documents\\PASCOM\\fotos site`, fora do repositório.

Rodar duas vezes carimba duas vezes. O script avisa quando desconfia que a
foto já tem marca (ver `ja_marcada`).
"""
import sys
from pathlib import Path
from PIL import Image, ImageChops

BRASAO = Path("public/fotos/brasao-escudo.webp")
PASTA = Path("public/fotos/galeria")

# --- marca do canto ---------------------------------------------------------
# Fração do MENOR lado da foto. Em foto retrato de 1400 px de altura por 1050
# de largura, 0.17 dá um escudo de ~178 px — grande o bastante para se
# reconhecer o brasão, pequeno o bastante para não disputar com a imagem.
CANTO_TAMANHO = 0.17
CANTO_OPACIDADE = 0.55
CANTO_MARGEM = 0.035  # também em fração do menor lado

# --- marca do centro --------------------------------------------------------
CENTRO_TAMANHO = 0.62
CENTRO_OPACIDADE = 0.07


def com_opacidade(imagem: Image.Image, fator: float) -> Image.Image:
    """Multiplica o canal alfa, preservando as bordas suaves do escudo."""
    saida = imagem.copy()
    alfa = saida.getchannel("A").point(lambda v: round(v * fator))
    saida.putalpha(alfa)
    return saida


def escudo_na_altura(brasao: Image.Image, altura: int) -> Image.Image:
    largura = max(1, round(brasao.width * altura / brasao.height))
    return brasao.resize((largura, altura), Image.LANCZOS)


def ja_marcada(foto: Path) -> bool:
    """Heurística simples: o script grava os arquivos com um comentário."""
    try:
        with Image.open(foto) as im:
            return im.info.get("marca_dagua") == "paroquia"
    except Exception:
        return False


def carimbar(foto: Image.Image, brasao: Image.Image) -> Image.Image:
    base = foto.convert("RGBA")
    menor_lado = min(base.size)

    # Centro primeiro, para o canto ficar por cima se houver sobreposição.
    centro = escudo_na_altura(brasao, round(menor_lado * CENTRO_TAMANHO))
    centro = com_opacidade(centro, CENTRO_OPACIDADE)
    base.alpha_composite(
        centro,
        ((base.width - centro.width) // 2, (base.height - centro.height) // 2),
    )

    canto = escudo_na_altura(brasao, round(menor_lado * CANTO_TAMANHO))
    canto = com_opacidade(canto, CANTO_OPACIDADE)
    margem = round(menor_lado * CANTO_MARGEM)
    base.alpha_composite(
        canto,
        (base.width - canto.width - margem, base.height - canto.height - margem),
    )

    return base.convert("RGB")


def main() -> None:
    conferir = "--conferir" in sys.argv

    if not BRASAO.exists():
        raise SystemExit(f"brasão não encontrado: {BRASAO}")

    brasao = Image.open(BRASAO).convert("RGBA")
    fotos = sorted(PASTA.glob("*/*.webp"))
    if not fotos:
        raise SystemExit(f"nenhuma foto em {PASTA}")

    if conferir:
        amostra = []
        for caminho in fotos[:3]:
            with Image.open(caminho) as im:
                antes = im.convert("RGB")
                antes.thumbnail((420, 420))
                depois = carimbar(im, brasao)
                depois.thumbnail((420, 420))
            amostra.append((caminho.name, antes, depois))

        largura = sum(a.width + d.width + 36 for _, a, d in amostra) + 20
        altura = max(max(a.height, d.height) for _, a, d in amostra) + 20
        tela = Image.new("RGB", (largura, altura), (250, 250, 252))
        x = 10
        for _, antes, depois in amostra:
            tela.paste(antes, (x, 10))
            x += antes.width + 12
            tela.paste(depois, (x, 10))
            x += depois.width + 24
        destino = Path("marca-dagua-amostra.png")
        tela.save(destino)
        print(f"amostra (antes | depois) em {destino} — nada foi gravado")
        return

    for caminho in fotos:
        if ja_marcada(caminho):
            print(f"  já marcada, pulando: {caminho}")
            continue
        with Image.open(caminho) as im:
            marcada = carimbar(im, brasao)
        # `quality=82`: um pouco acima do 78 do otimizar-fotos, porque o
        # degradê suave da marca central é o primeiro a sofrer com compressão.
        marcada.save(caminho, "WEBP", quality=82, method=6)
        # Grava o rastro que `ja_marcada` procura.
        with Image.open(caminho) as im:
            im.info["marca_dagua"] = "paroquia"
            im.save(caminho, "WEBP", quality=82, method=6, exif=b"")
        print(f"  carimbada: {caminho}  ({caminho.stat().st_size / 1024:.0f} KB)")

    print(f"\n{len(fotos)} foto(s) processada(s)")


if __name__ == "__main__":
    main()
