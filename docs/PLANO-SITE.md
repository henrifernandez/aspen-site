# Plano do site da Aspen Core (versão 1, 20/10/2026)

Plano para o Sonnet construir, sem perguntas, o site que será o destino do link da bio do @aspencore_. Este documento decide tudo o que precisa ser decidido. Onde algo depende do Henrique, o item está marcado com PENDENTE e listado na seção 11.

Arquivos deste plano

- `PLANO-SITE.md` (este arquivo, manda em caso de dúvida)
- `copy.json` (todo o texto do site, com os fatos que sustentam cada frase; a seção 4 deste plano foi gerada a partir dele e é idêntica)

Ordem de autoridade quando algo conflitar: este plano, depois `/home/claude/aspen-social-agent/brand/BRAND.md`, depois `agent/PLAYBOOK.md`, depois as habilidades de design.

---

## 0. Como este plano foi feito

Habilidades carregadas e usadas nas decisões (todas carregaram)

| Habilidade | Onde pesou |
| --- | --- |
| frontend-design | Direção com um único ponto de ousadia (a chave no topo com a luz do LED), revisão contra os "padrões de página gerada", um momento de movimento só, tipografia como elemento ativo |
| anthropic-skills:direcao-estetica-ui | Sistema de tokens compacto antes do código, revisão do sistema contra o briefing, voz ativa e terminologia fixa |
| anthropic-skills:biblioteca-de-direcoes-visuais | Nenhum arquétipo cabe inteiro. O mais próximo é "Corporativo confiável" (movimento mínimo e funcional, hierarquia previsível), mas a tipografia dele contradiz a marca. Pela regra da própria biblioteca, a direção foi desenhada do zero com a direcao-estetica-ui, sem misturar arquétipos |
| design:ux-copy | Botões com verbo e resultado ("Entrar na lista de espera"), mensagens de erro com o que houve e como resolver, mesmo nome para a mesma coisa em todo o site |
| design:accessibility-review | Base do checklist da seção 10, ampliado para WCAG 2.2 AA |

Conflitos entre habilidades e marca, e como foram resolvidos

- A direcao-estetica-ui e a frontend-design pedem para não usar caixa alta como padrão e para não destacar uma palavra do título. A marca exige títulos em caixa alta e, no modo escuro, uma palavra-chave no acento. A marca vence. Para reduzir o efeito de "modelo pronto", a caixa alta fica só em h1, h2, nomes dos passos e títulos das listas; rótulos, botões, legendas e corpo ficam em caixa normal; o destaque de palavra aparece só duas vezes no site inteiro (h1 e h2 do problema).
- A frontend-design aponta fundo creme e fundo quase preto com um acento como padrões de página gerada. As duas paletas são da marca e ficam. A diferença vem do assunto: a chave real fotografada como objeto, a ficha técnica com medidas e a lista "Hoje ele faz / Ainda não faz".
- A frontend-design desaconselha fonte mono em rótulos pequenos. Aqui a mono é a fonte inteira do modo escuro, por regra da marca, e não aparece no modo claro.

Pesquisa (fontes na seção 14)

- Tally: o código de incorporação usa um iframe com `data-tally-src` e o script `https://tally.so/widgets/embed.js`, chamado com `Tally.loadEmbeds()`. O script repassa sozinho o caminho e os parâmetros da página para o formulário, que os grava em campos ocultos com o mesmo nome. Formulários perto da tela (500 px) carregam na hora, os outros quando entram na tela. O parâmetro `dynamicHeight=1` ajusta a altura do iframe ao conteúdo. Eventos `Tally.FormLoaded`, `Tally.FormPageView` e `Tally.FormSubmitted` chegam por `postMessage`. A documentação não fala em conferir a origem da mensagem; este plano confere mesmo assim. Comportamento sem JavaScript: não confirmado na documentação, por isso o plano prevê link de reserva.
- Tally diz ser feito e hospedado na União Europeia. Se o iframe do formulário grava cookies no navegador do visitante: não confirmado (a política de cookies do Tally fala só do site deles). O QA verifica isso quando o formulário real existir.
- Cloudflare Pages: serve `/privacidade` a partir de `privacidade.html` e redireciona `.html` para o endereço sem extensão; usa `404.html` como página de erro (sem esse arquivo, trata o site como aplicação de página única e devolve a página inicial para qualquer endereço); adiciona `X-Robots-Tag: noindex` nos endereços de pré-visualização; aceita `_headers` e `_redirects` na pasta publicada. Se o painel exige comando de build: não confirmado (o plano dá a alternativa `exit 0`).
- Página de pré-lançamento: um único botão principal, pedir só o e-mail (ou e-mail e mais um campo), dizer o que a pessoa recebe ao se inscrever, mostrar o aparelho como imagem principal, e assumir os limites do produto perto do formulário, porque limite dito com clareza gera mais confiança do que promessa polida. Dois conselhos das fontes foram descartados de propósito por serem proibidos aqui: contador de inscritos e data de lançamento "certa".
- LGPD: agente de tratamento de pequeno porte pode ser dispensado de indicar encarregado, mas precisa manter um canal de comunicação (fonte secundária; o artigo exato da Resolução CD/ANPD nº 2/2022 não foi confirmado nesta pesquisa).
- Cloudflare Web Analytics: a página oficial diz que a ferramenta "não coleta nem usa dados pessoais dos visitantes" e que não registra parâmetros da URL. Se usa cookies ou armazenamento local: não confirmado nesta pesquisa. Fica desligado.

Dois documentos anteriores foram considerados

- `/mnt/user-data/outputs/aspen/bio-destaques-tally-2026-10-20.md` propunha um formulário com nome, WhatsApp e "Você é". Este plano substitui aquela tabela: fica só e-mail (obrigatório), nome (opcional), consentimento e campos ocultos. Motivo: menos dados (LGPD) e menos atrito. A bio prevista ("aviso de lançamento no link abaixo") combina com o texto do site.
- O mesmo documento registra que a página antiga `aspencore.onrender.com` tem frases proibidas ("Mais de 1.200 usuários protegidos", "tempo real", "sem falsos positivos"). O link da bio deve ir para o site novo, nunca para a página antiga (pendência P22).

---

## 1. Resumo de decisões

### 1.1 Stack e hospedagem

| Decisão | Escolha | Por quê |
| --- | --- | --- |
| Tecnologia | HTML, CSS e JavaScript simples, sem framework e sem etapa de build | Uma página e meia não justifica framework. Zero build deixa o Henrique editar texto direto no HTML e publicar sem configurar nada |
| CSS | Um arquivo `site.css` com tokens em variáveis CSS | Fácil de achar e trocar cor ou espaço num lugar só |
| JavaScript | Um arquivo `site.js` com `defer`, cerca de 5 KB, sem dependências | O site funciona sem ele; o JS só liga o formulário, a revelação dos passos e a classe `js` |
| Hospedagem | Cloudflare Pages ligado a um repositório GitHub, pasta publicada `public/`, sem comando de build | Grátis, HTTPS automático, publica a cada commit, aceita `_headers` e `_redirects` |
| Formulário | Tally incorporado (terceiro) | Sem servidor nem banco. Dados ficam no Tally, na União Europeia |
| Fontes | Arquivos WOFF2 locais, recortados para o alfabeto latino | Nada de CDN de fontes; menos peso |
| Imagens | WebP com transparência, várias larguras com `srcset`, `width` e `height` sempre | Peso baixo e nenhum salto de layout |
| Analytics | Nenhum nesta versão. Opção desligada documentada (Cloudflare Web Analytics) para o Henrique decidir (P18) | Sem cookies, sem banner de consentimento |
| Ferramentas de apoio | Scripts Python rodados uma vez pelo Sonnet (fontes, imagens, imagem de compartilhamento, favicons, QA). A saída deles vai para `public/` e é versionada | O site publicado não depende de build; os scripts só regeneram arquivos se algo mudar |

O que é estático e o que é de terceiro

- Estático e nosso: todo HTML, CSS, JS, fontes, imagens, vídeo (quando chegar), `robots.txt`, `sitemap.xml`, `_headers`, `_redirects`, manifest e ícones.
- Terceiro: só o Tally (`https://tally.so/widgets/embed.js` e o iframe `https://tally.so/embed/ID`). Carrega só quando a seção da lista se aproxima da tela e só se o código do formulário já existir.
- Link externo simples, sem carregar nada: Instagram.

### 1.2 Onde o Sonnet constrói

Pasta de trabalho: `/mnt/user-data/outputs/aspen/aspencore-site/` (este é o futuro repositório). Fontes da marca: `/home/claude/aspen-social-agent/brand/`. Não copiar nada de `/home/claude/aspen-social-agent/site/` nem de `site-src/` (são outro projeto).

### 1.3 Árvore de arquivos

```
aspencore-site/
  README.md                      como ver local, como publicar, como trocar pendentes (curto, aponta para este plano)
  .gitignore                     qa/ e __pycache__/
  public/                        TUDO que vai ao ar (diretório de saída no Cloudflare Pages)
    index.html
    privacidade.html
    404.html
    robots.txt
    sitemap.xml
    _headers
    _redirects
    site.webmanifest
    favicon.ico
    apple-touch-icon.png
    icon-192.png
    icon-512.png
    og-image.jpg
    assets/
      css/site.css
      js/site.js
      fonts/
        poppins-400.woff2  poppins-600.woff2  poppins-700.woff2
        spacemono-400.woff2  spacemono-700.woff2
        OFL-Poppins.txt  OFL-SpaceMono.txt
      img/                       lista exata na seção 7
      video/.gitkeep             vídeo do protótipo entra aqui (P04)
  origem/
    og.html                      modelo para gerar og-image.jpg
  ferramentas/
    gerar_fontes.sh
    exportar_imagens.py
    gerar_favicons.py
    gerar_og.py
    servidor_local.py            serve public/ imitando o Cloudflare (rotas sem .html, 404.html, _headers)
    checar_texto.py              travessão e expressões proibidas
    checar_pendentes.py          lista PENDENTE e seudominio; com --publicar falha se sobrar algum
    qa_playwright.py             capturas, links, peso, contraste, sobreposição, teclado, LCP
  qa/                            saída do QA (capturas e relatório), fora do repositório
```

Caminhos dentro do HTML são relativos (`assets/css/site.css`, `privacidade.html`), para `index.html` abrir direto do disco. Exceção: `404.html` usa caminhos absolutos (`/assets/...`), porque o Cloudflare a serve em qualquer endereço. Observação honesta: abrindo `index.html` pelo `file://`, o Chrome pode bloquear as fontes locais por regra de origem e mostrar a fonte reserva; para ver igual ao publicado, usar `python3 ferramentas/servidor_local.py` e abrir `http://localhost:8765`.

### 1.4 Direção visual "Ficha técnica honesta"

Paleta (da marca, sem cor nova além de tons de mistura entre cores dela)

| Nome | Hex | Papel |
| --- | --- | --- |
| Creme | #F6F6EA | Fundo do modo claro |
| Petróleo | #255B62 | Blocos de título, botões, rodapé |
| Creme-amarelo | #FBEFC9 | Texto sobre petróleo, fundo do aviso de protótipo no modo claro |
| Texto | #3A3A2E | Texto do modo claro |
| Noite | #0A2935 para #061A23 | Fundo do modo escuro, em degradê vertical |
| Creme noturno | #EFE8D6 | Texto do modo escuro |
| Acento | #3C94A4 | Uma palavra por título no modo escuro (só texto grande) |
| Dourado | #D2B17A | Linha do aviso e anel de foco no modo escuro |
| Azul-claro | #A9CBDD | Fundo da etiqueta "Ilustração de como será" (cor da visão) |
| Oliva | #A7A98A | Só como base de tons de mistura (círculo atrás das ilustrações, fundo dos detalhes) |
| LED | #94F7FE | Medido nos renders. Só no brilho do LED da chave, nunca em interface |

Tipografia: modo claro em Poppins (400, 600, 700); modo escuro em Space Mono (400, 700), substituta provisória da Disket Mono. Uma fonte por seção, nunca as duas na mesma seção.

Conceito de layout: página única, alinhada à esquerda, em duas "luzes". Começa à noite (topo e problema, modo escuro, a chave em destaque como um objeto numa vitrine) e vira o dia uma única vez, na fronteira entre o problema e a ideia (modo claro, explicação e ficha). A virada é a mesma "virada proposital" que a marca permite nos carrosséis: escuro para o problema, claro para a solução. O rodapé é um bloco petróleo.

Princípios

1. A chave é o único ponto de ousadia. Grande no topo, inclinada, com a faixa de LED acendendo uma vez. Todo o resto é quieto.
2. Honestidade como peça de design. A lista "Hoje ele faz / Ainda não faz" tem o mesmo peso visual da ficha técnica e fica ao lado do vídeo. Visão sempre com a etiqueta azul-clara; protótipo sempre com o aviso.
3. Estrutura que informa. Números só nos três passos (que são uma sequência de verdade). Bolinha cheia para "faz", anel vazio para "ainda não faz", sempre com texto junto. Nenhum rótulo decorativo acima dos títulos.

Revisão do plano contra o briefing (o que mudei e por quê)

- Primeira ideia: topo no modo claro, com a chave sobre o creme. Mudei para escuro porque a marca reserva o escuro para a chave em destaque, e a foto de referência já é escura.
- Primeira ideia: desenhar cotas (linhas de 20 mm e 6,6 mm) sobre os renders de frente e de perfil. Medi os PNGs: os renders não estão em projeção ortogonal e a proporção frente/perfil dá 1,94, não 3,03. Cotas sobre essas imagens seriam enganosas. Ficou uma ficha em texto.
- Primeira ideia: animação de entrada em todas as seções e barra fixa de botão no celular. Cortei as duas. Fica um momento de movimento no topo (LED) e a revelação dos três passos, que são uma sequência. A barra fixa cobriria conteúdo em foco (WCAG 2.2, 2.4.11) e a página é curta.
- Primeira ideia: três ilustrações de celular, uma por passo. Os passos 2 e 3 usariam imagens quase iguais (todas as poses de toque mostram "Acesso confirmado"). Ficaram duas, antes e depois, com uma legenda só.

---

## 2. Mapa do site

| Endereço | Arquivo | Modo | Conteúdo |
| --- | --- | --- | --- |
| `/` | `public/index.html` | escuro no topo, claro depois, rodapé petróleo | Landing rolável com 6 seções e rodapé |
| `/privacidade` | `public/privacidade.html` | claro, rodapé petróleo | Política de privacidade LGPD em linguagem simples |
| qualquer endereço inexistente | `public/404.html` | escuro | "Página não encontrada" e botão para o início |

Âncoras da landing: `#conteudo` (main), `#problema`, `#ideia`, `#prototipo`, `#lista`, `#faq`, `#faq-tecnico`.

A política de privacidade completa está na seção 4 (texto) e na seção 3.9 (layout). Campos pendentes nela: controlador (P10), base da transferência internacional (P11), prazo de guarda (P12), encarregado ou dispensa (P13), data (P14).

---

## 3. Layout seção por seção

Grade e medidas (valem para todas as seções)

| Faixa | Largura alvo | Colunas | Margem lateral | Espaço entre colunas | Respiro vertical da seção |
| --- | --- | --- | --- | --- | --- |
| Celular | 390 (vale de 320 a 767) | 1 | 20 px | 16 px | 64 px |
| Tablet | 768 (768 a 1023) | 8 | 32 px | 24 px | 96 px |
| Desktop | 1280 (1024 em diante) | 12 | 40 px | 24 px | 128 px |

Conteúdo com largura máxima de 1120 px, centrado. Texto corrido com largura máxima de 62ch. Tudo alinhado à esquerda (nenhum parágrafo centrado).

Estrutura de modos no HTML da landing

```
<html lang="pt-BR" class="no-js" data-modo="rascunho">
<body>
  <a class="pular" href="#conteudo">Pular para o conteúdo</a>
  <div class="faixa-rascunho so-rascunho">...</div>
  <header class="topo modo-escuro">          fundo transparente, posicionado sobre a área do degradê
  <main id="conteudo">
    <div class="noite modo-escuro">          degradê #0A2935 -> #061A23 cobre as duas seções; header sobreposto a ela
      <section class="hero">...</section>
      <section id="problema">...</section>
    </div>
    <section id="ideia" class="modo-claro">...</section>
    <section id="prototipo" class="modo-claro">...</section>
    <section id="lista" class="modo-claro">...</section>
    <section id="faq" class="modo-claro">...</section>
  </main>
  <footer class="rodape modo-petroleo">...</footer>
</body>
```

O `header` fica antes do `main` (landmark correto) e é posicionado com `position: absolute; left: 0; right: 0; top: 0` sobre a `.noite` (no rascunho, `top` igual à altura da faixa de rascunho, 40 px). O `site.js` troca `no-js` por `js` no `html`. A `.hero` ganha `padding-top` igual à altura do header (56 px no celular, 72 px no desktop) mais o respiro.

### 3.0 Topo (header) e faixa de rascunho

Objetivo: marca reconhecível e um atalho para a lista.

Hierarquia: escudo creme 28 px (40 px no desktop) + "Aspen Core" em caixa alta (Space Mono 700, 15 px, espaçamento 0,14em) à esquerda; link "Lista de espera" à direita (Space Mono 400, 15 px, sublinhado, alvo de toque 44 px).

```
Celular 390                                  Desktop 1280
+--------------------------------------+     +----------------------------------------------------------+
| [escudo] ASPEN CORE   Lista de espera|     | [escudo] ASPEN CORE                       Lista de espera|
+--------------------------------------+     +----------------------------------------------------------+
altura 56                                    altura 72
```

Imagens: `escudo-creme-64.webp` (exibido a 28 px) e `escudo-creme-128.webp` no `srcset` (exibido a 40 px). `alt=""`, porque o texto "Aspen Core" ao lado já dá o nome ao link do início.

Rolagem: o topo não é fixo. Rola com a página.

Faixa de rascunho (só com `data-modo="rascunho"`): barra de 40 px acima do header, fundo #FBEFC9, texto #3A3A2E Poppins 600 14 px, com o texto `comum.rascunho_faixa`. Some com `data-modo="publicado"`.

Link "Pular para o conteúdo": escondido fora da tela até receber foco; com foco, aparece no canto superior esquerdo com fundo #EFE8D6, texto #0A2935, contorno dourado.

