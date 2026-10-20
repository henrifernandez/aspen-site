#!/usr/bin/env python3
"""Exporta as imagens do site (WebP) a partir da biblioteca da marca.
Uso: python3 ferramentas/exportar_imagens.py [pasta_brand_assets] [nome ...]
Falha se algum arquivo passar do peso alvo em mais de 20%."""
import os
import sys
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIGEM = "/home/claude/aspen-social-agent/brand/assets"
if len(sys.argv) > 1 and os.path.isdir(sys.argv[1]):
    ORIGEM = sys.argv[1]
SAIDA = os.path.join(RAIZ, "public", "assets", "img")
os.makedirs(SAIDA, exist_ok=True)

# nome, origem, recorte (None = alfa getbbox; "nenhum"; ou caixa), larguras, pesos alvo em KB, qualidade
LINHAS = [
    ("hero-chave-deitada", "key/chave-deitada.png", None, [400, 800, 1200], [15, 40, 70], 80),
    ("hero-chave-3q", "key/chave-3q.png", None, [560, 1120], [40, 95], 80),
    ("marca-dagua-escudo", "logo-escudo-creme.png", None, [720], [35], 40),
    ("escudo-creme", "logo-escudo-creme.png", None, [64, 128], [4, 8], 80),
    ("escudo-petroleo", "logo-escudo-petroleo.png", None, [64, 128], [4, 8], 70),
    ("problema-celular-bloqueio", "key/celular-bloqueio.png", None, [320, 640, 960], [20, 45, 75], 80),
    ("ideia-celular-aguardando", "key/celular-aguardando.png", None, [280, 560, 840], [18, 40, 70], 80),
    ("ideia-toque-frente", "key/toque-frente.png", None, [320, 640, 960], [22, 55, 90], 80),
    ("prototipo-referencia", "aspen-key-prototipo-referencia.png", "nenhum", [600, 900, 1152], [12, 22, 32], 80),
    ("detalhe-conector", "key/detalhe-conector.png", (0, 0, 2036, 2036), [240, 480, 720], [8, 18, 35], 80),
    ("detalhe-led", "key/detalhe-led.png", (0, 0, 2101, 2101), [240, 480, 720], [8, 18, 35], 80),
    ("detalhe-anel", "key/detalhe-anel.png", (0, 0, 1707, 1707), [240, 480, 720], [14, 32, 55], 80),
]

FILTRO = [a for a in sys.argv[1:] if not os.path.isdir(a)]
falhas = []
for nome, origem, recorte, larguras, alvos, q in LINHAS:
    if FILTRO and nome not in FILTRO:
        continue
    im = Image.open(os.path.join(ORIGEM, origem))
    if recorte is None:
        im = im.convert("RGBA")
        im = im.crop(im.getchannel("A").getbbox())
    elif recorte != "nenhum":
        im = im.convert("RGBA").crop(recorte)
    for larg, alvo in zip(larguras, alvos):
        alt = round(im.height * larg / im.width)
        saida = im.resize((larg, alt), Image.LANCZOS)
        caminho = os.path.join(SAIDA, "%s-%d.webp" % (nome, larg))
        aq = 50 if nome == "marca-dagua-escudo" else 100  # marca d'agua fica a 6% de opacidade
        saida.save(caminho, "WEBP", quality=q, method=6, alpha_quality=aq)
        kb = os.path.getsize(caminho) / 1024
        marca = ""
        if kb > alvo * 1.2:
            marca = "  ACIMA DO ALVO"
            falhas.append(caminho)
        print("%-44s %4dx%-4d %6.1f KB (alvo %d)%s" % (os.path.basename(caminho), larg, alt, kb, alvo, marca))
if falhas:
    print("FALHOU:", falhas)
    sys.exit(1)
