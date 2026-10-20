#!/usr/bin/env python3
"""QA do site (plano, secao 12). Precisa do servidor local ativo:
    python3 ferramentas/servidor_local.py 8765 &
    python3 ferramentas/qa_playwright.py [http://localhost:8765]
Escreve capturas em _qa/capturas/ e os resultados em _qa/resultados.json."""
import json
import os
import re
import sys
import urllib.request
import urllib.error
from html.parser import HTMLParser

from playwright.sync_api import sync_playwright

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(RAIZ, "public")
QA = os.path.join(RAIZ, "_qa")
CAP = os.path.join(QA, "capturas")
BASE = next((a for a in sys.argv[1:] if a.startswith("http")), "http://localhost:8765")
os.makedirs(CAP, exist_ok=True)
os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", "/opt/pw-browsers")
R = {}  # resultados

PAGINAS = [("index", "/"), ("privacidade", "/privacidade"), ("404", "/pagina-que-nao-existe")]


def rodar_js(pg, js, arg=None):
    return pg.evaluate(js, arg) if arg is not None else pg.evaluate(js)


def abrir(ctx, caminho, espera=True):
    pg = ctx.new_page()
    pg.goto(BASE + caminho, wait_until="load")
    if espera:
        pg.evaluate("document.fonts.ready")
        rolar_tudo(pg)
    return pg


def rolar_tudo(pg, passo=500):
    h = pg.evaluate("document.documentElement.scrollHeight")
    y = 0
    while y < h:
        pg.evaluate("window.scrollTo(0, %d)" % y)
        pg.wait_for_timeout(120)
        y += passo
        h = pg.evaluate("document.documentElement.scrollHeight")
    pg.wait_for_timeout(300)
    pg.evaluate("window.scrollTo(0, 0)")
    pg.wait_for_timeout(500)


# ---------- funcoes de pagina (JS) ----------
JS_ROLAGEM_H = "() => [document.documentElement.scrollWidth, window.innerWidth]"

JS_CORTADO = """() => {
  const sel = 'h1,h2,h3,h4,p,li,dt,dd,figcaption,summary,a,button,label';
  const out = [];
  document.querySelectorAll(sel).forEach(e => {
    const cs = getComputedStyle(e);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const r = e.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;
    if (cs.overflow !== 'visible' || cs.overflowX !== 'visible' || cs.overflowY !== 'visible') {
      if (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1) {
        out.push((e.tagName + '.' + e.className + ' ' + (e.textContent || '').trim().slice(0, 40)));
      }
    }
  });
  return out;
}"""

JS_SOBREPOSICAO = """() => {
  const sel = 'h1,h2,h3,h4,p,figure,img,li,dt,dd,summary,.botao,.aviso,details,figcaption,.etiqueta-visao,label,input,button';
  const els = [...document.querySelectorAll(sel)].filter(e => {
    const cs = getComputedStyle(e);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    if (e.closest('[data-sobrepoe="ok"]')) return false;
    if (e.closest('.visualmente-oculto') || e.classList.contains('visualmente-oculto')) return false;
    if (e.closest('.pular')) return false;
    const d = e.closest('details');
    if (d && !d.open && e.tagName !== 'SUMMARY' && !e.closest('summary') && e !== d) return false;
    const r = e.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  });
  const out = [];
  function visivel(e) {
    let r = e.getBoundingClientRect();
    let L = r.left, T = r.top, Rr = r.right, B = r.bottom;
    for (let n = e.parentElement; n && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') {
        const q = n.getBoundingClientRect();
        L = Math.max(L, q.left); T = Math.max(T, q.top); Rr = Math.min(Rr, q.right); B = Math.min(B, q.bottom);
      }
    }
    return {left: L, top: T, right: Math.max(L, Rr), bottom: Math.max(T, B)};
  }
  const rs = els.map(visivel);
  for (let i = 0; i < els.length; i++) {
    for (let j = i + 1; j < els.length; j++) {
      if (els[i].contains(els[j]) || els[j].contains(els[i])) continue;
      const a = rs[i], b = rs[j];
      const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (w > 0 && h > 0 && w * h > 4) {
        out.push([els[i].tagName + '.' + els[i].className, els[j].tagName + '.' + els[j].className, Math.round(w * h)]);
      }
    }
  }
  return out;
}"""