### 3.1 Hero (promessa, aviso e botão)

Objetivo: em 10 segundos a pessoa sabe o que é (uma chave física), qual é a ideia (encostar no celular além da senha), que é protótipo e que não se conecta a nada ainda, e onde clicar.

Modo escuro, porque a marca reserva o escuro para a chave em destaque, e a chave preta com LED ciano ganha contraste na noite.

Hierarquia: imagem da chave, título h1, subtítulo, botão, caixa de aviso (com a frase de hoje e o link para o protótipo), legenda da imagem.

Ordem no HTML: h1, subtítulo, botão, aviso e, por último, a `figure` da chave. No celular e no tablet o CSS põe a figura em cima (`order: -1` na grade); no desktop ela fica na coluna da direita. Assim o leitor de tela começa pelo título e a ordem de foco não muda (a figura não recebe foco).

```
Celular 390 x 844 (dobra útil considerada: 664 px, Safari com barras)
+--------------------------------------+ 0
| [escudo] ASPEN CORE   Lista de espera| 56
|                                      |
|   ____________________________/O    | chave-deitada, 88vw (343 x 195),
|  [=|___________|=========|_]  O      | alinhada à direita, sangra 12 px
|                                      | para fora da margem direita
|                Imagem 3D feita a ... | legenda 13 px, à direita   ~ 290
| A CHAVE FÍSICA QUE                   | h1 Space Mono 700 29 px
| VAI CONFIRMAR QUE É                  | 3 linhas
| VOCÊ (acento)                        |                            ~ 400
| Essa é a Aspen Key. A ideia é que,   | sub 16 px, 3 linhas
| ao entrar numa conta, além da senha, |
| você encoste a chave no celular.     |                            ~ 490
| [     Entrar na lista de espera    ] | botão largura total, 52 px ~ 560
|                                      |
| +----------------------------------+ | aviso, borda dourada 1 px
| | /!\ Protótipo em desenvolvimento.| |
| |     O design final pode mudar.   | |
| |     Hoje ele ainda não se conecta| |
| |     a nenhum site, app ou conta. | |
| |     Ver o que o protótipo já faz | | link sublinhado
| +----------------------------------+ |                            ~ 720
+--------------------------------------+
Marca d'água: escudo creme a 6% de opacidade, 140vw, centrado em x = 70%, y = 30% do hero, atrás de tudo.
```

```
Desktop 1280 x 800
+--------------------------------------------------------------------------------------------+
| [escudo] ASPEN CORE                                                          Lista de espera|
|                                                                                            |
|  A CHAVE FÍSICA QUE VAI                                           \  O                     |
|  CONFIRMAR QUE É VOCÊ          (h1 52 px, colunas 1 a 7)           \/                      |
|                                                                    /\  chave-3q             |
|  Essa é a Aspen Key. A ideia é que, ao entrar numa conta,         /  \ colunas 8 a 12       |
|  além da senha, você encoste a chave no celular.                 /    \ altura 640 px       |
|                                                                 /______\ topo em 88 px      |
|  [ Entrar na lista de espera ]                                                             |
|                                                                                            |
|  +--------------------------------------------------+          Imagem 3D feita a partir... |
|  | /!\ Protótipo em desenvolvimento. O design ...   |                                      |
|  |     Hoje ele ainda não se conecta a nenhum ...   |                                      |
|  |     Ver o que o protótipo já faz                 |                                      |
|  +--------------------------------------------------+                                      |
+--------------------------------------------------------------------------------------------+
Marca d'água: escudo creme 6%, 720 px, ancorado à esquerda (left: -120px, bottom: -160px).
```

Tablet 768: igual ao celular, com a chave-deitada a 520 px de largura e o texto limitado a 6 das 8 colunas.

Imagens

- Celular e tablet: `hero-chave-deitada-400/800/1200.webp` (origem `brand/assets/key/chave-deitada.png`), `sizes="(min-width: 768px) 520px, 88vw"`, `width="800" height="454"`.
- Desktop (a partir de 1024): `<source media="(min-width: 1024px)" srcset="hero-chave-3q-560.webp 560w, hero-chave-3q-1120.webp 1120w" sizes="(min-width: 1280px) 386px, 30vw" width="560" height="930">` (origem `chave-3q.png`; 640 px de altura dão 386 px de largura).
- `fetchpriority="high"`, sem `loading="lazy"`, `decoding="async"`.
- Marca d'água: `marca-dagua-escudo-720.webp`, `alt=""`, `aria-hidden="true"`, `loading="lazy"`, `fetchpriority="low"`. A seção `.noite` tem `overflow-x: clip` para a marca d'água não criar rolagem horizontal.

Brilho do LED (elemento `span.hero__brilho` dentro da `figure`, que tem `position: relative` e a mesma caixa da imagem)

| Faixa | Posição do centro (medida nos PNGs recortados) | Forma |
| --- | --- | --- |
| Celular e tablet (chave-deitada) | x 56,6%, y 22% | elipse vertical, largura 14% da figura, altura 44% |
| Desktop (chave-3q) | x 52,4%, y 33,2% | elipse girada (a faixa é diagonal; começar com `rotate(-32deg)` e ajustar olhando a captura), largura 40%, altura 10% |

Fundo do brilho: `radial-gradient(closest-side, rgba(148, 247, 254, 0.55), rgba(148, 247, 254, 0))`, `mix-blend-mode: screen`, `pointer-events: none`. Animação na seção 6.

Rolagem: nada acontece ao rolar.

### 3.2 Problema (o problema em uma frase)

Objetivo: a pessoa reconhece a situação (senha que vai parar na mão de outro) antes de ver a solução. Nenhuma estatística (o slot de dado fica comentado no HTML até haver fonte).

Modo escuro, porque a marca usa o escuro para ameaça e alerta. Continua o mesmo degradê do hero.

Hierarquia: h2 com "senha" no acento, uma frase de apoio, ilustração do golpe com legenda, frase ponte para a ideia.

```
Celular 390
+--------------------------------------+
| QUEM DESCOBRE A SUA                  | h2 Space Mono 700 23 px
| SENHA (acento) PODE                  |
| ENTRAR COMO SE FOSSE                 |
| VOCÊ                                 |
| Uma mensagem com link falso, uma     | p 16 px
| página que imita a do banco, e a ... |
|                  +-----------------+ |
|                  | celular-bloqueio| | 60vw (234 px), alinhado à direita
|                  |  (tela com      | |
|                  |   notificação)  | |
|                  +-----------------+ |
|         Ilustração com um exemplo... | legenda 13 px, à direita
| A Aspen Key está sendo criada para   | p ponte, Space Mono 400 16 px,
| somar mais uma prova de que é você...| creme noturno
+--------------------------------------+  (fim do modo escuro, borda reta)
```

```
Desktop 1280
+--------------------------------------------------------------------------------------------+
|  QUEM DESCOBRE A SUA SENHA PODE                              +--------------+               |
|  ENTRAR COMO SE FOSSE VOCÊ        (colunas 1 a 6)            | celular-     |  colunas 8-11 |
|                                                              | bloqueio     |  largura 300  |
|  Uma mensagem com link falso, uma página que imita a do      |              |               |
|  banco, e a senha que você digita ali vai parar na mão...    +--------------+               |
|                                                              Ilustração com um exemplo...  |
|  A Aspen Key está sendo criada para somar mais uma prova...                                |
+--------------------------------------------------------------------------------------------+
```

Imagens: `problema-celular-bloqueio-320/640/960.webp` (origem `key/celular-bloqueio.png`), `sizes="(min-width: 1024px) 300px, 60vw"`, `width="640" height="1218"`, `loading="lazy"`. Legenda obrigatória `problema.figura_legenda`. Esta tela não mostra o fluxo da Aspen Key (mostra um golpe fictício), por isso a legenda diz que é ilustração com exemplo fictício, e não "como será".

Slot de dado (P15): no HTML, logo depois do parágrafo de apoio, deixar só um comentário `<!-- PENDENTE P15: dado sobre golpes digitais no Brasil, com fonte citada. Sem número até ter fonte. -->`. Nada visível.

Rolagem: nada.

Virada: a seção seguinte começa com fundo creme liso, borda reta, sem degradê de transição.

### 3.3 A ideia em três passos (como será)

Objetivo: mostrar a visão do produto com o lema, deixando claro que é visão.

Modo claro, porque é explicação e solução.

Hierarquia: h2 em bloco petróleo, frase de visão (logo abaixo do título, antes dos passos), lista numerada com Aproxime, Confie, Acesse, par de ilustrações com a etiqueta azul-clara.

```
Celular 390
+--------------------------------------+
| [A IDEIA EM TRÊS PASSOS]             | h2 Poppins 700 22 px, bloco petróleo,
|                                      | texto creme-amarelo
| Esta é a visão do produto. Ainda não | p 17 px
| é assim que o protótipo funciona hoje|
|                                      |
| (1) APROXIME                         | número: círculo 40 px, borda 2 px petróleo
|  |  Na hora de entrar numa conta,    | nome: Poppins 700 18 px, caixa alta
|  |  depois da senha, você encosta... | linha vertical 2 px tom oliva liga os números
| (2) CONFIE                           |
|  |  A chave confirma que quem está...|
| (3) ACESSE                           |
|     Com a senha e a chave, você entra|
|                                      |
|   .-~~~~~~~~~~~~~~~~~~-.             | círculo #DADBC8 atrás do par
|  +---------+  +---------+            |
|  | celular |  |  toque  |            | 2 colunas, 16 px entre elas
|  |aguardan.|  | -frente |            | a segunda desce 24 px
|  +---------+  +---------+            |
| [Ilustração de como será, ainda não  | etiqueta: fundo #A9CBDD, texto #3A3A2E
|  funciona assim]                     | Poppins 600 14 px, raio 8
+--------------------------------------+
```

```
Desktop 1280
+--------------------------------------------------------------------------------------------+
|  [A IDEIA EM TRÊS PASSOS]                                                                  |
|  Esta é a visão do produto. Ainda não é assim que o protótipo funciona hoje.               |
|                                                                                            |
|  (1) APROXIME                                  .-~~~~~~~~~~~~~~~~~~~~-.                    |
|   |  Na hora de entrar numa conta, ...        +-----------+                               |
|  (2) CONFIE                                    | aguardando|  +-----------+                |
|   |  A chave confirma que quem está ...       |           |  |   toque   |  desce 48 px  |
|  (3) ACESSE                                    +-----------+  |  -frente  |                |
|      Com a senha e a chave, você entra ...                    +-----------+                |
|  (colunas 1 a 5)                               [Ilustração de como será, ainda não ...]    |
|                                                (colunas 7 a 12)                            |
+--------------------------------------------------------------------------------------------+
```

Imagens

- `ideia-celular-aguardando-280/560/840.webp` (origem `key/celular-aguardando.png`), `width="560" height="1066"`, `sizes="(min-width: 1024px) 240px, 42vw"`.
- `ideia-toque-frente-320/640/960.webp` (origem `key/toque-frente.png`), `width="640" height="877"`, `sizes="(min-width: 1024px) 320px, 46vw"`.
- As duas com `loading="lazy"`. Uma etiqueta para o par, como `figcaption` de uma `figure` que contém as duas imagens, cada uma com seu `alt`.
- Círculo: `::before` do contêiner `.par`, cor #DADBC8 (mistura de 35% oliva no creme), diâmetro 80% da largura do par, centrado, atrás das imagens.

Rolagem: revelação dos passos, um por vez (seção 6). As imagens não se movem.

### 3.4 O protótipo hoje

Objetivo: mostrar com honestidade o que existe, o que faz e o que não faz. É a seção que o investidor vai ler com lupa.

Modo claro (explicação). Os PNGs da biblioteca 3D foram feitos com sombra para fundo claro, então ficam corretos aqui.

Hierarquia: h2 em bloco, frase de abertura, foto principal (slot), ficha técnica, três detalhes, lista "Hoje ele faz / Ainda não faz", vídeo (slot) com transcrição, aviso de protótipo, botão.

```
Celular 390
+--------------------------------------+
| [O PROTÓTIPO HOJE]                   |
| Ele já existe como peça física e     | lead Poppins 400 19 px
| funciona em parte. Aqui está o que...|
| +----------------------------------+ |
| |                                  | | foto principal (slot P01), 3:4,
| |   imagem de referência           | | largura total, raio 16
| |   (fundo escuro)                 | |
| +----------------------------------+ |
| Imagem de referência do protótipo.   | legenda 14 px
| [PENDENTE: trocar pela foto real...] | só no rascunho, caixa tracejada
| [slot P02 foto na mão] [slot P03 USB]| só no rascunho, 2 colunas, 4:5
|                                      |
| FICHA DO PROTÓTIPO                   | h3 Poppins 700 18 px caixa alta
| Formato      Bastão de metal preto...| dl em 2 colunas: rótulo 110 px
| Largura      Cerca de 20 mm          | linhas separadas por 1 px #858579
| Espessura    Cerca de 6,6 mm         |
| Conector     USB-C                   |
| Luz          Faixa fina de LED ciano |
| Topo         Anel para chaveiro      |
| Marca        Escudo da Aspen grava...|
| Chip         Chip de segurança cri...|
|                                      |
| +--------+ +--------+ +--------+     | 3 quadrados 1:1, fundo #E6E7D7, raio 16
| |conector| |  led   | |  anel  |     |
| +--------+ +--------+ +--------+     |
| Conector   Faixa de   Anel no topo   | legendas 14 px
| USB-C      LED e ...                 |
| Imagens 3D feitas a partir do protót.| legenda geral 13 px
|                                      |
| HOJE ELE FAZ                         | h3
| (o) Calcula hash.                    | bolinha cheia petróleo 12 px
| (o) Executa criptografia assimétrica |
| (o) Existe como peça física, com ... |
| AINDA NÃO FAZ                        | h3
| ( ) Não se conecta a nenhum site, ...| anel 12 px, borda 2 px #606054
| ( ) Não confirma o seu acesso quando |
| ( ) Ainda não está à venda.          |
| O que é hash e criptografia assimétr.| link para #faq-tecnico
|                                      |
| O PROTÓTIPO FUNCIONANDO              | h3
| +----------------+                   | slot de vídeo P04, 9:16, largura
| |  PENDENTE:     |                   | 70% no celular, máx. 70vh de altura
| |  vídeo curto...|                   | (no rascunho: caixa tracejada)
| +----------------+                   |
| Vídeo do protótipo calculando hash...| legenda
| O que aparece no vídeo               | h4 + p (transcrição, P05)
|                                      |
| +--/!\ Protótipo em desenvolvimento.-+ aviso: fundo #FBEFC9, texto #3A3A2E
| |      O design final pode mudar.    |
| +------------------------------------+
| [     Entrar na lista de espera    ] | botão petróleo, largura total
+--------------------------------------+
```

```
Desktop 1280
+--------------------------------------------------------------------------------------------+
| [O PROTÓTIPO HOJE]                                                                         |
| Ele já existe como peça física e funciona em parte. Aqui está o que ele faz agora ...      |
|                                                                                            |
| +-------------------------+   FICHA DO PROTÓTIPO                                           |
| |                         |   Formato      Bastão de metal preto escovado                  |
| |  foto principal 3:4     |   Largura      Cerca de 20 mm                                   |
| |  colunas 1 a 5          |   ...          (colunas 7 a 12)                                 |
| |                         |   Chip         Chip de segurança criptográfico                 |
| +-------------------------+                                                                |
| Imagem de referência do protótipo.                                                         |
|                                                                                            |
| +------------------------+ +------------------------+ +------------------------+           |
| |   detalhe-conector     | |     detalhe-led        | |     detalhe-anel       |  4 col.   |
| +------------------------+ +------------------------+ +------------------------+  cada     |
|                                                                                            |
| HOJE ELE FAZ                     AINDA NÃO FAZ               +--------------+              |
| (o) Calcula hash.                ( ) Não se conecta a ...    |  vídeo 9:16  |  colunas     |
| (o) Executa criptografia ...     ( ) Não confirma o seu ...  |  altura máx. |  9 a 12      |
| (o) Existe como peça física ...  ( ) Ainda não está à venda. |  560 px      |              |
| (colunas 1 a 4)                  (colunas 5 a 8)             +--------------+              |
| O que é hash e criptografia assimétrica?                     legenda + transcrição         |
|                                                                                            |
| [aviso de protótipo, colunas 1 a 6]          [ Entrar na lista de espera ]                 |
+--------------------------------------------------------------------------------------------+
```

Imagens

- Foto principal (slot P01): hoje `prototipo-referencia-600/900/1152.webp` (origem `brand/assets/aspen-key-prototipo-referencia.png`, sem recorte), `width="900" height="1200"`, `sizes="(min-width: 1024px) 420px, calc(100vw - 40px)"`, `loading="lazy"`. Legenda "Imagem de referência do protótipo." Não chamar de "foto real" até o Henrique confirmar (P16).
- Slots P02 e P03 (fotos extras, opcionais): `figure.slot[data-vazio]` com texto PENDENTE, proporção 4:5, visíveis só no rascunho.
- Detalhes: `detalhe-conector`, `detalhe-led` e `detalhe-anel`, cada um em 240, 480 e 720 px, quadrados, `width="480" height="480"`, `sizes="(min-width: 1024px) 357px, (min-width: 768px) 30vw, 30vw"`, `loading="lazy"`, `object-fit: cover`.
- Vídeo (slot P04): ver seção 7.3.

Bloco do vídeo: o h3 "O protótipo funcionando", a `figure` do vídeo e a transcrição ficam juntos num `div.video.slot#video-prototipo[data-vazio]`. Publicado e ainda sem vídeo, o bloco inteiro some, e a linha do desktop passa a ter só as duas listas, em colunas 1 a 6 e 7 a 12 (`.prototipo__linha:has(> .video[data-vazio])` no CSS, só quando `data-modo="publicado"`). Quando o vídeo chegar, remover `data-vazio` do `div` e seguir a seção 7.3.

Rolagem: nada se move nesta seção. A honestidade fica parada, de propósito.

### 3.5 Lista de espera

Objetivo: inscrição em um passo, com consentimento claro.

Modo claro. O painel do formulário tem fundo creme-amarelo para destacar a única ação da página.

Hierarquia: h2 em bloco, frase do que a pessoa recebe, painel com o formulário (iframe do Tally ou rascunho), resumo do consentimento logo abaixo do botão, linha de contato para investimento e imprensa.

