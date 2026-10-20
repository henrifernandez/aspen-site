#!/usr/bin/env python3
"""Lista PENDENTE e seudominio em public/ (arquivo, linha, trecho).
Com --publicar, termina com erro se sobrar algum, ou se ainda houver data-modo="rascunho" ou noindex."""
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(RAIZ, "public")
publicar = "--publicar" in sys.argv
achados = []
for d, subs, nomes in os.walk(PUB):
    for n in nomes:
        f = os.path.join(d, n)
        if os.path.splitext(n)[1].lower() in (".webp", ".jpg", ".png", ".ico", ".woff2", ".mp4", ".gitkeep"):
            continue
        try:
            linhas = open(f, encoding="utf-8").read().splitlines()
        except UnicodeDecodeError:
            continue
        for i, linha in enumerate(linhas, 1):
            if "PENDENTE" in linha or "seudominio" in linha:
                achados.append((os.path.relpath(f, RAIZ), i, linha.strip()[:150]))
for a in sorted(achados):
    print("%s:%d: %s" % a)
print("total de linhas com marcador:", len(achados))
erros = list(achados) if publicar else []
if publicar:
    for pag in ("index.html", "privacidade.html", "404.html"):
        txt = open(os.path.join(PUB, pag), encoding="utf-8").read()
        if 'data-modo="rascunho"' in txt:
            erros.append((pag, 0, 'ainda data-modo="rascunho"'))
        if pag != "404.html" and re.search(r'name="robots" content="noindex', txt):
            erros.append((pag, 0, "ainda noindex"))
    if erros:
        print("NAO PUBLICAR: %d pendencias" % len(erros))
        sys.exit(1)
    print("Pronto para publicar.")
