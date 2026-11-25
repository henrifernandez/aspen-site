/* Aspen Core, animação "Como funciona" do protótipo de hoje. Linear, sem interação: só toca, pausa e anda pelo tempo.
   Fluxo: conectar, PIN (cifrado e conferido pela chave), toque no BOOT, assinatura no chip de segurança ATECC pelo I2C,
   verificação no navegador e, no fim, o outro jeito de usar a chave: sem o USB, encostada num celular que abre o mesmo site
   (NFC pelo leitor PN532). Tudo é função do tempo t,
   então dá para pular e voltar. Página na tela: localhost, como na demonstração de 29/10/2026. Sem certificação FIDO.
   FUNCOES: ATECC e NFC entram como parte da chave (decisão do Henrique, implementação na semana de 29/10/2026). Se uma
   delas atrasar, trocar para false mostra o aviso "Ilustração de como será" nas cenas dela, sem refazer a animação (P22). */
import * as THREE from '../vendor/three-0.170.0.module.min.js';
import { montarNotebook, NB } from './notebook3d.js';
import { PLUGUE_Z } from './bancada3d.js';

export var FUNCOES = { atecc: true, nfc: false }; /* NFC: codigo funciona, ainda sem uso no prototipo (Henrique, 25/11/2026) */
var AVISO = 'Ilustração de como será, ainda não funciona assim.';

/* Os tempos abaixo são da linha do tempo interna. A abertura (0 a 6,6 s internos, bancada chegando e cabo USB-C entrando)
   é tocada em 3,7 s para não pesar; depois disso o tempo corre igual, 2,9 s adiantado. */
var DURACAO_INTERNA = 44.4, ABERTURA = 6.6, ABERTURA_VISTA = 3.7;
function interno(t) { return t <= ABERTURA_VISTA ? t * ABERTURA / ABERTURA_VISTA : t + ABERTURA - ABERTURA_VISTA; }
function visto(ti) { return ti <= ABERTURA ? ti * ABERTURA_VISTA / ABERTURA : ti - ABERTURA + ABERTURA_VISTA; }
var DURACAO = visto(DURACAO_INTERNA);
var F = '"Poppins","Segoe UI",system-ui,sans-serif';
var MONO = '"Cascadia Code",Consolas,"Courier New",monospace';
var C = { petroleo: '#255B62', petroleoEsc: '#1C444A', amarelo: '#FBEFC9', creme: '#F6F6EA', tile: '#E6E7D7', texto: '#3A3A2E', suave: '#606054', borda: '#C9CBB8', led: '#94F7FE', dourado: '#D2B17A', oliva: '#A7A98A' };

function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
function prog(t, a, b) { return clamp((t - a) / (b - a), 0, 1); }
function ease(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
function lerp(a, b, u) { return a + (b - a) * u; }
/* 0 antes de a, sobe até 1, fica, e desce até 0 em b */
function janela(t, a, b, f) { f = f || 0.25; return Math.min(prog(t, a, a + f), 1 - prog(t, b - f, b)); }

var CAPITULOS = [
  { numero: 1, nome: 'Conectar', t: 2.8 },
  { numero: 2, nome: 'PIN', t: 6.6 },
  { numero: 3, nome: 'Toque físico', t: 12.6 },
  { numero: 4, nome: 'Assinar no ATECC', t: 16.2 },
  { numero: 5, nome: 'Verificar', t: 24.2 },
  { numero: 6, nome: 'Alternativa por NFC', t: 31 }
].map(function (c) { return { numero: c.numero, nome: c.nome, t: visto(c.t) }; });

var LEGENDAS = [
  { a: 0, titulo: 'Aspen Key, protótipo de hoje', texto: 'Conectada ao computador por um cabo USB-C. A aproximação por NFC é a segunda forma planejada, ainda não usada no protótipo.' },
  { a: 2.8, titulo: '1. Conexão pelo USB', texto: 'Primeira forma: um cabo liga a entrada USB-C da placa ao computador e a chave é ligada.' },
  { a: 6.6, titulo: '2. PIN', texto: 'O site solicita o acesso com a chave e o sistema pede o PIN.' },
  { a: 10.4, titulo: 'PIN cifrado', texto: 'O navegador envia o PIN cifrado pelo USB. A placa o decifra e o confere internamente.' },
  { a: 12.6, titulo: '3. Toque físico', texto: 'Um toque no botão BOOT confirma a presença de uma pessoa.' },
  { a: 16.2, titulo: '4. Assinatura', texto: 'O desafio do site chega à placa pelo USB, que o encaminha ao chip de segurança pelo I2C.', funcao: 'atecc' },
  { a: 19.6, titulo: 'O ATECC assina', texto: 'A chave privada permanece dentro do chip. Ele assina o desafio e devolve apenas a assinatura.', funcao: 'atecc' },
  { a: 21.8, titulo: 'A assinatura retorna', texto: 'A assinatura volta pelo I2C, passa pela placa e segue pelo USB até o site.', funcao: 'atecc' },
  { a: 24.2, titulo: '5. Verificação', texto: 'O navegador valida a assinatura e cada item da resposta, na própria página.' },
  { a: 31, titulo: '6. Alternativa: celular, por NFC', texto: 'Segunda forma, sem cabo: o celular abre o mesmo site e a chave é aproximada dele. A aproximação estabelece a conexão e vale como toque.', funcao: 'nfc' },
  { a: 34.6, titulo: 'Mesmo caminho internamente', texto: 'O leitor NFC entrega o desafio à placa, e o chip de segurança assina como no USB.', funcao: 'nfc' },
  { a: 40.0, titulo: 'Verificado no celular', texto: 'O site valida da mesma forma. USB no computador ou NFC no celular são duas formas de chegar ao mesmo resultado.', funcao: 'nfc' },
  { a: 42.0, titulo: 'Aspen Key', texto: 'Protótipo em desenvolvimento. O design final pode mudar.' }
];

var ITENS = [
  'Tipo é webauthn.get', 'Desafio confere (novo a cada entrada)', 'Origem confere (http://localhost:8000)',
  'rpIdHash = SHA-256("localhost")', 'UP: toque físico confirmado', 'UV: PIN conferido pela chave',
  'Credencial usada é a registrada', 'Contador aumentou (5 → 6)', 'Assinatura ECDSA P-256 válida'
];
var ITENS_NFC = ['Desafio novo confere', 'UP: chave aproximada por NFC', 'Contador aumentou (6 → 7)', 'Assinatura ECDSA P-256 válida'];

var HEX_DESAFIO = '3f9a c41e 07b2 d85c 6e19 a0f3 52c7 9b04';
var HEX_PIN = '8c1f e04a 77d2 19b6 c3a0 5e8f 2d71 b904';
var HEX_ASSIN = '3045 0221 00c8 1d4e 9a7f 02b3 61ee 58a0';
function hexAleatorio(semente) {
  var s = semente * 9301 + 49297, out = [];
  for (var i = 0; i < 8; i++) { var p = ''; for (var j = 0; j < 4; j++) { s = (s * 9301 + 49297) % 233280; p += '0123456789abcdef'.charAt(Math.floor(s / 233280 * 16)); } out.push(p); }
  return out.join(' ');
}

/* ---------- desenho em canvas ---------- */
function rr(g, x, y, w, h, r, fill, stroke, lw) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  if (fill) { g.fillStyle = fill; g.fill(); }
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw || 2; g.stroke(); }
}
function txt(g, t, x, y, font, cor, alinha) { g.font = font; g.fillStyle = cor; g.textAlign = alinha || 'left'; g.textBaseline = 'alphabetic'; g.fillText(t, x, y); }
function quebra(g, t, x, y, maxW, lh, font, cor) {
  g.font = font; g.fillStyle = cor; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
  var palavras = t.split(' '), linha = '', yy = y;
  palavras.forEach(function (p) {
    var teste = linha ? linha + ' ' + p : p;
    if (g.measureText(teste).width > maxW && linha) { g.fillText(linha, x, yy); linha = p; yy += lh; } else linha = teste;
  });
  g.fillText(linha, x, yy); return yy;
}
/* sai rápido e passa um pouco do ponto antes de assentar */
function saida(x) { var c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); }
function check(g, x, y, r, cor) {
  g.strokeStyle = cor; g.lineWidth = Math.max(2.5, r * 0.22); g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(x - r * 0.42, y + r * 0.02); g.lineTo(x - r * 0.1, y + r * 0.34); g.lineTo(x + r * 0.45, y - r * 0.3); g.stroke();
}
/* marcador de etapa: ok (preenchido com visto), ativo (anel) ou pend (contorno claro) */
function marca(g, x, y, r, estado) {
  g.beginPath(); g.arc(x, y, r, 0, 7);
  if (estado === 'ok') { g.fillStyle = C.petroleo; g.fill(); check(g, x, y, r, C.amarelo); }
  else if (estado === 'ativo') { g.fillStyle = C.amarelo; g.fill(); g.strokeStyle = C.petroleo; g.lineWidth = 4; g.stroke(); g.beginPath(); g.arc(x, y, r * 0.32, 0, 7); g.fillStyle = C.petroleo; g.fill(); }
  else { g.fillStyle = '#fff'; g.fill(); g.strokeStyle = C.borda; g.lineWidth = 3; g.stroke(); }
}
function ondasNfc(g, x, y, k, cor) {
  g.strokeStyle = cor; g.lineCap = 'round'; g.lineWidth = 6 * k;
  for (var i = 1; i <= 3; i++) { g.beginPath(); g.arc(x, y, 18 * i * k, -0.8, 0.8); g.stroke(); }
  g.beginPath(); g.arc(x, y, 6 * k, 0, 7); g.fillStyle = cor; g.fill();
}