```
Celular 390
+--------------------------------------+
| [ENTRE NA LISTA DE ESPERA]           |
| Deixe seu e-mail e a gente avisa     | p 17 px
| quando a Aspen Key for lançada. O ...|
| +----------------------------------+ | painel #FBEFC9, raio 16, padding 20
| | (iframe do Tally, altura inicial | | altura inicial reservada 420 px
| |  420 px, ajusta sozinho)         | |
| |  Seu e-mail                      | |
| |  [nome@exemplo.com            ]  | |
| |  Como podemos te chamar? (opc.)  | |
| |  [                            ]  | |
| |  [x] Quero receber um e-mail ... | |
| |  Ao entrar na lista, você aceita | | texto de consentimento do Tally,
| |  ... Leia a Política de priv.    | | logo acima do botão
| |  [ Entrar na lista de espera ]   | |
| +----------------------------------+ |
| Ao entrar na lista, você aceita ...  | resumo do consentimento 14 px,
| Leia a Política de privacidade.      | fora do iframe (sempre visível)
| (área de status: confirmação)        | role="status", vazia até enviar
| Quer falar com a gente sobre invest..| 14 px, link mailto
+--------------------------------------+
```

```
Desktop 1280
+--------------------------------------------------------------------------------------------+
| [ENTRE NA LISTA DE ESPERA]                     +------------------------------------------+ |
| Deixe seu e-mail e a gente avisa quando a      | painel #FBEFC9 com o formulário          | |
| Aspen Key for lançada. O seu e-mail serve só   | colunas 7 a 12, largura máx. 560 px      | |
| para esse aviso.                               |                                          | |
| (colunas 1 a 5)                                +------------------------------------------+ |
|                                                Ao entrar na lista, você aceita ...          |
| Quer falar com a gente sobre investimento ...  (status)                                     |
+--------------------------------------------------------------------------------------------+
```

Estados do painel (detalhes na seção 8)

| Estado | Quando | O que aparece |
| --- | --- | --- |
| Rascunho sem Tally | código começa com PENDENTE e `data-modo="rascunho"` | Caixa tracejada com `lista.rascunho_titulo` e `lista.rascunho_texto`, campo de e-mail desativado, caixa de seleção desativada, botão desativado com o texto do botão, resumo do consentimento |
| Carregando | JS pediu o script do Tally | "Carregando o formulário..." no lugar do iframe, altura 420 px reservada |
| Pronto | evento `Tally.FormLoaded` | Iframe do Tally, sem a frase de carregamento |
| Falhou | 10 s sem `Tally.FormLoaded`, ou erro ao carregar o script | `lista.erro_carregar` e o link de reserva |
| Sem JavaScript | navegador sem JS | `noscript` com `lista.noscript` e o link de reserva |
| Enviado | evento `Tally.FormSubmitted` | `lista.confirmacao` na área de status (fora do iframe), além da página de agradecimento do próprio Tally |

Rolagem: nada.

### 3.6 Perguntas frequentes

Objetivo: responder as objeções com respostas curtas e verdadeiras.

Modo claro.

Hierarquia: h2 em bloco, lista de `details` com `summary`.

```
Celular 390                                  Desktop 1280
+--------------------------------------+     +------------------------------------------+
| [PERGUNTAS FREQUENTES]               |     | [PERGUNTAS FREQUENTES]                   |
| Já funciona?                      +  |     | Já funciona?                          +  |  colunas 1 a 8,
|--------------------------------------|     |------------------------------------------|  máx. 760 px
| Substitui a minha senha?          +  |     | Substitui a minha senha?              +  |
|--------------------------------------|     |   Não. A ideia é que a chave venha ...   |  (aberto)
| Quando lança?                     +  |     |------------------------------------------|
| ...                                  |     | ...                                      |
+--------------------------------------+     +------------------------------------------+
```

`summary`: Poppins 600 17 px, altura mínima 56 px, padding 16 px 40 px 16 px 0, sinal "+" à direita (gira 45 graus quando aberto). Resposta: Poppins 400 17 px, padding inferior 16 px, largura máxima 62ch. Separador 1 px #858579 entre itens.

Todas fechadas ao carregar. Se a página abrir com `#faq-tecnico` no endereço (link da seção do protótipo), o JS abre esse `details` e leva o foco ao `summary`.

### 3.7 Rodapé

Objetivo: contato, Instagram, privacidade, aviso de protótipo, lema.

Modo petróleo: fundo #255B62, texto #FBEFC9, Poppins.

```
Celular 390                                  Desktop 1280
+--------------------------------------+     +----------------------------------------------------------+
| [escudo] ASPEN CORE                  |     | [escudo] ASPEN CORE      @aspencore_ no     Protótipo em  |
| Aspen Core, empresa brasileira em... |     | Aspen Core, empresa ...  Instagram          desenvolv. O  |
|                                      |     |                          contato@seudom...  design final  |
| APROXIME                             |     | APROXIME                 Política de        pode mudar.   |
| CONFIE                               |     | CONFIE                   privacidade                      |
| ACESSE                               |     | ACESSE                                     © 2026 Aspen Core|
|                                      |     | (colunas 1 a 4)          (colunas 5 a 8)    (colunas 9 a 12)|
| @aspencore_ no Instagram             |     +----------------------------------------------------------+
| contato@seudominio.com.br            |
| Política de privacidade              |     Links empilhados com alvo de 44 px de altura.
|                                      |
| Protótipo em desenvolvimento. O ...  |
| © 2026 Aspen Core                    |
+--------------------------------------+
```

Lema: três linhas sem pontos, Poppins 700, 28 px no celular e 32 px no desktop, caixa alta, espaçamento 0,06em, cor #FBEFC9. É texto (um `p` com três `span` em bloco), não imagem.

Escudo: `escudo-creme-64/128.webp`, 40 px, `alt=""`.

### 3.8 Página 404

Modo escuro, tela cheia (`min-height: 100svh`), mesmo degradê. Escudo creme 64 px, h1 "Página não encontrada" (Space Mono 700, caixa alta), parágrafo, botão claro "Voltar para o início" para `/`. Caminhos absolutos. `<meta name="robots" content="noindex">`.

```
+--------------------------------------+
| [escudo]                             |
|                                      |
| PÁGINA NÃO ENCONTRADA                |
| O endereço pode ter mudado ou ter    |
| sido digitado errado.                |
| [   Voltar para o início   ]         |
+--------------------------------------+
```

### 3.9 Página de privacidade

Modo claro inteiro, rodapé petróleo igual ao da landing.

Topo próprio: escudo petróleo 28 px + "Aspen Core" (Poppins 700, caixa alta, cor #255B62), link para `./` (o início). À direita, link "Lista de espera" para `./#lista`.

Corpo: largura máxima 68ch, à esquerda. h1 em bloco petróleo; linha "Atualizada em ..." 14 px #606054; introdução; cada seção com h2 (Poppins 700, 18 px, caixa alta, espaçamento 0,06em, cor #255B62) e parágrafos ou listas com marcadores. Link "Voltar para o início" no fim.

---

## 4. Texto completo do site

Regras de escrita para qualquer texto novo: sem travessão; títulos sem ponto final; pouco dois pontos; voz ativa; o mesmo nome para a mesma coisa ("lista de espera" para a inscrição, "aviso de lançamento" para o que a pessoa recebe, "protótipo" para o que existe, "visão do produto" ou "ideia" para o que ainda não existe). Títulos ficam em caixa normal no HTML e viram caixa alta só pelo CSS (leitores de tela leem caixa alta do código letra por letra).

Filtro aplicado a cada frase: não afirma número de usuários, "usuários protegidos", "sem falsos positivos", "em tempo real", "detecta golpes", "protege contra golpes", segurança total, preço, plano, data, parceria, prêmio, depoimento, avaliação, selo, tamanho da equipe, nem função que o protótipo não tem; não usa "sem senha" nem "mesmo se a senha vazar"; não traz estatística. Toda frase sobre o que a chave fará está no futuro ("vai", "está sendo criada", "a ideia é") ou ao lado da etiqueta de ilustração.

<!-- COPY_AUTOGERADO_INICIO -->

### Metadados

| Chave | Texto | Caracteres |
| --- | --- | --- |
| `meta.index.title` | Aspen Key \| Chave física em desenvolvimento da Aspen Core | 57 |
| `meta.index.description` | Aspen Key, chave física em desenvolvimento. A ideia é encostar no celular para confirmar que é você, além da senha. Veja o protótipo e entre na lista. | 150 |
| `meta.index.og_title` | Aspen Key \| Protótipo em desenvolvimento | 40 |
| `meta.index.og_description` | Uma chave física pensada para confirmar que é você, além da senha. Veja o que o protótipo já faz e entre na lista de espera. | 124 |
| `meta.index.og_image_alt` | Aspen Key, bastão preto com faixa de luz ciano e anel de chaveiro, ao lado das palavras Aproxime, Confie e Acesse. Protótipo em desenvolvimento. | 144 |
| `meta.privacidade.title` | Política de privacidade \| Aspen Core | 36 |
| `meta.privacidade.description` | Como a Aspen Core usa o e-mail que você deixa na lista de espera da Aspen Key, por quanto tempo guarda e como pedir a exclusão. | 127 |
| `meta.erro404.title` | Página não encontrada \| Aspen Core | 34 |

### Comum (topo, aviso, botão)

| Chave | Texto |
| --- | --- |
| `comum.pular` | Pular para o conteúdo |
| `comum.marca` | Aspen Core |
| `comum.nav_lista` | Lista de espera |
| `comum.aviso_prototipo` | Protótipo em desenvolvimento. O design final pode mudar. |
| `comum.rascunho_faixa` | Rascunho. Os itens marcados como PENDENTE ainda precisam ser trocados antes de publicar. |
| `comum.cta_lista` | Entrar na lista de espera |

### Hero

| Chave | Texto |
| --- | --- |
| `hero.h1` | A chave física que vai confirmar que é você (destaque no acento: "você") |
| `hero.sub` | Essa é a Aspen Key. A ideia é que, ao entrar numa conta, além da senha, você encoste a chave no celular. |
| `hero.cta` | Entrar na lista de espera |
| `hero.aviso_titulo` | Protótipo em desenvolvimento. O design final pode mudar. |
| `hero.aviso_texto` | Hoje ele ainda não se conecta a nenhum site, app ou conta. |
| `hero.aviso_link` | Ver o que o protótipo já faz |
| `hero.figura_legenda` | Ilustração da ideia final. O protótipo de hoje é diferente. |
| `hero.figura_alt` | Aspen Key, um bastão fino de metal preto escovado com conector USB-C numa ponta, uma faixa fina de luz ciano e um anel de chaveiro na outra ponta. |

### Problema

| Chave | Texto |
| --- | --- |
| `problema.h2` | Quem descobre a sua senha pode entrar como se fosse você (destaque no acento: "senha") |
| `problema.texto` | Uma mensagem com link falso, uma página que imita a do banco, e a senha que você digita ali vai parar na mão de outra pessoa. |
| `problema.ponte` | A Aspen Key está sendo criada para somar mais uma prova de que é você, além da senha. Uma coisa física, que fica no seu chaveiro. |
| `problema.figura_alt` | Celular com uma notificação fictícia chamada Aviso de bloqueio, dizendo que a conta será suspensa hoje e trazendo o link site-do-banco.exemplo-falso. |
| `problema.figura_legenda` | Ilustração com um exemplo fictício de mensagem de golpe. |
| `problema.slot_dado` | PENDENTE: dado sobre golpes digitais no Brasil com fonte citada (opcional, sem número até ter fonte). |

### A ideia em três passos

| Chave | Texto |
| --- | --- |
| `ideia.h2` | A ideia em três passos |
| `ideia.intro` | Esta é a visão do produto. Ainda não é assim que o protótipo funciona hoje. |
| `ideia.passos[1]` | **Aproxime** (número 1). Na hora de entrar numa conta, depois da senha, você encosta a Aspen Key no celular. |
| `ideia.passos[2]` | **Confie** (número 2). A chave confirma que quem está entrando é você, e não alguém que só sabe a sua senha. |
| `ideia.passos[3]` | **Acesse** (número 3). Com a senha e a chave, você entra na sua conta. |
| `ideia.figura1_alt` | Ilustração de um celular na tela de entrar numa conta, com o pedido Confirme com a Aspen Key e a instrução Aproxime a chave do celular. |
| `ideia.figura2_alt` | Ilustração da Aspen Key encostada na lateral de um celular que mostra a mensagem Acesso confirmado. |
| `ideia.legenda_ilustracao` | Ilustração de como será, ainda não funciona assim |

### O protótipo hoje

| Chave | Texto |
| --- | --- |
| `prototipo.h2` | O protótipo hoje |
| `prototipo.lead` | Ele já existe como peça física e funciona em parte. Aqui está o que ele faz agora e o que ainda falta. |
| `prototipo.foto_alt` | Imagem de referência do protótipo da Aspen Key, bastão preto com conector USB-C, faixa de luz ciano e anel de chaveiro, sobre fundo escuro. |
| `prototipo.foto_legenda` | Imagem de referência do protótipo. |
| `prototipo.foto_pendente` | PENDENTE: trocar pela foto real do protótipo (pendência P01). |
| `prototipo.foto_extra_1_pendente` | PENDENTE: foto do protótipo na mão, para mostrar o tamanho (pendência P02). |
| `prototipo.foto_extra_2_pendente` | PENDENTE: foto do protótipo com o conector USB-C à mostra (pendência P03). |
| `prototipo.ficha_titulo` | Ficha do protótipo |
| `prototipo.ficha[1]` | rótulo "Formato", valor "Bastão de metal preto escovado" |
| `prototipo.ficha[2]` | rótulo "Largura", valor "Cerca de 20 mm" |
| `prototipo.ficha[3]` | rótulo "Espessura", valor "Cerca de 6,6 mm" |
| `prototipo.ficha[4]` | rótulo "Conector", valor "USB-C" |
| `prototipo.ficha[5]` | rótulo "Luz", valor "Faixa fina de LED ciano" |
| `prototipo.ficha[6]` | rótulo "Topo", valor "Anel para chaveiro" |
| `prototipo.ficha[7]` | rótulo "Marca", valor "Escudo da Aspen gravado de forma discreta" |
| `prototipo.ficha[8]` | rótulo "Chip", valor "Chip de segurança criptográfico" (PENDENTE_MODELO_CHIP: depois da confirmação do Henrique, pode virar 'Chip de segurança criptográfico ATECC608B'.) |
| `prototipo.detalhes[1]` (detalhe-conector) | legenda "Conector USB-C"; alt "Close do conector USB-C metálico da Aspen Key." |
| `prototipo.detalhes[2]` (detalhe-led) | legenda "Faixa de LED e escudo gravado"; alt "Close da faixa fina de luz ciano e do escudo da marca gravado no corpo preto." |
| `prototipo.detalhes[3]` (detalhe-anel) | legenda "Anel no topo"; alt "Close da ponta da Aspen Key com o furo e o anel de chaveiro de aço escuro." |
| `prototipo.detalhes_legenda` | Imagens 3D feitas a partir do protótipo. |
| `prototipo.hoje_titulo` | Hoje ele faz |
| `prototipo.hoje_itens[1]` | Calcula hash. |
| `prototipo.hoje_itens[2]` | Executa criptografia assimétrica com um chip de segurança criptográfico. |
| `prototipo.hoje_itens[3]` | Existe como peça física, com conector USB-C, faixa de LED e anel. |
| `prototipo.ainda_titulo` | Ainda não faz |
| `prototipo.ainda_itens[1]` | Não se conecta a nenhum site, app ou conta. |
| `prototipo.ainda_itens[2]` | Não confirma o seu acesso quando encosta no celular. Isso ainda é a visão do produto. |
| `prototipo.ainda_itens[3]` | Ainda não está à venda. |
| `prototipo.link_tecnico` | O que é hash e criptografia assimétrica? |
| `prototipo.video_titulo` | O protótipo funcionando |
| `prototipo.video_legenda` | Vídeo do protótipo calculando hash e fazendo criptografia assimétrica. |
| `prototipo.video_pendente` | PENDENTE: vídeo curto do protótipo calculando hash e fazendo criptografia assimétrica (pendência P04). |
| `prototipo.video_transcricao_titulo` | O que aparece no vídeo |
| `prototipo.video_transcricao_pendente` | PENDENTE: descrever em 2 a 4 frases, na ordem, o que aparece no vídeo (pendência P05). |
| `prototipo.aviso` | Protótipo em desenvolvimento. O design final pode mudar. |
| `prototipo.cta` | Entrar na lista de espera |

### Lista de espera (página)

| Chave | Texto |
| --- | --- |
| `lista.h2` | Entre na lista de espera |
| `lista.texto` | Deixe seu e-mail e a gente avisa quando a Aspen Key for lançada. O seu e-mail serve só para esse aviso. |
| `lista.carregando` | Carregando o formulário... |
| `lista.erro_carregar` | O formulário não carregou. Você pode abrir a lista de espera em outra aba. |
| `lista.link_fallback` | Abrir a lista de espera em outra aba |
| `lista.noscript` | Para ver o formulário aqui, ative o JavaScript. Ou abra a lista de espera em outra aba. |
| `lista.consentimento` | Ao entrar na lista, você aceita receber um e-mail da Aspen Core quando a Aspen Key for lançada. O formulário é do Tally, que guarda os dados na União Europeia. Você pode sair quando quiser. Leia a Política de privacidade. |
| `lista.confirmacao` | Pronto, você está na lista de espera. Quando a Aspen Key for lançada, a gente te avisa por e-mail. |
| `lista.contato_outros` | Quer falar com a gente sobre investimento, imprensa ou outro assunto? Escreva para contato@seudominio.com.br. (PENDENTE_EMAIL) |
| `lista.rascunho_titulo` | PENDENTE: endereço do formulário do Tally |
| `lista.rascunho_texto` | Henrique, crie o formulário no Tally e troque PENDENTE_TALLY_ID pelo código dele em index.html. Enquanto isso, o botão abaixo fica desativado. |
| `lista.rascunho_campo_email` | Seu e-mail |
| `lista.rascunho_placeholder_email` | nome@exemplo.com |
| `lista.rascunho_checkbox` | Quero receber um e-mail quando a Aspen Key for lançada. |
| `lista.rascunho_botao` | Entrar na lista de espera |

### Lista de espera (configuração dentro do Tally)

| Chave | Texto |
| --- | --- |
| `tally.nome_formulario` | Lista de espera Aspen Key |
| `tally.campo_email_pergunta` | Seu e-mail |
| `tally.campo_email_placeholder` | nome@exemplo.com |
| `tally.campo_nome_pergunta` | Como podemos te chamar? (opcional) |
| `tally.campo_checkbox` | Quero receber um e-mail quando a Aspen Key for lançada. |
| `tally.texto_antes_do_botao` | Ao entrar na lista, você aceita receber um e-mail da Aspen Core quando a Aspen Key for lançada. O formulário é do Tally, que guarda os dados na União Europeia. Você pode sair quando quiser. Leia a Política de privacidade. |
| `tally.botao` | Entrar na lista de espera |
| `tally.agradecimento_titulo` | Pronto, você está na lista |
| `tally.agradecimento_texto` | Quando a Aspen Key for lançada, a gente te avisa por e-mail. Enquanto isso, no Instagram @aspencore_ tem dicas para se defender de golpes digitais. |
| `tally.erro_email_invalido` | Confira o e-mail. Ele precisa ter o formato nome@exemplo.com. |
| `tally.erro_email_vazio` | Escreva o seu e-mail para entrar na lista. |
| `tally.erro_checkbox` | Marque a caixa para receber o aviso de lançamento. |
| `tally.campos_ocultos` | utm_source, utm_medium, utm_content |

### Perguntas frequentes

Título: Perguntas frequentes

| Id | Pergunta | Resposta |
| --- | --- | --- |
| `faq-funciona` | Já funciona? | Em parte. O protótipo já calcula hash e executa criptografia assimétrica com um chip de segurança criptográfico. Ele ainda não se conecta a nenhum site, app ou conta. |
| `faq-senha` | Substitui a minha senha? | Não. A ideia é que a chave venha junto com a senha, como uma confirmação a mais de que é você. |
| `faq-data` | Quando lança? | Ainda não há data. Se você entrar na lista de espera, a gente avisa por e-mail quando houver. |
| `faq-preco` | Quanto custa? | Ainda não há preço. |
| `faq-tecnico` | O que é hash e criptografia assimétrica? | Hash é um cálculo que transforma qualquer dado num código curto, como uma impressão digital desse dado. Criptografia assimétrica usa um par de chaves, uma secreta e outra que pode ser mostrada, e permite provar quem é sem revelar a parte secreta. O protótipo já faz esses dois tipos de cálculo com um chip de segurança criptográfico. |
| `faq-design` | Por que o design pode mudar? | Porque é um protótipo. Formato, acabamento e detalhes ainda podem mudar até a versão final. |
| `faq-email` | O que vocês fazem com o meu e-mail? | Usamos só para avisar quando a Aspen Key for lançada. Você pode pedir para sair da lista quando quiser, pelo contato@seudominio.com.br. Os detalhes estão na Política de privacidade. |
| `faq-quem` | Quem está por trás da Aspen Core? | A Aspen Core é uma empresa brasileira em fase de protótipo, que está desenvolvendo a Aspen Key. No Instagram @aspencore_, a gente publica conteúdo sobre como se defender de golpes digitais. |

### Rodapé

| Chave | Texto |
| --- | --- |
| `rodape.lema_linhas` | Aproxime / Confie / Acesse |
| `rodape.sobre` | Aspen Core, empresa brasileira em fase de protótipo. |
| `rodape.instagram` | @aspencore_ no Instagram |
| `rodape.contato` | contato@seudominio.com.br (PENDENTE_EMAIL) |
| `rodape.privacidade` | Política de privacidade |
| `rodape.aviso` | Protótipo em desenvolvimento. O design final pode mudar. |
| `rodape.copyright` | © 2026 Aspen Core |

O lema no rodapé e na imagem de compartilhamento vira três linhas sem pontos: Aproxime, Confie, Acesse (uma palavra por linha, caixa alta pelo CSS).


### Política de privacidade (texto completo)

**h1** Política de privacidade

Atualizada em PENDENTE_DATA.

Esta página explica, em linguagem simples, o que a Aspen Core faz com os dados de quem entra na lista de espera da Aspen Key. Ela segue a Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018).

