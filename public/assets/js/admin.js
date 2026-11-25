/* Aspen Core, painel interno da lista de espera. Fala com POST /api/admin (functions/api/admin.js).
   O código pessoal fica só na memória da aba (sessionStorage) e vai no cabeçalho Authorization, nunca na URL. */
(function () {
  'use strict';
  var CHAVE = 'aspen-painel-codigo';
  var DIAS_GRAFICO = 14;
  var codigo = '', itens = [], nome = '', carregando = false, alvoApagar = '';

  function $(id) { return document.getElementById(id); }
  function el(tag, classe, texto) { var e = document.createElement(tag); if (classe) e.className = classe; if (texto != null) e.textContent = texto; return e; }
  function guardar(v) { try { if (v) sessionStorage.setItem(CHAVE, v); else sessionStorage.removeItem(CHAVE); } catch (e) {} }
  function lembrado() { try { return sessionStorage.getItem(CHAVE) || ''; } catch (e) { return ''; } }

  /* ---------- conversa com o servidor ---------- */
  function chamar(acao, extra) {
    var controle = new AbortController();
    var prazo = setTimeout(function () { controle.abort(); }, 15000);
    var corpo = { acao: acao };
    if (extra) Object.keys(extra).forEach(function (k) { corpo[k] = extra[k]; });
    return fetch('/api/admin', {
      method: 'POST', cache: 'no-store', signal: controle.signal,
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + codigo },
      body: JSON.stringify(corpo)
    }).then(function (r) {
      return r.json().catch(function () { return { ok: false, erro: 'Resposta inesperada do servidor.' }; }).then(function (j) { j.status = r.status; return j; });
    }).catch(function () {
      return { ok: false, status: 0, erro: 'Sem conexão com o servidor. Confira a internet e tente de novo.' };
    }).then(function (j) { clearTimeout(prazo); return j; });
  }

  /* ---------- datas ---------- */
  function ymd(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function dataHora(iso) {
    if (!iso) return 'sem data';
    var d = new Date(iso); if (isNaN(d)) return 'sem data';
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  function soData(iso) {
    if (!iso) return 'sem data';
    var d = new Date(iso); if (isNaN(d)) return 'sem data';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  /* ---------- telas ---------- */
  function mostrarEntrada(msg) {
    $('painel').hidden = true; $('topo-acoes').hidden = true; $('entrada').hidden = false;
    var e = $('erro-entrada'); e.hidden = !msg; e.textContent = msg || '';
    $('btn-entrar').disabled = false; $('btn-entrar').textContent = 'Entrar';
  }
  function mostrarPainel() {
    $('entrada').hidden = true; $('painel').hidden = false; $('topo-acoes').hidden = false;
    $('ola').textContent = 'Olá, ' + nome;
  }
  function aviso(msg) { $('status').textContent = msg || ''; }

  /* ---------- resumo e gráfico ---------- */
  function resumo() {
    var agora = new Date(), hoje = ymd(agora), contagem = {};
    var limite7 = new Date(agora); limite7.setDate(limite7.getDate() - 6); limite7.setHours(0, 0, 0, 0);
    var limite30 = new Date(agora); limite30.setDate(limite30.getDate() - 29); limite30.setHours(0, 0, 0, 0);
    var nHoje = 0, n7 = 0, n30 = 0;
    itens.forEach(function (i) {
      if (!i.em) return;
      var d = new Date(i.em); if (isNaN(d)) return;
      contagem[ymd(d)] = (contagem[ymd(d)] || 0) + 1;
      if (ymd(d) === hoje) nHoje++;
      if (d >= limite7) n7++;
      if (d >= limite30) n30++;
    });
    $('n-total').textContent = String(itens.length);
    $('n-hoje').textContent = String(nHoje);
    $('n-sete').textContent = String(n7);
    $('n-trinta').textContent = String(n30);

    var graf = $('grafico'), dias = [], max = 0;
    graf.textContent = '';
    for (var k = DIAS_GRAFICO - 1; k >= 0; k--) {
      var d = new Date(agora); d.setDate(d.getDate() - k);
      var n = contagem[ymd(d)] || 0; if (n > max) max = n;
      dias.push({ d: d, n: n, hoje: k === 0 });
    }
    var resumoTxt = [];
    dias.forEach(function (x) {
      var b = el('div', 'barra' + (x.hoje ? ' barra--hoje' : '') + (x.n === 0 ? ' barra--zero' : ''));
      b.appendChild(el('span', 'barra__valor', x.n ? String(x.n) : ''));
      var h = el('span', 'barra__haste');
      h.style.height = (max ? Math.max(2, Math.round(x.n / max * 100 * 0.78)) : 2) + '%';
      b.appendChild(h);
      var rot = ('0' + x.d.getDate()).slice(-2) + '/' + ('0' + (x.d.getMonth() + 1)).slice(-2);
      b.appendChild(el('span', 'barra__dia', rot));
      b.title = rot + ': ' + x.n + (x.n === 1 ? ' inscrição' : ' inscrições');
      graf.appendChild(b);
      resumoTxt.push(rot + ' ' + x.n);
    });
    graf.setAttribute('aria-label', 'Inscrições por dia nos últimos 14 dias: ' + resumoTxt.join(', '));
  }

  /* ---------- tabela ---------- */
  function filtrados() {
    var q = $('busca').value.trim().toLowerCase();
    return q ? itens.filter(function (i) { return i.email.indexOf(q) !== -1; }) : itens;
  }
  function desenharTabela() {
    var lista = filtrados(), corpo = $('linhas'), agora = Date.now();
    corpo.textContent = '';
    lista.forEach(function (i) {
      var tr = el('tr'), td = el('td', 'email', i.email);
      if (i.em && agora - new Date(i.em).getTime() < 24 * 3600 * 1000) td.appendChild(el('span', 'novo', 'novo'));
      tr.appendChild(td);
      var a = el('td', 'data', dataHora(i.em)); a.setAttribute('data-rotulo', 'Inscrito em'); tr.appendChild(a);
      var s = el('td', 'data', soData(i.expira)); s.setAttribute('data-rotulo', 'Sai da lista em'); tr.appendChild(s);
      var ac = el('td', 'acao'), b = el('button', 'apagar', 'Apagar'); b.type = 'button';
      b.setAttribute('aria-label', 'Apagar ' + i.email);
      b.addEventListener('click', function () { pedirApagar(i.email); });
      ac.appendChild(b); tr.appendChild(ac);
      corpo.appendChild(tr);
    });
    var busca = $('busca').value.trim();
    $('contagem').textContent = busca ? lista.length + ' de ' + itens.length : String(itens.length);
    var vazio = $('vazio');
    vazio.hidden = lista.length > 0;
    if (!lista.length) vazio.textContent = itens.length ? 'Nenhum e-mail encontrado para essa busca.' : 'Ainda não há inscrições. Quando alguém entrar na lista pelo site, o e-mail aparece aqui.';
    $('btn-copiar').disabled = !lista.length; $('btn-csv').disabled = !lista.length;
  }
  function desenhar() { resumo(); desenharTabela(); $('aviso-cortado').hidden = !cortado; }
  var cortado = false;

  /* ---------- carregar ---------- */
  function carregar(silencioso) {
    if (carregando) return Promise.resolve(false);
    carregando = true;
    $('btn-atualizar').disabled = true;
    if (!silencioso) aviso('Carregando a lista...');
    return chamar('listar').then(function (r) {
      carregando = false; $('btn-atualizar').disabled = false;
      if (r.ok) {
        itens = r.itens || []; nome = r.nome || ''; cortado = !!r.cortado;
        mostrarPainel(); desenhar(); aviso('');
        $('atualizado').textContent = 'Atualizado às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        return true;
      }
      if (r.status === 401) { codigo = ''; guardar(''); mostrarEntrada('Código incorreto. Confira se copiou o código inteiro.'); return false; }
      if ($('painel').hidden) { codigo = ''; guardar(''); mostrarEntrada(r.erro || 'Não foi possível entrar agora.'); }
      else aviso(r.erro || 'Não foi possível atualizar agora.');
      return false;
    });
  }

  /* ---------- ações ---------- */
  function copiar(texto) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(texto);
    return new Promise(function (ok, falha) {
      var t = document.createElement('textarea'); t.value = texto; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select();
      var deu = false; try { deu = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(t); deu ? ok() : falha();
    });
  }
  function celulaCsv(v) {
    var s = String(v == null ? '' : v);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; /* evita que a planilha trate o texto como fórmula */
    return '"' + s.replace(/"/g, '""') + '"';
  }
  function baixarCsv(lista) {
    var linhas = ['e-mail,inscrito_em,sai_da_lista_em'];
    lista.forEach(function (i) { linhas.push([celulaCsv(i.email), celulaCsv(i.em || ''), celulaCsv(i.expira || '')].join(',')); });
    var blob = new Blob(['﻿' + linhas.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'lista-de-espera-' + ymd(new Date()) + '.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }
  function pedirApagar(email) {
    alvoApagar = email; $('confirma-email').textContent = email;
    var d = $('confirma');
    if (d.showModal) d.showModal(); else if (window.confirm('Apagar ' + email + '? Esta ação não pode ser desfeita.')) apagar();
  }
  function apagar() {
    var email = alvoApagar; if (!email) return;
    $('confirma-apagar').disabled = true;
    chamar('apagar', { email: email }).then(function (r) {
      $('confirma-apagar').disabled = false;
      var d = $('confirma'); if (d.open) d.close();
      if (r.ok) {
        itens = itens.filter(function (i) { return i.email !== email; });
        desenhar(); aviso('E-mail apagado: ' + email);
      } else aviso(r.erro || 'Não foi possível apagar agora.');
      alvoApagar = '';
    });
  }

  /* ---------- ligações ---------- */
  $('form-entrada').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = $('codigo').value.trim();
    if (!v) { var er = $('erro-entrada'); er.hidden = false; er.textContent = 'Digite o seu código pessoal.'; $('codigo').focus(); return; }
    codigo = v; $('btn-entrar').disabled = true; $('btn-entrar').textContent = 'Entrando...';
    carregar(false).then(function (entrou) { if (entrou) { guardar(codigo); $('codigo').value = ''; } });
  });
  $('btn-atualizar').addEventListener('click', function () { carregar(false); });
  $('btn-sair').addEventListener('click', function () { codigo = ''; guardar(''); itens = []; mostrarEntrada(''); $('codigo').focus(); });
  $('busca').addEventListener('input', desenharTabela);
  $('btn-copiar').addEventListener('click', function () {
    var lista = filtrados();
    copiar(lista.map(function (i) { return i.email; }).join('\n')).then(
      function () { aviso(lista.length + (lista.length === 1 ? ' e-mail copiado.' : ' e-mails copiados.')); },
      function () { aviso('Não foi possível copiar. Use "Baixar CSV".'); });
  });
  $('btn-csv').addEventListener('click', function () { var l = filtrados(); baixarCsv(l); aviso('Planilha gerada com ' + l.length + (l.length === 1 ? ' e-mail.' : ' e-mails.')); });
  $('confirma-apagar').addEventListener('click', apagar);
  $('confirma').addEventListener('close', function () { if (!$('confirma-apagar').disabled) alvoApagar = ''; });

  var antigo = lembrado();
  if (antigo) { codigo = antigo; carregar(false); } else { mostrarEntrada(''); }
})();
