/* Aspen Core, modelo 3D do protótipo de hoje (montagem de bancada). Versão 2, ilustrativa.
   Montado por código a partir das fotos e das medidas padrão de cada peça. Não é CAD nem escaneamento:
   a posição das peças e dos fios é aproximada (ver NOTAS-FOTOS.md). Unidade: 1 unidade = 1 mm. Y para cima, protoboard
   deitada com o lado comprido no eixo Z (topo da foto = -Z, direita da foto = +X).
   Cada peça é um grupo nomeado (name e userData.id), usado pela camada interativa e pela animação.
   CURVAS: caminhos dos dados para a animação (usb = cabo USB-C, atecc = I2C, nfc = fios do leitor, esp = por cima da placa de controle).
   Montagem conforme as fotos de 25/11/2026: a ligação ao computador é por uma das entradas USB-C da placa. */
import * as THREE from '../vendor/three-0.170.0.module.min.js';

var ALT = 8.5;             /* altura da protoboard */
var PX = 54.6, PZ = 165.1; /* protoboard de 830 pontos */
var GRADE = 2.54;
var Z_FUROS = -PZ / 2 + (PZ - 62 * GRADE) / 2; /* Z do primeiro furo das colunas principais */
var ESP_X = 22.86;                              /* centro da placa ESP32-S3: pinos da esquerda caem no furo X 11,43 */
var ESP_TOPO_Z = 7.62 - 9.5;                    /* topo da placa: o pino 0 cai num furo */
var ESP_Y = ALT + 2.5;                          /* base da placa (cabeçote de 2,5 mm por baixo) */
var NFC_X = 24.5, NFC_Z = -38, NFC_ESC = 0.88;  /* leitor NFC um pouco menor que o modelo de 43 x 40 */

var COR = {
  vermelho: 0xb3202b, verde: 0x2f8f4e, cinza: 0xa9a49b, laranja: 0xe07b2a, amarelo: 0xd6ae2c,
  azul: 0x2b4fa8, roxo: 0x6a3fa0, marrom: 0x6b4a3a, preto: 0x1b1b1b, branco: 0xd9d8d0
};

var MAT = {}, REFS = {}, CURVAS = {};
function materiais() {
  function s(cor, rug, met) { return new THREE.MeshStandardMaterial({ color: cor, roughness: rug, metalness: met || 0 }); }
  MAT.branco = s(0xeeede5, 0.5);
  MAT.preto = s(0x17181a, 0.5);
  MAT.pretoBrilho = s(0x0b0c0e, 0.3, 0.2);
  MAT.metal = s(0xc4c7cb, 0.3, 1);
  MAT.metalFosco = s(0x9a9da1, 0.45, 1);
  MAT.ouro = s(0xd8b25a, 0.35, 1);
  MAT.azulPlaca = s(0x1c3a9c, 0.45);
  MAT.verdePlaca = s(0x1e9a4a, 0.5);
  MAT.bege = s(0xc9a46a, 0.7);
  MAT.led = new THREE.MeshStandardMaterial({ color: 0xff2a2a, emissive: 0xff1010, emissiveIntensity: 2.2, roughness: 0.4 });
  MAT.ledBranco = new THREE.MeshStandardMaterial({ color: 0xe9e9e4, emissive: 0x444444, roughness: 0.4 });
  MAT.dip = s(0xc39a3c, 0.5);
  MAT.azulSmd = s(0x1b4aa0, 0.5);
  MAT.fio = {};
  Object.keys(COR).forEach(function (k) { MAT.fio[k] = s(COR[k], 0.42); });
}

function textura(w, h, desenhar) {
  var c = document.createElement('canvas'); c.width = w; c.height = h;
  desenhar(c.getContext('2d'), w, h);
  var t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

function caixa(l, a, p, mat) { return new THREE.Mesh(new THREE.BoxGeometry(l, a, p), mat); }
function em(m, x, y, z) { m.position.set(x, y, z); return m; }
/* Caixa com a textura só na face de cima. Na face de cima a imagem tem o topo em -Z e a esquerda em -X. */
function placa(l, a, p, topo, lado) {
  return new THREE.Mesh(new THREE.BoxGeometry(l, a, p), [lado, lado, topo, lado, lado, lado]);
}
function parte(id, nome) { var g = new THREE.Group(); g.name = id; g.userData = { id: id, nome: nome }; return g; }
function cilindro(r, h, mat, seg) { return new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg || 20), mat); }

