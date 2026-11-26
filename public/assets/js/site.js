/* Aspen Core, site v1. Sem dependencias. Liga: classe js, revelacao dos passos, FAQ por ancora e lista de espera (formulario proprio). */
(function () {
  'use strict';
  var doc = document;
  var raiz = doc.documentElement;
  raiz.className = raiz.className.replace('no-js', 'js');

  var reduzido = false;
  try { reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  /* Modelo 3D do prototipo: o quadro interativo so carrega em tela grande (no celular a capa abre em tela cheia) */
  (function () {
    var quadro = doc.querySelector('.modelo3d__moldura iframe[data-src]');
    if (!quadro || !window.matchMedia) return;
    var larga = window.matchMedia('(min-width: 768px)');
    function ligar() { if (larga.matches && !quadro.src) quadro.src = quadro.getAttribute('data-src'); }
    ligar();
    if (larga.addEventListener) larga.addEventListener('change', ligar);
  })();

  /* Barra "Quero ser avisado" do celular: aparece quando nem o botao do topo, nem o formulario, nem o rodape estao na tela */
  (function () {
    var barra = doc.getElementById('barra-cta');
    var alvos = [doc.querySelector('.hero__cta'), doc.getElementById('lista'), doc.querySelector('.rodape')].filter(Boolean);
    if (!barra || !alvos.length || !('IntersectionObserver' in window)) return;
    var naTela = new Set(), passouDoTopo = false;
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) naTela.add(en.target); else naTela.delete(en.target);
        if (en.target === alvos[0]) passouDoTopo = !en.isIntersecting && en.boundingClientRect.top < 0;
      });
      barra.hidden = !passouDoTopo || naTela.size > 0;
    });
    alvos.forEach(function (a) { obs.observe(a); });
  })();

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

  /* Lista de espera: formulário próprio, envia para /api/lista (functions/api/lista.js) */
  var secao = doc.getElementById('lista');
  if (!secao) return;
  var form = doc.getElementById('lista-form');
  var pronto = doc.getElementById('lista-pronto');
  var status = doc.getElementById('lista-status');
  if (!form) return;
  var campoEmail = form.elements.email;
  var erroEmail = doc.getElementById('lista-erro-email');
  var erroAceites = doc.getElementById('lista-erro-aceites');
  var botao = form.querySelector('button[type="submit"]');
  var rotuloBotao = botao.textContent;
  var caixas = ['aviso', 'maior', 'transferencia', 'privacidade'].map(function (n) { return form.elements[n]; });
  var MSG_OK = 'Cadastro confirmado. Você está na lista de espera.';

  function limparErros() {
    [erroEmail, erroAceites].forEach(function (e) { e.hidden = true; e.textContent = ''; });
    campoEmail.removeAttribute('aria-invalid');
    status.textContent = ''; status.classList.remove('lista__status--erro');
  }
  function erroNo(el, campo, texto) {
    el.textContent = texto; el.hidden = false;
    if (campo) campo.setAttribute('aria-invalid', 'true');
  }
  function mostrarPronto() {
    form.hidden = true; pronto.hidden = false; status.textContent = '';
    try { pronto.focus({ preventScroll: true }); } catch (e) { pronto.focus(); }
  }
  function falhou(texto) {
    status.textContent = texto; status.classList.add('lista__status--erro');
  }

  function validar() {
    limparErros();
    var ok = true, primeiro = null;
    var email = campoEmail.value.trim();
    if (!email) { erroNo(erroEmail, campoEmail, 'Digite o seu e-mail.'); ok = false; primeiro = campoEmail; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { erroNo(erroEmail, campoEmail, 'Confira o e-mail: ele precisa ter o formato nome@exemplo.com.'); ok = false; primeiro = campoEmail; }
    if (!caixas.every(function (c) { return c.checked; })) {
      erroNo(erroAceites, null, 'Marque as quatro confirmações para entrar na lista.'); ok = false;
      if (!primeiro) primeiro = caixas.filter(function (c) { return !c.checked; })[0];
    }
    if (primeiro) primeiro.focus();
    return ok;
  }

  form.addEventListener('submit', function (ev) {
    if (!window.fetch) return; /* sem fetch: o navegador envia o formulário do jeito antigo */
    ev.preventDefault();
    if (!validar()) return;
    botao.disabled = true; botao.textContent = 'Enviando...';
    var controle = window.AbortController ? new AbortController() : null;
    var prazo = setTimeout(function () { if (controle) controle.abort(); }, 15000);
    var dados = {
      email: campoEmail.value.trim(), aviso: caixas[0].checked, maior: caixas[1].checked, transferencia: caixas[2].checked, privacidade: caixas[3].checked,
      site: form.elements.site.value
    };
    fetch(form.getAttribute('action'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(dados),
      signal: controle ? controle.signal : undefined
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok && j.ok, j: j }; });
    }).then(function (res) {
      if (res.ok) { mostrarPronto(); return; }
      if (res.j.campo === 'email') { erroNo(erroEmail, campoEmail, res.j.erro); campoEmail.focus(); }
      else if (res.j.campo === 'aceites') erroNo(erroAceites, null, res.j.erro);
      else falhou(res.j.erro || 'Não deu para registrar agora. Tente de novo em instantes ou escreva para aspencorp0@gmail.com.');
    }).catch(function () {
      falhou('Sem conexão com o servidor. Confira a internet e tente de novo, ou escreva para aspencorp0@gmail.com.');
    }).then(function () {
      clearTimeout(prazo); botao.disabled = false; botao.textContent = rotuloBotao;
    });
  });

  [campoEmail].concat(caixas).forEach(function (c) {
    c.addEventListener('input', function () {
      if (c === campoEmail) { erroEmail.hidden = true; campoEmail.removeAttribute('aria-invalid'); }
      else erroAceites.hidden = true;
      status.textContent = ''; status.classList.remove('lista__status--erro');
    });
  });

  /* caminho sem JavaScript: o servidor volta para /?lista=ok ou /?lista=erro */
  try {
    var resultado = new URLSearchParams(location.search).get('lista');
    if (resultado === 'ok') mostrarPronto();
    else if (resultado === 'erro') falhou('Não deu para registrar. Confira o e-mail e as quatro confirmações, ou escreva para aspencorp0@gmail.com.');
  } catch (e) {}
})();
