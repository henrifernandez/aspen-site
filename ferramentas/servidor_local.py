#!/usr/bin/env python3
"""Serve public/ imitando o Cloudflare Pages: rotas sem .html, redirecionamento de .html,
404.html com status 404 e os cabecalhos de _headers. Uso: python3 ferramentas/servidor_local.py [porta]"""
import fnmatch
import mimetypes
import os
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit, unquote

RAIZ = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public")
PORTA = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
mimetypes.add_type("font/woff2", ".woff2")
mimetypes.add_type("image/webp", ".webp")
mimetypes.add_type("application/manifest+json", ".webmanifest")


def ler_cabecalhos():
    regras, atual = [], None
    caminho = os.path.join(RAIZ, "_headers")
    if not os.path.exists(caminho):
        return regras
    for linha in open(caminho, encoding="utf-8").read().splitlines():
        if not linha.strip() or linha.lstrip().startswith("#"):
            continue
        if not linha.startswith((" ", "\t")):
            atual = (linha.strip(), [])
            regras.append(atual)
        elif atual is not None and ":" in linha:
            nome, valor = linha.strip().split(":", 1)
            atual[1].append((nome.strip(), valor.strip()))
    return regras


def ler_redirecionamentos():
    regras = []
    caminho = os.path.join(RAIZ, "_redirects")
    if os.path.exists(caminho):
        for linha in open(caminho, encoding="utf-8").read().splitlines():
            partes = linha.split()
            if len(partes) >= 2 and not linha.startswith("#"):
                regras.append((partes[0], partes[1], int(partes[2]) if len(partes) > 2 else 302))
    return regras


CABECALHOS = ler_cabecalhos()
REDIRECIONAMENTOS = ler_redirecionamentos()


class Manipulador(BaseHTTPRequestHandler):
    server_version = "AspenLocal/1"

    def log_message(self, *a):
        pass

    def enviar(self, status, corpo=b"", tipo="text/html; charset=utf-8", extra=None, caminho=""):
        self.send_response(status)
        self.send_header("Content-Type", tipo)
        self.send_header("Content-Length", str(len(corpo)))
        for padrao, itens in CABECALHOS:
            if fnmatch.fnmatch(caminho, padrao):
                for n, v in itens:
                    self.send_header(n, v)
        for n, v in (extra or []):
            self.send_header(n, v)
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(corpo)

    def resolver(self, caminho):
        if caminho == "/":
            return os.path.join(RAIZ, "index.html")
        rel = caminho.lstrip("/")
        alvo = os.path.normpath(os.path.join(RAIZ, rel))
        if not alvo.startswith(RAIZ):
            return None
        if os.path.isfile(alvo):
            return alvo
        if os.path.isfile(alvo + ".html"):
            return alvo + ".html"
        return None

    def servir(self):
        partes = urlsplit(self.path)
        caminho = unquote(partes.path)
        consulta = ("?" + partes.query) if partes.query else ""
        for origem, destino, codigo in REDIRECIONAMENTOS:
            if caminho == origem:
                return self.enviar(codigo, extra=[("Location", destino + consulta)], caminho=caminho)
        if caminho == "/index.html":
            return self.enviar(308, extra=[("Location", "/" + consulta)], caminho=caminho)
        if caminho.endswith(".html") and caminho != "/404.html" and os.path.isfile(os.path.join(RAIZ, caminho.lstrip("/"))):
            return self.enviar(308, extra=[("Location", caminho[:-5] + consulta)], caminho=caminho)
        if caminho in ("/_headers", "/_redirects"):
            alvo = None
        else:
            alvo = self.resolver(caminho)
        if alvo is None:
            pagina = os.path.join(RAIZ, "404.html")
            corpo = open(pagina, "rb").read() if os.path.exists(pagina) else b"404"
            return self.enviar(404, corpo, caminho=caminho)
        tipo = mimetypes.guess_type(alvo)[0] or "application/octet-stream"
        if tipo.startswith("text/") or tipo in ("application/javascript", "application/json", "application/manifest+json"):
            tipo += "; charset=utf-8" if "charset" not in tipo else ""
        self.enviar(200, open(alvo, "rb").read(), tipo, caminho=caminho)

    do_GET = servir
    do_HEAD = servir


if __name__ == "__main__":
    print("Servindo %s em http://localhost:%d" % (RAIZ, PORTA))
    ThreadingHTTPServer(("127.0.0.1", PORTA), Manipulador).serve_forever()
