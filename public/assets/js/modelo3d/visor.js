/* Aspen Core, visor 3D da bancada. Sem biblioteca de controles.
   Arrastar gira, botão direito ou Shift move a vista, roda ou pinça dá zoom, setas e +/- no teclado, duplo clique volta ao início.
   Clique ou toque numa peça seleciona (destaque, o resto escurece, a câmera chega perto). Também faz a vista explodida,
   liga e desliga camadas e expõe a câmera e um gancho por quadro para a animação. Desenha só quando algo muda. */
import * as THREE from '../vendor/three-0.170.0.module.min.js';

var VISTAS = {
  tres_quartos: { theta: -0.55, phi: 0.95 },
  do_alto: { theta: 0, phi: 0.2 },
  frente: { theta: 0, phi: 1.2 },
  lado: { theta: -1.45, phi: 1.2 },
  tras: { theta: 3.14, phi: 1.05 },
  retrato: { theta: -0.3, phi: 0.6 } /* início em tela vertical: o lado comprido fica em pé */
};
var NAO_OCLUEM = { fios: true, 'cabos-usb': true };

function ambiente(renderer) {
  var cena = new THREE.Scene();
  cena.background = new THREE.Color(0xd9d5ca);
  function painel(cor, inten, w, h, pos) {
    var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(cor).multiplyScalar(inten), side: THREE.DoubleSide }));
    m.position.set(pos[0], pos[1], pos[2]); m.lookAt(0, 0, 0); cena.add(m);
  }
  painel(0xffffff, 5, 16, 12, [-8, 10, 8]);
  painel(0xfff4e0, 2.4, 12, 14, [10, 4, 6]);
  painel(0xdfe9ee, 1.6, 14, 8, [0, 6, -9]);
  painel(0xffffff, 1.2, 18, 5, [0, -9, 4]);
  var pm = new THREE.PMREMGenerator(renderer);
  var rt = pm.fromScene(cena, 0.04);
  pm.dispose();
  return rt.texture;
}

