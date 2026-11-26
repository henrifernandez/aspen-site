/* Aspen Core, interface do modelo 3D da bancada: pontos numerados, lista de peças, cartão da peça
   e o modo "Como funciona" (animação carregada só quando pedida, com um botão e uma linha do tempo).
   A lista de peças é o equivalente completo dos pontos para teclado e leitor de tela. */
import * as THREE from '../vendor/three-0.170.0.module.min.js';
import { montarBancada } from './bancada3d.js';
import { criarVisor } from './visor.js';
import { PARTES } from './partes.js';

var doc = document;
/* mostra as pendências (P22, P09) nos cartões só enquanto a página estiver em rascunho (data-modo, PENDENTE P19) */
var RASCUNHO = doc.documentElement.getAttribute('data-modo') === 'rascunho';
var REDUZIDO = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
var TOQUE = window.matchMedia && matchMedia('(pointer: coarse)').matches;
function $(id) { return doc.getElementById(id); }
function el(tag, classe, texto) { var e = doc.createElement(tag); if (classe) e.className = classe; if (texto != null) e.textContent = texto; return e; }

var host = $('visor');
function erro(msg) { host.innerHTML = '<p class="erro">' + msg + '</p>'; }

var modelo, visor;
try {
  var teste = doc.createElement('canvas');
  if (!(teste.getContext('webgl2') || teste.getContext('webgl'))) throw new Error('webgl');
  modelo = montarBancada();
  modelo.selecionaveis = PARTES.map(function (p) { return p.id; });
  modelo.exp = {};
  PARTES.forEach(function (p) { if (p.exp) modelo.exp[p.id] = p.exp; });
  visor = criarVisor(host, modelo, {
    aoClicar: function (id) { if (modo !== 'explorar') return; if (id) escolher(id, true); else if (sel) escolher(sel, false); },
    aoPassar: function (id) { hover = id; },
    aoQuadro: atualizarPinos,
    aoFalhar: function () { erro('O navegador interrompeu o 3D. Recarregue a página.'); }
  });
  window.visor = visor; window.modelo = modelo;
} catch (e) {
  console.error(e);
  erro('Não foi possível exibir o modelo 3D neste navegador.');
  throw e;
}

var modo = 'explorar', sel = null, hover = null;
var listaEl = $('lista'), cartaoEl = $('cartao'), pinosEl = $('pinos');
var chips = {}, pinos = [];

/* ---------- lista de peças e pontos ---------- */
PARTES.forEach(function (p, i) {
  var li = el('li'), b = el('button', 'chip'); b.type = 'button'; b.setAttribute('aria-pressed', 'false');
  b.appendChild(el('span', 'chip__num' + (p.pino ? '' : ' chip__num--sem'), p.pino ? String(i + 1) : ''));
  b.appendChild(el('span', null, p.nome));
  b.addEventListener('click', function () { escolher(p.id, true); });
  b.addEventListener('mouseenter', function () { visor.passar(p.id); });
  b.addEventListener('mouseleave', function () { visor.passar(null); });
  li.appendChild(b); listaEl.appendChild(li); chips[p.id] = b;

  if (p.pino) {
    var pb = el('button', 'pino'); pb.type = 'button'; pb.tabIndex = -1;
    pb.setAttribute('aria-hidden', 'true');
    pb.appendChild(el('span', 'pino__num', String(i + 1))); pb.appendChild(el('span', 'pino__nome', p.nome));
    pb.addEventListener('click', function (ev) { ev.stopPropagation(); escolher(p.id, true); });
    pb.addEventListener('mouseenter', function () { visor.passar(p.id); });
    pb.addEventListener('mouseleave', function () { visor.passar(null); });
    pinosEl.appendChild(pb); pinos.push({ id: p.id, el: pb });
  }
});

function parteDe(id) { for (var i = 0; i < PARTES.length; i++) if (PARTES[i].id === id) return PARTES[i]; return null; }