JS_CONTRASTE = """() => {
  function parse(c) { const m = c.match(/rgba?\\(([^)]+)\\)/); if (!m) return null; const p = m[1].split(',').map(parseFloat); return {r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1}; }
  function lum(c) { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); }
  function razao(a, b) { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); }
  function fundo(e) {
    let n = e;
    while (n) {
      if (n.classList && n.classList.contains('noite')) return {r: 10, g: 41, b: 53, a: 1};
      const bg = parse(getComputedStyle(n).backgroundColor);
      if (bg && bg.a > 0.99) return bg;
      if (n.classList && n.classList.contains('modo-escuro')) return {r: 10, g: 41, b: 53, a: 1};
      n = n.parentElement;
    }
    return {r: 246, g: 246, b: 234, a: 1};
  }
  const out = [], vistos = new Set();
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let t;
  while ((t = w.nextNode())) {
    if (!t.textContent.trim()) continue;
    const e = t.parentElement;
    if (!e || e.closest('script,style,noscript,.visualmente-oculto')) continue;
    const cs = getComputedStyle(e);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = e.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const cor = parse(cs.color);
    if (!cor) continue;
    const bg = fundo(e);
    const size = parseFloat(cs.fontSize), peso = parseInt(cs.fontWeight, 10);
    const grande = size >= 24 || (size >= 18.66 && peso >= 700);
    const min = grande ? 3 : 4.5;
    const rz = razao(cor, bg);
    const chave = e.tagName + e.className + cs.color + cs.fontSize + rz.toFixed(2);
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    out.push({el: e.tagName + '.' + e.className, texto: t.textContent.trim().slice(0, 30), razao: +rz.toFixed(2), min: min, ok: rz >= min, size: size, cor: cs.color});
  }
  return out;
}"""

JS_ESTRUTURA = """() => {
  const r = {};
  r.lang = document.documentElement.lang;
  r.h1 = document.querySelectorAll('h1').length;
  const hs = [...document.querySelectorAll('h1,h2,h3,h4')];
  let ant = 0, saltos = [];
  hs.forEach(h => { const n = +h.tagName[1]; if (ant && n > ant + 1) saltos.push(h.textContent.trim().slice(0, 30)); ant = n; });
  r.saltos = saltos;
  r.titulos = hs.map(h => h.tagName + ' ' + h.textContent.trim());
  r.landmarks = ['header', 'main', 'footer'].map(t => t + ':' + document.querySelectorAll(t).length);
  const ids = [...document.querySelectorAll('[id]')].map(e => e.id);
  r.idsDuplicados = ids.filter((v, i) => ids.indexOf(v) !== i);
  r.iframesSemTitle = [...document.querySelectorAll('iframe')].filter(f => !f.title).length;
  r.titulosMaiusculos = hs.filter(h => { const t = h.textContent.trim(); return t.length > 3 && t === t.toUpperCase() && /[A-Z]{4}/.test(t); }).map(h => h.textContent.trim());
  r.imgSemAlt = [...document.querySelectorAll('img')].filter(i => !i.hasAttribute('alt')).length;
  r.imgSemTamanho = [...document.querySelectorAll('img')].filter(i => !i.getAttribute('width') || !i.getAttribute('height')).length;
  r.imgDecorativaSemAria = [...document.querySelectorAll('img[alt=""]')].filter(i => i.getAttribute('aria-hidden') !== 'true').length;
  r.svgSemAria = [...document.querySelectorAll('svg')].filter(s => s.getAttribute('aria-hidden') !== 'true').length;
  return r;
}"""

