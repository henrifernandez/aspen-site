/* Aspen Core, site v1. Sem dependencias. Liga: classe js, revelacao dos passos, FAQ por ancora e formulario do Tally. */
(function () {
  'use strict';
  var doc = document;
  var raiz = doc.documentElement;
  raiz.className = raiz.className.replace('no-js', 'js');

  var reduzido = false;
  try { reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  /* Revelacao dos tres passos, uma vez, so com IntersectionObserver e sem movimento reduzido */
  var passos = doc.querySelectorAll('.passos li');
  if (passos.length && 'IntersectionObserver' in window && !reduzido) {
    var lista = doc.querySelector('.passos');
    passos.forEach(function (li) { li.classList.add('revelar'); });
    var obsPassos = new IntersectionObserver(function (entradas, obs) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        passos.forEach(function (li) { li.classList.add('visivel'); });
        obs.disconnect();
      });
    }, { threshold: 0.25 });
    obsPassos.observe(lista);
  }

  /* Visualizador 3D do hero: carrega three.js so quando precisa. Em tela grande e conexao livre abre sozinho;
     nos demais casos, so pelo botao. Qualquer falha devolve a imagem estatica. */
  (function () {
    var figura = doc.querySelector('.hero__figura');
    if (!figura) return;
    var host = figura.querySelector('.visualizador');
    var controles = figura.querySelector('.hero__controles');
    var btnAtivar = figura.querySelector('[data-3d="ativar"]');
    var painel = figura.querySelector('.vistas');
    if (!host || !controles || !btnAtivar || !painel || typeof window.Promise === 'undefined') return;

    var webgl = false;
    try {
      var teste = doc.createElement('canvas');
      webgl = !!(window.WebGLRenderingContext && (teste.getContext('webgl2') || teste.getContext('webgl')));
    } catch (e) {}
    if (!webgl) return;

    var conexao = navigator.connection || {};
    var economia = !!conexao.saveData || /(^|-)2g$/.test(conexao.effectiveType || '');
    var estado = 'parado'; /* parado, carregando, ativo */
    var controle = null;

    controles.hidden = false;

    function desligar() {
      if (controle) { try { controle.destruir(); } catch (e) {} controle = null; }
      estado = 'parado';
      figura.classList.remove('hero__figura--3d');
      host.hidden = true;
      painel.hidden = true;
      btnAtivar.hidden = false;
      btnAtivar.disabled = false;
      btnAtivar.textContent = 'Girar em 3D';
    }

    function ativar(foco) {
      if (estado !== 'parado') return;
      estado = 'carregando';
      btnAtivar.disabled = true;
      btnAtivar.textContent = 'Carregando...';
      import('./visualizador.js').then(function (mod) {
        figura.classList.add('hero__figura--3d');
        host.hidden = false;
        controle = mod.iniciar(host, {
          movimentoReduzido: reduzido,
          aoFalhar: desligar
        });
        estado = 'ativo';
        btnAtivar.hidden = true;
        painel.hidden = false;
        if (foco) host.focus({ preventScroll: true });
      }).catch(function () {
        desligar();
        controles.hidden = true; /* sem WebGL utilizavel ou sem o modulo: fica a imagem */
      });
    }

    btnAtivar.addEventListener('click', function () { ativar(true); });
    /* Painel: voltar à vista inicial e zoom. Um único ouvinte para os botões. */
    painel.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button') : null;
      if (!b || !controle) return;
      if (b.hasAttribute('data-zoom')) controle.zoom(parseFloat(b.getAttribute('data-zoom')));
      else if (b.getAttribute('data-3d') === 'reiniciar') controle.reiniciar();
    });

    var telaGrande = false;
    try { telaGrande = window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches; } catch (e) {}
    if (telaGrande && !economia) {
      var iniciar = function () { ativar(false); };
      if ('requestIdleCallback' in window) requestIdleCallback(iniciar, { timeout: 2500 });
      else setTimeout(iniciar, 1200);
    }
  })();

  /* FAQ: abrir o details indicado pela ancora e levar o foco ao summary */
  function abrirPorAncora() {
    var id = decodeURIComponent((location.hash || '').replace('#', ''));
    if (!id) return;
    var alvo = doc.getElementById(id);
    if (alvo && alvo.tagName === 'DETAILS') {
      alvo.open = true;
      var resumo = alvo.querySelector('summary');
      if (resumo) { resumo.focus({ preventScroll: true }); }
      alvo.scrollIntoView({ block: 'start' });
    }
  }
  abrirPorAncora();
  if (doc.readyState !== 'complete') {
    window.addEventListener('load', function () { setTimeout(abrirPorAncora, 0); });
  }
  window.addEventListener('hashchange', abrirPorAncora);

  /* Formulario do Tally */
  var secao = doc.getElementById('lista');
  if (!secao) return;
  var codigo = secao.getAttribute('data-tally-id') || '';
  var painelRascunho = secao.querySelector('.lista__rascunho');
  var blocoTally = secao.querySelector('.lista__tally');
  var iframe = secao.querySelector('iframe[data-tally-src]');
  var carregando = secao.querySelector('.lista__carregando');
  var erro = secao.querySelector('.lista__erro');
  var status = secao.querySelector('.lista__status');
  var reserva = secao.querySelector('.lista__reserva');

  if (!codigo || codigo.indexOf('PENDENTE') === 0) {
    if (blocoTally) blocoTally.hidden = true;
    return;
  }
  if (painelRascunho) painelRascunho.hidden = true;

  /* Link de reserva: so utm_source, utm_medium e utm_content, limpos */
  function limpar(v) {
    v = String(v || '').slice(0, 100);
    return /^[A-Za-z0-9_.-]+$/.test(v) ? encodeURIComponent(v) : '';
  }
  if (reserva) {
    try {
      var p = new URLSearchParams(location.search);
      var extra = [];
      ['utm_source', 'utm_medium', 'utm_content'].forEach(function (k) {
        var v = limpar(p.get(k));
        if (v) extra.push(k + '=' + v);
      });
      if (extra.length) reserva.href = reserva.href + (reserva.href.indexOf('?') === -1 ? '?' : '&') + extra.join('&');
    } catch (e) {}
  }

  var prazo = null;
  function mostrarErro() {
    blocoTally.classList.add('falhou');
    if (carregando) carregando.hidden = true;
    if (erro) erro.hidden = false;
  }
  function pronto() {
    if (prazo) { clearTimeout(prazo); prazo = null; }
    blocoTally.classList.remove('falhou');
    if (carregando) carregando.hidden = true;
    if (erro) erro.hidden = true;
  }

  window.addEventListener('message', function (e) {
    if (e.origin !== 'https://tally.so') return;
    var dados = e.data;
    if (typeof dados !== 'string' || dados.indexOf('Tally.') === -1) return;
    if (dados.indexOf('Tally.FormLoaded') !== -1) pronto();
    if (dados.indexOf('Tally.FormSubmitted') !== -1 && status) {
      status.textContent = status.getAttribute('data-confirmacao') || '';
    }
  });

  var carregou = false;
  function carregarTally() {
    if (carregou || !iframe) return;
    carregou = true;
    if (carregando) carregando.hidden = false;
    var s = doc.createElement('script');
    s.src = 'https://tally.so/widgets/embed.js';
    s.async = true;
    s.onload = function () {
      if (window.Tally && window.Tally.loadEmbeds) window.Tally.loadEmbeds();
      else iframe.setAttribute('src', iframe.getAttribute('data-tally-src'));
    };
    s.onerror = mostrarErro;
    doc.body.appendChild(s);
    prazo = setTimeout(mostrarErro, 10000);
  }
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entradas, o) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) { carregarTally(); o.disconnect(); }
      });
    }, { rootMargin: '800px 0px' });
    obs.observe(secao);
  } else {
    carregarTally();
  }
})();