function desenharCartao() {
  cartaoEl.textContent = '';
  var p = sel ? parteDe(sel) : null;
  cartaoEl.classList.toggle('cartao--vazio', !p);
  if (!p) { cartaoEl.appendChild(el('p', null, 'Selecione um número no modelo ou uma peça na lista para ver a descrição.')); return; }
  var x = el('button', 'cartao__fechar', '×'); x.type = 'button'; x.setAttribute('aria-label', 'Fechar a descrição');
  x.addEventListener('click', function () { escolher(sel, false); });
  cartaoEl.appendChild(x);
  cartaoEl.appendChild(el('h3', null, p.nome));
  if (p.funcao) cartaoEl.appendChild(el('p', 'cartao__funcao', p.funcao));
  cartaoEl.appendChild(el('p', null, p.texto));
  if (p.detalhes && p.detalhes.length) {
    var dl = el('dl', 'cartao__dados');
    p.detalhes.forEach(function (d) { dl.appendChild(el('dt', null, d[0])); dl.appendChild(el('dd', null, d[1])); });
    cartaoEl.appendChild(dl);
  }
  if (p.fluxo) { var fl = el('p', 'cartao__fluxo'); fl.appendChild(el('strong', null, 'No uso: ')); fl.appendChild(doc.createTextNode(p.fluxo)); cartaoEl.appendChild(fl); }
  if (RASCUNHO && p.pendente) cartaoEl.appendChild(el('p', 'pend', p.pendente));
}

function escolher(id, focar) {
  if (sel === id) { sel = null; visor.selecionar(null); visor.reiniciar(); }
  else { sel = id; visor.selecionar(id, focar !== false); }
  Object.keys(chips).forEach(function (k) { chips[k].setAttribute('aria-pressed', k === sel ? 'true' : 'false'); });
  pinos.forEach(function (p) { p.el.classList.toggle('pino--ativo', p.id === sel); });
  desenharCartao();
  if (sel && cartaoEl.scrollIntoView && matchMedia('(max-width: 899px)').matches) {
    try { cartaoEl.scrollIntoView({ block: 'nearest' }); } catch (e) {}
  }
}
desenharCartao();

/* ---------- dica de uso: some sozinha na primeira interação ---------- */
var dica = $('dica'), dicaVista = false;
dica.textContent = TOQUE ? 'Arraste para girar · Pinça para aproximar' : 'Arraste para girar · Role para aproximar · Duplo clique para recentralizar';
function esconderDica() { dicaVista = true; dica.classList.add('dica-visor--some'); }
host.addEventListener('pointerdown', esconderDica, true);
host.addEventListener('wheel', esconderDica, { passive: true });
setTimeout(esconderDica, 9000);

/* "Voltar ao site" so quando a pagina esta aberta sozinha (embutida no index ela nao aparece) */
if (window.top === window.self) $('voltar').hidden = false;

/* ---------- vista explodida: separa e junta as peças (os fios somem enquanto estão separadas) ---------- */
var btnExplodir = $('btn-explodir');
function marcarExplodir(ligado) {
  btnExplodir.setAttribute('aria-pressed', ligado ? 'true' : 'false');
  btnExplodir.textContent = ligado ? 'Juntar peças' : 'Separar peças';
}
btnExplodir.addEventListener('click', function () {
  var ligar = !visor.explodido();
  if (sel) escolher(sel, false);
  esconderDica();
  visor.explodir(ligar); marcarExplodir(ligar);
});

/* ---------- pontos acompanham o modelo ---------- */
var caixa = new THREE.Box3(), centro = new THREE.Vector3(), ultimaOclusao = 0;
function atualizarPinos() {
  if (modo !== 'explorar') return;
  var agora = performance.now(), checar = agora - ultimaOclusao > 140;
  if (checar) ultimaOclusao = agora;
  pinos.forEach(function (p) {
    caixa.setFromObject(modelo.partes[p.id]); caixa.getCenter(centro); centro.y = caixa.max.y + 3;
    var pr = visor.projetar(centro);
    p.el.hidden = !pr.visivel;
    p.el.style.transform = 'translate(' + (pr.x - 9).toFixed(1) + 'px,' + (pr.y - 9).toFixed(1) + 'px)';
    if (checar) p.el.classList.toggle('pino--oculto', visor.ocluido(centro, p.id));
  });
}

/* ---------- modo "Como funciona": um botão, uma linha do tempo ---------- */
var anim = null, carregando = false, tocando = false, movendo = false, t = 0;
var btnPlay = $('btn-play'), grande = $('grande-play'), tempoEl = $('tempo'), tempoTxt = $('tempo-txt'), legenda = $('legenda');
var palco = $('palco'), tela = $('tela'), player = $('player');