/* ---------- Protoboard ---------- */
function texProtoboard() {
  var k = 12, W = Math.round(PX * k), H = Math.round(PZ * k);
  return textura(W, H, function (g) {
    g.fillStyle = '#ecebe3'; g.fillRect(0, 0, W, H);
    function furo(xm, zm) { g.fillStyle = '#2b2b28'; g.fillRect((xm - 0.55) * k, (zm - 0.55) * k, 1.1 * k, 1.1 * k); }
    g.fillStyle = '#c9c8bd'; g.fillRect((PX / 2 - 1.7) * k, 0, 3.4 * k, H);
    g.fillStyle = '#aeada2'; g.fillRect((PX / 2 - 0.35) * k, 0, 0.7 * k, H);
    var z0 = (PZ - 62 * GRADE) / 2, i, j;
    g.font = (2.3 * k) + 'px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (i = 0; i < 63; i++) {
      var z = z0 + i * GRADE;
      for (j = 0; j < 5; j++) { furo(PX / 2 - 3.81 - j * GRADE, z); furo(PX / 2 + 3.81 + j * GRADE, z); }
      if ((i + 1) % 5 === 0) {
        g.fillStyle = '#8f8e85';
        g.fillText(String(i + 1), (PX / 2 - 3.81 - 4 * GRADE - 3.4) * k, z * k);
        g.fillText(String(i + 1), (PX / 2 + 3.81 + 4 * GRADE + 3.4) * k, z * k);
      }
    }
    var zr0 = (PZ - 59 * GRADE) / 2, xs = [3.4, 3.4 + GRADE, PX - 3.4 - GRADE, PX - 3.4], gp, h;
    for (gp = 0; gp < 10; gp++) for (h = 0; h < 5; h++) xs.forEach(function (x) { furo(x, zr0 + (gp * 6 + h) * GRADE); });
  });
}

function montarProtoboard() {
  var g = parte('protoboard', 'Protoboard');
  var corpo = placa(PX, ALT, PZ, new THREE.MeshStandardMaterial({ map: texProtoboard(), roughness: 0.5 }), MAT.branco);
  g.add(em(corpo, 0, ALT / 2, 0));
  [-60, -22, 22, 60].forEach(function (z) {
    var pino = cilindro(1.3, 2.4, MAT.branco, 12);
    pino.rotation.z = Math.PI / 2;
    g.add(em(pino, -PX / 2 - 1.1, ALT / 2, z));
  });
  return g;
}

/* ---------- Placa ESP32-S3 ---------- */
var ESP_ESQ = ['3V3', '3V3', 'RST', '4', '5', '6', '7', '15', '16', '17', '18', '8', '3', '46', '9', '10', '11', '12', '13', '14', '5V', 'G'];
var ESP_DIR = ['G', 'TX', 'RX', '1', '2', '42', '41', '40', '39', '38', '37', '36', '35', '0', '45', '48', '47', '21', '20', '19', 'G', 'G'];

function texEsp() {
  var k = 16, W = Math.round(25.4 * k), H = Math.round(69 * k);
  return textura(W, H, function (g) {
    g.fillStyle = '#0d0f12'; g.fillRect(0, 0, W, H);
    g.font = (1.5 * k) + 'px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    function rot(txt, x, z) { g.save(); g.translate(x * k, z * k); g.rotate(Math.PI / 2); g.fillStyle = '#e6e6de'; g.fillText(txt, 0, 0); g.restore(); }
    for (var i = 0; i < 22; i++) {
      var z = 9.5 + i * GRADE;
      [1.27, 24.13].forEach(function (x) {
        g.fillStyle = '#d6b25c'; g.beginPath(); g.arc(x * k, z * k, 0.95 * k, 0, 7); g.fill();
        g.fillStyle = '#2a2a2a'; g.beginPath(); g.arc(x * k, z * k, 0.45 * k, 0, 7); g.fill();
      });
      rot(ESP_ESQ[i], 4.1, z); rot(ESP_DIR[i], 21.3, z);
    }
    rot('RST', 22.6, 30.4); rot('BOOT', 22.6, 36.1); rot('RGB', 11.2, 44.1);
  });
}