var PASSOS = [['Chave conectada', 'cabo USB-C'], ['PIN conferido', 'cifrado, conferido na chave'], ['Toque físico', 'botão BOOT'], ['Assinatura', 'feita no chip de segurança'], ['Verificação', 'no próprio navegador']];

function desenharMoldura(g, s) {
  var W = NB.W;
  /* navegador */
  g.fillStyle = C.tile; g.fillRect(0, 0, W, 56);
  rr(g, 14, 8, 330, 48, 10, C.creme); g.fillStyle = C.creme; g.fillRect(14, 40, 330, 16);
  g.beginPath(); g.arc(38, 32, 8, 0, 7); g.fillStyle = C.petroleo; g.fill();
  txt(g, 'Aspen Key · demonstração', 56, 39, '500 18px ' + F, C.texto);
  rr(g, 360, 13, 600, 32, 16, '#fff');
  txt(g, 'localhost:8000', 384, 35, '500 18px ' + F, C.suave);
  /* topo da página */
  g.fillStyle = C.petroleo; g.fillRect(0, 56, W, 72);
  g.strokeStyle = C.amarelo; g.lineWidth = 5; g.beginPath(); g.arc(54, 92, 12, 0, 7); g.stroke();
  g.fillStyle = C.amarelo; g.fillRect(64, 89, 22, 6); g.fillRect(78, 89, 5, 12);
  txt(g, 'Aspen Key', 98, 103, '700 30px ' + F, C.amarelo);
  rr(g, 930, 74, 310, 36, 18, C.petroleoEsc);
  g.beginPath(); g.arc(954, 92, 7, 0, 7); g.fillStyle = s.conectada ? C.led : '#858579'; g.fill();
  txt(g, s.conectada ? 'Chave conectada pelo USB' : 'Aguardando a chave', 972, 99, '600 18px ' + F, C.amarelo);
  g.fillStyle = C.amarelo; g.fillRect(0, 128, W, 34);
  txt(g, 'Demonstração de laboratório · firmware experimental, sem certificação FIDO', W / 2, 151, '500 17px ' + F, C.texto, 'center');
  g.fillStyle = C.creme; g.fillRect(0, 162, W, NB.H - 162);

  /* etapas à esquerda */
  PASSOS.forEach(function (p, i) {
    var y = 222 + i * 92, e = s.passos[i];
    if (i < PASSOS.length - 1) { g.fillStyle = e === 'ok' ? C.petroleo : C.borda; g.fillRect(68, y + 20, 4, 52); }
    marca(g, 70, y, 19, e);
    txt(g, p[0], 104, y + 2, '700 21px ' + F, e === 'pend' ? C.oliva : C.texto);
    txt(g, p[1], 104, y + 26, '400 16px ' + F, C.suave);
  });
  rr(g, 360, 190, 880, 580, 22, '#fff', '#E0E1CF', 2);
}

function linhaEstado(g, x, y, texto, estado) {
  marca(g, x + 14, y, 14, estado);
  txt(g, texto, x + 42, y + 7, (estado === 'ativo' ? '700' : '500') + ' 21px ' + F, estado === 'pend' ? C.oliva : C.texto);
}

