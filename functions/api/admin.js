/* Aspen Core, painel da lista de espera. Cloudflare Pages Function: POST /api/admin
   Quem pode ver a lista: cada pessoa da equipe tem um código pessoal. Os códigos ficam no secret ADMIN_CODIGOS (JSON,
   nome -> código), gerado por ferramentas/gerar_codigos.mjs. O código vai no cabeçalho Authorization, nunca na URL.
   Ações (JSON no corpo): "listar" devolve as inscrições do KV (binding LISTA); "apagar" remove um e-mail (pedido de exclusão, LGPD).
   O que fica guardado de cada apagamento é só quem apagou e quando, sem o e-mail.
   Configuração: ver docs/lista-de-espera.md. */

var VINTE_QUATRO_MESES = 60 * 60 * 24 * 730;
var TAMANHO_MINIMO_CODIGO = 12;
var ERROS_POR_MINUTO = 20;
var PAGINAS_MAXIMAS = 5; /* 5 x 1000 inscrições; passa disso o painel avisa que cortou */
var LEITURAS_EXTRAS = 30; /* inscrições antigas sem data no índice exigem uma leitura cada; o limite protege o plano gratuito */

function resposta(corpo, status) {
  return new Response(JSON.stringify(corpo), {
    status: status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' }
  });
}

/* compara sem parar no primeiro byte diferente */
function iguais(a, b) {
  var x = String(a), y = String(b), r = x.length ^ y.length;
  for (var i = 0; i < Math.max(x.length, y.length); i++) r |= (x.charCodeAt(i) || 0) ^ (y.charCodeAt(i) || 0);
  return r === 0;
}

function lerCodigos(env) {
  var bruto = env.ADMIN_CODIGOS, lista = [];
  if (!bruto) return lista;
  try {
    var o = JSON.parse(bruto);
    Object.keys(o).forEach(function (nome) {
      if (typeof o[nome] === 'string' && o[nome].length >= TAMANHO_MINIMO_CODIGO) lista.push({ nome: nome, codigo: o[nome] });
    });
  } catch (e) { console.error('admin: ADMIN_CODIGOS não é um JSON válido'); }
  return lista;
}

function quemE(request, codigos) {
  var cab = request.headers.get('Authorization') || '';
  var m = /^Bearer\s+(.+)$/i.exec(cab);
  if (!m) return null;
  var dado = m[1].trim(), achou = null;
  codigos.forEach(function (c) { if (iguais(c.codigo, dado)) achou = c.nome; }); /* percorre todos, sem atalho */
  return achou;
}

function emailValido(e) {
  return typeof e === 'string' && e.length >= 6 && e.length <= 254 && /^[^\s@<>()"',;:\\]+@[^\s@<>()"',;:\\]+\.[^\s@<>()"',;:\\]{2,}$/.test(e);
}

async function listar(kv) {
  var itens = [], cursor, paginas = 0, extras = 0, cortado = false;
  do {
    var p = await kv.list({ prefix: 'e:', cursor: cursor, limit: 1000 });
    for (var i = 0; i < p.keys.length; i++) {
      var k = p.keys[i], em = k.metadata && k.metadata.d ? k.metadata.d : null;
      if (!em && extras < LEITURAS_EXTRAS) {
        extras++;
        try { var v = JSON.parse((await kv.get(k.name)) || '{}'); em = v.em || null; } catch (e) {}
      }
      itens.push({ email: k.name.slice(2), em: em, expira: k.expiration ? new Date(k.expiration * 1000).toISOString() : null });
    }
    cursor = p.list_complete ? null : p.cursor;
    paginas++;
    if (cursor && paginas >= PAGINAS_MAXIMAS) { cortado = true; break; }
  } while (cursor);
  itens.sort(function (a, b) { return String(b.em || '').localeCompare(String(a.em || '')); });
  return { itens: itens, cortado: cortado };
}

export async function onRequestPost(contexto) {
  var request = contexto.request, env = contexto.env, kv = env.LISTA;

  var origem = request.headers.get('Origin');
  if (origem) {
    var host = '';
    try { host = new URL(origem).host; } catch (e) {}
    if (host !== new URL(request.url).host) return resposta({ ok: false, erro: 'Origem não permitida.' }, 403);
  }
  if (!kv) return resposta({ ok: false, erro: 'O armazenamento da lista (KV) não está ligado a este site.' }, 503);

  var codigos = lerCodigos(env);
  if (!codigos.length) return resposta({ ok: false, erro: 'O acesso ainda não foi configurado (secret ADMIN_CODIGOS).' }, 503);

  /* freio contra tentativa de adivinhar código: conta só as tentativas erradas, por minuto, no site todo */
  var minuto = 'rlx:' + Math.floor(Date.now() / 60000);
  var erros = 0;
  try { erros = parseInt((await kv.get(minuto)) || '0', 10); } catch (e) {}
  if (erros >= ERROS_POR_MINUTO) return resposta({ ok: false, erro: 'Muitas tentativas. Aguarde um minuto.' }, 429);

  var nome = quemE(request, codigos);
  if (!nome) {
    try { await kv.put(minuto, String(erros + 1), { expirationTtl: 120 }); } catch (e) {}
    return resposta({ ok: false, erro: 'Código incorreto.' }, 401);
  }

  var corpo = null;
  try { corpo = JSON.parse(await request.text()); } catch (e) {}
  var acao = corpo && corpo.acao;

  if (acao === 'listar') {
    try {
      var r = await listar(kv);
      return resposta({ ok: true, nome: nome, total: r.itens.length, cortado: r.cortado, itens: r.itens }, 200);
    } catch (e) {
      console.error('admin: falha ao listar', e && e.message);
      return resposta({ ok: false, erro: 'Não foi possível ler a lista agora.' }, 500);
    }
  }

  if (acao === 'apagar') {
    var email = typeof corpo.email === 'string' ? corpo.email.trim().toLowerCase() : '';
    if (!emailValido(email)) return resposta({ ok: false, erro: 'E-mail inválido.' }, 400);
    try {
      await kv.delete('e:' + email);
      await kv.put('log:' + Date.now(), JSON.stringify({ por: nome, acao: 'apagar', em: new Date().toISOString() }), { expirationTtl: VINTE_QUATRO_MESES });
      return resposta({ ok: true }, 200);
    } catch (e) {
      console.error('admin: falha ao apagar', e && e.message);
      return resposta({ ok: false, erro: 'Não foi possível apagar agora.' }, 500);
    }
  }

  return resposta({ ok: false, erro: 'Ação desconhecida.' }, 400);
}

export async function onRequest() {
  return new Response('Método não permitido.', { status: 405, headers: { Allow: 'POST', 'Cache-Control': 'no-store' } });
}