function texShield() {
  var k = 16, S = Math.round(18 * k);
  return textura(S, S, function (g) {
    g.fillStyle = '#b9bcc0'; g.fillRect(0, 0, S, S);
    g.fillStyle = 'rgba(70,72,76,.9)'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = 'bold ' + (1.6 * k) + 'px sans-serif'; g.fillText('ESP32-S3', S / 2, 5.5 * k);
    g.font = (1.3 * k) + 'px sans-serif'; g.fillText('WIFI-BT MODEL', S / 2, 8.5 * k);
    g.font = (1.1 * k) + 'px sans-serif'; g.fillText('FC  CE  SRRC', S / 2, 11.5 * k);
  });
}

function montarEsp() {
  var g = parte('esp32', 'Placa de controle ESP32-S3');
  var topo = new THREE.MeshStandardMaterial({ map: texEsp(), roughness: 0.35, metalness: 0.1 });
  g.add(em(placa(25.4, 1.6, 69, topo, MAT.pretoBrilho), 12.7, 0.8, 34.5));
  var yp = 1.6;
  g.add(em(caixa(2.54, 2.5, 56, MAT.preto), 1.27, -1.25, 9.5 + 10.5 * GRADE));
  g.add(em(caixa(2.54, 2.5, 56, MAT.preto), 24.13, -1.25, 9.5 + 10.5 * GRADE));

  var mod = parte('esp32-modulo', 'Módulo Wi-Fi e Bluetooth');
  mod.add(em(caixa(18, 0.8, 25.5, MAT.pretoBrilho), 12.7, yp + 0.4, 12.75));
  var shield = placa(18, 2.4, 18, new THREE.MeshStandardMaterial({ map: texShield(), roughness: 0.4, metalness: 0.85 }), MAT.metalFosco);
  mod.add(em(shield, 12.7, yp + 0.8 + 1.2, 16.5));
  mod.add(em(caixa(3, 1.3, 3, MAT.metal), 19.2, yp + 0.8 + 0.65, 2.6));
  g.add(mod);

  var bot = parte('esp32-botoes', 'Botões RST e BOOT');
  var caps = [];
  [30.4, 36.1].forEach(function (z) {
    bot.add(em(caixa(4.4, 1.5, 4.4, MAT.preto), 18.5, yp + 0.75, z));
    var cap = em(cilindro(1.35, 0.9, MAT.metalFosco, 16), 18.5, yp + 1.5 + 0.45, z);
    bot.add(cap); caps.push(cap);
  });
  REFS.rstCap = caps[0]; REFS.bootCap = caps[1];
  g.add(bot);

  var leds = parte('esp32-leds', 'LEDs da placa');
  leds.add(em(caixa(5, 1.2, 5, MAT.ledBranco), 6.4, yp + 0.6, 44.1));
  REFS.espLed = em(caixa(2, 0.7, 1.4, MAT.led), 15.5, yp + 0.35, 44.1);
  leds.add(REFS.espLed);
  g.add(leds);

  g.add(em(caixa(6.5, 1.6, 3.5, MAT.preto), 10.5, yp + 0.8, 34.3));
  g.add(em(caixa(5, 0.9, 5, MAT.pretoBrilho), 19.8, yp + 0.45, 51.3));
  [[9.6, 28.6], [8.2, 39.3], [14.4, 49], [12.2, 53.2]].forEach(function (p) { g.add(em(caixa(3.2, 1, 1.6, MAT.bege), p[0], yp + 0.5, p[1])); });

  var usb = parte('esp32-usb', 'Entradas USB-C');
  [-6, 6].forEach(function (dx) {
    usb.add(em(caixa(8.94, 3.26, 7.3, MAT.metal), 12.7 + dx, yp + 1.63, 66.85));
    usb.add(em(caixa(7.2, 1.0, 0.3, MAT.pretoBrilho), 12.7 + dx, yp + 1.63, 66.85 + 3.72));
  });
  g.add(usb);
  return g;
}