function desenharCartao(g, s) {
  var X = 404;
  if (s.fase === 'entrar') {
    txt(g, 'Entrar com a Aspen Key', X, 258, '700 34px ' + F, C.texto);
    quebra(g, 'O site gera um desafio novo. A chave pede o PIN, espera um toque e assina.', X, 304, 780, 32, '400 22px ' + F, C.suave);
    rr(g, X, 372, 380, 66, 33, s.conectada ? (s.cliqueEntrar ? C.petroleoEsc : C.petroleo) : '#A9B9B5');
    txt(g, 'Entrar com a Aspen Key', X + 190, 413, '600 23px ' + F, C.amarelo, 'center');
    txt(g, 'Credencial já registrada neste navegador · contador 5', X, 486, '400 18px ' + F, C.suave);
    [['Desafio', 'novo a cada entrada'], ['PIN', 'conferido na chave'], ['Assinatura', 'ECDSA P-256, no chip']].forEach(function (d, i) {
      var x = X + i * 276;
      rr(g, x, 540, 258, 150, 16, C.creme);
      txt(g, d[0], x + 22, 596, '700 24px ' + F, C.petroleo);
      txt(g, d[1], x + 22, 634, '400 18px ' + F, C.suave);
    });
  } else if (s.fase === 'conferindo') {
    txt(g, 'Conferindo o PIN', X, 258, '700 34px ' + F, C.texto);
    g.strokeStyle = C.tile; g.lineWidth = 6; g.beginPath(); g.arc(X + 22, 324, 17, 0, 7); g.stroke();
    g.strokeStyle = C.petroleo; g.beginPath(); g.arc(X + 22, 324, 17, s.giro, s.giro + 1.9); g.stroke();
    txt(g, 'O navegador cifrou o PIN e enviou pelo USB.', X + 56, 332, '500 22px ' + F, C.texto);
    rr(g, X, 372, 792, 124, 14, C.creme);
    txt(g, 'PIN cifrado (pinHashEnc)', X + 24, 412, '600 18px ' + F, C.suave);
    txt(g, HEX_PIN, X + 24, 462, '500 28px ' + MONO, C.petroleo);
    quebra(g, 'Cifrado com ECDH P-256 e AES-256. Só a chave consegue decifrar e comparar.', X, 552, 780, 30, '400 21px ' + F, C.suave);
  } else if (s.fase === 'pinok') {
    marca(g, X + 30, 248, 30, 'ok');
    txt(g, 'PIN conferido pela chave', X + 78, 260, '700 34px ' + F, C.texto);
    linhaEstado(g, X, 348, 'Enviado cifrado: ECDH P-256 e AES-256', 'ok');
    linhaEstado(g, X, 408, 'Conferido dentro da chave', 'ok');
    linhaEstado(g, X, 468, 'Falta o toque físico', 'ativo');
  } else if (s.fase === 'assinando') {
    txt(g, 'Assinando o desafio', X, 258, '700 34px ' + F, C.texto);
    rr(g, X, 290, 792, 124, 14, C.creme);
    txt(g, 'Desafio novo', X + 24, 330, '600 18px ' + F, C.suave);
    txt(g, HEX_DESAFIO, X + 24, 380, '500 28px ' + MONO, C.petroleo);
    linhaEstado(g, X, 474, 'Desafio enviado à chave pelo USB', s.r[0]);
    linhaEstado(g, X, 540, 'Chip de segurança assinando', s.r[1]);
    linhaEstado(g, X, 606, 'Assinatura enviada ao site', s.r[2]);
    if (s.r[2] === 'ok') txt(g, HEX_ASSIN + ' …', X, 680, '500 22px ' + MONO, C.petroleo);
  } else if (s.fase === 'verificar') {
    var itens = ITENS, feitos = 0;
    txt(g, 'Verificação', X, 258, '700 34px ' + F, C.texto);
    s.vp.forEach(function (v) { feitos += v; });
    /* barra de progresso fina embaixo do título */
    rr(g, X + 230, 240, 420, 8, 4, C.tile);
    if (feitos > 0) rr(g, X + 230, 240, Math.max(8, 420 * feitos / itens.length), 8, 4, C.petroleo);
    if (s.selo > 0) {
      var k = 0.85 + 0.15 * saida(s.selo);
      g.save(); g.globalAlpha = s.selo; g.translate(1050, 245); g.scale(k, k);
      rr(g, -150, -23, 300, 46, 23, C.petroleo);
      txt(g, itens.length + ' de ' + itens.length + ' passaram', 0, 8, '700 21px ' + F, C.amarelo, 'center');
      g.restore();
    }
    var passo = 49, h = passo - 8;
    itens.forEach(function (t, i) {
      var y = 298 + i * passo, v = s.vp[i], cy = y + h / 2;
      rr(g, X, y, 792, h, 10, C.creme, C.tile, 1.5);
      marca(g, X + 26, cy, 12, 'pend');
      txt(g, t, X + 52, cy + 7, '500 19px ' + F, C.oliva);
      if (v <= 0) return;
      /* o item conferido aparece por cima: fundo, visto que cresce e texto que escurece */
      g.save(); g.globalAlpha = v;
      rr(g, X, y, 792, h, 10, '#EAF1EE', '#9DBFBF', 1.5);
      txt(g, t, X + 52 + 6 * (1 - v), cy + 7, '500 19px ' + F, C.texto);
      g.translate(X + 26, cy); var e = 0.5 + 0.5 * saida(v); g.scale(e, e); marca(g, 0, 0, 12, 'ok');
      g.restore();
      if (v < 1) { g.save(); g.globalAlpha = Math.sin(Math.PI * v); rr(g, X, y, 792, h, 10, null, C.petroleo, 2.5); g.restore(); }
    });
    txt(g, 'Conferido com WebCrypto nesta página, sem servidor.', X, 758, '400 16px ' + F, C.suave);
  }
}

function desenharDialogo(g, d) {
  g.fillStyle = 'rgba(28,40,40,0.38)'; g.fillRect(0, 56, NB.W, NB.H - 56);
  var x = 390, y = 230, w = 500, h = 320;
  g.save(); g.shadowColor = 'rgba(0,0,0,0.3)'; g.shadowBlur = 30; g.shadowOffsetY = 8; rr(g, x, y, w, h, 16, '#fff'); g.restore();
  txt(g, 'Janela do navegador', x + 28, y + 38, '500 15px ' + F, '#5f6368');
  if (d.etapa === 'pin') {
    txt(g, 'Insira o PIN da chave de segurança', x + 28, y + 82, '600 23px ' + F, '#202124');
    txt(g, 'PIN da chave de segurança', x + 28, y + 126, '400 15px ' + F, '#5f6368');
    rr(g, x + 28, y + 138, w - 56, 46, 8, '#fff', '#1a73e8', 2);
    for (var i = 0; i < d.pin; i++) { g.beginPath(); g.arc(x + 50 + i * 20, y + 161, 5, 0, 7); g.fillStyle = '#202124'; g.fill(); }
    rr(g, x + 170, y + 240, 140, 44, 22, '#fff', '#dadce0', 1.5); txt(g, 'Cancelar', x + 240, y + 268, '600 18px ' + F, '#1a73e8', 'center');
    rr(g, x + 322, y + 240, 150, 44, 22, d.ok ? '#1557b0' : '#1a73e8'); txt(g, 'OK', x + 397, y + 268, '600 18px ' + F, '#fff', 'center');
  } else {
    txt(g, 'Toque a chave de segurança', x + 28, y + 82, '600 23px ' + F, '#202124');
    var cx = x + w / 2, cy = y + 186;
    g.strokeStyle = '#1a73e8'; g.lineWidth = 5; g.beginPath(); g.arc(cx, cy, 34 + 6 * Math.sin(d.fase * 7), 0, 7); g.stroke();
    g.beginPath(); g.arc(cx, cy, 13, 0, 7); g.fillStyle = '#1a73e8'; g.fill();
    txt(g, 'Toque na chave para continuar.', cx, y + 280, '400 17px ' + F, '#5f6368', 'center');
  }
}

function desenharAviso(g, a) {
  g.globalAlpha = a;
  rr(g, 900, 180, 330, 54, 14, C.petroleo);
  g.beginPath(); g.arc(928, 207, 8, 0, 7); g.fillStyle = C.led; g.fill();
  txt(g, 'Aspen Key conectada', 948, 214, '600 20px ' + F, C.amarelo);
  g.globalAlpha = 1;
}

function desenharCursor(g, c) {
  if (!c) return;
  if (c.clique > 0) { g.beginPath(); g.arc(c.x, c.y, 8 + 26 * (1 - c.clique), 0, 7); g.strokeStyle = 'rgba(37,91,98,' + (0.8 * c.clique).toFixed(2) + ')'; g.lineWidth = 4; g.stroke(); }
  g.beginPath(); g.moveTo(c.x, c.y); g.lineTo(c.x, c.y + 30); g.lineTo(c.x + 8, c.y + 23); g.lineTo(c.x + 15, c.y + 37); g.lineTo(c.x + 21, c.y + 34); g.lineTo(c.x + 14, c.y + 21); g.lineTo(c.x + 24, c.y + 21); g.closePath();
  g.fillStyle = '#fff'; g.fill(); g.strokeStyle = '#000'; g.lineWidth = 2; g.stroke();
}

function desenharTela(g, s) {
  desenharMoldura(g, s);
  desenharCartao(g, s);
  if (s.aviso > 0) desenharAviso(g, s.aviso);
  if (s.dialogo) desenharDialogo(g, s.dialogo);
  desenharCursor(g, s.cursor);
}

/* cursor: pontos de passagem (tempo, x, y) em pixels da tela, e instantes de clique */
var CURSOR = [[0, 1000, 660], [6.5, 1000, 660], [7.2, 594, 405], [9.5, 594, 405], [9.95, 787, 492], [11, 1000, 660]];
var CLIQUES = [7.3, 10.05];
function cursorEm(t) {
  var i = 0;
  while (i < CURSOR.length - 2 && t > CURSOR[i + 1][0]) i++;
  var a = CURSOR[i], b = CURSOR[i + 1], u = ease(prog(t, a[0], b[0])), clique = 0;
  CLIQUES.forEach(function (c) { if (t >= c && t < c + 0.4) clique = 1 - (t - c) / 0.4; });
  return { x: lerp(a[1], b[1], u), y: lerp(a[2], b[2], u), clique: clique };
}