**h2** Quem cuida dos seus dados

A controladora dos dados é a Aspen Core (PENDENTE_CONTROLADOR: razão social e CNPJ, ou nome completo do responsável se ainda não houver CNPJ). Para qualquer assunto de privacidade, escreva para contato@seudominio.com.br.

**h2** Quais dados a gente coleta

- Seu e-mail, que você digita no formulário.
- Seu nome, só se você quiser informar.
- A marcação da campanha que trouxe você até aqui, quando o link tiver uma (por exemplo, utm_source=instagram). Ela diz de onde veio a visita, não quem você é.
- A confirmação de que você marcou a caixa de consentimento e a data da inscrição.

Não pedimos telefone, endereço nem documentos.

O Tally, que opera o formulário, pode registrar dados técnicos, como endereço IP e tipo de navegador, para o formulário funcionar e evitar abuso. Isso segue a política de privacidade do Tally, em tally.so/privacy.

**h2** Para que usamos

Só para mandar um e-mail avisando quando a Aspen Key for lançada. Não vendemos seus dados, não usamos para propaganda de outras empresas e não montamos perfil sobre você.

**h2** Base legal

Consentimento (LGPD, art. 7º, inciso I). Você dá o consentimento ao marcar a caixa no formulário e pode retirar quando quiser.

**h2** Com quem compartilhamos

Com ninguém, além do Tally (tally.so), que opera o formulário e guarda as inscrições em servidores na União Europeia. Isso é uma transferência internacional de dados. PENDENTE_TRANSFERENCIA: confirmar com quem cuida da LGPD a base dessa transferência (LGPD, art. 33).

**h2** Por quanto tempo guardamos

Até mandarmos o aviso de lançamento ou até você pedir para sair, o que acontecer primeiro. Se a Aspen Key não for lançada em até 24 meses depois da sua inscrição, apagamos o seu e-mail. PENDENTE_RETENCAO: Henrique confirmar esse prazo.

**h2** Seus direitos

- Confirmar se temos dados seus e ver quais são.
- Corrigir dados errados ou desatualizados.
- Pedir a exclusão dos seus dados.
- Retirar o consentimento a qualquer momento.
- Saber com quem compartilhamos seus dados.
- Pedir a portabilidade dos seus dados.
- Pedir a anonimização ou o bloqueio de dados desnecessários.
- Reclamar na Autoridade Nacional de Proteção de Dados (ANPD).

**h2** Como pedir a exclusão ou usar seus direitos

Mande um e-mail para contato@seudominio.com.br, do mesmo endereço que você cadastrou, com o assunto Privacidade. A gente responde em até 15 dias.

**h2** Cookies e rastreadores

Este site não usa cookies nem ferramentas de rastreamento. O formulário é carregado do site do Tally e segue a política dele.

**h2** Canal sobre dados pessoais

O canal para falar com a Aspen Core sobre dados pessoais é o contato@seudominio.com.br. PENDENTE_ENCARREGADO: confirmar se a Aspen Core se enquadra como agente de tratamento de pequeno porte (Resolução CD/ANPD nº 2/2022) e, se não, indicar aqui o nome do encarregado.

**h2** Idade

A lista de espera é para pessoas com 18 anos ou mais.

**h2** Mudanças nesta política

Se esta política mudar, a data no topo da página muda junto.

Link final: Voltar para o início


### Página 404

| Chave | Texto |
| --- | --- |
| `erro404.h1` | Página não encontrada |
| `erro404.texto` | O endereço pode ter mudado ou ter sido digitado errado. |
| `erro404.botao` | Voltar para o início |

### Imagem de compartilhamento (texto dentro da imagem)

| Chave | Texto |
| --- | --- |
| `og_imagem.marca` | Aspen Core |
| `og_imagem.lema_linhas` | Aproxime / Confie / Acesse |
| `og_imagem.linha` | Aspen Key, chave física em desenvolvimento |
| `og_imagem.aviso` | Protótipo em desenvolvimento. O design final pode mudar. |

### Fatos que sustentam o texto

| Id | Fato |
| --- | --- |
| F1 | O protótipo existe como hardware e funciona parcialmente. |
| F2 | Hoje o protótipo calcula hash. |
| F3 | Hoje o protótipo executa criptografia assimétrica usando um chip de segurança criptográfico (modelo pendente de confirmação). |
| F4 | Hoje o protótipo não se conecta a nenhum site, app ou conta. |
| F5 | Visão do produto, sempre rotulada como visão: no futuro, encostar a chave no celular para confirmar que é você ao entrar numa conta, além da senha. |
| F6 | Lema da marca: Aproxime. Confie. Acesse. |
| F7 | Aviso obrigatório: Protótipo em desenvolvimento. O design final pode mudar. |
| F8 | Forma do protótipo: bastão de metal preto escovado, cerca de 20 mm de largura por 6,6 mm de espessura, conector USB-C, faixa fina de LED ciano, escudo da marca gravado discretamente, anel no topo. |
| F9 | A Aspen Core é uma empresa brasileira em estágio de protótipo e a Aspen Key é o produto em desenvolvimento. |
| F10 | O Instagram @aspencore_ publica conteúdo sobre como se defender de golpes digitais. |
| F11 | A lista de espera usa um formulário do Tally e serve para avisar sobre o lançamento. |
| F12 | Não há data de lançamento nem preço. O briefing proíbe afirmar os dois e manda responder 'Ainda não há data' e 'Ainda não há preço'. |
| F13 | As imagens da chave e do celular são renders 3D feitos a partir do protótipo (brand/BRAND.md). As telas de celular mostram um fluxo que ainda não existe. |
| F14 | O Tally diz ser feito e hospedado na União Europeia (tally.so/help/cookie-policy, consultado em 20/10/2026). |
| F15 | Decisão de produto deste plano: o site é estático, sem cookies e sem rastreadores na primeira versão. |
| G1 | Conhecimento geral, sem número: em conta que só pede senha, quem sabe a senha consegue entrar; mensagens com link falso e páginas que imitam bancos são usadas para obter senhas. |
| G2 | Definição técnica geral: hash transforma um dado num código curto de tamanho fixo; criptografia assimétrica usa um par de chaves (privada e pública) e permite provar a posse da chave privada sem revelá-la. |
| L1 | LGPD, Lei 13.709/2018: consentimento (art. 7º, I), direitos do titular (art. 18), transferência internacional (art. 33). |
| P1 | Regra de operação proposta neste plano para a lista de espera (uso só para o aviso, prazo de guarda, resposta em até 15 dias). Pendente de confirmação do Henrique. |

### Tabela frase do site para fato

Frases sem fato (vazias) são navegação, instrução ou pendência e não afirmam nada sobre produto, empresa ou números.