/* ---------- Leitor NFC ---------- */
function texNfc() {
  var k = 20, W = 43 * k, H = 40 * k;
  return textura(W, H, function (g) {
    g.fillStyle = '#8d0f19'; g.fillRect(0, 0, W, H);
    g.strokeStyle = '#730a13'; g.lineWidth = 0.35 * k;
    [[6, 8, 18, 8, 18, 14], [16, 15, 16, 24, 28, 24], [24, 20, 34, 20, 34, 12], [10, 24, 10, 30, 20, 30], [26, 12, 32, 12], [14, 26, 24, 26]].forEach(function (p) {
      g.beginPath(); g.moveTo(p[0] * k, p[1] * k); for (var i = 2; i < p.length; i += 2) g.lineTo(p[i] * k, p[i + 1] * k); g.stroke();
    });
    var inset = 1.7, c = 5, pts = [[inset + c, inset], [43 - inset - c, inset], [43 - inset, inset + c], [43 - inset, 40 - inset - c], [43 - inset - c, 40 - inset], [inset + c, 40 - inset], [inset, 40 - inset - c], [inset, inset + c]];
    g.strokeStyle = '#f3f1ea'; g.lineWidth = 3.3 * k; g.lineJoin = 'miter';
    g.beginPath(); pts.forEach(function (p, i) { if (i) g.lineTo(p[0] * k, p[1] * k); else g.moveTo(p[0] * k, p[1] * k); }); g.closePath(); g.stroke();
    [[35.4, 7.4], [6.8, 28.8]].forEach(function (f) {
      g.fillStyle = '#d9dadc'; g.beginPath(); g.arc(f[0] * k, f[1] * k, 2.5 * k, 0, 7); g.fill();
      g.fillStyle = '#2a2a2a'; g.beginPath(); g.arc(f[0] * k, f[1] * k, 1.5 * k, 0, 7); g.fill();
    });
    function pad(x, z) { g.fillStyle = '#d6b25c'; g.beginPath(); g.arc(x * k, z * k, 0.95 * k, 0, 7); g.fill(); g.fillStyle = '#2a2a2a'; g.beginPath(); g.arc(x * k, z * k, 0.45 * k, 0, 7); g.fill(); }
    var esq = ['RSTO', 'IRQ', 'GND', 'VCC', 'SS', 'MOSI', 'MISO', 'SCK'], i;
    g.font = 'bold ' + (1.25 * k) + 'px sans-serif'; g.textBaseline = 'middle';
    for (i = 0; i < 8; i++) { pad(8.9, 5.8 + i * GRADE); g.textAlign = 'left'; g.fillStyle = '#f3f1ea'; g.fillText(esq[i], 10.9 * k, (5.8 + i * GRADE) * k); }
    var baixo = ['GND', 'VCC', 'SDA', 'SCL'];
    for (i = 0; i < 4; i++) {
      pad(14.5 + i * GRADE, 31);
      g.save(); g.translate((14.5 + i * GRADE) * k, 28.1 * k); g.rotate(-Math.PI / 2); g.textAlign = 'left'; g.fillStyle = '#f3f1ea'; g.fillText(baixo[i], 0, 0); g.restore();
    }
    for (i = 0; i < 9; i++) pad(31.6, 9 + i * 1.27);
    g.textAlign = 'center'; g.fillStyle = '#f3f1ea'; g.save(); g.translate(26.4 * k, 22.4 * k); g.rotate(-Math.PI / 2); g.fillText('PWR', 0, 0); g.restore();
    g.font = (0.95 * k) + 'px sans-serif'; g.textAlign = 'left';
    g.fillText('HSU 0 0', 32 * k, 27.6 * k); g.fillText('I2C 1 0', 32 * k, 29.1 * k); g.fillText('SPI 0 1', 32 * k, 30.6 * k);
  });
}

