/* Aspen Core, lista de espera da Aspen Key. Cloudflare Pages Function: POST /api/lista
   Guarda o e-mail no KV (binding LISTA) e avisa a equipe por e-mail pelo Resend (secret RESEND_API_KEY).
   Só guarda: e-mail, data e versão da política aceita. Não guarda IP, nome nem cookies.
   O registro apaga sozinho 24 meses depois da inscrição (expirationTtl), como diz a Política de privacidade.
   Configuração: ver docs/lista-de-espera.md. */

var VERSAO_POLITICA = 1;
var VINTE_QUATRO_MESES = 60 * 60 * 24 * 730;
var AVISO_PARA_PADRAO = 'aspencorp0@gmail.com';
var LIMITE_POR_MINUTO = 30;

var MSG = {
  ok: 'Cadastro confirmado. Você está na lista de espera e será avisado por e-mail quando a Aspen Key for lançada.',
  email: 'Confira o e-mail: ele precisa ter o formato nome@exemplo.com.',
  aceites: 'Marque as quatro confirmações para entrar na lista.',
  origem: 'Não foi possível enviar daqui.',
  muitas: 'Muitas inscrições agora. Tente de novo em um minuto.',
  falha: 'Não deu para registrar agora. Tente de novo em instantes ou escreva para aspencorp0@gmail.com.'
};

function resposta(corpo, status) {
  return new Response(JSON.stringify(corpo), {
    status: status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
  });
}

function emailValido(e) {
  return typeof e === 'string' && e.length >= 6 && e.length <= 254 && /^[^\s@<>()"',;:\\]+@[^\s@<>()"',;:\\]+\.[^\s@<>()"',;:\\]{2,}$/.test(e);
}

async function lerCorpo(request) {
  var tipo = (request.headers.get('Content-Type') || '').toLowerCase();
  var bruto = await request.text();
  if (bruto.length > 4096) return null;
  if (tipo.indexOf('application/json') !== -1) {
    try { return JSON.parse(bruto); } catch (e) { return null; }
  }
  var p = new URLSearchParams(bruto), o = {};
  p.forEach(function (v, k) { o[k] = v; });
  return o;
}

function marcado(v) { return v === true || v === 'on' || v === 'true' || v === '1'; }

async function avisarEquipe(env, email, quando) {
  if (!env.RESEND_API_KEY) return false;
  var controle = new AbortController();
  var prazo = setTimeout(function () { controle.abort(); }, 8000);
  try {
    var r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      signal: controle.signal,
      headers: { 'Authorization': 'Bearer ' + env.RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Aspen Key <onboarding@resend.dev>',
        to: [env.AVISO_PARA || AVISO_PARA_PADRAO],
        subject: 'Nova inscrição na lista de espera da Aspen Key',
        text: 'Nova inscrição na lista de espera.\n\nE-mail: ' + email + '\nData: ' + quando + '\n\nEla já está guardada no KV da Cloudflare (chave e:' + email + ').'
      })
    });
    return r.ok;
  } catch (e) {
    return false;
  } finally {
    clearTimeout(prazo);
  }
}

/* freio simples contra enchente: conta inscrições por minuto, sem guardar nada de pessoa.
   O KV aceita só 1 gravação por segundo na mesma chave, então falhar ao gravar o contador NUNCA pode impedir a
   inscrição. A contagem em memória desta instância segura as rajadas em que o contador do KV não consegue subir. */
var freio = { minuto: 0, n: 0 };

async function passouDoLimite(kv) {
  var minuto = Math.floor(Date.now() / 60000);
  if (freio.minuto !== minuto) { freio.minuto = minuto; freio.n = 0; }
  var nesta = ++freio.n; /* soma antes de qualquer espera, para pedidos simultâneos não passarem juntos */
  var chave = 'rl:' + minuto, n = 0;
  try { n = parseInt((await kv.get(chave)) || '0', 10) || 0; } catch (e) {}
  if (n >= LIMITE_POR_MINUTO || nesta > LIMITE_POR_MINUTO) return true;
  try { await kv.put(chave, String(n + 1), { expirationTtl: 120 }); } catch (e) {}
  return false;
}

export async function onRequestPost(contexto) {
  var request = contexto.request, env = contexto.env;
  var querJson = (request.headers.get('Accept') || '').indexOf('application/json') !== -1;

  /* no caminho sem JavaScript o navegador espera uma página: volta para o site com o resultado */
  function terminar(corpo, status) {
    if (querJson) return resposta(corpo, status);
    return new Response(null, { status: 303, headers: { Location: '/?lista=' + (corpo.ok ? 'ok' : 'erro') + '#lista', 'Cache-Control': 'no-store' } });
  }

  /* só aceita envio vindo do próprio site */
  var origem = request.headers.get('Origin');
  if (origem) {
    var host = '';
    try { host = new URL(origem).host; } catch (e) {}
    if (host !== new URL(request.url).host) return terminar({ ok: false, erro: MSG.origem }, 403);
  }

  var d = await lerCorpo(request);
  if (!d) return terminar({ ok: false, erro: MSG.falha }, 400);

  /* campo-isca: pessoa não vê, robô preenche. Responde como se tivesse dado certo e não guarda nada */
  if (typeof d.site === 'string' && d.site.length > 0) return terminar({ ok: true, mensagem: MSG.ok }, 200);

  var email = typeof d.email === 'string' ? d.email.trim().toLowerCase() : '';
  if (!emailValido(email)) return terminar({ ok: false, campo: 'email', erro: MSG.email }, 400);
  if (!marcado(d.aviso) || !marcado(d.maior) || !marcado(d.transferencia) || !marcado(d.privacidade)) return terminar({ ok: false, campo: 'aceites', erro: MSG.aceites }, 400);

  var kv = env.LISTA;
  var quando = new Date().toISOString();
  var guardou = false;

  if (kv) {
    try {
      if (await passouDoLimite(kv)) return terminar({ ok: false, erro: MSG.muitas }, 429);

      var chave = 'e:' + email;
      var ja = await kv.get(chave);
      if (ja) return terminar({ ok: true, mensagem: MSG.ok }, 200); /* já estava na lista: mesma resposta, sem avisar de novo */
      await kv.put(chave, JSON.stringify({ em: quando, v: VERSAO_POLITICA }), { expirationTtl: VINTE_QUATRO_MESES, metadata: { d: quando } }); /* metadata: o painel /admin lê a data sem abrir cada registro */
      guardou = true;
    } catch (e) {
      console.error('lista: falha ao gravar no KV', e && e.message);
    }
  } else {
    console.error('lista: binding LISTA (KV) não configurado');
  }

  var avisou = await avisarEquipe(env, email, quando);
  if (!guardou && !avisou) return terminar({ ok: false, erro: MSG.falha }, 500);
  return terminar({ ok: true, mensagem: MSG.ok }, 200);
}

export async function onRequest() {
  return new Response('Método não permitido.', { status: 405, headers: { Allow: 'POST' } });
}