| Onde | Frase | Fatos |
| --- | --- | --- |
| `meta.index.title` | Aspen Key \| Chave física em desenvolvimento da Aspen Core | F9, F1 |
| `meta.index.description` | Aspen Key, chave física em desenvolvimento. A ideia é encostar no celular para confirmar que é você, além da senha. Veja o protótipo e entre na lista. | F1, F5, F11 |
| `meta.index.og_title` | Aspen Key \| Protótipo em desenvolvimento | F1, F7 |
| `meta.index.og_description` | Uma chave física pensada para confirmar que é você, além da senha. Veja o que o protótipo já faz e entre na lista de espera. | F5, F1, F11 |
| `meta.index.og_image_alt` | Aspen Key, bastão preto com faixa de luz ciano e anel de chaveiro, ao lado das palavras Aproxime, Confie e Acesse. Protótipo em desenvolvimento. | F8, F6, F7, F13 |
| `meta.privacidade.title` | Política de privacidade \| Aspen Core | L1 |
| `meta.privacidade.description` | Como a Aspen Core usa o e-mail que você deixa na lista de espera da Aspen Key, por quanto tempo guarda e como pedir a exclusão. | F11, P1, L1 |
| `comum.marca` | Aspen Core | F9 |
| `comum.nav_lista` | Lista de espera | F11 |
| `comum.aviso_prototipo` | Protótipo em desenvolvimento. O design final pode mudar. | F7 |
| `comum.cta_lista` | Entrar na lista de espera | F11 |
| `hero.h1` | A chave física que vai confirmar que é você | F5, F8 |
| `hero.sub` | Essa é a Aspen Key. A ideia é que, ao entrar numa conta, além da senha, você encoste a chave no celular. | F5 |
| `hero.cta` | Entrar na lista de espera | F11 |
| `hero.aviso_titulo` | Protótipo em desenvolvimento. O design final pode mudar. | F7 |
| `hero.aviso_texto` | Hoje ele ainda não se conecta a nenhum site, app ou conta. | F4 |
| `hero.aviso_link` | Ver o que o protótipo já faz | F1, F2, F3 |
| `hero.figura_legenda` | Ilustração da ideia final. O protótipo de hoje é diferente. | F13 |
| `hero.figura_alt` | Aspen Key, um bastão fino de metal preto escovado com conector USB-C numa ponta, uma faixa fina de luz ciano e um anel de chaveiro na outra ponta. | F8 |
| `problema.h2` | Quem descobre a sua senha pode entrar como se fosse você | G1 |
| `problema.texto` | Uma mensagem com link falso, uma página que imita a do banco, e a senha que você digita ali vai parar na mão de outra pessoa. | G1 |
| `problema.ponte` | A Aspen Key está sendo criada para somar mais uma prova de que é você, além da senha. Uma coisa física, que fica no seu chaveiro. | F5, F8 |
| `problema.figura_alt` | Celular com uma notificação fictícia chamada Aviso de bloqueio, dizendo que a conta será suspensa hoje e trazendo o link site-do-banco.exemplo-falso. | F13 |
| `problema.figura_legenda` | Ilustração com um exemplo fictício de mensagem de golpe. | F13 |
| `ideia.h2` | A ideia em três passos | F5, F6 |
| `ideia.intro` | Esta é a visão do produto. Ainda não é assim que o protótipo funciona hoje. | F5, F4 |
| `ideia.passos[1].nome` | Aproxime | F6 |
| `ideia.passos[1].texto` | Na hora de entrar numa conta, depois da senha, você encosta a Aspen Key no celular. | F5 |
| `ideia.passos[2].nome` | Confie | F6 |
| `ideia.passos[2].texto` | A chave confirma que quem está entrando é você, e não alguém que só sabe a sua senha. | F5 |
| `ideia.passos[3].nome` | Acesse | F6 |
| `ideia.passos[3].texto` | Com a senha e a chave, você entra na sua conta. | F5 |
| `ideia.figura1_alt` | Ilustração de um celular na tela de entrar numa conta, com o pedido Confirme com a Aspen Key e a instrução Aproxime a chave do celular. | F13, F5 |
| `ideia.figura2_alt` | Ilustração da Aspen Key encostada na lateral de um celular que mostra a mensagem Acesso confirmado. | F13, F5 |
| `ideia.legenda_ilustracao` | Ilustração de como será, ainda não funciona assim | F13, F4 |
| `prototipo.h2` | O protótipo hoje | F1 |
| `prototipo.lead` | Ele já existe como peça física e funciona em parte. Aqui está o que ele faz agora e o que ainda falta. | F1 |
| `prototipo.foto_alt` | Imagem de referência do protótipo da Aspen Key, bastão preto com conector USB-C, faixa de luz ciano e anel de chaveiro, sobre fundo escuro. | F8 |
| `prototipo.foto_legenda` | Imagem de referência do protótipo. | F13 |
| `prototipo.ficha_titulo` | Ficha do protótipo | F8 |
| `prototipo.ficha[1]` | Formato: Bastão de metal preto escovado | F8 |
| `prototipo.ficha[2]` | Largura: Cerca de 20 mm | F8 |
| `prototipo.ficha[3]` | Espessura: Cerca de 6,6 mm | F8 |
| `prototipo.ficha[4]` | Conector: USB-C | F8 |
| `prototipo.ficha[5]` | Luz: Faixa fina de LED ciano | F8 |
| `prototipo.ficha[6]` | Topo: Anel para chaveiro | F8 |
| `prototipo.ficha[7]` | Marca: Escudo da Aspen gravado de forma discreta | F8 |
| `prototipo.ficha[8]` | Chip: Chip de segurança criptográfico | F3 |
| `prototipo.detalhes[1].legenda` | Conector USB-C | F8, F13 |
| `prototipo.detalhes[1].alt` | Close do conector USB-C metálico da Aspen Key. | F8, F13 |
| `prototipo.detalhes[2].legenda` | Faixa de LED e escudo gravado | F8, F13 |
| `prototipo.detalhes[2].alt` | Close da faixa fina de luz ciano e do escudo da marca gravado no corpo preto. | F8, F13 |
| `prototipo.detalhes[3].legenda` | Anel no topo | F8, F13 |
| `prototipo.detalhes[3].alt` | Close da ponta da Aspen Key com o furo e o anel de chaveiro de aço escuro. | F8, F13 |
| `prototipo.detalhes_legenda` | Imagens 3D feitas a partir do protótipo. | F13 |
| `prototipo.hoje_titulo` | Hoje ele faz | F1 |
| `prototipo.hoje_itens[1]` | Calcula hash. | F2 |
| `prototipo.hoje_itens[2]` | Executa criptografia assimétrica com um chip de segurança criptográfico. | F3 |
| `prototipo.hoje_itens[3]` | Existe como peça física, com conector USB-C, faixa de LED e anel. | F1, F8 |
| `prototipo.ainda_titulo` | Ainda não faz | F4 |
| `prototipo.ainda_itens[1]` | Não se conecta a nenhum site, app ou conta. | F4 |
| `prototipo.ainda_itens[2]` | Não confirma o seu acesso quando encosta no celular. Isso ainda é a visão do produto. | F4, F5 |
| `prototipo.ainda_itens[3]` | Ainda não está à venda. | F12, F9 |
| `prototipo.link_tecnico` | O que é hash e criptografia assimétrica? | G2 |
| `prototipo.video_titulo` | O protótipo funcionando | F1 |
| `prototipo.video_legenda` | Vídeo do protótipo calculando hash e fazendo criptografia assimétrica. | F2, F3 |
| `prototipo.aviso` | Protótipo em desenvolvimento. O design final pode mudar. | F7 |
| `prototipo.cta` | Entrar na lista de espera | F11 |
| `lista.h2` | Entre na lista de espera | F11 |
| `lista.texto` | Deixe seu e-mail e a gente avisa quando a Aspen Key for lançada. O seu e-mail serve só para esse aviso. | F11, P1 |
| `lista.link_fallback` | Abrir a lista de espera em outra aba | F11 |
| `lista.consentimento` | Ao entrar na lista, você aceita receber um e-mail da Aspen Core quando a Aspen Key for lançada. O formulário é do Tally, que guarda os dados na União Europeia. Você pode sair quando quiser. Leia a Política de privacidade. | F11, F14, P1, L1 |
| `lista.confirmacao` | Pronto, você está na lista de espera. Quando a Aspen Key for lançada, a gente te avisa por e-mail. | F11, P1 |
| `lista.rascunho_checkbox` | Quero receber um e-mail quando a Aspen Key for lançada. | F11 |
| `lista.rascunho_botao` | Entrar na lista de espera | F11 |
| `tally.nome_formulario` | Lista de espera Aspen Key | F11 |
| `tally.campo_checkbox` | Quero receber um e-mail quando a Aspen Key for lançada. | F11 |
| `tally.texto_antes_do_botao` | Ao entrar na lista, você aceita receber um e-mail da Aspen Core quando a Aspen Key for lançada. O formulário é do Tally, que guarda os dados na União Europeia. Você pode sair quando quiser. Leia a Política de privacidade. | F11, F14, P1 |
| `tally.botao` | Entrar na lista de espera | F11 |
| `tally.agradecimento_titulo` | Pronto, você está na lista | F11 |
| `tally.agradecimento_texto` | Quando a Aspen Key for lançada, a gente te avisa por e-mail. Enquanto isso, no Instagram @aspencore_ tem dicas para se defender de golpes digitais. | F11, F10 |
| `faq.faq-funciona.resposta` | Em parte. O protótipo já calcula hash e executa criptografia assimétrica com um chip de segurança criptográfico. Ele ainda não se conecta a nenhum site, app ou conta. | F1, F2, F3, F4 |
| `faq.faq-senha.resposta` | Não. A ideia é que a chave venha junto com a senha, como uma confirmação a mais de que é você. | F5 |
| `faq.faq-data.resposta` | Ainda não há data. Se você entrar na lista de espera, a gente avisa por e-mail quando houver. | F12, F11 |
| `faq.faq-preco.resposta` | Ainda não há preço. | F12 |
| `faq.faq-tecnico.resposta` | Hash é um cálculo que transforma qualquer dado num código curto, como uma impressão digital desse dado. Criptografia assimétrica usa um par de chaves, uma secreta e outra que pode ser mostrada, e permite provar quem é sem revelar a parte secreta. O protótipo já faz esses dois tipos de cálculo com um chip de segurança criptográfico. | G2, F2, F3 |
| `faq.faq-design.resposta` | Porque é um protótipo. Formato, acabamento e detalhes ainda podem mudar até a versão final. | F7, F1 |
| `faq.faq-email.resposta` | Usamos só para avisar quando a Aspen Key for lançada. Você pode pedir para sair da lista quando quiser, pelo contato@seudominio.com.br. Os detalhes estão na Política de privacidade. | F11, P1 |
| `faq.faq-quem.resposta` | A Aspen Core é uma empresa brasileira em fase de protótipo, que está desenvolvendo a Aspen Key. No Instagram @aspencore_, a gente publica conteúdo sobre como se defender de golpes digitais. | F9, F10 |
| `rodape.lema_linhas` | Aproxime / Confie / Acesse | F6 |
| `rodape.sobre` | Aspen Core, empresa brasileira em fase de protótipo. | F9 |
| `rodape.instagram` | @aspencore_ no Instagram | F10 |
| `rodape.privacidade` | Política de privacidade | L1 |
| `rodape.aviso` | Protótipo em desenvolvimento. O design final pode mudar. | F7 |
| `rodape.copyright` | © 2026 Aspen Core | F9 |
| `privacidade.h1` | Política de privacidade | L1 |
| `privacidade.intro` | Esta página explica, em linguagem simples, o que a Aspen Core faz com os dados de quem entra na lista de espera da Aspen Key. Ela segue a Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018). | L1, F11 |
| `privacidade.secao[1] Quem cuida dos seus dados` | A controladora dos dados é a Aspen Core (PENDENTE_CONTROLADOR: razão social e CNPJ, ou nome completo do responsável se ainda não houver CNPJ). Para qualquer assunto de privacidade, escreva para contato@seudominio.com.br. | F9, L1 |
| `privacidade.secao[2] Quais dados a gente coleta` | Seu e-mail, que você digita no formulário. Seu nome, só se você quiser informar. A marcação da campanha que trouxe você até aqui, quando o link tiver uma (por exemplo, utm_source=instagram). Ela diz de onde veio a visita, não quem você é. A confirmação de que você marcou a caixa de consentimento e a data da inscrição. Não pedimos telefone, endereço nem documentos. O Tally, que opera o formulário, pode registrar dados técnicos, como endereço IP e tipo de navegador, para o formulário funcionar e evitar abuso. Isso segue a política de privacidade do Tally, em tally.so/privacy. | F11, P1 |
| `privacidade.secao[3] Para que usamos` | Só para mandar um e-mail avisando quando a Aspen Key for lançada. Não vendemos seus dados, não usamos para propaganda de outras empresas e não montamos perfil sobre você. | P1 |
| `privacidade.secao[4] Base legal` | Consentimento (LGPD, art. 7º, inciso I). Você dá o consentimento ao marcar a caixa no formulário e pode retirar quando quiser. | L1 |
| `privacidade.secao[5] Com quem compartilhamos` | Com ninguém, além do Tally (tally.so), que opera o formulário e guarda as inscrições em servidores na União Europeia. Isso é uma transferência internacional de dados. PENDENTE_TRANSFERENCIA: confirmar com quem cuida da LGPD a base dessa transferência (LGPD, art. 33). | F14, L1 |
| `privacidade.secao[6] Por quanto tempo guardamos` | Até mandarmos o aviso de lançamento ou até você pedir para sair, o que acontecer primeiro. Se a Aspen Key não for lançada em até 24 meses depois da sua inscrição, apagamos o seu e-mail. PENDENTE_RETENCAO: Henrique confirmar esse prazo. | P1 |
| `privacidade.secao[7] Seus direitos` | Confirmar se temos dados seus e ver quais são. Corrigir dados errados ou desatualizados. Pedir a exclusão dos seus dados. Retirar o consentimento a qualquer momento. Saber com quem compartilhamos seus dados. Pedir a portabilidade dos seus dados. Pedir a anonimização ou o bloqueio de dados desnecessários. Reclamar na Autoridade Nacional de Proteção de Dados (ANPD). | L1 |
| `privacidade.secao[8] Como pedir a exclusão ou usar seus direitos` | Mande um e-mail para contato@seudominio.com.br, do mesmo endereço que você cadastrou, com o assunto Privacidade. A gente responde em até 15 dias. | P1, L1 |
| `privacidade.secao[9] Cookies e rastreadores` | Este site não usa cookies nem ferramentas de rastreamento. O formulário é carregado do site do Tally e segue a política dele. | F15 |
| `privacidade.secao[10] Canal sobre dados pessoais` | O canal para falar com a Aspen Core sobre dados pessoais é o contato@seudominio.com.br. PENDENTE_ENCARREGADO: confirmar se a Aspen Core se enquadra como agente de tratamento de pequeno porte (Resolução CD/ANPD nº 2/2022) e, se não, indicar aqui o nome do encarregado. | L1 |
| `privacidade.secao[11] Idade` | A lista de espera é para pessoas com 18 anos ou mais. | P1 |
| `privacidade.secao[12] Mudanças nesta política` | Se esta política mudar, a data no topo da página muda junto. | P1 |
| `og_imagem.marca` | Aspen Core | F9 |
| `og_imagem.lema_linhas` | Aproxime / Confie / Acesse | F6 |
| `og_imagem.linha` | Aspen Key, chave física em desenvolvimento | F1, F8 |
| `og_imagem.aviso` | Protótipo em desenvolvimento. O design final pode mudar. | F7 |
<!-- COPY_AUTOGERADO_FIM -->

---

## 5. Sistema de design

### 5.1 Tokens de cor

```css
:root {
  --c-creme: #F6F6EA;
  --c-petroleo: #255B62;
  --c-petroleo-hover: #1F4D53;   /* 15% de preto no petróleo */
  --c-petroleo-ativo: #1C444A;   /* 25% de preto no petróleo */
  --c-amarelo: #FBEFC9;
  --c-texto: #3A3A2E;
  --c-texto-suave: #606054;      /* 20% de creme no texto */
  --c-borda-clara: #858579;      /* 42% de creme no texto, 3,43:1 no creme */
  --c-azul-claro: #A9CBDD;
  --c-oliva: #A7A98A;
  --c-oliva-circulo: #DADBC8;    /* 35% de oliva no creme */
  --c-tile: #E6E7D7;             /* 20% de oliva no creme */
  --c-erro: #A3341F;
  --c-noite-1: #0A2935;
  --c-noite-2: #061A23;
  --c-noite-texto: #EFE8D6;
  --c-noite-suave: #B6B8AE;      /* 25% de noite no creme noturno */
  --c-noite-borda: #717F7D;
  --c-acento: #3C94A4;
  --c-dourado: #D2B17A;
  --c-led: #94F7FE;              /* só no brilho do LED */
}
.modo-claro    { --fundo: var(--c-creme); --texto: var(--c-texto); --texto-suave: var(--c-texto-suave);
                 --borda: var(--c-borda-clara); --foco: var(--c-petroleo); --link: var(--c-petroleo);
                 --fonte: var(--f-poppins); color-scheme: light; }
.modo-escuro   { --fundo: var(--c-noite-1); --texto: var(--c-noite-texto); --texto-suave: var(--c-noite-suave);
                 --borda: var(--c-noite-borda); --foco: var(--c-dourado); --link: var(--c-noite-texto);
                 --fonte: var(--f-mono); color-scheme: dark; }
.modo-petroleo { --fundo: var(--c-petroleo); --texto: var(--c-amarelo); --texto-suave: var(--c-amarelo);
                 --borda: var(--c-amarelo); --foco: var(--c-amarelo); --link: var(--c-amarelo);
                 --fonte: var(--f-poppins); color-scheme: dark; }
.noite { background: linear-gradient(180deg, var(--c-noite-1) 0%, var(--c-noite-2) 100%); }
body { background: var(--c-creme); }
```

Cada seção usa `background: var(--fundo); color: var(--texto); font-family: var(--fonte);`. Componentes só usam as variáveis semânticas (`--texto`, `--borda`, `--foco`), nunca o hex direto. O site não muda com o modo escuro do sistema operacional: os modos são da marca e têm significado.

### 5.2 Contraste (calculado pela fórmula da WCAG)

| Uso | Frente | Fundo | Razão | Mínimo | Passa |
| --- | --- | --- | --- | --- | --- |
| Texto corrido claro | #3A3A2E | #F6F6EA | 10,57 | 4,5 | sim |
| Texto suave claro (legendas) | #606054 | #F6F6EA | 5,85 | 4,5 | sim |
| Texto suave no painel da lista | #606054 | #FBEFC9 | 5,55 | 4,5 | sim |
| Link e títulos petróleo | #255B62 | #F6F6EA | 7,01 | 4,5 | sim |
| Bloco de título | #FBEFC9 | #255B62 | 6,65 | 4,5 | sim |
| Botão petróleo (normal) | #FBEFC9 | #255B62 | 6,65 | 4,5 | sim |
| Botão petróleo (hover) | #FBEFC9 | #1F4D53 | 8,15 | 4,5 | sim |
| Botão petróleo (ativo) | #FBEFC9 | #1C444A | 9,26 | 4,5 | sim |
| Aviso claro | #3A3A2E | #FBEFC9 | 10,03 | 4,5 | sim |
| Etiqueta de ilustração | #3A3A2E | #A9CBDD | 6,73 | 4,5 | sim |
| Erro no claro | #A3341F | #F6F6EA | 6,29 | 4,5 | sim |
| Texto escuro (pior ponto do degradê) | #EFE8D6 | #0A2935 | 12,44 | 4,5 | sim |
| Texto escuro (fim do degradê) | #EFE8D6 | #061A23 | 14,57 | 4,5 | sim |
| Texto suave escuro | #B6B8AE | #0A2935 | 7,57 | 4,5 | sim |
| Acento em título grande (29 px ou mais, negrito) | #3C94A4 | #0A2935 | 4,32 | 3,0 | sim, só texto grande |
| Acento em texto pequeno | #3C94A4 | #0A2935 | 4,32 | 4,5 | NÃO. Proibido usar o acento em texto menor que 24 px (ou 18,66 px em negrito) |
| Botão claro no escuro | #0A2935 | #EFE8D6 | 12,44 | 4,5 | sim |
| Botão claro no escuro (hover) | #0A2935 | #FBEFC9 | 13,24 | 4,5 | sim |
| Rodapé | #FBEFC9 | #255B62 | 6,65 | 4,5 | sim |
| Anel de foco claro | #255B62 | #F6F6EA | 7,01 | 3,0 | sim |
| Anel de foco escuro (dourado) | #D2B17A | #0A2935 | 7,46 | 3,0 | sim |
| Anel de foco no rodapé | #FBEFC9 | #255B62 | 6,65 | 3,0 | sim |
| Borda de campo no claro | #858579 | #F6F6EA | 3,43 | 3,0 | sim |
| Borda tracejada no escuro | #717F7D | #0A2935 | 3,64 | 3,0 | sim |
| Ícone de aviso dourado | #D2B17A | #0A2935 | 7,46 | 3,0 | sim |
| Oliva, azul-claro e #DADBC8 sobre o creme | | | 1,57 a 2,22 | | só decoração, nunca texto nem borda de controle |

### 5.3 Tipografia

Famílias

```css
--f-poppins: "Poppins", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
--f-mono: "Space Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, "Courier New", monospace;
```

`@font-face` com `font-display: swap` para os cinco arquivos. Pré-carregar só `spacemono-700.woff2` e `spacemono-400.woff2` (fontes do topo). Poppins não é pré-carregada.

Escala do modo claro (Poppins)

| Papel | Tamanho | Peso | Altura de linha | Caixa | Espaçamento |
| --- | --- | --- | --- | --- | --- |
| h1 (privacidade) | clamp(1.75rem, 1.35rem + 1.8vw, 2.75rem) | 700 | 1.15 | alta | 0.06em |
| h2 em bloco | clamp(1.375rem, 1.1rem + 1.2vw, 2rem) | 700 | 1.5 (o bloco precisa de folga) | alta | 0.06em |
| h3 (passos, ficha, listas) | 1.125rem, 1.25rem a partir de 1024 | 700 | 1.3 | alta | 0.08em |
| lead | 1.1875rem, 1.375rem a partir de 1024 | 400 | 1.5 | normal | 0 |
| corpo | 1.0625rem, 1.125rem a partir de 1024 | 400 | 1.6 | normal | 0 |
| pequeno (legendas, consentimento) | 0.875rem | 400 | 1.5 | normal | 0 |
| rótulo da ficha | 0.875rem | 600 | 1.4 | normal | 0 |
| botão | 1rem | 600 | 1.2 | normal | 0.01em |
| marca "Aspen Core" | 0.9375rem | 700 | 1 | alta | 0.14em |
| lema do rodapé | 1.75rem, 2rem a partir de 1024 | 700 | 1.1 | alta | 0.06em |

Escala do modo escuro (Space Mono)

| Papel | Tamanho | Peso | Altura de linha | Caixa | Espaçamento |
| --- | --- | --- | --- | --- | --- |
| h1 | clamp(1.75rem, 1.2rem + 2.6vw, 3.25rem) (29 px em 390, 52 px em 1280) | 700 | 1.18 (folga para Ê e Í em caixa alta) | alta | 0.02em |
| h2 | clamp(1.375rem, 1.05rem + 1.6vw, 2.25rem) (23 px em 390, 36 px em 1280) | 700 | 1.2 | alta | 0.02em |
| corpo | 1rem, 1.0625rem a partir de 1024 | 400 | 1.65 | normal | 0 |
| pequeno | 0.875rem | 400 | 1.5 | normal | 0 |
| botão | 1rem | 700 | 1.2 | normal | 0 |
| marca | 0.9375rem | 700 | 1 | alta | 0.14em |

Regras

- `text-transform: uppercase` no CSS; texto em caixa normal no HTML.
- `text-wrap: balance` em h1 e h2; `text-wrap: pretty` em parágrafos.
- `hyphens: manual` em tudo (sem hifenização automática).
- `overflow-wrap: anywhere` em links de e-mail.
- Palavra de destaque (só h1 do hero e h2 do problema): `<span class="destaque">`, cor `--c-acento`.

Bloco de título (h2 do modo claro e h1 da privacidade)

```css
.titulo-bloco { display: inline; background: var(--c-petroleo); color: var(--c-amarelo);
  padding: 0.12em 0.4em; border-radius: 8px;
  -webkit-box-decoration-break: clone; box-decoration-break: clone; }
```

O `h2` recebe a classe; o bloco quebra em várias linhas mantendo o fundo em cada uma.

### 5.4 Espaçamento, raios, sombras e grade

- Base de 4 px. Escala: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 (`--e-1` a `--e-10`).
- Raios só do conjunto da marca: 8 px (botões, blocos de título, etiquetas, avisos, campos), 16 px (painéis, fotos, quadrados de detalhe), 999 px (bolinhas de estado e círculo dos números).
- Sombras: nenhuma na interface. As únicas sombras são as que já vêm dentro dos PNGs.
- Grade: `display: grid` com `grid-template-columns: repeat(12, 1fr)` a partir de 1024 e `repeat(8, 1fr)` entre 768 e 1023; uma coluna abaixo de 768. Contêiner `.conteudo { width: min(100% - 2 * var(--margem), 1120px); margin-inline: auto; }` com `--margem` de 20, 32 e 40 px.

### 5.5 Botões e links