function montarNfc() {
  var g = parte('nfc', 'Leitor NFC');
  g.add(em(placa(43, 1.6, 40, new THREE.MeshStandardMaterial({ map: texNfc(), roughness: 0.4 }), new THREE.MeshStandardMaterial({ color: 0x8d0f19, roughness: 0.45 })), 21.5, 0.8, 20));
  var y = 1.6;
  var chip = parte('nfc-chip', 'Chip do leitor');
  chip.add(em(caixa(6.5, 0.9, 6.5, MAT.pretoBrilho), 22.3, y + 0.45, 13.7));
  g.add(chip);
  g.add(em(caixa(3.8, 1.4, 5.5, MAT.metal), 16.3, y + 0.7, 12.3));
  g.add(em(caixa(2.6, 1.2, 2.2, MAT.azulSmd), 22.5, y + 0.6, 6));
  g.add(em(caixa(2.6, 1.2, 2.2, MAT.azulSmd), 25.6, y + 0.6, 6));
  [[18, 18], [19.6, 18.4], [26, 17], [27.4, 17.4], [18.4, 9.6], [20.6, 9.2], [26.8, 9.4], [24, 21.6]].forEach(function (p) { g.add(em(caixa(1.6, 0.6, 0.8, MAT.bege), p[0], y + 0.3, p[1])); });
  var led = parte('nfc-led', 'LED de energia');
  led.add(em(caixa(1.6, 0.7, 0.9, MAT.led), 22.3, y + 0.35, 22.4));
  g.add(led);
  var chave = parte('nfc-chave', 'Chave seletora');
  chave.add(em(caixa(7, 3, 6, MAT.dip), 28.1, y + 1.5, 29.7));
  chave.add(em(caixa(1.6, 1.2, 2.4, MAT.branco), 26.6, y + 3.4, 29.7));
  chave.add(em(caixa(1.6, 1.2, 2.4, MAT.branco), 29.6, y + 3.4, 29.7));
  g.add(chave);
  return g;
}

/* ---------- Chip de segurança (plaquinha azul) ---------- */
function montarChipAzul() {
  var g = parte('chip-seguranca', 'Chip de segurança criptográfico');
  g.add(em(caixa(9, 1, 11, MAT.azulPlaca), 0, 0.5, 0));
  REFS.atecc = em(caixa(4.9, 1.5, 3.9, MAT.pretoBrilho), -0.3, 1.75, -0.6);
  g.add(REFS.atecc);
  for (var i = 0; i < 4; i++) { g.add(em(caixa(0.5, 0.3, 1, MAT.metal), -2.1 + i * 1.27, 1.2, 1.8)); g.add(em(caixa(0.5, 0.3, 1, MAT.metal), -2.1 + i * 1.27, 1.2, -3)); }
  g.add(em(cilindro(1.1, 1.1, MAT.metal, 16), 3, 0.55, 4));
  [[5.6, -3.2], [7.4, -0.6]].forEach(function (p) {
    var r = new THREE.Group();
    r.add(em(cilindro(1.1, 3.4, MAT.bege, 12), 0, 4.5, 0));
    r.add(em(cilindro(1.14, 0.45, MAT.fio.vermelho, 12), 0, 4.9, 0));
    r.add(em(cilindro(1.14, 0.45, MAT.fio.marrom, 12), 0, 4.1, 0));
    r.add(em(cilindro(0.18, 3, MAT.metal, 6), 0, 1.5, 0));
    r.position.set(p[0], -0.1, p[1]); g.add(r);
  });
  return g;
}

/* ---------- Botão de pressão preto (ao lado do chip azul) ---------- */
function montarBotao() {
  var g = parte('botao-pressao', 'Botão de pressão');
  g.add(em(caixa(6, 3.4, 6, MAT.preto), 0, 1.7, 0));
  REFS.botaoCap = em(cilindro(1.7, 1.2, MAT.pretoBrilho, 16), 0, 3.4 + 0.6, 0);
  g.add(REFS.botaoCap);
  return g;
}

/* ---------- Fios e conectores dupont ---------- */
function curva(pts) { return new THREE.CatmullRomCurve3(pts.map(function (p) { return new THREE.Vector3(p[0], p[1], p[2]); }), false, 'centripetal'); }
function fio(cor, pts, raio) {
  var c = curva(pts);
  var m = new THREE.Mesh(new THREE.TubeGeometry(c, Math.max(28, pts.length * 14), raio || 0.55, 6, false), MAT.fio[cor]);
  m.userData.curva = c;
  return m;
}
/* a e b = [x, z, yBase]; yBase é a altura da superfície onde o conector fica (padrão: topo da protoboard) */
function arco(a, b, lift, bx, bz) {
  var ya = (a[2] == null ? ALT : a[2]) + 8, yb = (b[2] == null ? ALT : b[2]) + 8, pts = [[a[0], ya, a[1]], [a[0], ya + 4, a[1]]];
  [0.08, 0.25, 0.5, 0.75, 0.92].forEach(function (t) {
    var s = Math.sin(Math.PI * t);
    pts.push([a[0] + (b[0] - a[0]) * t + bx * s, ya + (yb - ya) * t + lift * s, a[1] + (b[1] - a[1]) * t + bz * s]);
  });
  pts.push([b[0], yb + 4, b[1]], [b[0], yb, b[1]]);
  return pts;
}
function holeZ(n) { return Z_FUROS + n * GRADE; }
function espPinZ(k) { return 7.62 + k * GRADE; }