JS_IMGS_LAZY = """() => [...document.querySelectorAll('img')].map(i => ({
  src: i.getAttribute('src'), top: Math.round(i.getBoundingClientRect().top + window.scrollY),
  lazy: i.getAttribute('loading') === 'lazy', hero: !!i.closest('.hero__figura'), topo: !!i.closest('.topo')}))"""

JS_PENDENTE_VISIVEL = "() => document.body.innerText.split('\\n').filter(l => l.indexOf('PENDENTE') !== -1)"


# ---------- checagens estaticas ----------
class Coletor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs = []
        self.links = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        for k in ("src", "href", "poster", "data-tally-src"):
            if k in a:
                self.refs.append((tag, k, a[k]))
        for k in ("srcset", "imagesrcset"):
            if k in a:
                for parte in a[k].split(","):
                    self.refs.append((tag, k, parte.strip().split(" ")[0]))
        if tag == "a" and "href" in a:
            self.links.append(a["href"])


def checar_arquivos_e_links():
    faltando, links_ext, mailtos, ancoras_ruins, hrefs_vazios, internos = [], set(), set(), [], [], []
    for pagina in ("index.html", "privacidade.html", "404.html"):
        txt = open(os.path.join(PUB, pagina), encoding="utf-8").read()
        c = Coletor()
        c.feed(txt)
        ids = set(re.findall(r'\sid="([^"]+)"', txt))
        base_dir = PUB
        for tag, k, v in c.refs:
            if not v or v.startswith(("http://", "https://", "mailto:", "data:")):
                continue
            if v.startswith("#"):
                continue
            alvo = v.split("#")[0].split("?")[0]
            if alvo in ("", "./"):
                continue
            caminho = os.path.join(base_dir, alvo.lstrip("/"))
            if not os.path.exists(caminho):
                faltando.append((pagina, v))
        for h in c.links:
            if h == "#" or h == "":
                hrefs_vazios.append((pagina, h))
            elif h.startswith("mailto:"):
                mailtos.add(h)
                if "@" not in h:
                    ancoras_ruins.append((pagina, h))
            elif h.startswith("http"):
                links_ext.add(h)
            elif h.startswith("#"):
                if h[1:] not in ids:
                    ancoras_ruins.append((pagina, h))
            else:
                internos.append((pagina, h))
    # css: urls
    css = open(os.path.join(PUB, "assets/css/site.css"), encoding="utf-8").read()
    for u in re.findall(r"url\(\"?([^)\"]+)\"?\)", css):
        if not os.path.exists(os.path.normpath(os.path.join(PUB, "assets/css", u))):
            faltando.append(("site.css", u))
    man = json.load(open(os.path.join(PUB, "site.webmanifest")))
    for ic in man["icons"]:
        if not os.path.exists(os.path.join(PUB, ic["src"])):
            faltando.append(("webmanifest", ic["src"]))
    return faltando, sorted(links_ext), sorted(mailtos), ancoras_ruins, hrefs_vazios, internos


def status_http(caminho):
    try:
        req = urllib.request.Request(BASE + caminho, method="GET")
        with urllib.request.urlopen(req, timeout=10) as r:
            return r.status
    except urllib.error.HTTPError as e:
        return e.code
    except Exception:
        return -1