| Variante | Onde | Normal | Hover | Ativo | Foco |
| --- | --- | --- | --- | --- | --- |
| `.botao--claro` | modo escuro (hero, 404) | fundo #EFE8D6, texto #0A2935 | fundo #FBEFC9 | fundo #E2D8BE | contorno 3 px #D2B17A, afastado 3 px |
| `.botao--petroleo` | modo claro | fundo #255B62, texto #FBEFC9 | fundo #1F4D53 | fundo #1C444A | contorno 3 px #255B62, afastado 3 px |
| `.botao[aria-disabled="true"]` | rascunho do formulário | fundo transparente, borda 1 px tracejada #858579, texto #606054, cursor `not-allowed` | sem mudança | sem mudança | contorno igual ao petróleo |

Medidas: altura mínima 52 px, padding 0 24 px, `display: inline-flex`, centralizado, raio 8 px. No celular (abaixo de 768) os botões do hero, do protótipo e da lista ocupam a largura toda; acima disso, largura automática. Transição só de `background-color`, 150 ms.

Links de texto: sempre sublinhados (`text-decoration-thickness: 1px; text-underline-offset: 0.2em`); no hover a espessura vai a 2 px. Links de navegação e do rodapé com alvo mínimo de 44 px de altura (padding vertical).

Foco: `:focus-visible { outline: 3px solid var(--foco); outline-offset: 3px; }` em tudo que recebe foco. Nunca `outline: none` sem substituto. `scroll-padding-top: 16px` e `scroll-padding-bottom: 16px` no `html`.

### 5.6 Componentes

- Aviso de protótipo `.aviso`: raio 8, padding 16, ícone `triangle-alert` (Lucide, 20 px, `aria-hidden="true"`, `stroke="currentColor"`) à esquerda, alinhado à primeira linha. Escuro: borda 1 px #D2B17A, ícone dourado, texto #EFE8D6, frase obrigatória em peso 700. Claro: fundo #FBEFC9, sem borda, ícone e texto #3A3A2E, frase obrigatória em peso 600. O SVG é copiado de `brand/icons/lucide/triangle-alert.svg` para dentro do HTML (inline), sem alterar os caminhos.
- Etiqueta de ilustração `.etiqueta-visao`: fundo #A9CBDD, texto #3A3A2E, Poppins 600 14 px, padding 6 px 12 px, raio 8. Sem ícone.
- Ficha `.ficha` (`dl`): `grid-template-columns: 110px 1fr` no celular e `160px 1fr` no desktop; cada par com borda inferior 1 px `--borda`, padding 12 px 0.
- Estados `.estado`: `ul` sem marcador nativo; `li::before` de 12 px. "Faz": círculo cheio #255B62. "Ainda não": anel com borda 2 px #606054 e centro transparente. O sentido está no título de cada lista; a forma só ajuda.
- Passos `.passos` (`ol`): cada `li` em grade `40px 1fr`, gap 16; número dentro de um círculo de 40 px com borda 2 px #255B62, Poppins 700 16 px #255B62; linha vertical de 2 px #DADBC8 entre os círculos. O número vem do HTML (texto "1", "2", "3" com `aria-hidden="true"`), e o `ol` já anuncia a ordem.
- Detalhe `.detalhe`: `figure` com quadrado 1:1, fundo #E6E7D7, raio 16, `overflow: hidden`; `figcaption` abaixo, 14 px.
- Slot `.slot`: no rascunho, caixa com borda 2 px tracejada #858579, raio 16, fundo #E6E7D7, texto PENDENTE centralizado na vertical, Poppins 600 14 px #3A3A2E. Com `data-modo="publicado"`, todo `.slot[data-vazio]` fica `display: none`.
- FAQ `details`: descrito em 3.6.

### 5.7 Estados do formulário

O formulário real vive dentro do iframe do Tally, que controla os estados dele. O site controla só o painel em volta e o rascunho. Tokens para os dois:

| Estado | Visual |
| --- | --- |
| Campo normal (rascunho) | altura 52 px, fundo #F6F6EA (o branco não faz parte da paleta), borda 1 px #858579, raio 8, texto 17 px |
| Campo desativado (rascunho) | igual ao normal, texto #606054, `disabled`, cursor `not-allowed` |
| Foco | contorno 3 px #255B62, afastado 2 px |
| Erro (reserva, caso um dia o formulário seja nosso) | borda 2 px #A3341F, mensagem 14 px #A3341F abaixo do campo, ligada por `aria-describedby`, começando pelo que houve e dizendo como resolver (textos em `tally.erro_*`) |
| Carregando | texto "Carregando o formulário..." em #606054, 14 px, na área reservada |
| Falha | texto `lista.erro_carregar` em #3A3A2E com o link de reserva em petróleo |
| Enviado | área `role="status"` com `lista.confirmacao`, Poppins 600 17 px #255B62, com uma bolinha cheia petróleo de 12 px antes |

---

## 6. Movimento

Regra geral: só `opacity` e `transform`. Nada anima ao rolar além dos passos. Nenhum movimento atrasa o texto do topo.

| O quê | Gatilho | Propriedades | Duração | Atraso | Curva |
| --- | --- | --- | --- | --- | --- |
| Brilho do LED no hero (o único momento orquestrado) | carregar a página | `opacity` 0 para 0,9 e depois 0,45 (fica parado em 0,45) | 1400 ms | 400 ms | `cubic-bezier(0.65, 0, 0.35, 1)` |
| Revelação dos passos | 25% da lista visível (IntersectionObserver), uma vez | `opacity` 0 para 1 e `translateY(12px)` para 0 | 300 ms cada | 0, 120 e 240 ms (por `nth-child`) | `cubic-bezier(0.2, 0.7, 0.2, 1)` |
| Hover de botão | ponteiro | `background-color` | 150 ms | 0 | `ease` |
| Sinal "+" do FAQ | abrir ou fechar | `rotate(0)` para `rotate(45deg)` | 200 ms | 0 | `cubic-bezier(0.2, 0.7, 0.2, 1)` |
| Rolagem suave para âncoras | clique em link interno | `scroll-behavior: smooth` | do navegador | | |

```css
@keyframes led-acende { 0% { opacity: 0; } 35% { opacity: .9; } 100% { opacity: .45; } }
.hero__brilho { opacity: .45; animation: led-acende 1400ms cubic-bezier(.65,0,.35,1) 400ms both; }

.js .passos li.revelar { opacity: 0; transform: translateY(12px); }
.js .passos li.revelar.visivel { opacity: 1; transform: none;
  transition: opacity 300ms cubic-bezier(.2,.7,.2,1), transform 300ms cubic-bezier(.2,.7,.2,1); }
.js .passos li.revelar:nth-child(2) { transition-delay: 120ms; }
.js .passos li.revelar:nth-child(3) { transition-delay: 240ms; }

@media (prefers-reduced-motion: no-preference) { html { scroll-behavior: smooth; } }
@media (prefers-reduced-motion: reduce) {
  .hero__brilho { animation: none; opacity: .45; }
  .js .passos li.revelar { opacity: 1; transform: none; transition: none; }
  * { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
}
```

O JS só adiciona a classe `revelar` aos passos se existir `IntersectionObserver` e se `matchMedia('(prefers-reduced-motion: reduce)')` for falso. Sem JS, os passos aparecem normais. A imagem da chave não tem animação de entrada (ela pode ser o elemento de LCP, e opacidade zero atrasaria a medição).

---

## 7. Figuras

### 7.1 Imagens exportadas

Script `ferramentas/exportar_imagens.py` (Pillow 12, já instalado). Para cada linha: abrir a origem, aplicar o recorte, redimensionar com `Image.LANCZOS` para cada largura (altura proporcional), salvar WebP `quality=80, method=6` (transparência mantida), em `public/assets/img/<nome>-<largura>.webp`. Imprimir tamanho de cada arquivo e falhar se passar do peso alvo em mais de 20%.

| Nome de saída | Origem (em `/home/claude/aspen-social-agent/brand/assets/`) | Recorte (caixa em px da origem) | Larguras | Atributos width x height no HTML | Peso alvo por arquivo | Alt (chave no copy.json) |
| --- | --- | --- | --- | --- | --- | --- |
| hero-chave-deitada | key/chave-deitada.png | getbbox do alfa = (28, 28, 1787, 1026) | 400, 800, 1200 | 800 x 454 | 15 / 40 / 70 KB | hero.figura_alt |
| hero-chave-3q | key/chave-3q.png | getbbox = (28, 28, 1637, 2700) | 560, 1120 | 560 x 930 | 40 / 95 KB | hero.figura_alt |
| marca-dagua-escudo | logo-escudo-creme.png | getbbox = (24, 24, 1443, 1454) | 720 (quality 70) | 720 x 726 | 35 KB | vazio (decorativa) |
| escudo-creme | logo-escudo-creme.png | getbbox | 64, 128 | 64 x 64 | 4 / 8 KB | vazio (texto ao lado) |
| escudo-petroleo | logo-escudo-petroleo.png | getbbox | 64, 128 | 64 x 64 | 4 / 8 KB | vazio (texto ao lado) |
| problema-celular-bloqueio | key/celular-bloqueio.png | getbbox = (28, 28, 950, 1783) | 320, 640, 960 | 640 x 1218 | 20 / 45 / 75 KB | problema.figura_alt |
| ideia-celular-aguardando | key/celular-aguardando.png | getbbox = (28, 28, 950, 1783) | 280, 560, 840 | 560 x 1066 | 18 / 40 / 70 KB | ideia.figura1_alt |
| ideia-toque-frente | key/toque-frente.png | getbbox = (28, 28, 1239, 1688) | 320, 640, 960 | 640 x 877 | 22 / 55 / 90 KB | ideia.figura2_alt |
| prototipo-referencia | aspen-key-prototipo-referencia.png | nenhum (1152 x 1536) | 600, 900, 1152 | 900 x 1200 | 12 / 22 / 32 KB | prototipo.foto_alt |
| detalhe-conector | key/detalhe-conector.png | (0, 0, 2036, 2036) | 240, 480, 720 | 480 x 480 | 8 / 18 / 35 KB | prototipo.detalhes[0].alt |
| detalhe-led | key/detalhe-led.png | (0, 0, 2101, 2101), para a faixa de LED não ser cortada | 240, 480, 720 | 480 x 480 | 8 / 18 / 35 KB | prototipo.detalhes[1].alt |
| detalhe-anel | key/detalhe-anel.png | (0, 0, 1707, 1707), para o anel aparecer inteiro | 240, 480, 720 | 480 x 480 | 14 / 32 / 55 KB | prototipo.detalhes[2].alt |

Pesos medidos num teste destas exportações: chave-3q 560 px ficou com cerca de 32 KB a 480 px e 80 KB a 960 px; chave-deitada 37 KB a 960 px; referência 27 KB a 1080 px; detalhes 7 a 32 KB. Os alvos acima têm folga.

Imagens não usadas, de propósito: `celular-confirmado`, `celular-frente`, `celular-3q-direita`, `celular-perfil`, `celular-e-chave-encostada`, `toque-3q-direita` (repetiriam a tela "Acesso confirmado"), `chave-frente`, `chave-perfil`, `chave-baixo`, `chave-topo`, `chave-3q-direita` (a ficha em texto cobre as medidas; ver a nota sobre cotas na seção 1.4). Se o Henrique quiser variar o topo, `chave-3q-direita.png` é a alternativa ao `chave-3q.png` (mesma pose espelhada).

Regras

- Nenhum dispositivo desenhado à mão, nem em CSS, nem em SVG. Só esses PNGs.
- Todo `img` tem `width`, `height`, `alt` (vazio só nas decorativas), `decoding="async"`; abaixo da dobra, `loading="lazy"`.
- Aviso de protótipo visível em toda seção que mostra a chave: hero (caixa de aviso), protótipo (caixa de aviso), rodapé, imagem de compartilhamento.
- Toda imagem com tela de celular do fluxo da Aspen Key leva a etiqueta "Ilustração de como será, ainda não funciona assim".

### 7.2 Figuras que faltam e como produzir sem desenhar à mão

| Figura | Como produzir |
| --- | --- |
| Imagem de compartilhamento `og-image.jpg` 1200 x 630 | Montar `origem/og.html` (abaixo) e fotografar com Playwright |
| Favicons | Pillow, a partir de `logo-escudo-creme.png` sobre quadrado petróleo |
| Brilho do LED | CSS (gradiente radial na posição medida da faixa); é a luz real do produto, permitida pela marca |
| Círculo atrás das ilustrações e fundo dos detalhes | CSS, forma geométrica simples em tom de mistura da paleta |
| Ícone do aviso | `triangle-alert.svg` do Lucide já vendorizado |
| Bolinhas de estado, números dos passos, sinal "+" do FAQ | forma geométrica em CSS e texto |
| Fotos reais e vídeo | só o Henrique (P01 a P05) |

Ícones disponíveis em `brand/icons/lucide/`: `key-round.svg`, `shield-check.svg`, `triangle-alert.svg`. O site usa só o `triangle-alert`. O `shield-check` fica de fora porque um escudo com "check" ao lado de qualquer frase sugere proteção garantida. Instagram e e-mail aparecem só como texto (logo de terceiros é proibido pela marca).

Imagem de compartilhamento (`origem/og.html`, 1200 x 630, modo escuro)

```
+------------------------------------------------------------------------------------+
| [escudo creme 56] ASPEN CORE            marca d'água escudo 6%, 760 px, x 700       |
|                                                   \  O                              |
| APROXIME          (Space Mono 700, 84 px,          \/   chave-3q, altura 600,       |
| CONFIE             cor #3C94A4, caixa alta,        /\   centro em x 900, y 330      |
| ACESSE             sem pontos)                    /  \                              |
|                                                  /____\                             |
| Aspen Key, chave física em desenvolvimento   (Space Mono 400, 30 px, #EFE8D6)      |
| ------- linha dourada 1 px, 96 px                                                  |
| Protótipo em desenvolvimento. O design final pode mudar.  (Space Mono 400, 24 px)  |
+------------------------------------------------------------------------------------+
margem 72 px, fundo linear-gradient(160deg, #0A2935, #061A23)
```

O `og.html` carrega as fontes de `../public/assets/fonts/` e as imagens de `../public/assets/img/` (hero-chave-3q-1120.webp, escudo-creme-128.webp, marca-dagua-escudo-720.webp). `ferramentas/gerar_og.py` abre o arquivo no Chromium (viewport 1200 x 630, escala 1), espera `document.fonts.ready`, tira a captura em PNG e salva `public/og-image.jpg` com Pillow em qualidade 85 (alvo até 150 KB). Conferir a captura: nada encostando nas bordas, texto do aviso inteiro.

Favicons (`ferramentas/gerar_favicons.py`)

- Base: quadrado #255B62 com o escudo creme centrado ocupando 76% do lado.
- `favicon.ico` com 16, 32 e 48 px (cantos com raio de 20% do lado).
- `apple-touch-icon.png` 180 x 180, sem cantos arredondados (o sistema arredonda), escudo a 70%.
- `icon-192.png` e `icon-512.png` (cantos retos) para o `site.webmanifest`:

```json
{ "name": "Aspen Core", "short_name": "Aspen Core", "icons": [
  { "src": "icon-192.png", "sizes": "192x192", "type": "image/png" },
  { "src": "icon-512.png", "sizes": "512x512", "type": "image/png" } ],
  "theme_color": "#0A2935", "background_color": "#F6F6EA", "display": "browser" }
```

### 7.3 Slots de foto e vídeo

Marcação dos slots (no rascunho aparecem; publicados vazios somem)

```html
<figure class="slot slot--foto" id="foto-mao" data-vazio>
  <!-- PENDENTE P02: foto do protótipo na mão. Trocar este conteúdo por <img> e remover data-vazio. -->
  <p class="slot__texto">PENDENTE: foto do protótipo na mão, para mostrar o tamanho (pendência P02).</p>
</figure>
```

No rascunho, enquanto não houver vídeo, o bloco é o mesmo `div.video.slot#video-prototipo`, com `data-vazio`, o h3, uma caixa `p.slot__texto` com `prototipo.video_pendente` (proporção 9:16, largura 70% no celular) e a transcrição com `prototipo.video_transcricao_pendente`.

Vídeo, quando chegar (P04 e P05)

```html
<div class="video slot" id="video-prototipo"><!-- data-vazio removido quando o vídeo chegou -->
<h3>O protótipo funcionando</h3>
<figure class="video__figura">
  <video controls playsinline preload="none" width="720" height="1280"
         poster="assets/video/prototipo-poster.webp">
    <source src="assets/video/prototipo.mp4" type="video/mp4">
    <!-- Só se o vídeo tiver fala: <track kind="captions" src="assets/video/prototipo.vtt" srclang="pt-BR" label="Português" default> -->
  </video>
  <figcaption>Vídeo do protótipo calculando hash e fazendo criptografia assimétrica.</figcaption>
</figure>
<h4>O que aparece no vídeo</h4>
<p class="video__transcricao"><!-- PENDENTE P05 -->(2 a 4 frases do Henrique)</p>
</div>
```

Sem `autoplay`. O vídeo fica fora do orçamento de 1,5 MB porque só baixa quando a pessoa toca no play.

Preparar o vídeo (comandos para o Sonnet rodar quando o arquivo chegar)

```
ffmpeg -i entrada.mov -vf "scale=-2:1280,fps=30" -c:v libx264 -profile:v high -crf 26 -preset slow \
       -movflags +faststart -an public/assets/video/prototipo.mp4
ffmpeg -ss 1 -i public/assets/video/prototipo.mp4 -frames:v 1 /tmp/poster.png
python3 -c "from PIL import Image; Image.open('/tmp/poster.png').resize((720,1280)).save('public/assets/video/prototipo-poster.webp', quality=80)"
```

Trocar `-an` por `-c:a aac -b:a 96k` se o vídeo tiver fala, e então criar a legenda `.vtt`. Alvo: até 4 MB para até 30 s. Se o vídeo vier na horizontal, trocar para `scale=1280:-2`, `width="1280" height="720"` e proporção 16:9 no slot.

---

## 8. Integração do Tally

### 8.1 O formulário que o Henrique cria no tally.so (P07)

Nomes de menus do Tally não foram confirmados nesta pesquisa; o conteúdo é este.

| Ordem | Bloco | Texto | Obrigatório |
| --- | --- | --- | --- |
| 1 | E-mail | `tally.campo_email_pergunta`, marcador `tally.campo_email_placeholder` | sim |
| 2 | Texto curto | `tally.campo_nome_pergunta` | não |
| 3 | Caixa de seleção (uma opção) | `tally.campo_checkbox` | sim |
| 4 | Texto | `tally.texto_antes_do_botao`, com "Política de privacidade" ligado a `https://seudominio.com.br/privacidade` | |
| 5 | Botão | `tally.botao` | |
| oculto | Campos ocultos | `utm_source`, `utm_medium`, `utm_content` | |
| fim | Página de agradecimento | `tally.agradecimento_titulo` e `tally.agradecimento_texto` | |