function montarFios() {
  var g = parte('fios', 'Fios de ligação');
  var yEspTopo = ESP_Y + 1.6;
  function cap(x, z, yb, n) { g.add(em(caixa(2.6, 8, (n || 1) * GRADE - 0.1, MAT.preto), x, (yb == null ? ALT : yb) + 4, z)); }
  function pontaBarra(x, z0, n, yb) { cap(x, z0 + (n - 1) * GRADE / 2, yb, n); }
  function pinoZ(z0, i) { return z0 + i * GRADE; }
  function naPlaca(i) { var b = [8.89, espPinZ(i)]; cap(b[0], b[1]); return b; }

  /* conector do leitor NFC: nas fotos, só quatro dos oito pinos têm fio */
  var nfcX = 3.81, nfcZ0 = holeZ(13);
  pontaBarra(nfcX, nfcZ0, 8);
  CURVAS.nfc = [];
  [['vermelho', 7, 20], ['branco', 8, 25], ['laranja', 9, 30]].forEach(function (d, i) {
    var f = fio(d[0], arco([nfcX, pinoZ(nfcZ0, i)], naPlaca(d[1]), d[2], -(12 + i * 3), 0));
    g.add(f); CURVAS.nfc.push(f.userData.curva);
  });

  /* dois conectores no módulo azul, um de cada lado */
  var azX = 6.35, azY = -9.5, azZ0 = holeZ(2);
  pontaBarra(azX, azZ0, 4);
  pontaBarra(azY, azZ0, 4);
  CURVAS.atecc = [];
  ['vermelho', 'verde', 'cinza', 'branco'].forEach(function (cor, i) {
    var f = fio(cor, arco([azX, pinoZ(azZ0, i)], naPlaca(2 + i), 26 + i * 3, -(16 + i * 2), 0));
    g.add(f); if (i >= 2) CURVAS.atecc.push(f.userData.curva);
  });
  g.add(fio('laranja', arco([azY, pinoZ(azZ0, 0)], naPlaca(12), 36, -8, 0)));
  /* marrom: arco alto até o conector do leitor; preto: laço alto sobre o próprio módulo */
  g.add(fio('marrom', arco([azY, pinoZ(azZ0, 1)], [nfcX, pinoZ(nfcZ0, 3)], 46, -14, 0)));
  g.add(fio('preto', arco([azY, pinoZ(azZ0, 2)], [azX, pinoZ(azZ0, 3)], 32, 0, -14)));

  /* conector de 4 pinos na ponta, ao lado da placa de controle, encaixado direto na protoboard */
  var pX = -11.43, pZ0 = holeZ(51);
  pontaBarra(pX, pZ0, 4);
  g.add(fio('amarelo', arco([pX, pinoZ(pZ0, 0)], [azY, pinoZ(azZ0, 3)], 34, -6, 0)));
  cap(-9.5, pinoZ(azZ0, 3));
  [['verde', 18, 14, 0, 38, 1], ['azul', 19, 14, 0, 40, 2], ['vermelho', 21, 16, -22, 46, 3]].forEach(function (d) {
    var b = [ESP_X + 11.43, espPinZ(d[1]), yEspTopo];
    cap(b[0], b[1], yEspTopo);
    g.add(fio(d[0], arco([pX, pinoZ(pZ0, d[5])], b, d[2], d[3], d[4])));
  });

  /* dois fios (preto e branco) que saem pela outra borda do leitor e vão em arco até a placa */
  var xn = NFC_X - 3, zn = -19, yn = ALT + 2.4;
  g.add(em(caixa(5.4, 2.8, 7, MAT.preto), xn, yn, zn));
  [['preto', -1.3, 0], ['branco', 1.3, 1]].forEach(function (d) {
    var b = naPlaca(d[2]), x0 = xn + d[1];
    var f = fio(d[0], [[x0, yn, zn + 3.5], [x0, yn + 7, zn + 10], [x0 - 2, ALT + 32 + d[2] * 3, zn + 14],
      [(x0 + b[0]) / 2, ALT + 36 + d[2] * 3, (zn + b[1]) / 2], [b[0] + 1, ALT + 24, b[1]], [b[0], ALT + 12, b[1]], [b[0], ALT + 8, b[1]]]);
    g.add(f); CURVAS.nfc.push(f.userData.curva);
  });
  return g;
}

