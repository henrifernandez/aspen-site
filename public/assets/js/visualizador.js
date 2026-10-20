/* Aspen Core, visualizador 3D da Aspen Key. Modulo carregado sob demanda pelo site.js.
   Modelo simplificado e ilustrativo, montado por codigo a partir do render. Nao e CAD do protótipo.
   Usa three.js (MIT, copia local em vendor/). Arrastar ou setas giram, sem biblioteca de controles. */
import * as THREE from './vendor/three-0.170.0.module.min.js';

var MM_CENTRO_Y = 13.5; /* centro de giro, no meio entre a ponta do USB-C e o topo do anel */

function caixaArredondada(l, a, r) {
  var s = new THREE.Shape();
  var x = -l / 2, y = -a / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + l - r, y); s.quadraticCurveTo(x + l, y, x + l, y + r);
  s.lineTo(x + l, y + a - r); s.quadraticCurveTo(x + l, y + a, x + l - r, y + a);
  s.lineTo(x + r, y + a); s.quadraticCurveTo(x, y + a, x, y + a - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function extrudar(forma, espessura, chanfro) {
  var g = new THREE.ExtrudeGeometry(forma, {
    depth: espessura - chanfro * 2, bevelEnabled: true, bevelThickness: chanfro, bevelSize: chanfro,
    bevelSegments: 3, curveSegments: 10
  });
  g.center();
  return g;
}

function ambiente(renderer) {
  var cena = new THREE.Scene();
  cena.background = new THREE.Color(0x05131a);
  function painel(cor, intensidade, w, h, pos) {
    var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(cor).multiplyScalar(intensidade), side: THREE.DoubleSide }));
    m.position.set(pos[0], pos[1], pos[2]);
    m.lookAt(0, 0, 0);
    cena.add(m);
  }
  painel(0xffffff, 9, 16, 12, [-8, 9, 8]);   /* luz principal, alto a esquerda */
  painel(0xdfe9ee, 4, 12, 16, [10, 2, 6]);   /* preenchimento a direita */
  painel(0x94f7fe, 1.3, 3, 14, [9, 0, -8]);  /* contra-luz ciano, combina com o LED */
  painel(0xffffff, 2.4, 18, 5, [0, -9, 6]);   /* rebatedor de baixo */
  var pmrem = new THREE.PMREMGenerator(renderer);
  var rt = pmrem.fromScene(cena, 0.04);
  pmrem.dispose();
  return rt.texture;
}

