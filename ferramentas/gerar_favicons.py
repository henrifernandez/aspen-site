#!/usr/bin/env python3
"""Gera favicon.ico, apple-touch-icon.png, icon-192.png e icon-512.png a partir do escudo creme."""
import os
from PIL import Image, ImageDraw

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(RAIZ, "public")
ESCUDO = "/home/claude/aspen-social-agent/brand/assets/logo-escudo-creme.png"
PETROLEO = (0x25, 0x5B, 0x62, 255)

esc = Image.open(ESCUDO).convert("RGBA")
esc = esc.crop(esc.getchannel("A").getbbox())

def icone(lado, proporcao, raio=0.0):
    base = Image.new("RGBA", (lado, lado), PETROLEO)
    alvo = int(lado * proporcao)
    e = esc.copy()
    e.thumbnail((alvo, alvo), Image.LANCZOS)
    base.alpha_composite(e, ((lado - e.width) // 2, (lado - e.height) // 2))
    if raio:
        mascara = Image.new("L", (lado, lado), 0)
        ImageDraw.Draw(mascara).rounded_rectangle((0, 0, lado - 1, lado - 1), radius=int(lado * raio), fill=255)
        base.putalpha(mascara)
    return base

grande = icone(512, 0.76, 0.2)
grande.save(os.path.join(PUB, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])
icone(180, 0.70).convert("RGB").save(os.path.join(PUB, "apple-touch-icon.png"))
icone(192, 0.76).convert("RGB").save(os.path.join(PUB, "icon-192.png"))
icone(512, 0.76).convert("RGB").save(os.path.join(PUB, "icon-512.png"))
for n in ("favicon.ico", "apple-touch-icon.png", "icon-192.png", "icon-512.png"):
    print(n, os.path.getsize(os.path.join(PUB, n)))