function estadoTela(t) {
  /* a partir de 31,6 s o USB sai do notebook (o resto acontece no celular) */
  var s = { conectada: t >= 5.3 && t < 31.6 };
  s.aviso = Math.round(janela(t, 5.3, 7.4, 0.3) * 10) / 10;
  s.fase = t < 10.25 ? 'entrar' : t < 12.6 ? 'conferindo' : t < 15.3 ? 'pinok' : t < 24.6 ? 'assinando' : 'verificar';
  function et(ok, ativo) { return t >= ok ? 'ok' : t >= ativo ? 'ativo' : 'pend'; }
  s.passos = [et(5.3, 2.8), et(12.6, 7.3), et(15.0, 12.6), et(24.0, 15.3), et(28.3, 24.6)];
  s.cliqueEntrar = t >= 7.3 && t < 7.55;
  s.giro = Math.floor(t * 10) * 0.6;
  s.r = [et(17.8, 15.3), et(21.2, 19.4), et(24.0, 21.4)];
  /* um item a cada 0,36 s, cada um leva 0,28 s para entrar; o selo aparece no fim */
  s.vp = ITENS.map(function (x, i) { return Math.round(prog(t, 25 + i * 0.36, 25.28 + i * 0.36) * 14) / 14; });
  s.selo = Math.round(prog(t, 28.2, 28.5) * 10) / 10;
  s.dialogo = null;
  if (t >= 7.6 && t < 10.25) s.dialogo = { etapa: 'pin', pin: Math.floor(prog(t, 7.9, 9.5) * 12.99), ok: t >= 10.05 };
  else if (t >= 12.9 && t < 15.25) s.dialogo = { etapa: 'toque', fase: t };
  s.cursor = t >= 6.4 && t < 10.8 ? cursorEm(t) : null;
  s.sig = [s.conectada, s.aviso, s.fase, s.passos.join(), s.cliqueEntrar, s.fase === 'conferindo' ? s.giro : 0, s.r.join(), s.vp.join(), s.selo,
    s.dialogo ? [s.dialogo.etapa, s.dialogo.pin, s.dialogo.ok, s.dialogo.etapa === 'toque' ? Math.floor(t * 12) : 0].join() : '',
    s.cursor ? [Math.round(s.cursor.x), Math.round(s.cursor.y), Math.round(s.cursor.clique * 10)].join() : ''].join('|');
  return s;
}

/* ---------- tela do celular: a versão móvel da mesma página ---------- */
var CW = 528, CH = 1113, CESC = 2; /* tamanho lógico da tela; o canvas tem o dobro para ficar nítido */
function estadoCelular(t) {
  var e = { fase: t < 34.4 ? 'espera' : t < 40.0 ? 'lendo' : 'ok' };
  function et(ok, ativo) { return t >= ok ? 'ok' : t >= ativo ? 'ativo' : 'pend'; }
  e.r = [et(34.6, 34.4), et(36.3, 34.6), et(38.1, 37.2), et(39.9, 38.1)];
  e.giro = Math.floor(t * 10) * 0.6;
  e.sig = [e.fase, e.r.join(), e.fase === 'lendo' ? e.giro : 0].join('|');
  return e;
}
function desenharCelular(g, e) {
  var W = CW, X = 56;
  g.setTransform(CESC, 0, 0, CESC, 0, 0);
  g.fillStyle = C.creme; g.fillRect(0, 0, W, CH);
  /* barra de status (a ilha da câmera fica no meio, por cima) */
  g.fillStyle = C.petroleoEsc; g.fillRect(0, 0, W, 96);
  txt(g, '12:00', 70, 62, '600 26px ' + F, C.amarelo);
  for (var b = 0; b < 4; b++) { g.fillStyle = b < 3 ? C.amarelo : 'rgba(251,239,201,0.4)'; rr(g, 376 + b * 9, 60 - 6 - b * 5, 6, 6 + b * 5, 1.5, g.fillStyle); }
  rr(g, 422, 44, 40, 20, 5, null, C.amarelo, 2.5); rr(g, 426, 48, 26, 12, 2.5, C.amarelo); rr(g, 463, 50, 3, 8, 1.5, C.amarelo);
  /* barra do navegador */
  g.fillStyle = C.tile; g.fillRect(0, 96, W, 78);
  rr(g, 24, 110, W - 48, 50, 25, '#fff');
  g.beginPath(); g.arc(52, 135, 7, 0, 7); g.fillStyle = C.petroleo; g.fill();
  txt(g, 'Aspen Key · demonstração', W / 2 + 10, 143, '500 21px ' + F, C.suave, 'center');
  /* topo da página, como no computador */
  g.fillStyle = C.petroleo; g.fillRect(0, 174, W, 90);
  g.strokeStyle = C.amarelo; g.lineWidth = 6; g.beginPath(); g.arc(52, 219, 14, 0, 7); g.stroke();
  g.fillStyle = C.amarelo; g.fillRect(64, 215, 26, 7); g.fillRect(81, 215, 6, 14);
  txt(g, 'Aspen Key', 104, 231, '700 36px ' + F, C.amarelo);
  g.fillStyle = C.amarelo; g.fillRect(0, 264, W, 62);
  txt(g, 'Demonstração de laboratório', W / 2, 291, '600 19px ' + F, C.texto, 'center');
  txt(g, 'firmware experimental, sem certificação FIDO', W / 2, 315, '400 17px ' + F, C.texto, 'center');
  g.save(); g.shadowColor = 'rgba(37,91,98,0.14)'; g.shadowBlur = 24; g.shadowOffsetY = 6;
  rr(g, 28, 352, W - 56, 690, 28, '#fff'); g.restore();
  rr(g, 28, 352, W - 56, 690, 28, null, '#E0E1CF', 2);
  if (e.fase === 'espera') {
    txt(g, 'Entrar pelo NFC', X, 424, '700 38px ' + F, C.texto);
    quebra(g, 'Aproxime a Aspen Key da parte traseira do celular.', X, 474, W - 112, 34, '400 25px ' + F, C.suave);
    ondasNfc(g, W / 2 - 30, 720, 3, C.petroleo);
    quebra(g, 'Sem cabo. A conexão ocorre por aproximação e já vale como toque.', X, 930, W - 112, 32, '400 22px ' + F, C.suave);
  } else if (e.fase === 'lendo') {
    txt(g, 'Chave encontrada', X, 424, '700 38px ' + F, C.texto);
    g.strokeStyle = C.tile; g.lineWidth = 7; g.beginPath(); g.arc(X + 20, 486, 18, 0, 7); g.stroke();
    g.strokeStyle = C.petroleo; g.beginPath(); g.arc(X + 20, 486, 18, e.giro, e.giro + 1.9); g.stroke();
    txt(g, 'Comunicação por NFC', X + 56, 495, '500 25px ' + F, C.texto);
    ['Conectada por NFC', 'Desafio enviado à chave', 'Chip de segurança assinando', 'Assinatura enviada ao site'].forEach(function (d, i) {
      var y = 604 + i * 92, st = e.r[i];
      marca(g, X + 18, y, 18, st);
      txt(g, d, X + 54, y + 9, (st === 'ativo' ? '700' : '500') + ' 24px ' + F, st === 'pend' ? C.oliva : C.texto);
    });
  } else {
    marca(g, X + 28, 414, 28, 'ok');
    txt(g, 'Verificado pelo NFC', X + 72, 426, '700 34px ' + F, C.texto);
    rr(g, X, 466, 250, 48, 24, C.petroleo);
    txt(g, ITENS_NFC.length + ' de ' + ITENS_NFC.length + ' passaram', X + 125, 499, '700 21px ' + F, C.amarelo, 'center');
    ITENS_NFC.forEach(function (t, i) {
      var y = 548 + i * 96;
      rr(g, X, y, W - 112, 80, 14, '#EAF1EE', '#9DBFBF', 1.5);
      marca(g, X + 32, y + 40, 15, 'ok');
      quebra(g, t, X + 62, y + 49, W - 190, 28, '500 22px ' + F, C.texto);
    });
    txt(g, 'Validado com WebCrypto nesta página.', X, 1000, '400 19px ' + F, C.suave);
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
}

/* ---------- cartão flutuante do chip de segurança ---------- */
function desenharChip(g, e) {
  var W = 640, H = 300;
  g.clearRect(0, 0, W, H);
  rr(g, 6, 6, W - 12, H - 12, 26, '#fff', C.petroleo, 6);
  rr(g, 6, 6, W - 12, 70, 26, C.petroleo); g.fillStyle = C.petroleo; g.fillRect(6, 46, W - 12, 30);
  txt(g, 'CHIP DE SEGURANÇA · ATECC', 36, 54, '700 26px ' + F, C.amarelo);
  /* cadeado */
  g.strokeStyle = C.petroleo; g.lineWidth = 7; g.beginPath(); g.arc(70, 138, 18, Math.PI, 0); g.stroke();
  rr(g, 44, 136, 52, 44, 8, C.petroleo); g.beginPath(); g.arc(70, 156, 6, 0, 7); g.fillStyle = C.amarelo; g.fill();
  if (e.etapa === 'recebe') {
    txt(g, 'Recebeu o desafio', 122, 150, '700 30px ' + F, C.texto);
    txt(g, HEX_DESAFIO, 122, 196, '500 24px ' + MONO, C.petroleo);
  } else if (e.etapa === 'assina') {
    txt(g, 'Assinando com a chave privada', 122, 150, '700 30px ' + F, C.texto);
    txt(g, hexAleatorio(e.semente), 122, 196, '500 24px ' + MONO, C.oliva);
    rr(g, 122, 222, 480, 14, 7, C.tile); rr(g, 122, 222, Math.max(14, 480 * e.p), 14, 7, C.petroleo);
  } else {
    txt(g, '✓ Assinatura pronta', 122, 150, '700 30px ' + F, C.petroleo);
    txt(g, HEX_ASSIN, 122, 196, '500 24px ' + MONO, C.petroleo);
    txt(g, 'A chave privada não saiu do chip.', 122, 246, '500 22px ' + F, C.suave);
  }
}

function textoSprite(texto, cor, fundo) {
  var c = document.createElement('canvas'), g = c.getContext('2d');
  g.font = '700 40px ' + F; var w = Math.ceil(g.measureText(texto).width) + 56;
  c.width = w; c.height = 72; g = c.getContext('2d');
  rr(g, 2, 2, w - 4, 68, 34, fundo); txt(g, texto, w / 2, 50, '700 40px ' + F, cor, 'center');
  var tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false, toneMapped: false, fog: false }));
  sp.scale.set(3.4 * w / 72, 3.4, 1); sp.renderOrder = 20; sp.visible = false;
  return sp;
}

