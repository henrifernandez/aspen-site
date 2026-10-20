# Pendências do site

Cada item abaixo está marcado no código com `PENDENTE` e o número (por exemplo `<!-- PENDENTE P07 -->`) ou com um marcador em texto (por exemplo `PENDENTE_TALLY_ID`). Para listar todos com arquivo e linha: `python3 ferramentas/checar_pendentes.py`.

"Bloqueia" quer dizer que o item precisa ser resolvido antes de publicar. `python3 ferramentas/checar_pendentes.py --publicar` falha enquanto houver qualquer marcador.

| Id | O quê | Quem | Arquivo e trecho | Bloqueia |
| --- | --- | --- | --- | --- |
| P01 | Foto real principal do protótipo | Henrique | `public/index.html`, `<figure class="foto-principal" id="foto-principal">` (comentário `PENDENTE P01`). Trocar `prototipo-referencia-*.webp` por `prototipo-foto-600/900/1152.webp` (mesmo script de exportação), alt novo e legenda "Foto do protótipo." Também há uma caixa de rascunho `PENDENTE: trocar pela foto real do protótipo (pendência P01)` logo abaixo, que some publicada | não (a imagem de referência serve até lá) |
| P02 | Foto do protótipo na mão (opcional) | Henrique | `public/index.html`, `<figure class="slot slot--foto" id="foto-mao" data-vazio>` | não |
| P03 | Foto com o USB-C à mostra (opcional) | Henrique | `public/index.html`, `<figure class="slot slot--foto" id="foto-usb" data-vazio>` | não |
| P04 | Vídeo curto do protótipo calculando hash e fazendo criptografia assimétrica | Henrique | `public/index.html`, `<div class="video slot" id="video-prototipo" data-vazio>`; arquivos em `public/assets/video/` (comandos do ffmpeg na seção 7.3 do plano) | não (o bloco some publicado) |
| P05 | Transcrição do vídeo (2 a 4 frases) | Henrique | `public/index.html`, `<p class="video__transcricao"><!-- PENDENTE P05 -->` | só se o P04 entrar |
| P06 | E-mail real de contato | Henrique | todas as ocorrências de `contato@seudominio.com.br`: `public/index.html` (lista de espera, FAQ "O que vocês fazem com o meu e-mail?", rodapé, JSON-LD), `public/privacidade.html` (3 vezes no texto e rodapé), e o texto do Tally | sim |
| P07 | Código do formulário do Tally | Henrique | `public/index.html`: `data-tally-id="PENDENTE_TALLY_ID"`, `data-tally-src="https://tally.so/embed/PENDENTE_TALLY_ID?..."`, dois `href="https://tally.so/r/PENDENTE_TALLY_ID"`; o aviso visível `lista__rascunho` desaparece sozinho quando o código for real | sim |
| P08 | Domínio | Henrique | `seudominio.com.br` em: `public/index.html` (canonical, og:url, og:image, twitter:image, JSON-LD), `public/privacidade.html` (canonical), `public/robots.txt`, `public/sitemap.xml`, texto do Tally (link da privacidade) | sim |
| P09 | Modelo do chip (provavelmente ATECC608B) | Henrique confirma | `public/index.html`, na ficha: `<dd>Chip de segurança criptográfico<!-- PENDENTE P09 (PENDENTE_MODELO_CHIP) ... --></dd>` | não (sem confirmação, fica sem modelo) |
| P10 | Controlador (razão social e CNPJ, ou nome completo se não houver CNPJ) | Henrique | `public/privacidade.html`, `PENDENTE_CONTROLADOR` | sim |
| P11 | Base legal da transferência internacional para o Tally (LGPD, art. 33) | responsável pela LGPD | `public/privacidade.html`, `PENDENTE_TRANSFERENCIA` | sim |
| P12 | Prazo de guarda (proposta: até o aviso, a saída ou 24 meses) | Henrique | `public/privacidade.html`, `PENDENTE_RETENCAO` | sim |
| P13 | Encarregado ou dispensa como agente de pequeno porte, e quem responde os pedidos | Henrique e responsável pela LGPD | `public/privacidade.html`, `PENDENTE_ENCARREGADO` | sim |
| P14 | Data de publicação | Henrique (no dia) | `public/privacidade.html`, `PENDENTE_DATA`; `public/sitemap.xml` (2 vezes) | sim |
| P15 | Dado sobre golpes com fonte (opcional) | Henrique ou agente de social media | `public/index.html`, `<!-- PENDENTE P15 -->` na seção `#problema` | não |
| P16 | A imagem de referência é foto real ou imagem gerada? | Henrique | `public/index.html`, legenda da foto principal (comentário `PENDENTE P16`) | não (a legenda atual não afirma que é foto) |
| P17 | Fonte Disket Mono Bold (.ttf) | Henrique | trocar `spacemono-*.woff2` e o `@font-face` em `public/assets/css/site.css` (comentário `PENDENTE P17`), regerar `og-image.jpg` com `ferramentas/gerar_og.py` | não |
| P18 | Ligar ou não o Cloudflare Web Analytics | Henrique | painel do Cloudflare; `public/_headers` (comentário `PENDENTE P18`); seção de cookies em `public/privacidade.html` | não (desligado por padrão) |
| P19 | Virar para publicado | Henrique (no dia) | `data-modo="rascunho"` para `data-modo="publicado"` em `public/index.html`, `public/privacidade.html` e `public/404.html`; `noindex, nofollow` para `index, follow` em `public/index.html` e `public/privacidade.html` | é o próprio ato de publicar |
| P20 | Confirmar o endereço do Instagram | Henrique | `https://www.instagram.com/aspencore_/` em `public/index.html` (rodapé, JSON-LD) e `public/privacidade.html` (rodapé) | não |
| P21 | Tirar do ar ou corrigir a página antiga `aspencore.onrender.com` (tem frases proibidas) | Henrique e o dono do repositório antigo | fora deste site | não, mas a bio do Instagram não pode apontar para ela |

## Itens a fazer fora deste repositório

- Criar o formulário no Tally conforme a seção 8.1 do plano (campos, textos, campos ocultos de UTM, página de agradecimento e link da política de privacidade já no domínio novo).
- Depois do P07, rodar a checagem 20 do plano (UTM chegando ao Tally, cookies de `tally.so`, leitor de tela no iframe) e testar o link da bio no Android e no iPhone.