/* ---------- Cabo USB-C até o computador (só aparece na animação) ----------
   Sai de uma entrada USB-C da placa, desce até a mesa e termina num plugue virado para -X, onde fica o notebook. */
export var PLUGUE_Z = 96;
function montarCabo(zFace) {
  var g = new THREE.Group();
  g.name = 'cabo-anim';
  var x = ESP_X + 6, y = ESP_Y + 1.6 + 1.63, mat = MAT.fio.preto;
  g.add(em(caixa(8.4, 2.6, 6, MAT.metal), x, y, zFace + 1.5));
  g.add(em(caixa(11, 6, 11, mat), x, y, zFace + 7.5));
  var c = curva([[-12, 13.2, PLUGUE_Z], [-6, 11, PLUGUE_Z + 0.5], [2, 3.2, PLUGUE_Z + 6], [18, 2.4, PLUGUE_Z + 9], [28, 6, PLUGUE_Z + 2], [x, y - 1, zFace + 20], [x, y, zFace + 13]]);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(c, 80, 1.8, 10, false), mat));
  g.add(em(caixa(14, 7, 12, mat), -17.5, 13.2, PLUGUE_Z));
  g.add(em(caixa(9, 4.2, 11.6, MAT.metal), -28.5, 13.2, PLUGUE_Z));
  CURVAS.usb = [c];
  g.visible = false;
  return g;
}

export function montarBancada() {
  materiais(); REFS = {}; CURVAS = {};
  var raiz = new THREE.Group();
  raiz.name = 'bancada';
  var partes = {};
  function reg(p) { partes[p.name] = p; raiz.add(p); p.traverse(function (o) { if (o.userData && o.userData.id && !partes[o.name]) partes[o.name] = o; }); return p; }

  reg(montarProtoboard());
  var esp = montarEsp(); esp.position.set(ESP_X - 12.7, ESP_Y, ESP_TOPO_Z); reg(esp);

  var nfc = montarNfc(), ang = THREE.MathUtils.degToRad(-2.5);
  nfc.scale.setScalar(NFC_ESC); nfc.rotation.y = ang;
  var centro = new THREE.Vector3(21.5 * NFC_ESC, 0, 20 * NFC_ESC).applyAxisAngle(new THREE.Vector3(0, 1, 0), ang);
  nfc.position.set(NFC_X - centro.x, ALT + 0.4, NFC_Z - centro.z); reg(nfc);

  var azul = montarChipAzul(); azul.position.set(-1.3, ALT + 0.8, -70.1); reg(azul);
  var botao = montarBotao(); botao.position.set(-8.89, ALT, holeZ(9)); reg(botao);

  reg(montarFios());
  /* caminho por cima da placa de controle, da entrada USB-C até os pinos do I2C e do leitor (esquerda), passando pelo módulo */
  var yTopo = ESP_Y + 1.6 + 0.6;
  CURVAS.esp = curva([[ESP_X + 6, yTopo, ESP_TOPO_Z + 66], [ESP_X + 4, yTopo + 1, espPinZ(14)], [ESP_X, ESP_Y + 1.6 + 3.6, 16.5], [ESP_X - 7, yTopo + 1, espPinZ(5)], [ESP_X - 11.43, yTopo, espPinZ(4)]]);
  CURVAS.espNfc = curva([[ESP_X - 11.43, yTopo, espPinZ(10)], [ESP_X - 6, yTopo + 1, espPinZ(8)], [ESP_X, ESP_Y + 1.6 + 3.6, 16.5]]);
  var cabo = montarCabo(ESP_TOPO_Z + 69 + 0.5);
  raiz.add(cabo);

  raiz.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return { grupo: raiz, partes: partes, cabo: cabo, raio: 118, refs: REFS, curvas: CURVAS };
}