/* ---------- celular (genérico, sem marca) ---------- */
function retanguloRedondo(w, h, r) {
  var f = new THREE.Shape(), x = -w / 2, y = -h / 2;
  f.moveTo(x + r, y); f.lineTo(x + w - r, y); f.quadraticCurveTo(x + w, y, x + w, y + r);
  f.lineTo(x + w, y + h - r); f.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  f.lineTo(x + r, y + h); f.quadraticCurveTo(x, y + h, x, y + h - r);
  f.lineTo(x, y + r); f.quadraticCurveTo(x, y, x + r, y);
  return f;
}
/* placa plana com cantos arredondados, deitada (normal +Y), com UV de 0 a 1 na largura e na altura */
function chapa(w, h, r) {
  var geo = new THREE.ShapeGeometry(retanguloRedondo(w, h, r), 12), pos = geo.attributes.position, uv = geo.attributes.uv;
  for (var i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / h + 0.5);
  geo.rotateX(-Math.PI / 2);
  return geo;
}
function montarCelular(texTela) {
  var L = 71.5, C_ = 147, E = 7.8, R = 10.5; /* largura, comprimento, espessura, raio do canto (mm) */
  var g = new THREE.Group();
  var metal = new THREE.MeshPhysicalMaterial({ color: 0x5a6068, metalness: 0.9, roughness: 0.28, clearcoat: 0.6 });
  var traseira = new THREE.MeshPhysicalMaterial({ color: 0x1f3d42, metalness: 0.1, roughness: 0.38, clearcoat: 1, clearcoatRoughness: 0.15 });
  var vidro = new THREE.MeshPhysicalMaterial({ color: 0x040506, metalness: 0, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.03 });
  var preto = new THREE.MeshStandardMaterial({ color: 0x050506, roughness: 0.25 });
  /* moldura: extrusão com bisel, para as laterais ficarem arredondadas */
  var molde = new THREE.ExtrudeGeometry(retanguloRedondo(L - 1.6, C_ - 1.6, R - 0.8), { depth: E - 1.6, bevelEnabled: true, bevelThickness: 0.8, bevelSize: 0.8, bevelSegments: 4, curveSegments: 20 });
  molde.rotateX(-Math.PI / 2); molde.translate(0, -(E - 1.6) / 2, 0);
  g.add(new THREE.Mesh(molde, metal));
  var fundo = new THREE.Mesh(chapa(L - 1.2, C_ - 1.2, R - 0.6), traseira); fundo.rotation.x = Math.PI; fundo.position.y = -E / 2 - 0.02; g.add(fundo);
  var frente = new THREE.Mesh(chapa(L - 1.2, C_ - 1.2, R - 0.6), vidro); frente.position.y = E / 2 + 0.02; g.add(frente);
  var tela = new THREE.Mesh(chapa(L - 4.6, C_ - 4.6, R - 2.4), new THREE.MeshBasicMaterial({ map: texTela, toneMapped: false }));
  tela.position.y = E / 2 + 0.05; g.add(tela);
  /* ilha da câmera da frente, no topo (-Z) */
  var ilha = new THREE.Mesh(chapa(19, 5.6, 2.8), preto); ilha.position.set(0, E / 2 + 0.08, -C_ / 2 + 8.2); g.add(ilha);
  /* botões laterais */
  [[-1, -38, 9], [-1, -24, 9], [1, -30, 15]].forEach(function (b) {
    var m = new THREE.Mesh(new THREE.BoxGeometry(1, 2.6, b[2]), metal); m.position.set(b[0] * (L / 2 + 0.3), 0, b[1]); g.add(m);
  });
  /* módulo de câmeras atrás, no canto de cima */
  var bloco = new THREE.Mesh(chapa(30, 30, 7.5), vidro); bloco.rotation.x = Math.PI; bloco.position.set(-L / 2 + 19, -E / 2 - 0.9, -C_ / 2 + 19); g.add(bloco);
  var base = new THREE.Mesh(new THREE.ExtrudeGeometry(retanguloRedondo(30, 30, 7.5), { depth: 0.9, bevelEnabled: false, curveSegments: 12 }).rotateX(-Math.PI / 2), traseira);
  base.position.set(-L / 2 + 19, -E / 2 - 0.9, -C_ / 2 + 19); g.add(base);
  [[-6.5, -6.5], [6.5, -6.5], [-6.5, 6.5]].forEach(function (o) {
    var anel = new THREE.Mesh(new THREE.CylinderGeometry(5.4, 5.4, 1.4, 32), metal); anel.position.set(-L / 2 + 19 + o[0], -E / 2 - 1.5, -C_ / 2 + 19 + o[1]); g.add(anel);
    var lente = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 1.5, 32), vidro); lente.position.copy(anel.position); g.add(lente);
  });
  g.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.receiveShadow = o !== tela; } });
  return g;
}