Também: idioma do formulário em português se a opção existir; mensagens de erro iguais às de `tally.erro_*` se o Tally permitir editar; notificação por e-mail a cada inscrição para o Henrique. O código do formulário aparece no link de compartilhamento (formato esperado `https://tally.so/r/CODIGO`; conferir na aba Share).

### 8.2 HTML da seção

```html
<section id="lista" class="lista modo-claro" aria-labelledby="lista-titulo"
         data-tally-id="PENDENTE_TALLY_ID"><!-- PENDENTE P07 -->
  <div class="conteudo lista__grade">
    <div class="lista__texto">
      <h2 id="lista-titulo"><span class="titulo-bloco">Entre na lista de espera</span></h2>
      <p>Deixe seu e-mail e a gente avisa quando a Aspen Key for lançada. O seu e-mail serve só para esse aviso.</p>
      <p class="pequeno">Quer falar com a gente sobre investimento, imprensa ou outro assunto?
         Escreva para <a href="mailto:contato@seudominio.com.br">contato@seudominio.com.br</a>.</p>
    </div>
    <div class="lista__painel">
      <!-- Rascunho: aparece só com código PENDENTE e data-modo="rascunho" -->
      <div class="lista__rascunho so-rascunho" hidden>
        <p class="lista__rascunho-titulo">PENDENTE: endereço do formulário do Tally</p>
        <p>Henrique, crie o formulário no Tally e troque PENDENTE_TALLY_ID pelo código dele em index.html. Enquanto isso, o botão abaixo fica desativado.</p>
        <label for="rascunho-email">Seu e-mail</label>
        <input id="rascunho-email" type="email" placeholder="nome@exemplo.com" disabled>
        <label class="lista__caixa"><input type="checkbox" disabled> Quero receber um e-mail quando a Aspen Key for lançada.</label>
        <button type="button" class="botao" aria-disabled="true" disabled>Entrar na lista de espera</button>
      </div>
      <!-- Formulário real -->
      <div class="lista__tally">
        <p class="lista__carregando" hidden>Carregando o formulário...</p>
        <iframe data-tally-src="https://tally.so/embed/PENDENTE_TALLY_ID?alignLeft=1&amp;hideTitle=1&amp;transparentBackground=1&amp;dynamicHeight=1"
                loading="lazy" width="100%" height="420" frameborder="0" marginheight="0" marginwidth="0"
                title="Formulário da lista de espera da Aspen Key"></iframe>
        <p class="lista__erro" hidden>O formulário não carregou. Você pode abrir a lista de espera em outra aba.
          <a class="lista__reserva" href="https://tally.so/r/PENDENTE_TALLY_ID" target="_blank" rel="noopener">Abrir a lista de espera em outra aba</a></p>
        <noscript><p>Para ver o formulário aqui, ative o JavaScript. Ou abra a lista de espera em outra aba.
          <a href="https://tally.so/r/PENDENTE_TALLY_ID" target="_blank" rel="noopener">Abrir a lista de espera em outra aba</a></p></noscript>
      </div>
    </div>
    <p class="lista__consentimento pequeno">Ao entrar na lista, você aceita receber um e-mail da Aspen Core quando a Aspen Key for lançada. O formulário é do Tally, que guarda os dados na União Europeia. Você pode sair quando quiser. Leia a <a href="privacidade.html">Política de privacidade</a>.</p>
    <p class="lista__status" role="status"></p>
  </div>
</section>
```

O CSS base tem `[hidden] { display: none !important; }`, para nenhuma regra de `display` vencer o atributo `hidden`. O `noscript` fica dentro de `.lista__tally`. O CSS esconde o iframe quando o `html` tem a classe `no-js` (o iframe vazio não serve para nada sem JS).

Links que abrem outra aba levam o aviso para leitor de tela: `<span class="visualmente-oculto"> (abre em outra aba)</span>` dentro do `a`.

### 8.3 Comportamento do `site.js` para o formulário

1. Ler `data-tally-id` da seção. Se estiver vazio ou começar com `PENDENTE`: mostrar `.lista__rascunho` (tirar `hidden`), esconder `.lista__tally`, não carregar nada do Tally e parar. O CSS ainda esconde `.so-rascunho` quando `data-modo="publicado"`, então um código pendente nunca aparece publicado (o `checar_pendentes.py --publicar` também bloqueia).
2. Campos ocultos (UTM): o `embed.js` do Tally repassa sozinho os parâmetros da página para o iframe (documentado). Por isso o JS não mexe no `data-tally-src`. O JS só acrescenta ao link de reserva (`.lista__reserva`) os parâmetros `utm_source`, `utm_medium` e `utm_content` da página, se existirem, depois de limpar cada valor: até 100 caracteres, só `[A-Za-z0-9_.-]`, `encodeURIComponent`. Nenhum outro parâmetro é copiado.
3. Carregar o script quando a seção chegar a 800 px da tela (`IntersectionObserver` com `rootMargin: '800px 0px'`; sem `IntersectionObserver`, carregar logo): criar `<script src="https://tally.so/widgets/embed.js" async>`, no `onload` chamar `window.Tally && window.Tally.loadEmbeds()`, no `onerror` mostrar `.lista__erro`. Mostrar `.lista__carregando` enquanto isso.
4. Prazo: se em 10 s não chegar `Tally.FormLoaded`, mostrar `.lista__erro` (o iframe continua lá, caso carregue depois).
5. Ouvir mensagens:

```js
window.addEventListener('message', function (e) {
  if (e.origin !== 'https://tally.so') return;
  var dados = e.data;
  if (typeof dados !== 'string' || dados.indexOf('Tally.') === -1) return;
  if (dados.indexOf('Tally.FormLoaded') !== -1) { /* esconder carregando e erro, cancelar prazo */ }
  if (dados.indexOf('Tally.FormSubmitted') !== -1) { /* escrever lista.confirmacao em .lista__status */ }
});
```

Nunca ler, guardar nem registrar no console o conteúdo das respostas (`payload.fields`). O foco não é movido (a pessoa está dentro do iframe); o `role="status"` anuncia a confirmação.

6. Altura: `dynamicHeight=1` faz o Tally ajustar a altura. O `height="420"` reserva o espaço inicial para não haver salto grande de layout.

Plano B, só se o QA com o formulário real mostrar que os UTM não chegam ao Tally: montar a URL no JS (`https://tally.so/embed/ID?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1&utm_source=...`) e gravar em `data-tally-src` antes de chamar `Tally.loadEmbeds()`, conferindo que cada parâmetro aparece uma vez só no `src` final.

### 8.4 Endereços com UTM para o Instagram

| Onde | Endereço |
| --- | --- |
| Link da bio | `https://seudominio.com.br/?utm_source=instagram&utm_medium=bio&utm_content=link_bio` |
| Figurinha de link em story | `https://seudominio.com.br/?utm_source=instagram&utm_medium=story&utm_content=AAAA-MM-DD` |
| Destaque Lista | `https://seudominio.com.br/?utm_source=instagram&utm_medium=destaque&utm_content=lista` |

---

## 9. SEO e compartilhamento

`<head>` da landing, nesta ordem

```html
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Aspen Key | Chave física em desenvolvimento da Aspen Core</title>
<meta name="description" content="(meta.index.description)">
<link rel="canonical" href="https://seudominio.com.br/"><!-- PENDENTE P08 -->
<meta name="robots" content="noindex, nofollow"><!-- PENDENTE P19: trocar por "index, follow" ao publicar -->
<meta name="theme-color" content="#0A2935">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="Aspen Core">
<meta property="og:title" content="(meta.index.og_title)">
<meta property="og:description" content="(meta.index.og_description)">
<meta property="og:url" content="https://seudominio.com.br/">
<meta property="og:image" content="https://seudominio.com.br/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="(meta.index.og_image_alt)">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="(meta.index.og_title)">
<meta name="twitter:description" content="(meta.index.og_description)">
<meta name="twitter:image" content="https://seudominio.com.br/og-image.jpg">
<meta name="twitter:image:alt" content="(meta.index.og_image_alt)">
<link rel="icon" href="favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="manifest" href="site.webmanifest">
<link rel="preload" href="assets/fonts/spacemono-700.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/spacemono-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" as="image" media="(max-width: 1023px)" fetchpriority="high"
      imagesrcset="assets/img/hero-chave-deitada-400.webp 400w, assets/img/hero-chave-deitada-800.webp 800w, assets/img/hero-chave-deitada-1200.webp 1200w"
      imagesizes="(min-width: 768px) 520px, 88vw">
<link rel="preload" as="image" media="(min-width: 1024px)" fetchpriority="high"
      imagesrcset="assets/img/hero-chave-3q-560.webp 560w, assets/img/hero-chave-3q-1120.webp 1120w"
      imagesizes="(min-width: 1280px) 386px, 30vw">
<link rel="stylesheet" href="assets/css/site.css">
<script src="assets/js/site.js" defer></script>
<script type="application/ld+json">
{ "@context": "https://schema.org", "@type": "Organization", "name": "Aspen Core",
  "url": "https://seudominio.com.br/", "logo": "https://seudominio.com.br/icon-512.png",
  "email": "contato@seudominio.com.br", "sameAs": ["https://www.instagram.com/aspencore_/"],
  "address": { "@type": "PostalAddress", "addressCountry": "BR" } }
</script>
```

Sem `Product`, sem `Offer`, sem `AggregateRating`, sem `Review`.

Privacidade: title e description de `meta.privacidade`, canonical `https://seudominio.com.br/privacidade`, mesmo robots, sem Open Graph próprio (herda nada; tudo bem). 404: `noindex`.

`public/robots.txt`

```
User-agent: *
Allow: /
Sitemap: https://seudominio.com.br/sitemap.xml
```

`public/sitemap.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://seudominio.com.br/</loc><lastmod>PENDENTE_DATA</lastmod></url>
  <url><loc>https://seudominio.com.br/privacidade</loc><lastmod>PENDENTE_DATA</lastmod></url>
</urlset>
```

`public/_headers`

```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' https://tally.so; frame-src https://tally.so; connect-src 'self' https://tally.so; img-src 'self' data: https://tally.so; style-src 'self' 'unsafe-inline'; font-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; upgrade-insecure-requests
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
/assets/fonts/*
  Cache-Control: public, max-age=31536000, immutable
```

`style-src 'unsafe-inline'` fica por precaução, porque não foi confirmado se o `embed.js` injeta estilo. O site em si não usa estilo inline (nenhum atributo `style` no HTML). Se o Henrique ligar o Cloudflare Web Analytics (P18), somar `https://static.cloudflareinsights.com` em `script-src` e `https://cloudflareinsights.com` em `connect-src`, e atualizar a seção de cookies da privacidade.

`public/_redirects`

```
/privacidade/  /privacidade  301
```

---

## 10. Acessibilidade (WCAG 2.2 AA), checklist deste site

| # | Critério | O que conferir aqui | Como o QA confere |
| --- | --- | --- | --- |
| 1 | 3.1.1 Idioma | `<html lang="pt-BR">` nas três páginas | busca no HTML |
| 2 | 1.3.1 Estrutura | um `h1` por página; ordem h1, h2, h3 sem pular; `header`, `main`, `footer`; seções com `aria-labelledby`; ficha em `dl`; passos em `ol`; estados em `ul` | script lista os títulos e landmarks |
| 3 | 2.4.1 Pular blocos | link "Pular para o conteúdo" é o primeiro foco e leva ao `main` | teclado (Tab) |
| 4 | 1.1.1 Texto alternativo | alt de cada imagem igual ao `copy.json`; decorativas com `alt=""` e `aria-hidden="true"`; ícone SVG com `aria-hidden="true"` | script: todo `img` tem `alt` |
| 5 | 1.2.1 e 1.2.2 Vídeo | sem fala: transcrição "O que aparece no vídeo" logo abaixo; com fala: legenda `.vtt` também | revisão manual quando o vídeo chegar |
| 6 | 1.4.2 e 2.2.2 Movimento e som | nada toca sozinho; brilho do LED dura 1,8 s e para; vídeo sem autoplay | revisão |
| 7 | 1.4.3 Contraste de texto | tabela da seção 5.2; acento só em texto grande | script de contraste |
| 8 | 1.4.11 Contraste de componentes | anéis de foco, borda de campo, ícone do aviso, bolinhas de estado com 3:1 ou mais | tabela 5.2 |
| 9 | 1.4.1 Uso de cor | "faz" e "ainda não faz" têm título em texto; links sublinhados; etiqueta de visão tem texto | revisão |
| 10 | 1.4.4 e 1.4.10 Zoom e reflow | 200% de zoom sem perder conteúdo; em 320 px de largura, nada de rolagem horizontal | captura em 320 x 640 e zoom 2 |
| 11 | 1.4.12 Espaçamento de texto | com altura de linha 1,5, espaço entre parágrafos 2x, letras 0,12em e palavras 0,16em, nada corta (blocos sem altura fixa) | script injeta o CSS de teste e confere estouro |
| 12 | 1.3.4 Orientação | funciona em retrato e paisagem | captura 844 x 390 |
| 13 | 2.1.1 Teclado | tudo alcançável por Tab: links, botões, `summary`, vídeo, iframe | script de Tab |
| 14 | 2.4.3 Ordem de foco | ordem igual à leitura | script de Tab |
| 15 | 2.4.7 Foco visível | contorno de 3 px em tudo | script confere `outline-style` no foco |
| 16 | 2.4.11 Foco não encoberto | nada fixo na tela; `scroll-padding` de 16 px | script confere que o elemento focado está inteiro na tela |
| 17 | 2.5.8 Tamanho do alvo | mínimo 24 x 24 px (meta do site: 44 x 44 em links de navegação, rodapé, `summary` e botões) | script mede a caixa de cada alvo |
| 18 | 2.4.4 Propósito do link | texto do link diz o destino; links de outra aba avisam "(abre em outra aba)" | revisão |
| 19 | 2.4.2 Título da página | títulos da seção 4 | busca |
| 20 | 3.2.6 Ajuda consistente | e-mail de contato no mesmo lugar do rodapé nas três páginas | revisão |
| 21 | 3.3.2 Rótulos | no rascunho, `label` ligado a cada campo; no Tally, perguntas visíveis (não só placeholder) | revisão |
| 22 | 4.1.2 Nome, papel e valor | iframe com `title`; `details` e `summary` nativos; botão desativado com `disabled` e `aria-disabled` | script |
| 23 | 4.1.3 Mensagens de status | confirmação de inscrição em `role="status"` | revisão com formulário real |
| 24 | 2.3.3 e preferências | `prefers-reduced-motion` desliga brilho animado e revelação | captura com movimento reduzido |
| 25 | Caixa alta | títulos em caixa normal no HTML e caixa alta só no CSS | busca no HTML por títulos inteiros em maiúsculas |
| 26 | Formulário de terceiro | navegar o iframe do Tally só com teclado e com leitor de tela (VoiceOver no iPhone) depois do P07 | manual, pelo Henrique ou Sonnet |
| 27 | Navegador do Instagram | abrir o link pela bio no Android e no iPhone; formulário visível e enviável | manual, pelo Henrique |

---

## 11. Pendências (o que o Henrique fornece ou decide)

Marcadores pesquisáveis: `PENDENTE` (em valores como `PENDENTE_TALLY_ID` e em comentários `<!-- PENDENTE Pxx -->`) e `seudominio`. O script `ferramentas/checar_pendentes.py` lista todas as ocorrências com arquivo e linha; com `--publicar`, termina com erro se sobrar alguma ou se ainda houver `data-modo="rascunho"` ou `noindex` na landing e na privacidade.

| Id | O quê | Quem | Arquivo e trecho exato | Bloqueia publicar |
| --- | --- | --- | --- | --- |
| P01 | Foto real principal do protótipo | Henrique | `public/index.html`, `<figure class="foto-principal" id="foto-principal">` com `<!-- PENDENTE P01 -->`; trocar `prototipo-referencia-*.webp` por `prototipo-foto-600/900/1152.webp` (mesmo script de exportação), alt novo e legenda "Foto do protótipo." | não (a imagem de referência serve até lá) |
| P02 | Foto do protótipo na mão (opcional) | Henrique | `public/index.html`, `<figure class="slot slot--foto" id="foto-mao" data-vazio>` | não |
| P03 | Foto com o USB-C à mostra (opcional) | Henrique | `public/index.html`, `<figure class="slot slot--foto" id="foto-usb" data-vazio>` | não |
| P04 | Vídeo curto do protótipo calculando hash e fazendo criptografia assimétrica | Henrique | `public/index.html`, `<div class="video slot" id="video-prototipo" data-vazio>`; arquivos em `public/assets/video/` (seção 7.3) | não (o slot some publicado) |
| P05 | Transcrição do vídeo | Henrique | `public/index.html`, `<p class="video__transcricao"><!-- PENDENTE P05 -->` | só se P04 entrar |
| P06 | E-mail real de contato | Henrique | todas as ocorrências de `contato@seudominio.com.br`: `index.html` (lista, FAQ "O que vocês fazem com o meu e-mail?", rodapé, JSON-LD), `privacidade.html` (4 vezes e rodapé), texto do Tally | sim |
| P07 | Código do formulário do Tally | Henrique | `public/index.html`: `data-tally-id="PENDENTE_TALLY_ID"`, `data-tally-src="https://tally.so/embed/PENDENTE_TALLY_ID?..."`, dois `href="https://tally.so/r/PENDENTE_TALLY_ID"` | sim |
| P08 | Domínio | Henrique | `seudominio.com.br` em: `index.html` (canonical, og:url, og:image, twitter:image, JSON-LD), `privacidade.html` (canonical), `robots.txt`, `sitemap.xml`, texto do Tally (link da privacidade) | sim |
| P09 | Modelo do chip (provavelmente ATECC608B) | Henrique confirma | `public/index.html`, na ficha: `<dd>Chip de segurança criptográfico<!-- PENDENTE_MODELO_CHIP: confirmar ATECC608B --></dd>` | não (sem confirmação, fica sem modelo) |
| P10 | Controlador (razão social e CNPJ, ou nome completo se não houver CNPJ) | Henrique | `public/privacidade.html`, `PENDENTE_CONTROLADOR` | sim |
| P11 | Base legal da transferência internacional para o Tally (art. 33) | responsável pela LGPD | `public/privacidade.html`, `PENDENTE_TRANSFERENCIA` | sim |
| P12 | Prazo de guarda (proposta: até o aviso, a saída ou 24 meses) | Henrique | `public/privacidade.html`, `PENDENTE_RETENCAO` | sim |
| P13 | Encarregado ou dispensa como agente de pequeno porte, e quem responde os pedidos | Henrique e responsável pela LGPD | `public/privacidade.html`, `PENDENTE_ENCARREGADO` | sim |
| P14 | Data de publicação | Henrique (no dia) | `public/privacidade.html` `PENDENTE_DATA`; `public/sitemap.xml` (2 vezes) | sim |
| P15 | Dado sobre golpes com fonte (opcional) | Henrique ou agente de social media | `public/index.html`, `<!-- PENDENTE P15 -->` na seção problema | não |
| P16 | A imagem de referência é foto real ou imagem gerada? | Henrique | `public/index.html`, legenda da foto principal | não (a legenda atual não afirma que é foto) |
| P17 | Fonte Disket Mono Bold (.ttf) | Henrique | trocar `spacemono-*.woff2` e o `@font-face` em `site.css`, regerar `og-image.jpg` | não |
| P18 | Ligar ou não o Cloudflare Web Analytics | Henrique | painel do Cloudflare; `_headers`; seção de cookies em `privacidade.html` | não (desligado por padrão) |
| P19 | Virar para publicado | Henrique (no dia) | `<html lang="pt-BR" class="no-js" data-modo="rascunho">` para `data-modo="publicado"` em `index.html`, `privacidade.html` e `404.html`; `<meta name="robots" content="noindex, nofollow">` para `index, follow` em `index.html` e `privacidade.html` | é o próprio ato de publicar |
| P20 | Confirmar o endereço do Instagram | Henrique | `https://www.instagram.com/aspencore_/` em `index.html` (rodapé, JSON-LD) e `privacidade.html` (rodapé) | não |
| P21 | Tirar do ar ou corrigir a página antiga `aspencore.onrender.com` (frases proibidas) | Henrique e o dono do repositório antigo | fora deste site | não, mas a bio não pode apontar para ela |

