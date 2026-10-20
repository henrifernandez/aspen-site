#!/usr/bin/env python3
"""Fotografa origem/og.html (1200x630) com o Chromium e salva public/og-image.jpg (qualidade 85)."""
import io
import os
from PIL import Image
from playwright.sync_api import sync_playwright

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", "/opt/pw-browsers")
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path="/opt/pw-browsers/chromium")
    pg = nav.new_page(viewport={"width": 1200, "height": 630}, device_scale_factor=1)
    pg.goto("file://" + os.path.join(RAIZ, "origem", "og.html"))
    pg.evaluate("document.fonts.ready")
    pg.wait_for_timeout(600)
    png = pg.screenshot(type="png")
    nav.close()
im = Image.open(io.BytesIO(png)).convert("RGB")
saida = os.path.join(RAIZ, "public", "og-image.jpg")
im.save(saida, "JPEG", quality=85, optimize=True)
print(saida, im.size, round(os.path.getsize(saida) / 1024, 1), "KB")