export function criarAnimacao(visor, modelo) {
  visor.explodirJa();
  var cena = visor.cena, banco = modelo.grupo, refs = modelo.refs, cv = modelo.curvas;
  function local(o) { var b = new THREE.Box3().setFromObject(o); return { min: banco.worldToLocal(b.min.clone()), max: banco.worldToLocal(b.max.clone()), c: banco.worldToLocal(b.getCenter(new THREE.Vector3())) }; }

  /* posições de referência, com a bancada parada no lugar */
  var plugue = new THREE.Vector3(-29.5, 13.2, PLUGUE_Z);
  var nb = montarNotebook(plugue.z, plugue.y);
  nb.grupo.visible = false; cena.add(nb.grupo);
  var tela = nb.centroTela;
  var bootLocal = banco.worldToLocal(refs.bootCap.getWorldPosition(new THREE.Vector3()));
  var capBase = refs.bootCap.position.y;
  var nfcB = local(modelo.partes.nfc), chipB = local(refs.atecc), modB = local(modelo.partes['esp32-modulo']), nfcChipB = local(modelo.partes['nfc-chip']);

  /* dedo que aperta o BOOT */
  var pele = new THREE.MeshStandardMaterial({ color: 0xd9a37a, roughness: 0.65 });
  var dedo = new THREE.Group();
  var DEDO_R = 4.6, DEDO_L = 30, DEDO_INCL = 0.5, DEDO_MEIO = DEDO_L / 2 + DEDO_R;
  dedo.add(new THREE.Mesh(new THREE.CapsuleGeometry(DEDO_R, DEDO_L, 6, 16), pele));
  dedo.rotation.x = DEDO_INCL; dedo.visible = false; banco.add(dedo);

  /* pulsos de dados: cometas finos pelos fios (núcleo de 0,8 mm, rastro que some e um brilho leve em volta da cabeça).
     ciano = pedido indo para a chave; dourado = assinatura voltando. */
  var CAUDA = 9, R_PULSO = 0.8, esfera = new THREE.SphereGeometry(1, 10, 8);
  var matsPulso = { ciano: [], dourado: [] }, matsHalo = {};
  [['ciano', 0x12c8dc], ['dourado', 0xe8a317]].forEach(function (d) {
    for (var j = 0; j < CAUDA; j++) matsPulso[d[0]].push(new THREE.MeshBasicMaterial({ color: d[1], transparent: true, opacity: 1 - j / CAUDA, toneMapped: false, depthWrite: false }));
    matsHalo[d[0]] = new THREE.MeshBasicMaterial({ color: d[1], transparent: true, opacity: 0.28, toneMapped: false, depthWrite: false });
  });
  var cometas = [];
  for (var ci = 0; ci < 18; ci++) {
    var bolas = [];
    for (var j = 0; j < CAUDA; j++) { var m = new THREE.Mesh(esfera, matsPulso.ciano[j]); m.visible = false; m.scale.setScalar(R_PULSO * (1 - j * 0.08)); m.renderOrder = 5; banco.add(m); bolas.push(m); }
    var h = new THREE.Mesh(esfera, matsHalo.ciano); h.visible = false; h.scale.setScalar(2.4); h.renderOrder = 4; banco.add(h);
    bolas.halo = h; cometas.push(bolas);
  }
  function lista(c) { return Array.isArray(c) ? c : [c]; }
  var comp = new Map();
  function comprimento(c) { if (!comp.has(c)) comp.set(c, c.getLength()); return comp.get(c); }
  /* c: nome da curva em modelo.curvas; dir 1 = do começo para o fim do fio; n = cometas por fio */
  var PULSOS = [
    { c: 'usb', a: 10.9, b: 12.0, dir: 1, n: 2, cor: 'ciano' },
    { c: 'usb', a: 16.7, b: 17.8, dir: 1, n: 2, cor: 'ciano' },
    { c: 'esp', a: 17.6, b: 18.4, dir: 1, n: 1, cor: 'ciano' },
    { c: 'atecc', a: 18.3, b: 19.4, dir: -1, n: 2, cor: 'ciano' },
    { c: 'atecc', a: 21.4, b: 22.4, dir: 1, n: 2, cor: 'dourado' },
    { c: 'esp', a: 22.2, b: 22.9, dir: -1, n: 1, cor: 'dourado' },
    { c: 'usb', a: 22.8, b: 24.0, dir: -1, n: 2, cor: 'dourado' },
    { c: 'nfc', a: 34.7, b: 35.9, dir: 1, n: 2, cor: 'ciano' },
    { c: 'espNfc', a: 35.8, b: 36.4, dir: 1, n: 1, cor: 'ciano' },
    { c: 'atecc', a: 36.3, b: 37.2, dir: -1, n: 2, cor: 'ciano' },
    { c: 'atecc', a: 38.1, b: 38.9, dir: 1, n: 2, cor: 'dourado' },
    { c: 'espNfc', a: 38.8, b: 39.3, dir: -1, n: 1, cor: 'dourado' },
    { c: 'nfc', a: 39.2, b: 39.9, dir: -1, n: 2, cor: 'dourado' }
  ];
  function pulsar(t) {
    var usado = 0, algum = false;
    PULSOS.forEach(function (p) {
      if (t < p.a || t > p.b + 0.4) return;
      var dur = p.b - p.a, gap = p.n > 1 ? dur * 0.3 : 0, viagem = dur - gap * (p.n - 1);
      lista(cv[p.c] || []).forEach(function (curva) {
        var du = 1.3 / comprimento(curva);
        for (var k = 0; k < p.n; k++) {
          var u = (t - p.a - k * gap) / viagem;
          if (u < 0 || u > 1 + CAUDA * du || usado >= cometas.length) continue;
          var bolas = cometas[usado++]; algum = true;
          bolas.halo.visible = u <= 1; bolas.halo.material = matsHalo[p.cor];
          if (u <= 1) bolas.halo.position.copy(curva.getPointAt(p.dir > 0 ? u : 1 - u));
          for (var j = 0; j < CAUDA; j++) {
            var q = u - j * du, b = bolas[j];
            b.visible = q >= 0 && q <= 1;
            if (!b.visible) continue;
            b.material = matsPulso[p.cor][j];
            b.position.copy(curva.getPointAt(p.dir > 0 ? q : 1 - q));
          }
        }
      });
    });
    for (var i = usado; i < cometas.length; i++) { cometas[i].forEach(function (b) { b.visible = false; }); cometas[i].halo.visible = false; }
    return algum;
  }

  /* brilho por cima das peças que trabalham */
  function brilho(b, cor, folga) {
    var m = new THREE.Mesh(new THREE.BoxGeometry(b.max.x - b.min.x + folga, 0.35, b.max.z - b.min.z + folga), new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: 0, toneMapped: false, depthWrite: false }));
    m.position.set(b.c.x, b.max.y + 0.25, b.c.z); m.visible = false; m.renderOrder = 4; banco.add(m); return m;
  }
  var brModulo = brilho(modB, 0x12c8dc, 1), brChip = brilho(chipB, 0x12c8dc, 1.2), brNfcChip = brilho(nfcChipB, 0x12c8dc, 1);
  var halo = new THREE.Mesh(new THREE.RingGeometry(4.6, 5.6, 48), new THREE.MeshBasicMaterial({ color: 0x12c8dc, transparent: true, opacity: 0, toneMapped: false, depthWrite: false, side: THREE.DoubleSide }));
  halo.rotation.x = -Math.PI / 2; halo.position.set(chipB.c.x, chipB.max.y + 0.3, chipB.c.z); halo.visible = false; banco.add(halo);
  function acender(m, v) { m.visible = v > 0.01; m.material.opacity = 0.7 * v; }

  /* cartão flutuante do chip e rótulos dos barramentos */
  var cvChip = document.createElement('canvas'); cvChip.width = 640; cvChip.height = 300;
  var texChip = new THREE.CanvasTexture(cvChip); texChip.colorSpace = THREE.SRGBColorSpace;
  var cartaoChip = new THREE.Sprite(new THREE.SpriteMaterial({ map: texChip, transparent: true, depthTest: false, depthWrite: false, toneMapped: false, fog: false }));
  cartaoChip.scale.set(44, 44 * 300 / 640, 1); cartaoChip.center.set(0.5, 0);
  /* ao lado do chip (para o fim da protoboard), para não cobrir os fios do I2C */
  cartaoChip.position.set(chipB.c.x, chipB.max.y + 8, chipB.c.z - 30); cartaoChip.renderOrder = 21; cartaoChip.visible = false; banco.add(cartaoChip);
  var sigChip = null;
  function meio(nome, i, dy) { var c = lista(cv[nome])[i || 0]; return c.getPointAt(0.5).add(new THREE.Vector3(0, dy, 0)); }
  var ROTULOS = [
    { s: textoSprite('USB · PIN cifrado', C.amarelo, C.petroleo), p: meio('usb', 0, 6), a: 10.8, b: 12.2 },
    { s: textoSprite('USB · desafio', C.amarelo, C.petroleo), p: meio('usb', 0, 6), a: 16.6, b: 18.0 },
    { s: textoSprite('I2C', C.amarelo, C.petroleo), p: meio('atecc', 1, 5), a: 18.2, b: 19.7 },
    { s: textoSprite('I2C · assinatura', '#3A2A00', '#F2C14E'), p: meio('atecc', 1, 5), a: 21.3, b: 22.6 },
    { s: textoSprite('USB · assinatura', '#3A2A00', '#F2C14E'), p: meio('usb', 0, 6), a: 22.7, b: 24.2 },
    { s: textoSprite('NFC', C.amarelo, C.petroleo), p: meio('nfc', 1, 5), a: 34.6, b: 36.1 },
    { s: textoSprite('I2C', C.amarelo, C.petroleo), p: meio('atecc', 1, 5), a: 36.2, b: 37.4 },
    { s: textoSprite('I2C · assinatura', '#3A2A00', '#F2C14E'), p: meio('atecc', 1, 5), a: 38.0, b: 39.1 },
    { s: textoSprite('NFC · assinatura', '#3A2A00', '#F2C14E'), p: meio('nfc', 1, 5), a: 39.1, b: 40.1 }
  ];
  ROTULOS.forEach(function (r) { r.s.position.copy(r.p); banco.add(r.s); });

  /* celular que lê a chave por NFC: deitado sobre o leitor, tela para cima, topo para -X (tela de pé para a câmera em +X).
     Montado por código: moldura de metal com cantos arredondados, vidro, tela, ilha da câmera, botões e câmeras atrás. */
  var cvCel = document.createElement('canvas'); cvCel.width = CW * CESC; cvCel.height = CH * CESC;
  var texCel = new THREE.CanvasTexture(cvCel); texCel.colorSpace = THREE.SRGBColorSpace; texCel.anisotropy = 16;
  var celular = montarCelular(texCel);
  celular.rotation.y = Math.PI / 2; celular.visible = false;
  banco.add(celular);
  /* pousado: o topo do celular (onde fica a antena) por cima da moldura do leitor */
  var CEL = { x: nfcB.c.x + 58, y: nfcB.max.y + 9, z: nfcB.c.z };
  var sigCel = null;
  var ondas = [0, 1, 2].map(function () {
    var m = new THREE.Mesh(new THREE.RingGeometry(9, 9.7, 48), new THREE.MeshBasicMaterial({ color: 0x12c8dc, transparent: true, opacity: 0, toneMapped: false, depthWrite: false, side: THREE.DoubleSide }));
    m.rotation.x = -Math.PI / 2; m.position.set(nfcB.c.x, nfcB.max.y + 0.5, nfcB.c.z); m.visible = false; m.renderOrder = 6; banco.add(m); return m;
  });

  /* câmera: pontos de passagem (th, ph em radianos; rx, ry = meia largura e meia altura do quadro, em mm) */
  var A_INICIO = { a: [-110, 70, 10], th: -0.5, ph: 1.0, rx: 300, ry: 165 };
  var A_AMPLA = { a: [-120, 75, 0], th: -0.25, ph: 1.05, rx: 275, ry: 150 };
  var SOLTA = 28; /* mm que a bancada recua para o plugue sair do notebook */
  var A_SOLTA = { a: [plugue.x + 14, 14, plugue.z - 6], th: 0.5, ph: 0.82, rx: 80, ry: 50 };
  var A_PLUGUE = { a: [plugue.x - 4, 13, plugue.z], th: 0.4, ph: 0.72, rx: 52, ry: 32 };
  var A_TELA = { a: [tela.x, tela.y - 30, tela.z], th: -0.03, ph: 1.31, rx: 160, ry: 135 }; /* tela um pouco acima do centro, para a legenda não cobrir */
  var A_USB = { a: [10, 8, 88], th: 0.0, ph: 0.7, rx: 58, ry: 36 };
  var A_BOOT = { a: [bootLocal.x, bootLocal.y + 3, bootLocal.z], th: 0.3, ph: 0.95, rx: 36, ry: 24 };
  var A_CADEIA = { a: [30, 16, -18], th: 1.5708, ph: 0.62, rx: 110, ry: 62 };
  var A_ATECC = { a: [chipB.c.x + 4, chipB.max.y + 12, chipB.c.z - 12], th: 1.4, ph: 0.5, rx: 48, ry: 30 }; /* bem de cima: o conector ao lado não cobre o chip */
  var A_NFC = { a: [50 + SOLTA, 14, -42], th: 1.5708, ph: 0.55, rx: 125, ry: 72 }; /* bancada já recuada, celular por cima do leitor */
  /* abertura sem pausa: a câmera desce do plano aberto direto até o plugue enquanto a bancada chega */
  var A_CEL = { a: [CEL.x + SOLTA + 26, CEL.y + 4, CEL.z], th: 1.5708, ph: 0.22, rx: 120, ry: 88 }; /* tela do celular de pé na imagem */
  var A_FIM = { a: [-80, 50, 0], th: 0.15, ph: 0.95, rx: 270, ry: 140 };
  var K = [[0, A_INICIO], [3.8, A_PLUGUE], [5.8, A_PLUGUE], [6.6, A_TELA], [10.3, A_TELA], [10.9, A_USB], [12.0, A_USB], [12.6, A_TELA],
    [13.5, A_TELA], [14.1, A_BOOT], [15.9, A_BOOT], [16.6, A_CADEIA], [19.3, A_CADEIA], [19.9, A_ATECC], [21.4, A_ATECC], [22.1, A_CADEIA], [24.0, A_CADEIA],
    [24.7, A_TELA], [30.8, A_TELA], [31.5, A_SOLTA], [32.6, A_SOLTA], [33.4, A_NFC], [39.9, A_NFC], [40.6, A_CEL], [42.0, A_CEL], [43.0, A_FIM], [44.4, A_FIM]];

  function camera(t) {
    var i = 0; while (i < K.length - 2 && t > K[i + 1][0]) i++;
    var a = K[i], b = K[i + 1], u = ease(prog(t, a[0], b[0])), p = a[1], q = b[1];
    var resp = 0.03 * Math.sin(t * 0.55);
    visor.camera3d(lerp(p.th, q.th, u) + resp, lerp(p.ph, q.ph, u), visor.fit2(lerp(p.rx, q.rx, u), lerp(p.ry, q.ry, u)), lerp(p.a[0], q.a[0], u), lerp(p.a[1], q.a[1], u), lerp(p.a[2], q.a[2], u));
  }

  var ativa = false, tAtual = 0, sigAnterior = null;

  function aplicar(tv) {
    tAtual = tv;
    var t = interno(tv);
    banco.position.x = 70 * (1 - ease(prog(t, 1.0, 5.2))) + SOLTA * ease(prog(t, 31.7, 32.5));
    camera(t);

    /* dedo e botão BOOT */
    var pres = 0, lift = 0, mostra = false, w = [14.2, 14.7, 15.15, 15.7];
    if (t >= w[0] && t <= w[3]) {
      mostra = true;
      var d = ease(prog(t, w[0], w[1])), v = ease(prog(t, w[2], w[3]));
      lift = 26 * (1 - d) + 26 * v; pres = d * (1 - v);
    }
    dedo.visible = mostra;
    if (mostra) dedo.position.set(bootLocal.x, bootLocal.y + 0.5 + DEDO_MEIO * Math.cos(DEDO_INCL) + lift, bootLocal.z + DEDO_MEIO * Math.sin(DEDO_INCL));
    refs.bootCap.position.y = capBase - 0.9 * (pres > 0.95 ? 1 : 0);

    var dados = pulsar(t);

    /* brilhos: placa confere o PIN e repassa; chip assina; leitor NFC lê a tag */
    acender(brModulo, Math.max(janela(t, 11.7, 12.5), janela(t, 17.5, 18.6), janela(t, 22.1, 23.1), janela(t, 35.7, 36.6)));
    var vChip = Math.max(janela(t, 19.3, 21.4, 0.3), janela(t, 37.0, 38.2, 0.3));
    acender(brChip, vChip * (0.75 + 0.25 * Math.sin(t * 14)));
    halo.visible = vChip > 0.01;
    if (halo.visible) { var f = (t * 1.4) % 1; halo.scale.setScalar(1 + 1.6 * f); halo.material.opacity = 0.8 * vChip * (1 - f); }
    acender(brNfcChip, janela(t, 34.5, 35.8));

    /* cartão do chip: recebe, assina, pronta */
    var sessoes = [[18.6, 19.6, 21.2, 24.2], [36.4, 37.2, 38.1, 39.4]], e = null, op = 0;
    sessoes.forEach(function (x) {
      if (t < x[0] || t > x[3]) return;
      op = janela(t, x[0], x[3], 0.3);
      e = t < x[1] ? { etapa: 'recebe' } : t < x[2] ? { etapa: 'assina', semente: Math.floor(t * 14), p: prog(t, x[1], x[2]) } : { etapa: 'pronto' };
    });
    cartaoChip.visible = op > 0.01; cartaoChip.material.opacity = op;
    if (e) { var sc = e.etapa + (e.semente || '') + (e.p ? Math.round(e.p * 20) : ''); if (sc !== sigChip) { sigChip = sc; desenharChip(cvChip.getContext('2d'), e); texChip.needsUpdate = true; } }
    ROTULOS.forEach(function (r) { var o = janela(t, r.a, r.b, 0.2); r.s.visible = o > 0.01; r.s.material.opacity = o; });

    /* LED da placa: mais forte nos toques e com dados passando */
    refs.espLed.material.emissiveIntensity = pres > 0.5 || dados ? 4.2 : 2.2;

    /* NFC: o celular chega com o site aberto e pousa sobre o leitor; as ondas saem da antena na ida e na volta */
    var vCel = t >= 31.4;
    celular.visible = vCel;
    if (vCel) {
      var ap = ease(prog(t, 32.4, 34.3));
      celular.position.set(CEL.x + lerp(70, 0, ap), CEL.y + lerp(55, 0, ap), CEL.z + lerp(-20, 0, ap));
      celular.rotation.set(0, Math.PI / 2 + lerp(0.35, 0, ap), lerp(0.3, 0, ap));
      var ec = estadoCelular(t);
      if (ec.sig !== sigCel) { sigCel = ec.sig; desenharCelular(cvCel.getContext('2d'), ec); texCel.needsUpdate = true; }
    }
    ondas.forEach(function (o, i) {
      var ida = t >= 34.4 && t <= 36.6, volta = t >= 39.4 && t <= 40.4, v = ida || volta; o.visible = v;
      if (v) {
        var a0 = ida ? 34.4 : 39.4, b0 = ida ? 36.6 : 40.4, f = ((t - a0) / 1.0 + i / 3) % 1;
        o.material.color.setHex(ida ? 0x12c8dc : 0xe8a317);
        o.scale.setScalar(0.6 + 2.6 * f); o.material.opacity = 0.85 * (1 - f) * janela(t, a0, b0, 0.2);
      }
    });

    /* tela do notebook: só redesenha quando algo muda */
    var s = estadoTela(t);
    if (s.sig !== sigAnterior) { sigAnterior = s.sig; desenharTela(nb.ctx, s); nb.tex.needsUpdate = true; }
    visor.pedir();
  }

  function legenda(tv) {
    var t = interno(tv), l = LEGENDAS[0];
    for (var i = LEGENDAS.length - 1; i >= 0; i--) if (t >= LEGENDAS[i].a) { l = LEGENDAS[i]; break; }
    return { titulo: l.titulo, texto: l.texto, aviso: l.funcao && !FUNCOES[l.funcao] ? AVISO : null };
  }

  function esconderTudo() {
    dedo.visible = false; celular.visible = false; cartaoChip.visible = false; halo.visible = false;
    cometas.forEach(function (c) { c.forEach(function (b) { b.visible = false; }); c.halo.visible = false; });
    ondas.forEach(function (o) { o.visible = false; }); ROTULOS.forEach(function (r) { r.s.visible = false; });
    [brModulo, brChip, brNfcChip].forEach(function (m) { m.visible = false; });
  }

  return {
    duracao: DURACAO, capitulos: CAPITULOS, aplicar: aplicar, legenda: legenda,
    celular: CEL, cameras: { A_CEL: A_CEL, A_FIM: A_FIM, A_INICIO: A_INICIO, A_SOLTA: A_SOLTA, A_USB: A_USB, A_CADEIA: A_CADEIA, A_ATECC: A_ATECC, A_NFC: A_NFC, A_TELA: A_TELA }, /* para ajuste fino no console */
    ativar: function () {
      ativa = true; nb.grupo.visible = true; sigAnterior = null; sigChip = null; sigCel = null;
      modelo.cabo.visible = true; visor.palco(-110, 270);
      visor.aoRedimensionar(function () { if (ativa) aplicar(tAtual); });
    },
    desativar: function () {
      ativa = false; nb.grupo.visible = false; banco.position.x = 0; esconderTudo();
      refs.bootCap.position.y = capBase; refs.espLed.material.emissiveIntensity = 2.2;
      modelo.cabo.visible = false; visor.palco(0, 150); visor.aoRedimensionar(null);
    }
  };
}
