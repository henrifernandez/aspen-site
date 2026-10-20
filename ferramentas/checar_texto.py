#!/usr/bin/env python3
"""Checagens de texto do plano (secao 12, itens 1 e 2).
  --tracos    procura travessoes e meia-risca em arquivos de texto (espera zero)
  --proibidas procura expressoes proibidas no texto visivel das paginas renderizadas (espera zero)
Uso: python3 ferramentas/checar_texto.py --tracos [caminhos extras]
     python3 ferramentas/checar_texto.py --proibidas [http://localhost:8765]
Os padroes sao montados a partir dos codigos para o script nao acusar a si mesmo."""
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXT = {".html", ".css", ".js", ".json", ".md", ".txt", ".xml", ".py", ".sh", ".webmanifest", ".svg", ".vtt"}
NOMES = {"_headers", "_redirects", ".gitignore"}


def padroes_tracos():
    chars = [chr(c) for c in (0x2012, 0x2013, 0x2014, 0x2015, 0xFE58, 0xFE63)]
    ents = ["&" + "mdash;", "&" + "ndash;", "&#" + "8211;", "&#" + "8212;", "&#x" + "2013;", "&#x" + "2014;",
            "&#X" + "2013;", "&#X" + "2014;", "\\" + "u2013", "\\" + "u2014", "\\" + "U2013", "\\" + "U2014"]
    return chars + ents


def arquivos(bases):
    for base in bases:
        if os.path.isfile(base):
            yield base
            continue
        for d, subs, nomes in os.walk(base):
            subs[:] = [s for s in subs if s not in ("_qa", "__pycache__", ".git", "node_modules")]
            for n in nomes:
                if os.path.splitext(n)[1].lower() in EXT or n in NOMES:
                    yield os.path.join(d, n)


def tracos(extras):
    bases = [os.path.join(RAIZ, p) for p in ("public", "origem", "ferramentas", "README.md", "PENDENCIAS.md")]
    bases = [b for b in bases if os.path.exists(b)] + extras
    achados, total = [], 0
    pads = padroes_tracos()
    for f in arquivos(bases):
        total += 1
        try:
            texto = open(f, encoding="utf-8").read()
        except UnicodeDecodeError:
            continue
        for n, linha in enumerate(texto.splitlines(), 1):
            for p in pads:
                if p in linha:
                    achados.append((f, n, repr(p)))
    print("arquivos verificados:", total)
    for a in achados:
        print("TRACO", *a)
    print("ocorrencias de travessao:", len(achados))
    return len(achados)


FALHA = [r"sem senha", r"mesmo se a senha vazar", r"em tempo real", r"falsos positivos", r"usuários protegidos",
         r"\busuári", r"detect", r"proteg", r"proteção", r"segurança total", r"100%", r"R\$", r"\bpreço:\s*\d",
         r"plano (básico|pro|premium)", r"em breve", r"lançamento em", r"parceria", r"parceiros", r"prêmio",
         r"premiad", r"depoimento", r"avaliaç", r"estrelas", r"\bselo", r"equipe de", r"integrantes", r"garant",
         r"impede", r"bloqueia", r"inviolável", r"à prova de", r"acesso antecipado", r"já funciona com",
         r"\b\d+ ?(mil|milhões)\b"]
REVISAR = [r"segur", r"golpe", r"funciona", r"confirma", r"vai ", r"\b20\d\d\b"]
EXCECOES = ["Autoridade Nacional de Proteção de Dados", "Proteção de Dados"]


def proibidas(base):
    from playwright.sync_api import sync_playwright
    os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", "/opt/pw-browsers")
    falhas, revisar = [], []
    with sync_playwright() as p:
        nav = p.chromium.launch(executable_path="/opt/pw-browsers/chromium")
        for caminho in ("/", "/privacidade", "/nada-aqui-404"):
            pg = nav.new_page(viewport={"width": 390, "height": 844})
            pg.goto(base + caminho)
            textos = [("texto", pg.evaluate("document.body.innerText"))]
            extras = pg.evaluate("""() => {
              const o = [];
              document.querySelectorAll('[alt],[title],[aria-label]').forEach(e => {
                ['alt','title','aria-label'].forEach(a => { if (e.getAttribute(a)) o.push(a + ': ' + e.getAttribute(a)); });
              });
              document.querySelectorAll('meta[content],title').forEach(m => o.push('meta: ' + (m.getAttribute('content') || m.textContent)));
              return o; }""")
            textos += [("atributo", t) for t in extras]
            for tipo, t in textos:
                limpo = t
                for ex in EXCECOES:
                    limpo = limpo.replace(ex, " ")
                for pad in FALHA:
                    for m in re.finditer(pad, limpo, re.I):
                        ctx = limpo[max(0, m.start() - 40): m.end() + 40].replace("\n", " ")
                        falhas.append((caminho, pad, ctx))
                for pad in REVISAR:
                    for m in re.finditer(pad, limpo, re.I):
                        ctx = limpo[max(0, m.start() - 50): m.end() + 50].replace("\n", " ")
                        revisar.append((caminho, pad, ctx))
            pg.close()
        nav.close()
    for f in falhas:
        print("PROIBIDA", *f)
    print("expressoes proibidas:", len(falhas))
    print("--- REVISAR (%d) ---" % len(revisar))
    vistos = set()
    for r in revisar:
        if r[1:] in vistos:
            continue
        vistos.add(r[1:])
        print("REVISAR %s [%s] ...%s..." % r)
    return len(falhas)


if __name__ == "__main__":
    args = sys.argv[1:]
    codigo = 0
    if "--tracos" in args:
        extras = [a for a in args if not a.startswith("--") and os.path.exists(a)]
        codigo |= 1 if tracos(extras) else 0
    if "--proibidas" in args:
        url = next((a for a in args if a.startswith("http")), "http://localhost:8765")
        codigo |= 1 if proibidas(url) else 0
    sys.exit(codigo)
