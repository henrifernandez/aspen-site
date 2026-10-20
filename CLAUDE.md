# Aspen Core: site do protótipo (instruções para o Claude Code)

Site estático (HTML, CSS e JS simples, sem build) para o link da bio do Instagram `aspencore_`. Mostra o protótipo da Aspen Key e coleta lista de espera pelo Tally. Deploy previsto: Cloudflare Pages, pasta `public/`, sem build. Nada está publicado ainda.

## Como rodar e testar
- Servidor local: `cd public && python3 -m http.server 8080` (ou `python3 ferramentas/servidor_local.py`), abrir http://localhost:8080
- Pendências: `python3 ferramentas/checar_pendentes.py` (o `--publicar` falha enquanto houver marcador)
- Texto: `python3 ferramentas/checar_texto.py` (travessão e expressões proibidas)
- QA completo: `python3 ferramentas/qa_playwright.py` (Playwright com Chromium; não rodar `playwright install`)
- Imagens: `python3 ferramentas/exportar_imagens.py [pasta_brand_assets]`

## Documentos
- `docs/PLANO-SITE.md`: plano completo (layout, copy, design system, movimento, SEO, acessibilidade, QA, publicação)
- `docs/copy.json`: todos os textos com o mapa de fatos
- `PENDENCIAS.md`: lista P01 a P21 com arquivo e trecho

## Regras de verdade (não quebrar)
- Hoje o protótipo só faz hash e criptografia assimétrica num chip de segurança. Ele NÃO se conecta a site, app ou conta.
- Aproxime, Confie, Acesse e as telas de celular são a ideia, sempre com a legenda "Ilustração de como será, ainda não funciona assim".
- Aviso obrigatório: "Protótipo em desenvolvimento. O design final pode mudar."
- Proibido: número de usuários, "sem falsos positivos", "em tempo real", "protege/detecta golpes", preço, data de lançamento, parcerias, depoimentos, "sem senha", "mesmo se a senha vazar".
- Termo do produto: "criptografia assimétrica". Modelo do chip só depois de confirmado (P09).
- Nunca usar travessão (em dash). Evitar encher o texto de dois-pontos e pontos seguidos.
- Marcador `PENDENTE` com número para tudo que falta. Não inventar dado para tapar buraco.

## Decisões novas (20/10/2026), ainda não implementadas
1. Separar o site em duas partes. "Como queremos que seja": os renders atuais, com legenda "Ilustração da ideia final. O protótipo de hoje é diferente." "O protótipo de hoje": a peça real.
2. Corrigir a legenda do topo "Imagem 3D feita a partir do protótipo", que está errada se o render for a ideia final.
3. Visualizador que gira. Os renders disponíveis em `/brand/assets/key` do repo `aspen-social-agent` (frente, 3q, 3q-direita, perfil, topo, baixo, deitada) servem para um visualizador por vistas (arrastar ou setas), não para rotação contínua.
4. O protótipo de hoje foi montado à mão, não existe CAD nem foto online. A digitalização será por giro de fotos reais (prato giratório, 36 fotos a cada 10 graus, visualizador por sequência de imagens). Escaneamento 3D por fotos é só tentativa (peça pequena, preta e brilhante). O Henrique vai fotografar.

## Pendências com o Henrique
Tally (URL), e-mail de contato, domínio, dados do controlador na página de privacidade, fotos e vídeos do protótipo, confirmação do chip, confirmar se a imagem de referência é foto real (P16), decidir se o repositório fica público.

## Como trabalhar com ele
- Responder em português do Brasil, direto.
- Planejamento pesado no Opus, código no Sonnet, tarefas pequenas no Haiku.
- Não publicar, fazer deploy nem alterar o Instagram sem ordem explícita ("aprovo" ou "aplique").
- Projeto já instalado localmente: enviar só os arquivos que mudaram, nunca o zip inteiro.
- Commits terminam com `Co-Authored-By: Claude <noreply@anthropic.com>`.