---

## 12. Plano de QA para o Sonnet

Ambiente: `export PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`. Playwright para Python já está instalado. Lançar com `p.chromium.launch(executable_path="/opt/pw-browsers/chromium")`. Não rodar `playwright install`.

### 12.1 Servidor local

`ferramentas/servidor_local.py` (biblioteca padrão, porta 8765, pasta `public/`): serve `/privacidade` a partir de `privacidade.html`, redireciona `*.html` para o endereço sem extensão (exceto `index.html` para `/`), devolve `404.html` com status 404 para o que não existe, e aplica os cabeçalhos de `_headers` (ler o arquivo: linha sem recuo é o caminho com `*` como coringa; linhas recuadas são `Nome: valor`). Assim o QA testa a CSP como no Cloudflare. Rodar em segundo plano antes do QA.

### 12.2 Checagens, em ordem

| # | Checagem | Como | Passa se |
| --- | --- | --- | --- |
| 1 | Travessão | `checar_texto.py --tracos` em todos os arquivos de texto de `public/`, `origem/`, `ferramentas/`, `README.md` e nos dois arquivos deste plano. Procurar os caracteres U+2012, U+2013, U+2014, U+2015, U+FE58 e U+FE63, as entidades HTML nomeadas mdash e ndash, as numéricas 8211 e 8212 (decimais) e 2013 e 2014 (hexadecimais), e os escapes com barra invertida de u2013 e u2014. O script monta esses padrões a partir dos códigos (por exemplo `chr(0x2014)` e `'&' + 'mdash;'`) para não acusar a si mesmo | zero ocorrências |
| 2 | Expressões proibidas | `checar_texto.py --proibidas` sobre o texto visível de cada página (pegar com Playwright `document.body.innerText`), mais `alt`, `title`, `aria-label` e conteúdo dos `meta`. Lista FALHA (sem diferenciar maiúsculas): `sem senha`, `mesmo se a senha vazar`, `em tempo real`, `falsos positivos`, `usuários protegidos`, `\busuári`, `detect`, `proteg`, `proteção` (exceto o trecho exato `Proteção de Dados` e `Autoridade Nacional de Proteção de Dados`), `segurança total`, `100%`, `R\$`, `\bpreço:\s*\d`, `plano (básico\|pro\|premium)`, `em breve`, `lançamento em`, `parceria`, `parceiros`, `prêmio`, `premiad`, `depoimento`, `avaliaç`, `estrelas`, `\bselo`, `equipe de`, `integrantes`, `garant`, `impede`, `bloqueia`, `inviolável`, `à prova de`, `acesso antecipado`, `já funciona com`, `\b\d+ ?(mil\|milhões)\b`. Lista REVISAR (imprime com contexto, não falha): `segur`, `golpe`, `funciona`, `confirma`, `vai `, `\b20\d\d\b` | FALHA vazia; cada item de REVISAR conferido contra a tabela de fatos da seção 4 e anotado no relatório |
| 3 | Pendentes | `checar_pendentes.py` | lista impressa no relatório (no rascunho é esperado) |
| 4 | Capturas | páginas `/`, `/privacidade`, `/404.html` em 390 x 844 (escala 2), 768 x 1024 (escala 1) e 1280 x 800 (escala 1), página inteira e só a primeira tela; mais 320 x 640, 844 x 390 (paisagem) e 390 x 664 (Safari com barras) só da landing; repetir a landing em 390 e 1280 com `data-modo="publicado"` (trocar o atributo por `page.evaluate` antes da captura) e com `reduced_motion="reduce"` | capturas salvas em `qa/capturas/`; o Sonnet ABRE cada uma com a ferramenta Read e descreve problemas no relatório |
| 5 | Botão na primeira tela | em 390 x 664, a caixa do botão "Entrar na lista de espera" do hero termina antes de 664 px | `bottom <= 664` |
| 6 | Rolagem horizontal | em todos os tamanhos, `document.documentElement.scrollWidth <= window.innerWidth` | verdadeiro |
| 7 | Texto cortado | para `h1, h2, h3, h4, p, li, dt, dd, figcaption, summary, a, button, label`: `scrollWidth <= clientWidth + 1` e `scrollHeight <= clientHeight + 1` quando o elemento tem `overflow` diferente de `visible` | nenhum caso |
| 8 | Sobreposição | em cada seção, pegar as caixas dos filhos diretos de `.conteudo` e de cada grade, mais `figure`, `img`, títulos e parágrafos; qualquer par que se cruze em mais de 4 px quadrados é falha, exceto elementos marcados com `data-sobrepoe="ok"` (só a marca d'água e o círculo atrás do par de ilustrações, que são decorativos e ficam atrás) | nenhum caso |
| 9 | Contraste | em `page.evaluate`: para cada elemento com texto próprio visível, pegar `color` e o primeiro `background-color` não transparente subindo pelos pais; se o pai for `.noite`, usar #0A2935 (pior ponto do degradê); calcular a razão; mínimo 4,5, ou 3 se `font-size >= 24px` ou (`>= 18.66px` e `font-weight >= 700`) | nenhum caso abaixo |
| 10 | Links | todos os `a[href]`: internos respondem 200 no servidor local; âncoras `#x` têm elemento com `id="x"`; `mailto:` com um `@`; externos só listados (Instagram e Tally); nenhum `href="#"` vazio | tudo ok |
| 11 | Imagens | todo `img` com `alt`, `width` e `height`; nenhum `img` sem `loading="lazy"` abaixo de 900 px do topo, exceto o hero e o escudo do header; todos os arquivos de `srcset` existem | tudo ok |
| 12 | Peso | ouvir `response` de todas as requisições a `localhost`; somar `len(await response.body())`. Medir (a) na carga inicial em 390 x 844 e (b) depois de rolar até o fim em passos de 600 px com 300 ms de espera, em 390 x 844 e 1280 x 800 | (a) até 600 KB; (b) até 1,5 MB sem vídeo e sem Tally; nenhum arquivo acima do peso alvo da seção 7 |
| 13 | LCP e CLS | via CDP: `Network.emulateNetworkConditions` (latência 150 ms, download 200000 bytes/s, upload 93750 bytes/s) e `Emulation.setCPUThrottlingRate` 4; ler `largest-contentful-paint` e somar `layout-shift` sem entrada recente, com `PerformanceObserver` `buffered: true` | LCP até 2500 ms e CLS até 0,1 em 390 x 844 |
| 14 | Console e rede | nenhum erro no console (inclusive violação de CSP) e nenhuma resposta 4xx ou 5xx, exceto o 404 testado de propósito | zero |
| 15 | Teclado | apertar Tab até voltar ao começo; registrar a sequência; para cada foco: `outline-style` diferente de `none`, elemento inteiro na tela, caixa com 24 x 24 px ou mais | ordem igual à leitura, todos visíveis |
| 16 | Espaçamento de texto (1.4.12) | injetar `* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }` e repetir 6, 7 e 8 em 390 px | nenhum caso |
| 17 | Estrutura | um `h1` por página; nenhum salto de nível; `lang="pt-BR"`; ids únicos; iframe com `title`; títulos do HTML não estão inteiros em maiúsculas | tudo ok |
| 18 | Movimento reduzido | com `reduced_motion="reduce"`: `getComputedStyle(.hero__brilho).animationName` é `none` e os passos têm `opacity` 1 | verdadeiro |
| 19 | Rascunho e publicado | com `data-modo="publicado"` (atributo trocado por `page.evaluate`), listar todo "PENDENTE" que continua visível em `innerText` | na landing, zero; na privacidade, só os marcadores PENDENTE_CONTROLADOR, PENDENTE_TRANSFERENCIA, PENDENTE_RETENCAO, PENDENTE_ENCARREGADO e PENDENTE_DATA (esperados até o Henrique preencher P10 a P14) |
| 20 | Tally real (só depois do P07) | abrir `/?utm_source=teste&utm_medium=qa&utm_content=x`; esperar `Tally.FormLoaded`; conferir que o `src` final do iframe contém os três UTM (uma vez cada); listar `context.cookies()` de `tally.so`; anotar no relatório. O envio de teste é feito pelo Henrique, não pelo Sonnet | UTM presentes; cookies anotados para o Henrique decidir |

Relatório: `qa/relatorio.md` com uma linha por checagem (passou ou falhou, números medidos), a lista de pendentes e as observações das capturas. Qualquer falha das checagens 1, 2, 5, 6, 7, 8, 9, 14 e 15 volta para correção antes de entregar.

### 12.3 Ordem de execução para o Sonnet

1. Criar a árvore da seção 1.3 em `/mnt/user-data/outputs/aspen/aspencore-site/`.
2. Fontes: `pip install --user brotli` (o fontTools 4.66 já está instalado), depois `ferramentas/gerar_fontes.sh` com `pyftsubset <ttf> --unicodes="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2018-201E,U+2022,U+2026,U+20AC,U+2122,U+2212,U+FEFF,U+FFFD" --layout-features='*' --flavor=woff2 --output-file=...` para Poppins Regular, SemiBold e Bold e Space Mono Regular e Bold (origem `brand/fonts/`). Copiar as licenças OFL.
3. `exportar_imagens.py`, `gerar_favicons.py`.
4. `index.html`, `privacidade.html`, `404.html` com o texto do `copy.json` (copiar exatamente; não reescrever).
5. `site.css` com os tokens da seção 5; `site.js` com as seções 6 e 8.3.
6. `robots.txt`, `sitemap.xml`, `_headers`, `_redirects`, `site.webmanifest`.
7. `origem/og.html` e `gerar_og.py`.
8. `servidor_local.py`, `checar_texto.py`, `checar_pendentes.py`, `qa_playwright.py`; rodar tudo; abrir as capturas; corrigir; repetir até passar.
9. `README.md` curto (como ver local, como publicar, onde estão as pendências), sem travessão.
10. Não publicar, não criar repositório remoto, não enviar nada a ninguém.

Critério de pronto: QA todo verde (exceto pendentes e checagem 20), capturas revisadas, peso e LCP dentro do orçamento, relatório escrito.

---

## 13. Como o Henrique publica depois

1. Criar o repositório. No GitHub (conta henrifernandez), criar `aspencore-site` (pode ser privado). Enviar o conteúdo da pasta `aspencore-site/` pela página do repositório ("Add file" e "Upload files", arrastando as pastas) ou pelo terminal com `git init`, `git add .`, `git commit -m "Site v1"`, `git remote add origin ...` e `git push -u origin main`.
2. Conectar no Cloudflare Pages. No painel do Cloudflare, Workers & Pages, criar um projeto Pages ligado ao Git, autorizar o GitHub e escolher o repositório. Configuração: branch de produção `main`; framework preset `None`; comando de build vazio (se o painel exigir algo, `exit 0`); diretório de saída `public`. Salvar e publicar. O site fica em `https://<nome-do-projeto>.pages.dev`. Os nomes dos botões do painel podem ter mudado; se o painel oferecer só Workers, procurar a opção de site estático (assets) com a mesma pasta `public` (não confirmado).
3. Domínio próprio. No projeto Pages, aba de domínios personalizados, adicionar o domínio (por exemplo o `.com.br` comprado no Registro.br). Recomendado passar os servidores DNS do domínio para o Cloudflare (no Registro.br, trocar os DNS pelos dois que o Cloudflare indicar); assim o domínio raiz funciona e o HTTPS sai sozinho. Alternativa sem mudar DNS: só um subdomínio (`www`) com registro CNAME apontando para `<nome-do-projeto>.pages.dev`.
4. Criar o formulário no Tally conforme a seção 8.1, com o link da privacidade já no domínio novo. Copiar o código do formulário.
5. Trocar os pendentes da seção 11. Para cada id, buscar o marcador no arquivo indicado e trocar. Os principais: `PENDENTE_TALLY_ID` (3 lugares), `seudominio.com.br` (todos), `contato@seudominio.com.br` (todos), os cinco `PENDENTE_` da privacidade, a data.
6. Virar para publicado (P19) e conferir: `python3 ferramentas/checar_pendentes.py --publicar` tem de terminar sem erro.
7. Enviar as mudanças ao GitHub. O Cloudflare publica sozinho em cerca de um minuto.
8. Testar no celular: abrir o link com UTM da bio (seção 8.4), entrar na lista com um e-mail seu, conferir no Tally que a inscrição chegou com `utm_source=instagram`, e apagar a inscrição de teste.
9. Trocar o link da bio do Instagram pelo endereço da seção 8.4 e acrescentar a chamada da linha 3 da bio. Nunca apontar para `aspencore.onrender.com`.

Trocar uma foto depois: colocar a foto original em qualquer pasta, rodar `exportar_imagens.py` com uma linha nova para ela, apontar o `img` para os arquivos novos, atualizar alt e legenda, remover `data-vazio` se for um slot, enviar ao GitHub.

---

## 14. Fontes consultadas (20/10/2026)

- Tally, documentação de incorporação: [developers.tally.so/widgets/embeds](https://developers.tally.so/widgets/embeds) (código do iframe, `embed.js`, `Tally.loadEmbeds`, repasse automático de parâmetros, carregamento a 500 px)
- Tally, eventos: [developers.tally.so/widgets/events](https://developers.tally.so/widgets/events) (`Tally.FormLoaded`, `Tally.FormPageView`, `Tally.FormSubmitted`; a página não fala de conferir origem)
- Tally, ajuda sobre incorporação: [tally.so/help/embed-your-form](https://tally.so/help/embed-your-form) (altura dinâmica, campos ocultos preenchidos pelo endereço)
- Tally, política de cookies: [tally.so/help/cookie-policy](https://tally.so/help/cookie-policy) (feito e hospedado na UE; cookies do formulário incorporado não confirmados)
- Tally, GDPR e DPA (encontrados, não lidos nesta pesquisa): [tally.so/help/gdpr](https://tally.so/help/gdpr), [tally.so/help/data-processing-agreement](https://tally.so/help/data-processing-agreement), [tally.so/privacy](https://tally.so/privacy)
- Cloudflare Pages, como as páginas são servidas: [developers.cloudflare.com/pages/configuration/serving-pages](https://developers.cloudflare.com/pages/configuration/serving-pages/) (rotas sem extensão, `404.html`, cabeçalhos padrão, `noindex` nas pré-visualizações)
- Cloudflare Pages, redirecionamentos: [developers.cloudflare.com/pages/configuration/redirects](https://developers.cloudflare.com/pages/configuration/redirects/index.md)
- Cloudflare Pages, cabeçalhos (encontrado, sintaxe não relida nesta pesquisa): [developers.cloudflare.com/pages/configuration/headers](https://developers.cloudflare.com/pages/configuration/headers/index.md)
- Cloudflare Web Analytics: [developers.cloudflare.com/web-analytics/about](https://developers.cloudflare.com/web-analytics/about/) e [FAQ](https://developers.cloudflare.com/web-analytics/faq) (não coleta dados pessoais; não registra parâmetros da URL; cookies não confirmados)
- Página de pré-lançamento de hardware de segurança: [Apexure, análise da página do Shield SOS](https://www.apexure.com/landing-page-examples/shield-sos-landing-page)
- Página de lista de espera: [Unicorn Platform, landing page para lista de espera](https://unicornplatform.com/blog/how-to-make-an-effective-landing-page-for-launching-your-waitlist)
- LGPD para pequeno porte: [Confidata, LGPD para pequenas empresas](https://confidata.com.br/blog/lgpd-pequenas-empresas-resolucao-pequeno-porte) (fonte secundária; artigo da Resolução CD/ANPD nº 2/2022 não confirmado)
- LGPD, Lei 13.709/2018 (art. 7º, I; art. 18; art. 33): conhecimento prévio, não relido nesta pesquisa. Texto oficial em planalto.gov.br
- LCP bom até 2,5 s e CLS bom até 0,1: limites do Core Web Vitals, conhecimento prévio, não relido nesta pesquisa
- Medições próprias nos PNGs de `brand/assets/` (recortes, posição do LED, proporção frente e perfil, cor do LED, pesos de WebP) e contrastes calculados pela fórmula da WCAG 2.x