function montarChave(texEscudo) {
  var grupo = new THREE.Group();

  var metal = new THREE.MeshPhysicalMaterial({ color: 0x4d5254, metalness: 0.85, roughness: 0.38, clearcoat: 0.3, clearcoatRoughness: 0.45 });
  var metalCapa = metal.clone(); metalCapa.color = new THREE.Color(0x474c4e);
  var aco = new THREE.MeshStandardMaterial({ color: 0xd6d6cc, metalness: 1, roughness: 0.22 });
  var preto = new THREE.MeshStandardMaterial({ color: 0x121314, metalness: 0.6, roughness: 0.26 });
  var led = new THREE.MeshBasicMaterial({ color: 0x2a9fd0, toneMapped: false });
  var halo = new THREE.MeshBasicMaterial({ color: 0x1f8fd0, transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });

  /* Corpo: 22 x 62 x 8 mm */
  var corpo = new THREE.Mesh(extrudar(caixaArredondada(22, 62, 1.6), 8, 0.7), metal);
  corpo.position.set(0, 0, 0);
  grupo.add(corpo);

  /* Tampa do chaveiro com furo em ranhura: 22 x 18 x 8 mm, mais alta que o corpo */
  var forma = caixaArredondada(22, 18, 1.6);
  var furo = new THREE.Path();
  var fx = -5.5, fy = -2.6, fl = 11, fa = 5.2, fr = 2.6;
  furo.moveTo(fx + fr, fy); furo.lineTo(fx + fl - fr, fy); furo.absarc(fx + fl - fr, fy + fr, fr, -Math.PI / 2, Math.PI / 2, false);
  furo.lineTo(fx + fr, fy + fa); furo.absarc(fx + fr, fy + fr, fr, Math.PI / 2, Math.PI * 1.5, false);
  forma.holes.push(furo);
  var tampa = new THREE.Mesh(extrudar(forma, 8, 0.7), metalCapa);
  tampa.position.set(0, 32.2 + 9, 0);
  grupo.add(tampa);

  /* Faixa de luz entre corpo e tampa */
  var faixa = new THREE.Mesh(new THREE.BoxGeometry(21.4, 1.1, 7.6), led);
  faixa.position.set(0, 31.6, 0);
  grupo.add(faixa);
  var brilho = new THREE.Mesh(new THREE.BoxGeometry(22.6, 2.6, 8.8), halo);
  brilho.position.copy(faixa.position);
  grupo.add(brilho);

  /* Conector USB-C: base fina escura e peça de aço, 8.4 x 2.6 mm */
  var base = new THREE.Mesh(new THREE.BoxGeometry(13, 1.1, 5.2), preto);
  base.position.set(0, -31.4, 0);
  grupo.add(base);
  var usb = new THREE.Mesh(extrudar(caixaArredondada(8.4, 12, 1.25), 2.6, 0.5), aco);
  usb.position.set(0, -31 - 5.4, 0);
  grupo.add(usb);
  var vazio = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.2, 1.0), preto);
  vazio.position.set(0, -41.4, 0);
  grupo.add(vazio);

  /* Escudo gravado na face da frente */
  if (texEscudo) {
    var escudo = new THREE.Mesh(new THREE.PlaneGeometry(8.4, 8.5),
      new THREE.MeshStandardMaterial({ map: texEscudo, color: 0x9c9d90, transparent: true, metalness: 0.7, roughness: 0.45,
        depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    escudo.position.set(0, -8, 4.02);
    grupo.add(escudo);
  }

  /* Argola de chaveiro passando pelo furo da tampa */
  var argola = new THREE.Mesh(new THREE.TorusGeometry(13, 1.15, 14, 72), preto);
  argola.position.set(0, 32.2 + 9 - 0.5 + 12.2, 0);
  argola.rotation.y = 1.0;
  grupo.add(argola);

  grupo.position.y = -MM_CENTRO_Y;
  return grupo;
}

export function iniciar(host, opcoes) {
  opcoes = opcoes || {};
  var reduzido = !!opcoes.movimentoReduzido;
  var canvas = host.querySelector('canvas');

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  var cena = new THREE.Scene();
  cena.environment = ambiente(renderer);
  var luz = new THREE.DirectionalLight(0xffffff, 1.4);
  luz.position.set(-30, 50, 60);
  cena.add(luz);

  var camera = new THREE.PerspectiveCamera(20, 1, 10, 1200);

  var pivo = new THREE.Group(); /* a orientação inteira da chave fica aqui, como quaternion: giro livre, sem travar em cima ou embaixo */
  cena.add(pivo);

  var texEscudo = new THREE.TextureLoader().load(new URL('../img/escudo-creme-128.webp', import.meta.url).href, function () { pedir(); });
  texEscudo.colorSpace = THREE.SRGBColorSpace;
  texEscudo.anisotropy = 4;
  pivo.add(montarChave(texEscudo));

  /* Vistas prontas: yaw, pitch e roll em radianos, ordem YXZ */
  var VISTAS = {
    inicial: [-0.55, 0.12, -0.28],
    frente: [-0.12, 0.05, 0],
    costas: [Math.PI - 0.12, 0.05, 0],
    lado: [-Math.PI / 2 + 0.1, 0.08, 0],
    anel: [-0.35, 1.2, 0],
    usb: [-0.35, -1.2, 0]
  };
  function quatDe(v) { return new THREE.Quaternion().setFromEuler(new THREE.Euler(v[1], v[0], v[2], 'YXZ')); }

  var q = quatDe(VISTAS.inicial);
  var vx = 0, vy = 0;          /* velocidade angular da inércia, rad/s (vy em torno do eixo Y da tela, vx em torno do X) */
  /* O zoom máximo não é fixo: é o maior que ainda deixa a chave, na posição em que está, sem encostar nas palavras, nos botões
     e no topo em volta. Ele é recalculado a cada quadro, então gira junto com a chave. */
  var ZOOM_REPOUSO = 0.85, ZOOM_MIN = 0.4, ZOOM_ABS = 3;
  var zoom = ZOOM_REPOUSO, alvoZoom = ZOOM_REPOUSO, pedido = ZOOM_REPOUSO; /* pedido é o que a pessoa quer; alvoZoom é o que o espaço livre permite */
  var auto = !reduzido;        /* giro lento até a primeira interação */
  var anim = null;             /* transição para uma vista: { de, para, t, dur } */
  var ponteiros = { n: 0 };    /* ponteiros ativos, para arrastar com um dedo e dar pinça com dois */
  var distPinca = 0, zoomPinca = 1;
  var rodando = false, anterior = 0, visivel = true;
  var ultimoT = 0;

  /* Pontos que contornam a chave (em mm, em torno do centro de giro): corpo, tampa, conector e argola */
  var PONTOS = (function () {
    var l = [];
    function caixa(x, y0, y1, z) {
      [-x, x].forEach(function (px) { [y0, y1].forEach(function (py) { [-z, z].forEach(function (pz) { l.push(new THREE.Vector3(px, py - MM_CENTRO_Y, pz)); }); }); });
    }
    caixa(11, -31, 31, 4);
    caixa(11, 32.2, 50.2, 4);
    caixa(4.2, -42.4, -30.4, 1.3);
    for (var i = 0; i < 24; i++) { /* argola: círculo de raio 14 em torno de (0, 52.9), girado 1 rad em Y */
      var t = i / 24 * Math.PI * 2, rx = Math.cos(t) * 14.2, ry = Math.sin(t) * 14.2;
      l.push(new THREE.Vector3(rx * Math.cos(1), 52.9 + ry - MM_CENTRO_Y, -rx * Math.sin(1)));
    }
    return l;
  })();
  var camDist = 400, tgv = Math.tan(THREE.MathUtils.degToRad(10)), ladoCanvas = 400, pxMm = 4;
  var pan = { x: 0, y: 0 };    /* deslocamento fixo da chave na caixa, em px (y para cima), rumo ao lado onde há mais espaço livre */
  var limites = { esq: 200, dir: 200, cima: 300, baixo: 300 }; /* folga em px, do centro da caixa até o que não pode ser tocado */
  var V = new THREE.Vector3();

  function medirLimites() {
    var r = host.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    var raiz = document.documentElement;
    var esq = 4, dir = raiz.clientWidth - 4, cima = -Infinity, baixo = Infinity;
    var topo = document.querySelector('.topo');
    if (topo) cima = topo.getBoundingClientRect().bottom + 4;
    var hero = host.closest('.hero');
    if (hero) {
      /* palavras em volta: o que está ao lado esquerdo limita a esquerda; o que está embaixo limita embaixo */
      hero.querySelectorAll('.hero__h1, .hero__sub, .hero__cta, .aviso--escuro').forEach(function (el) {
        var b = el.getBoundingClientRect();
        if (!b.width || !b.height) return;
        if (b.top >= r.bottom - 1) baixo = Math.min(baixo, b.top - 8);
        else if (b.right <= cx) esq = Math.max(esq, b.right + 12);
      });
    }
    var ctl = document.querySelector('.hero__controles');
    if (ctl && !ctl.hidden) baixo = Math.min(baixo, ctl.getBoundingClientRect().top - 6);
    limites.esq = cx - esq; limites.dir = dir - cx;
    limites.cima = cima === -Infinity ? 1e5 : cy - cima;
    limites.baixo = baixo === Infinity ? 1e5 : baixo - cy;
    /* a chave não precisa ficar no centro da caixa: desloca-se um pouco para o lado mais livre, e assim cresce mais */
    var maxX = r.width * 0.18, maxY = r.height * 0.14;
    pan.x = Math.max(-maxX, Math.min(maxX, (limites.dir - limites.esq) / 2));
    pan.y = Math.max(-maxY, Math.min(maxY, (limites.cima - limites.baixo) / 2));
  }

  function zoomMaximo() {
    var minX = 0, maxX = 0, minY = 0, maxY = 0;
    for (var i = 0; i < PONTOS.length; i++) {
      V.copy(PONTOS[i]).applyQuaternion(q);
      var k = 1 / ((camDist - V.z) * tgv), nx = V.x * k, ny = V.y * k;
      if (nx < minX) minX = nx; if (nx > maxX) maxX = nx;
      if (ny < minY) minY = ny; if (ny > maxY) maxY = ny;
    }
    var meio = ladoCanvas / 2 - 2, z = ZOOM_ABS;
    if (maxX > 0) z = Math.min(z, (Math.min(limites.dir, meio) - pan.x) / (maxX * meio));
    if (minX < 0) z = Math.min(z, (Math.min(limites.esq, meio) + pan.x) / (-minX * meio));
    if (maxY > 0) z = Math.min(z, (Math.min(limites.cima, meio) - pan.y) / (maxY * meio));
    if (minY < 0) z = Math.min(z, (Math.min(limites.baixo, meio) + pan.y) / (-minY * meio));
    return Math.max(ZOOM_MIN, z);
  }

  var QX = new THREE.Quaternion(), QY = new THREE.Quaternion();
  var EIXO_X = new THREE.Vector3(1, 0, 0), EIXO_Y = new THREE.Vector3(0, 1, 0);
  function girar(emY, emX) { /* ângulos em torno dos eixos da tela, aplicados sobre a orientação atual */
    QY.setFromAxisAngle(EIXO_Y, emY); QX.setFromAxisAngle(EIXO_X, emX);
    q.premultiply(QX).premultiply(QY).normalize();
  }

  function ajustar() {
    var w = Math.max(host.clientWidth, 1), h = Math.max(host.clientHeight, 1);
    /* Escala em repouso: a chave inteira cabe na caixa visível. O canvas é um quadrado maior que a caixa,
       centrado nela (sem capturar clique), com folga para qualquer giro: o modelo, no zoom máximo, cabe numa esfera de 285 mm. */
    var pxPorMm = Math.min(h / 118, w / 80);
    var lado = Math.round(Math.max(h, 285 * pxPorMm));
    canvas.style.width = canvas.style.height = lado + 'px';
    canvas.style.left = Math.round((w - lado) / 2) + 'px';
    canvas.style.top = Math.round((h - lado) / 2) + 'px';
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(lado, lado, false);
    camera.aspect = 1;
    var tg = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    camDist = (lado / pxPorMm / 2) / tg; tgv = tg; ladoCanvas = lado; pxMm = pxPorMm;
    camera.position.set(0, 0, camDist);
    camera.lookAt(0, 0, 0);
    camera.zoom = zoom;
    camera.updateProjectionMatrix();
    medirLimites();
    desenhar();
  }

  function desenhar() {
    pivo.quaternion.copy(q);
    pivo.position.set(pan.x / (pxMm * zoom), pan.y / (pxMm * zoom), 0);
    renderer.render(cena, camera);
  }

  function atualizarZoom() {
    camera.zoom = zoom;
    camera.updateProjectionMatrix();
  }

  function facil(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  function quadro(t) {
    rodando = false;
    if (!visivel) return;
    var dt = Math.min((t - anterior) / 1000, 0.05);
    anterior = t;
    var continua = false;

    if (anim) {
      anim.t = Math.min(anim.t + dt / anim.dur, 1);
      q.slerpQuaternions(anim.de, anim.para, facil(anim.t));
      if (anim.t >= 1) anim = null; else continua = true;
    } else if (ponteiros.n === 0) {
      if (auto) { girar(0.5 * dt, 0); continua = true; }
      if (Math.abs(vx) > 0.02 || Math.abs(vy) > 0.02) {
        girar(vy * dt, vx * dt);
        var f = Math.pow(0.06, dt); vx *= f; vy *= f; continua = true;
      } else { vx = vy = 0; }
    } else { continua = true; }

    alvoZoom = Math.min(pedido, zoomMaximo());
    if (Math.abs(alvoZoom - zoom) > 0.002) {
      /* encolhe na hora (nunca encosta no texto); cresce com suavidade */
      if (alvoZoom < zoom || reduzido) zoom = alvoZoom;
      else zoom += (alvoZoom - zoom) * (1 - Math.pow(0.001, dt));
      atualizarZoom(); continua = true;
    }
    desenhar();
    if (continua) pedir();
  }
  function pedir() {
    if (rodando || !visivel) return;
    rodando = true;
    anterior = performance.now();
    requestAnimationFrame(quadro);
  }

  function avisarAuto() { if (opcoes.aoMudarAuto) opcoes.aoMudarAuto(auto); }
  function interagiu() {
    anim = null;
    host.classList.add('visualizador--usado');
    if (auto) { auto = false; avisarAuto(); }
  }
  function limitarZoom(z) { return Math.max(ZOOM_MIN, Math.min(zoomMaximo(), z)); }

  /* Ponteiros: um dedo ou o mouse giram, dois dedos dão pinça */
  function lista() { var l = []; for (var k in ponteiros) if (k !== 'n') l.push(ponteiros[k]); return l; }
  function distancia() {
    var p = lista();
    return p.length > 1 ? Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) : 0;
  }
  function aoApertar(e) {
    if (e.pointerType === 'mouse' && e.button > 0) return;
    ponteiros[e.pointerId] = { x: e.clientX, y: e.clientY };
    ponteiros.n = lista().length;
    if (ponteiros.n === 2) { distPinca = distancia(); zoomPinca = alvoZoom; medirLimites(); }
    ultimoT = e.timeStamp; vx = vy = 0;
    interagiu();
    try { host.setPointerCapture(e.pointerId); } catch (x) {}
    host.classList.add('visualizador--arrastando');
    pedir();
  }
  function aoMover(e) {
    var p = ponteiros[e.pointerId];
    if (!p) return;
    var dx = e.clientX - p.x, dy = e.clientY - p.y;
    p.x = e.clientX; p.y = e.clientY;
    if (ponteiros.n >= 2) {
      var d = distancia();
      if (distPinca > 0 && d > 0) { pedido = limitarZoom(zoomPinca * d / distPinca); alvoZoom = zoom = Math.min(pedido, zoomMaximo()); atualizarZoom(); }
    } else {
      var dt = Math.max((e.timeStamp - ultimoT) / 1000, 0.001);
      var ay = dx * 0.011, ax = dy * 0.011;
      girar(ay, ax);
      vy = vy * 0.5 + (ay / dt) * 0.5; vx = vx * 0.5 + (ax / dt) * 0.5;
      ultimoT = e.timeStamp;
    }
    pedir();
  }
  function aoSoltar(e) {
    if (!ponteiros[e.pointerId]) return;
    delete ponteiros[e.pointerId];
    ponteiros.n = lista().length;
    if (ponteiros.n === 0) {
      host.classList.remove('visualizador--arrastando');
      if (reduzido || e.timeStamp - ultimoT > 90) vx = vy = 0;
      var m = Math.hypot(vx, vy);
      if (m > 8) { vx *= 8 / m; vy *= 8 / m; }
    }
    pedir();
  }
  host.addEventListener('pointerdown', aoApertar);
  host.addEventListener('pointermove', aoMover);
  host.addEventListener('pointerup', aoSoltar);
  host.addEventListener('pointercancel', aoSoltar);
  host.addEventListener('dblclick', function () { api.reiniciar(); });

  /* Ctrl e rolagem (ou pinça no trackpad) dão zoom; a rolagem comum segue rolando a página */
  host.addEventListener('wheel', function (e) {
    if (!e.ctrlKey) return;
    e.preventDefault();
    interagiu();
    medirLimites();
    pedido = limitarZoom(alvoZoom * Math.exp(-e.deltaY * 0.01));
    pedir();
  }, { passive: false });

  host.addEventListener('keydown', function (e) {
    var imp = 1.6, usado = true;
    if (e.key === 'ArrowLeft') vy = -imp;
    else if (e.key === 'ArrowRight') vy = imp;
    else if (e.key === 'ArrowUp') vx = -imp;
    else if (e.key === 'ArrowDown') vx = imp;
    else if (e.key === '+' || e.key === '=') { medirLimites(); pedido = limitarZoom(alvoZoom * 1.2); }
    else if (e.key === '-') { medirLimites(); pedido = limitarZoom(alvoZoom / 1.2); }
    else if (e.key === '0' || e.key === 'Home') { api.reiniciar(); e.preventDefault(); return; }
    else usado = false;
    if (!usado) return;
    e.preventDefault(); interagiu(); pedir();
  });

  var obs = null;
  if ('IntersectionObserver' in window) {
    obs = new IntersectionObserver(function (en) {
      visivel = en[0].isIntersecting;
      if (visivel) pedir();
    }, { threshold: 0 });
    obs.observe(host);
  }
  var ro = null;
  if ('ResizeObserver' in window) { ro = new ResizeObserver(ajustar); ro.observe(host); }
  else window.addEventListener('resize', ajustar);

  canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); if (opcoes.aoFalhar) opcoes.aoFalhar(); });

  var api = {
    vista: function (nome) {
      var v = VISTAS[nome]; if (!v) return;
      interagiu(); vx = vy = 0;
      anim = { de: q.clone(), para: quatDe(v), t: 0, dur: reduzido ? 0.01 : 0.8 };
      pedir();
    },
    zoom: function (fator) { interagiu(); medirLimites(); pedido = limitarZoom(alvoZoom * fator); pedir(); },
    auto: function (ligado) {
      auto = typeof ligado === 'boolean' ? ligado : !auto;
      if (auto) { anim = null; vx = vy = 0; }
      avisarAuto(); pedir();
      return auto;
    },
    reiniciar: function () { api.vista('inicial'); pedido = ZOOM_REPOUSO; },
    destruir: function () {
      if (obs) obs.disconnect();
      if (ro) ro.disconnect(); else window.removeEventListener('resize', ajustar);
      visivel = false;
      renderer.dispose();
    }
  };

  ajustar();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { medirLimites(); pedir(); });
  pedir();
  if (auto) avisarAuto();
  return api;
}
