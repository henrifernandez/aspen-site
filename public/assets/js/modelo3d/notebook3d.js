/* Aspen Core, notebook genérico (sem marca) para a animação "Como funciona". Montado por código.
   Fica à esquerda da bancada (-X), com a lateral direita voltada para o plugue do cabo e a tela virada para +Z.
   A tela é uma textura de canvas desenhada por animacao.js. Unidade: mm. */
import * as THREE from '../vendor/three-0.170.0.module.min.js';

export var NB = { XD: -26, LARG: 330, PROF: 225, ESP: 16, Y0: 2.5, TAMPA: 215, ANG: 105, TELA_L: 300, TELA_A: 187.5, W: 1280, H: 800 };

function textura(w, h, desenhar) {
  var c = document.createElement('canvas'); c.width = w; c.height = h;
  desenhar(c.getContext('2d'), w, h);
  var t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

function texTeclado() {
  return textura(1320, 900, function (g, W, H) {
    g.fillStyle = '#a6abb0'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#1a1c20'; g.fillRect(70, 50, W - 140, 520);
    var linhas = [14, 14, 13, 13, 12, 8], y = 66, i, j;
    for (i = 0; i < linhas.length; i++) {
      var n = linhas[i], larg = (W - 160) / n, x = 80;
      for (j = 0; j < n; j++) {
        var kw = i === 5 && j === 3 ? larg * 3.4 : larg;
        g.fillStyle = '#2d3036'; g.fillRect(x + 3, y, kw - 6, 74);
        g.fillStyle = '#3a3e45'; g.fillRect(x + 3, y, kw - 6, 8);
        x += kw; if (x > W - 90) break;
      }
      y += 82;
    }
    g.fillStyle = '#9ba0a5'; g.fillRect(470, 640, 380, 220);
    g.strokeStyle = '#80858a'; g.lineWidth = 4; g.strokeRect(470, 640, 380, 220);
  });
}

export function montarNotebook(portaZ, portaY) {
  var g = new THREE.Group(); g.name = 'notebook';
  var alum = new THREE.MeshStandardMaterial({ color: 0xa4a9ae, metalness: 0.8, roughness: 0.38 });
  var preto = new THREE.MeshStandardMaterial({ color: 0x14161a, roughness: 0.55 });
  var y0 = portaY - NB.ESP / 2, zFrente = portaZ + 45, yTopoBase = y0 + NB.ESP;

  /* base: a imagem do teclado vai só na face de cima (topo da imagem = fundo do notebook) */
  var topo = new THREE.MeshStandardMaterial({ map: texTeclado(), roughness: 0.5 });
  var base = new THREE.Mesh(new THREE.BoxGeometry(NB.LARG, NB.ESP, NB.PROF), [alum, alum, topo, alum, alum, alum]);
  base.position.set(NB.XD - NB.LARG / 2, y0 + NB.ESP / 2, zFrente - NB.PROF / 2);
  g.add(base);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) {
    var pe = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, y0, 12), preto);
    pe.position.set(base.position.x + p[0] * (NB.LARG / 2 - 25), y0 / 2, base.position.z + p[1] * (NB.PROF / 2 - 25));
    g.add(pe);
  });

  /* porta USB na lateral direita, na altura do plugue */
  var porta = new THREE.Mesh(new THREE.PlaneGeometry(13.6, 5.8), new THREE.MeshBasicMaterial({ color: 0x050505 }));
  porta.rotation.y = Math.PI / 2; porta.position.set(NB.XD + 0.06, portaY, portaZ);
  g.add(porta);

  /* tampa articulada no fundo da base, inclinada 105 graus */
  var pivo = new THREE.Group();
  pivo.position.set(NB.XD - NB.LARG / 2, yTopoBase, zFrente - NB.PROF);
  pivo.rotation.x = -THREE.MathUtils.degToRad(NB.ANG);
  var tampa = new THREE.Mesh(new THREE.BoxGeometry(NB.LARG, 5, NB.TAMPA), alum);
  tampa.position.set(0, 0, NB.TAMPA / 2);
  pivo.add(tampa);
  var moldura = new THREE.Mesh(new THREE.PlaneGeometry(NB.LARG - 10, NB.TAMPA - 10), preto);
  moldura.rotation.x = Math.PI / 2; moldura.position.set(0, -2.52, NB.TAMPA / 2);
  pivo.add(moldura);

  var cv = document.createElement('canvas'); cv.width = NB.W; cv.height = NB.H;
  var tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  var tela = new THREE.Mesh(new THREE.PlaneGeometry(NB.TELA_L, NB.TELA_A), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  tela.rotation.x = Math.PI / 2; tela.position.set(0, -2.56, NB.TAMPA / 2 + 1);
  pivo.add(tela);
  g.add(pivo);

  g.traverse(function (o) { if (o.isMesh) { o.castShadow = o !== tela && o !== moldura && o !== porta; o.receiveShadow = true; } });
  /* centro da tela no mundo, para a câmera */
  g.updateMatrixWorld(true);
  var centroTela = tela.getWorldPosition(new THREE.Vector3());
  return { grupo: g, canvas: cv, ctx: cv.getContext('2d'), tex: tex, centroTela: centroTela, portaZ: portaZ };
}