# ---------- execucao ----------
def main():
    with sync_playwright() as p:
        nav = p.chromium.launch(executable_path="/opt/pw-browsers/chromium")

        # ---- 4. capturas ----
        tamanhos = [("390", 390, 844, 2), ("768", 768, 1024, 1), ("1280", 1280, 800, 1)]
        falhas_captura = []
        for nome, caminho in PAGINAS:
            for tag, w, h, esc in tamanhos:
                ctx = nav.new_context(viewport={"width": w, "height": h}, device_scale_factor=1)
                pg = abrir(ctx, caminho)
                pg.screenshot(path=os.path.join(CAP, "%s-%s-inteira.png" % (nome, tag)), full_page=True)
                pg.close()
                ctx.close()
                ctx = nav.new_context(viewport={"width": w, "height": h}, device_scale_factor=esc)
                pg = abrir(ctx, caminho, espera=False)
                pg.wait_for_timeout(2200)  # deixa o brilho do LED terminar
                pg.screenshot(path=os.path.join(CAP, "%s-%s-primeira-tela.png" % (nome, tag)))
                pg.close()
                ctx.close()
        for tag, w, h in (("320x640", 320, 640), ("paisagem-844x390", 844, 390), ("safari-390x664", 390, 664)):
            ctx = nav.new_context(viewport={"width": w, "height": h})
            pg = abrir(ctx, "/")
            pg.screenshot(path=os.path.join(CAP, "index-%s-inteira.png" % tag), full_page=True)
            pg.evaluate("window.scrollTo(0,0)")
            pg.wait_for_timeout(200)
            pg.screenshot(path=os.path.join(CAP, "index-%s-primeira-tela.png" % tag))
            pg.close()
            ctx.close()
        # publicado e movimento reduzido
        for tag, w, h in (("390", 390, 844), ("1280", 1280, 800)):
            ctx = nav.new_context(viewport={"width": w, "height": h})
            pg = abrir(ctx, "/")
            pg.evaluate("document.documentElement.setAttribute('data-modo','publicado')")
            pg.wait_for_timeout(300)
            pg.screenshot(path=os.path.join(CAP, "index-publicado-%s-inteira.png" % tag), full_page=True)
            pg.close()
            ctx.close()
            ctx = nav.new_context(viewport={"width": w, "height": h}, reduced_motion="reduce")
            pg = abrir(ctx, "/")
            pg.screenshot(path=os.path.join(CAP, "index-movimento-reduzido-%s-inteira.png" % tag), full_page=True)
            pg.close()
            ctx.close()
        R["4_capturas"] = sorted(os.listdir(CAP))

        # ---- 5. botao na primeira tela ----
        res5 = {}
        for modo in ("rascunho", "publicado"):
            ctx = nav.new_context(viewport={"width": 390, "height": 664})
            pg = ctx.new_page()
            pg.goto(BASE + "/")
            pg.evaluate("document.fonts.ready")
            pg.evaluate("m => document.documentElement.setAttribute('data-modo', m)", modo)
            pg.wait_for_timeout(300)
            res5[modo] = pg.evaluate("document.querySelector('.hero__cta .botao').getBoundingClientRect().bottom")
            pg.close()
            ctx.close()
        R["5_botao_primeira_tela_bottom_px"] = res5

        # ---- 6, 7, 8, 16 em varios tamanhos ----
        r6, r7, r8, r16 = {}, {}, {}, {}
        for nome, caminho in PAGINAS:
            for w, h in ((320, 640), (390, 844), (768, 1024), (1024, 768), (1280, 800), (844, 390)):
                ctx = nav.new_context(viewport={"width": w, "height": h})
                pg = abrir(ctx, caminho)
                sw, iw = pg.evaluate(JS_ROLAGEM_H)
                r6["%s %dx%d" % (nome, w, h)] = [sw, iw, sw <= iw]
                cortado = pg.evaluate(JS_CORTADO)
                if cortado:
                    r7["%s %dx%d" % (nome, w, h)] = cortado
                sobre = pg.evaluate(JS_SOBREPOSICAO)
                if sobre:
                    r8["%s %dx%d" % (nome, w, h)] = sobre[:12]
                if w == 390:
                    pg.add_style_tag(content="* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }")
                    pg.wait_for_timeout(300)
                    sw2, iw2 = pg.evaluate(JS_ROLAGEM_H)
                    c2 = pg.evaluate(JS_CORTADO)
                    s2 = pg.evaluate(JS_SOBREPOSICAO)
                    r16[nome] = {"scrollWidth": sw2, "inner": iw2, "cortado": c2, "sobreposicao": s2[:12]}
                    pg.screenshot(path=os.path.join(CAP, "%s-espacamento-texto-390.png" % nome), full_page=True)
                pg.close()
                ctx.close()
        R["6_rolagem_horizontal"] = r6
        R["7_texto_cortado"] = r7
        R["8_sobreposicao"] = r8
        R["16_espacamento_texto"] = r16

        # ---- 9. contraste ----
        r9 = {}
        for nome, caminho in PAGINAS:
            for w, h in ((390, 844), (1280, 800)):
                ctx = nav.new_context(viewport={"width": w, "height": h})
                pg = abrir(ctx, caminho)
                itens = pg.evaluate(JS_CONTRASTE)
                ruins = [i for i in itens if not i["ok"]]
                r9["%s %d" % (nome, w)] = {"verificados": len(itens), "abaixo": ruins, "menor_razao": min([i["razao"] for i in itens] or [0])}
                if nome == "index" and w == 390:
                    pg.evaluate("document.documentElement.setAttribute('data-modo','publicado')")
                    pg.wait_for_timeout(200)
                    itens2 = pg.evaluate(JS_CONTRASTE)
                    r9["index 390 publicado"] = {"verificados": len(itens2), "abaixo": [i for i in itens2 if not i["ok"]]}
                pg.close()
                ctx.close()
        R["9_contraste"] = r9

        # ---- 10. links ----
        faltando, ext, mail, anc, vazios, internos = checar_arquivos_e_links()
        codigos = {}
        for pagina, h in internos:
            alvo = "/" + h.split("#")[0].lstrip("./") if h.split("#")[0] not in ("", "./", ".") else "/"
            codigos[h] = status_http(alvo)
        R["10_links"] = {"arquivos_faltando": faltando, "ancoras_sem_alvo": anc, "href_vazio": vazios,
                         "internos_status": codigos, "mailto": mail, "externos_listados": ext}

        # ---- 11. imagens ----
        ctx = nav.new_context(viewport={"width": 390, "height": 844})
        pg = abrir(ctx, "/")
        imgs = pg.evaluate(JS_IMGS_LAZY)
        sem_lazy = [i for i in imgs if not i["lazy"] and i["top"] > 900 and not i["hero"] and not i["topo"]]
        est = pg.evaluate(JS_ESTRUTURA)
        R["11_imagens"] = {"total": len(imgs), "sem_lazy_abaixo_de_900": sem_lazy,
                           "sem_alt": est["imgSemAlt"], "sem_width_height": est["imgSemTamanho"],
                           "decorativa_sem_aria_hidden": est["imgDecorativaSemAria"]}
        pg.close()
        ctx.close()

        # ---- 12. peso ----
        r12 = {}
        for w, h in ((390, 844), (1280, 800)):
            for fase in ("inicial", "rolado"):
                if fase == "rolado" or w == 390:
                    ctx = nav.new_context(viewport={"width": w, "height": h})
                    pg = ctx.new_page()
                    tot = {"bytes": 0, "arquivos": {}}

                    def ao_resp(resp):
                        if resp.url.startswith(BASE):
                            try:
                                corpo = resp.body()
                            except Exception:
                                return
                            tot["bytes"] += len(corpo)
                            tot["arquivos"][resp.url.replace(BASE, "")] = len(corpo)

                    pg.on("response", ao_resp)
                    pg.goto(BASE + "/", wait_until="load")
                    pg.evaluate("document.fonts.ready")
                    pg.wait_for_timeout(2200)
                    if fase == "rolado":
                        rolar_tudo(pg, 600)
                        pg.wait_for_timeout(500)
                    r12["%dx%d %s" % (w, h, fase)] = {"KB": round(tot["bytes"] / 1024, 1), "n": len(tot["arquivos"]),
                                                      "maiores": sorted(tot["arquivos"].items(), key=lambda x: -x[1])[:6]}
                    pg.close()
                    ctx.close()
        R["12_peso"] = r12

        # ---- 13. LCP e CLS ----
        ctx = nav.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2)
        pg = ctx.new_page()
        pg.add_init_script("""
          window.__lcp = 0; window.__cls = 0;
          new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({type: 'largest-contentful-paint', buffered: true});
          new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({type: 'layout-shift', buffered: true});
        """)
        cdp = ctx.new_cdp_session(pg)
        cdp.send("Network.enable")
        cdp.send("Network.emulateNetworkConditions", {"offline": False, "latency": 150, "downloadThroughput": 200000, "uploadThroughput": 93750})
        cdp.send("Emulation.setCPUThrottlingRate", {"rate": 4})
        pg.goto(BASE + "/", wait_until="load")
        pg.wait_for_timeout(4000)
        lcp = pg.evaluate("window.__lcp")
        cls0 = pg.evaluate("window.__cls")
        rolar_tudo(pg, 400)
        pg.wait_for_timeout(2500)
        cls1 = pg.evaluate("window.__cls")
        R["13_lcp_cls"] = {"lcp_ms": round(lcp), "cls_carga": round(cls0, 4), "cls_apos_rolar": round(cls1, 4),
                           "rede": "latencia 150 ms, 200000 B/s; CPU 4x"}
        pg.close()
        ctx.close()

        # ---- 14. console e rede ----
        r14 = {}
        for nome, caminho in PAGINAS:
            ctx = nav.new_context(viewport={"width": 390, "height": 844})
            pg = ctx.new_page()
            erros, ruins = [], []
            pg.on("console", lambda m, e=erros: e.append(m.text) if m.type in ("error", "warning") else None)
            pg.on("pageerror", lambda x, e=erros: e.append(str(x)))
            pg.on("response", lambda r, b=ruins: b.append((r.status, r.url)) if r.status >= 400 else None)
            pg.goto(BASE + caminho, wait_until="load")
            rolar_tudo(pg)
            r14[nome] = {"console": erros, "http_4xx_5xx": ruins}
            pg.close()
            ctx.close()
        R["14_console_rede"] = r14

        # ---- 15. teclado ----
        r15 = {}
        for nome, caminho in PAGINAS[:2]:
            ctx = nav.new_context(viewport={"width": 390, "height": 844}, reduced_motion="reduce")
            pg = ctx.new_page()
            pg.goto(BASE + caminho, wait_until="load")
            pg.evaluate("document.fonts.ready")
            seq, problemas = [], []
            for i in range(80):
                pg.keyboard.press("Tab")
                pg.wait_for_timeout(60)
                info = pg.evaluate("""() => {
                  const e = document.activeElement;
                  if (!e || e === document.body) return null;
                  const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
                  return {tag: e.tagName.toLowerCase(), txt: (e.textContent || e.getAttribute('alt') || '').trim().slice(0, 36),
                          href: e.getAttribute('href'), outline: cs.outlineStyle, ow: cs.outlineWidth, w: Math.round(r.width), h: Math.round(r.height),
                          emlinha: e.tagName === 'A' && e.parentElement && e.parentElement.tagName === 'P' && (e.parentElement.textContent.trim().length > e.textContent.trim().length + 4),
                          dentro: r.top >= 0 && r.left >= 0 && r.bottom <= window.innerHeight + 1 && r.right <= window.innerWidth + 1,
                          alto: r.height > window.innerHeight};
                }""")
                if info is None:
                    break
                if seq and info["txt"] == seq[0]["txt"] and info["href"] == seq[0]["href"] and i > 2:
                    break
                seq.append(info)
                if info["outline"] == "none" or info["ow"] in ("0px",):
                    problemas.append(("sem contorno", info["txt"]))
                if not info["dentro"] and not info["alto"]:
                    problemas.append(("fora da tela", info["txt"]))
                if (info["w"] < 24 or info["h"] < 24) and not info["emlinha"]:
                    problemas.append(("alvo pequeno", info["txt"], info["w"], info["h"]))
            r15[nome] = {"n_focos": len(seq), "ordem": [("%s %s" % (s["tag"], s["txt"])) for s in seq], "problemas": problemas}
            pg.close()
            ctx.close()
        R["15_teclado"] = r15

        # ---- 17. estrutura ----
        r17 = {}
        for nome, caminho in PAGINAS:
            ctx = nav.new_context(viewport={"width": 390, "height": 844})
            pg = abrir(ctx, caminho)
            r17[nome] = pg.evaluate(JS_ESTRUTURA)
            pg.close()
            ctx.close()
        R["17_estrutura"] = r17

        # ---- 18. movimento reduzido ----
        ctx = nav.new_context(viewport={"width": 390, "height": 844}, reduced_motion="reduce")
        pg = abrir(ctx, "/")
        R["18_movimento_reduzido"] = pg.evaluate("""() => ({
          animacao: getComputedStyle(document.querySelector('.hero__brilho')).animationName,
          opacidadeBrilho: getComputedStyle(document.querySelector('.hero__brilho')).opacity,
          passos: [...document.querySelectorAll('.passos li')].map(l => getComputedStyle(l).opacity),
          classeRevelar: document.querySelectorAll('.passos li.revelar').length,
          scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior})""")
        pg.close()
        ctx.close()
        ctx = nav.new_context(viewport={"width": 390, "height": 844})
        pg = abrir(ctx, "/")
        R["18_movimento_normal_passos"] = pg.evaluate("""() => ({animacao: getComputedStyle(document.querySelector('.hero__brilho')).animationName,
          passos: [...document.querySelectorAll('.passos li')].map(l => getComputedStyle(l).opacity),
          revelar: document.querySelectorAll('.passos li.revelar').length, visivel: document.querySelectorAll('.passos li.visivel').length})""")
        pg.close()
        ctx.close()

        # ---- 19. publicado: PENDENTE visivel ----
        r19 = {}
        for nome, caminho in PAGINAS[:2]:
            ctx = nav.new_context(viewport={"width": 390, "height": 844})
            pg = abrir(ctx, caminho)
            pg.evaluate("document.documentElement.setAttribute('data-modo','publicado')")
            pg.wait_for_timeout(200)
            r19[nome] = pg.evaluate(JS_PENDENTE_VISIVEL)
            pg.close()
            ctx.close()
        R["19_publicado_pendente_visivel"] = r19

        # ---- extra: JavaScript desligado ----
        ctx = nav.new_context(viewport={"width": 390, "height": 844}, java_script_enabled=False)
        pg = ctx.new_page()
        pg.goto(BASE + "/", wait_until="load")
        pg.wait_for_timeout(800)
        sem_js = pg.evaluate("""() => ({
          classe: document.documentElement.className,
          passosVisiveis: [...document.querySelectorAll('.passos li')].map(l => getComputedStyle(l).opacity),
          rascunhoVisivel: getComputedStyle(document.querySelector('.lista__rascunho')).display,
          iframeDisplay: getComputedStyle(document.querySelector('.lista__tally iframe')).display,
          scrollW: document.documentElement.scrollWidth})""")
        pg.screenshot(path=os.path.join(CAP, "index-sem-js-390-inteira.png"), full_page=True)
        pg.close()
        ctx.close()
        # sem JS, publicado, com codigo falso do Tally: o noscript aparece
        ctx = nav.new_context(viewport={"width": 390, "height": 844}, java_script_enabled=False)
        pg = ctx.new_page()

        def troca(route):
            corpo = route.fetch().text().replace("PENDENTE_TALLY_ID", "TESTE123").replace('data-modo="rascunho"', 'data-modo="publicado"')
            route.fulfill(status=200, content_type="text/html; charset=utf-8", body=corpo)

        pg.route(BASE + "/", troca)
        pg.goto(BASE + "/", wait_until="load")
        sem_js["noscript_fallback_visivel"] = pg.evaluate("""() => { const n = document.querySelector('.lista__tally noscript');
          return n ? n.textContent.trim().slice(0, 120) : null; }""")
        pg.locator("#lista").screenshot(path=os.path.join(CAP, "lista-sem-js-publicado-390.png"))
        pg.close()
        ctx.close()
        R["extra_sem_javascript"] = sem_js

        # ---- extra: fluxo do Tally com codigo falso e script bloqueado (falha) e sucesso simulado ----
        ctx = nav.new_context(viewport={"width": 390, "height": 844})
        pg = ctx.new_page()
        pedidos = []
        pg.on("request", lambda r: pedidos.append(r.url) if "tally.so" in r.url else None)
        pg.route(BASE + "/", troca)
        pg.route("https://tally.so/**", lambda r: r.abort())
        pg.goto(BASE + "/", wait_until="load")
        pg.evaluate("document.getElementById('lista').scrollIntoView()")
        pg.wait_for_timeout(1500)
        antes = pg.evaluate("({carregando: !document.querySelector('.lista__carregando').hidden, erro: !document.querySelector('.lista__erro').hidden})")
        pg.wait_for_timeout(10500)
        depois = pg.evaluate("({carregando: !document.querySelector('.lista__carregando').hidden, erro: !document.querySelector('.lista__erro').hidden, href: document.querySelector('.lista__reserva').href})")
        pg.locator("#lista").screenshot(path=os.path.join(CAP, "lista-falha-tally-390.png"))
        R["extra_tally_bloqueado"] = {"pedidos_ao_tally": len(pedidos), "apos_1_5s": antes, "apos_12s": depois}
        pg.close()
        ctx.close()

        # tally: so carrega perto da secao e so com codigo real; sem codigo, nada e pedido
        ctx = nav.new_context(viewport={"width": 390, "height": 844})
        pg = ctx.new_page()
        pedidos2 = []
        pg.on("request", lambda r: pedidos2.append(r.url) if "tally.so" in r.url else None)
        pg.goto(BASE + "/", wait_until="load")
        rolar_tudo(pg)
        R["extra_tally_sem_codigo_pedidos"] = len(pedidos2)
        pg.close()
        ctx.close()
        # UTM no link de reserva
        ctx = nav.new_context(viewport={"width": 390, "height": 844})
        pg = ctx.new_page()
        pg.route(BASE + "/*", lambda r: troca(r) if r.request.url.split("?")[0] == BASE + "/" else r.continue_())
        pg.route("https://tally.so/**", lambda r: r.abort())
        pg.goto(BASE + "/?utm_source=instagram&utm_medium=bio&utm_content=link_bio&x=<script>", wait_until="load")
        pg.wait_for_timeout(500)
        R["extra_utm_link_reserva"] = pg.evaluate("document.querySelector('.lista__reserva').href")
        pg.close()
        ctx.close()

        # FAQ por ancora
        ctx = nav.new_context(viewport={"width": 390, "height": 844})
        pg = ctx.new_page()
        pg.goto(BASE + "/#faq-tecnico", wait_until="load")
        pg.wait_for_timeout(600)
        R["extra_faq_ancora"] = pg.evaluate("({aberto: document.getElementById('faq-tecnico').open, foco: document.activeElement.tagName, outros: [...document.querySelectorAll('.faq details')].filter(d => d.open).length})")
        pg.screenshot(path=os.path.join(CAP, "index-faq-ancora-390.png"))
        pg.close()
        ctx.close()

        # cabecalhos aplicados
        ctx = nav.new_context()
        pg = ctx.new_page()
        resp = pg.goto(BASE + "/")
        R["extra_cabecalhos"] = {k: v[:80] for k, v in resp.headers.items() if k in ("content-security-policy", "x-frame-options", "x-content-type-options", "referrer-policy", "permissions-policy")}
        cookies = ctx.cookies()
        R["extra_cookies_apos_carga"] = len(cookies)
        pg.close()
        ctx.close()
        nav.close()

    json.dump(R, open(os.path.join(QA, "resultados.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("resultados em", os.path.join(QA, "resultados.json"))


if __name__ == "__main__":
    main()