function fmt(s) { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
function noFim() { return !!anim && t >= anim.duracao - 0.05; }
function mostrarLegenda() {
  var l = anim.legenda(t);
  $('leg-titulo').textContent = l.titulo; $('leg-texto').textContent = l.texto;
  /* aviso: função mostrada que ainda não está no firmware (FUNCOES em animacao.js) */
  var pe = $('leg-pend'); pe.hidden = !l.aviso; pe.textContent = l.aviso || '';
}
/* botão pequeno do reprodutor e botão grande do centro (só no começo e no fim) */
function atualizarBotoes() {
  var fim = noFim();
  btnPlay.textContent = tocando ? '❚❚' : fim ? '↺' : '▶';
  btnPlay.setAttribute('aria-label', tocando ? 'Pausar' : fim ? 'Ver de novo' : 'Reproduzir');
  grande.hidden = modo !== 'anim' || tocando || (t > 0.05 && !fim);
  grande.textContent = fim ? '↺ Ver de novo' : '▶ Reproduzir';
}
function desenharAnim() {
  anim.aplicar(t);
  if (!movendo) tempoEl.value = String(Math.round(t / anim.duracao * 1000));
  tempoTxt.textContent = fmt(t) + ' / ' + fmt(anim.duracao);
  mostrarLegenda();
  visor.pedir();
}
function parar() { tocando = false; visor.gancho(null); atualizarBotoes(); }
function tocar() {
  if (!anim) return;
  if (noFim()) t = 0;
  tocando = true; atualizarBotoes();
  visor.gancho(function (dt) {
    if (!tocando) return false;
    t += dt;
    if (t >= anim.duracao) { t = anim.duracao; desenharAnim(); parar(); return false; }
    desenharAnim(); return true;
  });
}
function alternar() { if (tocando) parar(); else tocar(); }
function irPara(novo) { t = Math.max(0, Math.min(anim.duracao, novo)); desenharAnim(); if (!tocando) atualizarBotoes(); }

btnPlay.addEventListener('click', alternar);
grande.addEventListener('click', tocar);
tempoEl.addEventListener('input', function () { irPara(tempoEl.value / 1000 * anim.duracao); });
tempoEl.addEventListener('pointerdown', function () { movendo = true; });
doc.addEventListener('pointerup', function () { movendo = false; });
/* clicar no próprio modelo pausa e retoma, como num vídeo */
palco.addEventListener('click', function (e) { if (modo === 'anim' && e.target && e.target.tagName === 'CANVAS') alternar(); });
doc.addEventListener('keydown', function (e) {
  if (modo !== 'anim' || (e.key !== ' ' && e.key !== 'k')) return;
  var alvo = e.target && e.target.tagName;
  if (alvo === 'BUTTON' || alvo === 'INPUT' || alvo === 'A') return;
  e.preventDefault(); alternar();
});
doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && sel && modo === 'explorar') escolher(sel, false); });

function trocarModo(novo) {
  if (novo === modo || carregando) return;
  doc.querySelectorAll('.modo').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-modo') === novo ? 'true' : 'false'); });
  if (novo === 'anim') {
    carregando = true;
    import('./animacao.js').then(function (m) {
      if (!anim) {
        anim = m.criarAnimacao(visor, modelo);
        window.anim = anim; window.irPara = irPara; /* ganchos de teste */
        /* um traço fino por etapa na linha do tempo; o nome da etapa aparece na legenda */
        var marcas = $('marcas');
        anim.capitulos.forEach(function (c) {
          var s = el('span'); s.style.left = 'calc(8px + (100% - 16px) * ' + (c.t / anim.duracao).toFixed(4) + ')';
          marcas.appendChild(s);
        });
      }
      if (sel) escolher(sel, false);
      visor.explodir(false); marcarExplodir(false); btnExplodir.hidden = true;
      modo = 'anim'; carregando = false;
      pinosEl.hidden = true; dica.hidden = true; $('painel-explorar').hidden = true; $('nota-pecas').hidden = true; $('nota-anim').hidden = false;
      tela.classList.add('tela--anim'); palco.classList.add('palco--anim');
      legenda.hidden = false; player.hidden = false;
      visor.entrada(false); anim.ativar();
      t = 0; desenharAnim(); atualizarBotoes();
      if (!REDUZIDO) tocar(); /* começa sozinho; com movimento reduzido, espera o clique */
    }).catch(function (e) { console.error(e); carregando = false; erro('Não foi possível carregar a animação.'); });
  } else {
    parar(); if (anim) anim.desativar();
    modo = 'explorar';
    btnExplodir.hidden = false; pinosEl.hidden = false; dica.hidden = dicaVista; $('painel-explorar').hidden = false; $('nota-pecas').hidden = false; $('nota-anim').hidden = true;
    tela.classList.remove('tela--anim'); palco.classList.remove('palco--anim');
    legenda.hidden = true; player.hidden = true; grande.hidden = true;
    visor.entrada(true); visor.camada('fios', true); visor.camada('cabos-usb', true); visor.ocultar('cabos-usb', false);
    visor.reiniciar();
  }
}
doc.querySelectorAll('.modo').forEach(function (b) { b.addEventListener('click', function () { trocarModo(b.getAttribute('data-modo')); }); });