export function criarVisor(host, modelo, opcoes) {
  opcoes = opcoes || {};
  var reduzido = false;
  try { reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  var canvas = renderer.domElement;
  canvas.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;';
  host.appendChild(canvas);

  var cena = new THREE.Scene();
  cena.background = new THREE.Color(0xd9d5ca);
  cena.environment = ambiente(renderer);
  cena.environmentIntensity = 0.9;

  var luz = new THREE.DirectionalLight(0xfff6e8, 1.6);
  luz.position.set(-70, 150, 90);
  luz.castShadow = true;
  luz.shadow.mapSize.set(2048, 2048);
  var c = luz.shadow.camera; c.left = -150; c.right = 150; c.top = 150; c.bottom = -150; c.near = 20; c.far = 420;
  luz.shadow.bias = -0.0004; luz.shadow.normalBias = 0.4; luz.shadow.radius = 4;
  cena.add(luz);
  /* a luz acompanha o centro do que está em cena quando a animação alarga o palco */
  var luzAlvo = luz.target; cena.add(luzAlvo);

  var mesa = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400), new THREE.MeshStandardMaterial({ color: 0xd8d1c0, roughness: 0.92 }));
  mesa.rotation.x = -Math.PI / 2; mesa.position.y = -0.05; mesa.receiveShadow = true;
  cena.add(mesa);
  cena.fog = new THREE.Fog(0xd9d5ca, 600, 1400);

  cena.add(modelo.grupo);

  var camera = new THREE.PerspectiveCamera(30, 1, 5, 3000);
  var alvo = new THREE.Vector3(0, 6, 22), alvoPadrao = alvo.clone();
  var th = VISTAS.tres_quartos.theta, ph = VISTAS.tres_quartos.phi, dist = 400, distPadrao = 400;
  var vth = 0, vph = 0, anim = null, rodando = false, anterior = 0, mexeu = false;
  var gancho = null, entradaLigada = true, aoRedim = opcoes.aoRedimensionar || null;

  /* ---------- peças: materiais próprios por malha, para destacar e escurecer sem afetar as outras ---------- */
  var ids = modelo.selecionaveis || [], selSet = {}, malhas = [];
  ids.forEach(function (id) { selSet[id] = true; });
  modelo.grupo.traverse(function (o) {
    if (!o.isMesh) return;
    var p = o, id = null;
    while (p && p !== modelo.grupo) { if (selSet[p.name]) { id = p.name; break; } p = p.parent; }
    o.userData.parte = id; o.userData.k = 1; o.userData.h = 0;
    var arr = Array.isArray(o.material), lista = arr ? o.material : [o.material];
    var novos = lista.map(function (m) {
      var cl = m.clone();
      cl.userData.base = { cor: cl.color.clone(), emi: cl.emissive ? cl.emissive.clone() : new THREE.Color(0) };
      return cl;
    });
    o.material = arr ? novos : novos[0]; o.userData.mats = novos; malhas.push(o);
  });
  var HL = new THREE.Color(0x1f7a88), tmp = new THREE.Color();
  function aplicarMalha(o) {
    var k = o.userData.k, h = o.userData.h;
    o.userData.mats.forEach(function (m) {
      var b = m.userData.base;
      m.color.copy(b.cor).multiplyScalar(0.3 + 0.7 * k); /* as outras peças escurecem sem sumir, para a montagem continuar legível */
      if (m.emissive) m.emissive.copy(b.emi).add(tmp.copy(HL).multiplyScalar(h * 0.07));
    });
  }

  var sel = null, hov = null;
  var expo = 0, expoAlvo = 0, pos0 = {}, expVec = {};
  Object.keys(modelo.exp || {}).forEach(function (id) {
    var p = modelo.partes[id]; if (!p) return;
    pos0[id] = p.position.clone(); expVec[id] = new THREE.Vector3().fromArray(modelo.exp[id]);
  });
  var camadaOn = { fios: true, 'cabos-usb': true }, forcaOculto = {};
  function aplicarVisibilidade() {
    ['fios', 'cabos-usb'].forEach(function (id) {
      var p = modelo.partes[id]; if (!p) return;
      p.visible = camadaOn[id] && !forcaOculto[id] && !(id === 'fios' && expo > 0.02);
    });
  }
  function aplicarExplosao() {
    var e = expo * expo * (3 - 2 * expo);
    Object.keys(expVec).forEach(function (id) { modelo.partes[id].position.copy(pos0[id]).addScaledVector(expVec[id], e); });
    aplicarVisibilidade();
  }

  /* ---------- câmera ---------- */
  function posicionar() {
    var sp = Math.sin(ph);
    camera.position.set(alvo.x + dist * sp * Math.sin(th), alvo.y + dist * Math.cos(ph), alvo.z + dist * sp * Math.cos(th));
    camera.lookAt(alvo);
  }
  function fit(r) {
    var fv = THREE.MathUtils.degToRad(camera.fov / 2), fh = Math.atan(Math.tan(fv) * camera.aspect);
    return r / Math.sin(Math.min(fv, fh));
  }
  function inicial() { return camera.aspect < 0.85 ? VISTAS.retrato : VISTAS.tres_quartos; }
  function ajustar() {
    var w = Math.max(host.clientWidth, 1), h = Math.max(host.clientHeight, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    distPadrao = fit(modelo.raio) * 0.8;
    cena.fog.near = Math.max(600, distPadrao * 1.6); cena.fog.far = Math.max(1400, distPadrao * 3.4);
    if (!mexeu) { var v = inicial(); th = v.theta; ph = v.phi; dist = distPadrao; }
    if (aoRedim) aoRedim();
    pedir();
  }
  function desenhar() { posicionar(); renderer.render(cena, camera); }

  function quadro(t) {
    rodando = false;
    /* dt entre dois quadros reais; nunca negativo (o carimbo do quadro pode vir antes do relógio) e limitado para voltas de aba */
    var dt = anterior ? Math.min(Math.max((t - anterior) / 1000, 0), 0.05) : 0.016; anterior = t;
    var continua = false;
    if (anim) {
      anim.t = Math.min(anim.t + dt / anim.dur, 1);
      var e = anim.t < 0.5 ? 4 * anim.t * anim.t * anim.t : 1 - Math.pow(-2 * anim.t + 2, 3) / 2;
      th = anim.th0 + (anim.th1 - anim.th0) * e; ph = anim.ph0 + (anim.ph1 - anim.ph0) * e;
      dist = anim.d0 + (anim.d1 - anim.d0) * e;
      alvo.lerpVectors(anim.a0, anim.a1, e);
      if (anim.t >= 1) anim = null; else continua = true;
    } else if (n === 0 && (Math.abs(vth) > 0.0005 || Math.abs(vph) > 0.0005)) {
      th += vth * dt; ph = clampPh(ph + vph * dt);
      var f = Math.pow(0.04, dt); vth *= f; vph *= f; continua = true;
    } else if (n > 0) continua = true;

    if (gancho && gancho(dt)) continua = true;

    /* destaque e escurecimento por peça */
    var mudou = false, passo = reduzido ? 1 : Math.min(1, dt * 12);
    for (var i = 0; i < malhas.length; i++) {
      var o = malhas[i], id = o.userData.parte;
      var alvoK = (sel && id !== sel) ? 0 : 1;
      var alvoH = (id && id === sel) ? 1 : ((id && id === hov) ? 0.45 : 0);
      var k = o.userData.k, h = o.userData.h;
      if (k !== alvoK || h !== alvoH) {
        k += (alvoK - k) * passo; h += (alvoH - h) * passo;
        k = Math.max(0, Math.min(1, k)); h = Math.max(0, Math.min(1, h));
        if (Math.abs(alvoK - k) < 0.01) k = alvoK;
        if (Math.abs(alvoH - h) < 0.01) h = alvoH;
        o.userData.k = k; o.userData.h = h; aplicarMalha(o); mudou = true;
      }
    }
    if (mudou) continua = true;

    /* vista explodida */
    if (expo !== expoAlvo) {
      expo += (expoAlvo - expo) * (reduzido ? 1 : Math.min(1, dt * 5));
      if (Math.abs(expoAlvo - expo) < 0.003) expo = expoAlvo;
      aplicarExplosao(); continua = true;
    }

    desenhar();
    if (opcoes.aoQuadro) opcoes.aoQuadro();
    if (continua) pedir(); else anterior = 0;
  }
  function pedir() { if (rodando) return; rodando = true; requestAnimationFrame(quadro); }
  function clampPh(v) { return Math.max(0.05, Math.min(1.5, v)); }
  function clampDist(v) { return Math.max(40, Math.min(distPadrao * 1.8, v)); }

  /* ---------- seleção por clique e passagem do mouse ---------- */
  var raio = new THREE.Raycaster(), mouse = new THREE.Vector2();
  function visivelDeVerdade(o) { for (var p = o; p; p = p.parent) if (!p.visible) return false; return true; }
  function pegarEm(cx, cy) {
    var r = canvas.getBoundingClientRect();
    mouse.set((cx - r.left) / r.width * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    raio.setFromCamera(mouse, camera); raio.far = Infinity;
    var h = raio.intersectObjects(malhas.filter(visivelDeVerdade), false);
    return h.length ? h[0].object.userData.parte : null;
  }

  var ponteiros = {}, n = 0, distPinca = 0, ultimo = 0, toque = null;
  function lista() { var l = []; for (var k in ponteiros) l.push(ponteiros[k]); return l; }
  function mover(dx, dy) {
    var k = dist * 0.0013;
    var dir = new THREE.Vector3(Math.cos(th), 0, -Math.sin(th)), fr = new THREE.Vector3(-Math.sin(th), 0, -Math.cos(th));
    alvo.addScaledVector(dir, -dx * k).addScaledVector(fr, dy * k);
    alvo.x = Math.max(-160, Math.min(160, alvo.x)); alvo.z = Math.max(-160, Math.min(160, alvo.z));
  }
  canvas.addEventListener('pointerdown', function (e) {
    if (!entradaLigada) return;
    mexeu = true;
    ponteiros[e.pointerId] = { x: e.clientX, y: e.clientY, pan: e.button === 2 || e.shiftKey };
    n = lista().length; anim = null; vth = vph = 0; ultimo = e.timeStamp;
    toque = n === 1 && e.button === 0 ? { x: e.clientX, y: e.clientY, t: e.timeStamp, tipo: e.pointerType } : null;
    if (n === 2) { var l = lista(); distPinca = Math.hypot(l[0].x - l[1].x, l[0].y - l[1].y); toque = null; }
    try { canvas.setPointerCapture(e.pointerId); } catch (x) {}
    host.classList.add('arrastando'); pedir();
  });
  canvas.addEventListener('pointermove', function (e) {
    var p = ponteiros[e.pointerId];
    if (!p) {
      if (entradaLigada && e.pointerType === 'mouse' && !hovPend) {
        hovPend = true;
        var cx = e.clientX, cy = e.clientY;
        requestAnimationFrame(function () {
          hovPend = false;
          var id = pegarEm(cx, cy);
          if (id !== hov) { hov = id; canvas.style.cursor = id ? 'pointer' : ''; if (opcoes.aoPassar) opcoes.aoPassar(id); pedir(); }
        });
      }
      return;
    }
    var dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
    if (toque && Math.hypot(e.clientX - toque.x, e.clientY - toque.y) > 6) toque = null;
    if (n >= 2) {
      var l = lista(), d = Math.hypot(l[0].x - l[1].x, l[0].y - l[1].y);
      if (distPinca > 0 && d > 0) { dist = clampDist(dist * distPinca / d); distPinca = d; }
      mover(dx / 2, dy / 2);
    } else if (p.pan) mover(dx, dy);
    else {
      var dt = Math.max((e.timeStamp - ultimo) / 1000, 0.001); ultimo = e.timeStamp;
      th -= dx * 0.008; ph = clampPh(ph - dy * 0.008);
      vth = vth * 0.5 + (-dx * 0.008 / dt) * 0.5; vph = vph * 0.5 + (-dy * 0.008 / dt) * 0.5;
    }
    pedir();
  });
  var hovPend = false;
  function soltar(e) {
    if (!ponteiros[e.pointerId]) return;
    delete ponteiros[e.pointerId]; n = lista().length;
    if (n === 0) {
      host.classList.remove('arrastando');
      if (toque && e.type === 'pointerup' && e.timeStamp - toque.t < 600) {
        vth = vph = 0;
        var id = pegarEm(e.clientX, e.clientY);
        if (opcoes.aoClicar) opcoes.aoClicar(id);
      } else {
        if (reduzido || e.timeStamp - ultimo > 90) vth = vph = 0;
        vth = Math.max(-4, Math.min(4, vth)); vph = Math.max(-4, Math.min(4, vph));
      }
      toque = null;
    }
    pedir();
  }
  canvas.addEventListener('pointerup', soltar);
  canvas.addEventListener('pointercancel', soltar);
  canvas.addEventListener('pointerleave', function () { if (hov && n === 0) { hov = null; canvas.style.cursor = ''; if (opcoes.aoPassar) opcoes.aoPassar(null); pedir(); } });
  canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  canvas.addEventListener('wheel', function (e) {
    if (!entradaLigada) return;
    e.preventDefault(); mexeu = true; anim = null; dist = clampDist(dist * Math.exp(e.deltaY * 0.0012)); pedir();
  }, { passive: false });
  canvas.addEventListener('dblclick', function () { if (entradaLigada) api.reiniciar(); });
  host.addEventListener('keydown', function (e) {
    if (!entradaLigada) return;
    var u = true;
    if (e.key === 'ArrowLeft') vth = 1.4; else if (e.key === 'ArrowRight') vth = -1.4;
    else if (e.key === 'ArrowUp') vph = 1.0; else if (e.key === 'ArrowDown') vph = -1.0;
    else if (e.key === '+' || e.key === '=') dist = clampDist(dist / 1.2);
    else if (e.key === '-') dist = clampDist(dist * 1.2);
    else if (e.key === '0' || e.key === 'Home') api.reiniciar();
    else u = false;
    if (u) { e.preventDefault(); mexeu = true; anim = null; pedir(); }
  });

  var ro = ('ResizeObserver' in window) ? new ResizeObserver(ajustar) : null;
  if (ro) ro.observe(host); else window.addEventListener('resize', ajustar);
  canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); if (opcoes.aoFalhar) opcoes.aoFalhar(); });

  function irPara(v, d, alvoDest) {
    var dt = Math.atan2(Math.sin(v.theta - th), Math.cos(v.theta - th)); /* gira pelo caminho mais curto */
    mexeu = true;
    anim = { th0: th, th1: th + dt, ph0: ph, ph1: v.phi, d0: dist, d1: d, a0: alvo.clone(), a1: (alvoDest || alvoPadrao).clone(), t: 0, dur: reduzido ? 0.01 : 0.9 };
    vth = vph = 0; pedir();
  }

  /* distância para ver uma região de meia-largura rx e meia-altura ry (mm) no alvo, com a proporção atual da janela */
  function fit2(rx, ry) {
    var fv = THREE.MathUtils.degToRad(camera.fov / 2), fh = Math.atan(Math.tan(fv) * camera.aspect);
    return Math.max(ry / Math.tan(fv), rx / Math.tan(fh));
  }

  var api = {
    cena: cena,
    camera: camera,
    fit: fit,
    fit2: fit2,
    aoRedimensionar: function (fn) { aoRedim = fn; },
    /* alarga a luz e a sombra para um palco maior (a animação põe um notebook ao lado da bancada) */
    palco: function (cx, r) {
      luzAlvo.position.set(cx, 0, 0); luz.position.set(cx - 70, 150, 90);
      c.left = -r; c.right = r; c.top = r; c.bottom = -r; c.far = 420 + r; c.updateProjectionMatrix(); pedir();
    },
    explodirJa: function () { expo = expoAlvo = 0; aplicarExplosao(); pedir(); },
    pedir: pedir,
    vista: function (nome) { var v = VISTAS[nome]; if (v) irPara(v, distPadrao); },
    reiniciar: function () { irPara(inicial(), distPadrao); },
    /* posiciona a câmera na hora (sem animar): ângulos em radianos, distância e alvo em mm, sem limites. Usada pela animação. */
    camera3d: function (theta, phi, d, x, y, z) { mexeu = true; anim = null; vth = vph = 0; th = theta; ph = phi; dist = d; alvo.set(x, y, z); pedir(); },
    estado: function () { return { th: th, ph: ph, dist: dist, alvo: alvo.clone(), distPadrao: distPadrao }; },
    gancho: function (fn) { gancho = fn; pedir(); },
    entrada: function (ligada) { entradaLigada = ligada; if (!ligada) { hov = null; canvas.style.cursor = ''; } },
    /* seleciona uma peça (id) ou limpa (null). focar: a câmera chega perto da peça. */
    selecionar: function (id, focar) {
      sel = id || null;
      if (sel && focar !== false) api.focar(sel);
      pedir();
    },
    passar: function (id) { hov = id || null; pedir(); },
    focar: function (id) {
      var p = modelo.partes[id]; if (!p) return;
      var box = new THREE.Box3().setFromObject(p), cc = box.getCenter(new THREE.Vector3()), s = box.getSize(new THREE.Vector3());
      var r = Math.max(s.x, s.y, s.z) * 0.5 + 14, d = Math.max(60, Math.min(distPadrao * 1.1, fit(r)));
      irPara({ theta: th, phi: Math.max(0.55, Math.min(ph, 1.1)) }, d, cc);
    },
    explodir: function (ligado) { expoAlvo = ligado ? 1 : 0; pedir(); },
    explodido: function () { return expoAlvo === 1; },
    camada: function (id, ligada) { camadaOn[id] = ligada; aplicarVisibilidade(); pedir(); },
    ocultar: function (id, oculto) { forcaOculto[id] = oculto; aplicarVisibilidade(); pedir(); },
    projetar: function (v) {
      var p = v.clone().project(camera);
      return { x: (p.x * 0.5 + 0.5) * host.clientWidth, y: (-p.y * 0.5 + 0.5) * host.clientHeight, visivel: p.z < 1 };
    },
    /* o ponto v (em mm) está escondido atrás de outra peça (fios e cabos não contam)? */
    ocluido: function (v, id) {
      var d = v.clone().sub(camera.position), len = d.length();
      raio.set(camera.position, d.normalize()); raio.far = len - 1.5;
      var h = raio.intersectObjects(malhas.filter(function (o) { return !NAO_OCLUEM[o.userData.parte] && visivelDeVerdade(o); }), false);
      raio.far = Infinity;
      return h.length > 0 && h[0].object.userData.parte !== id;
    },
    mostrar: function (id, ligado) { var p = modelo.partes[id]; if (p) { p.visible = ligado; pedir(); } },
    destruir: function () { if (ro) ro.disconnect(); else window.removeEventListener('resize', ajustar); renderer.dispose(); }
  };
  ajustar();
  pedir();
  return api;
}
