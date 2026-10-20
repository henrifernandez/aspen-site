# Site da Aspen Core (rascunho v1)

Site estático da Aspen Key: página principal, política de privacidade e página 404. HTML, CSS e JavaScript simples, sem build, sem cookies e sem rastreadores. O plano completo está em `/mnt/user-data/outputs/aspen/site-plano/PLANO-SITE.md`.

## Ver no computador

```
python3 ferramentas/servidor_local.py
```

Abra `http://localhost:8765`. O servidor imita o Cloudflare Pages (endereços sem `.html`, página 404 e cabeçalhos de `public/_headers`). Abrir `public/index.html` direto do disco funciona, mas o Chrome pode bloquear as fontes locais.

## O que está em cada pasta

- `public/` tudo que vai ao ar (pasta de saída no Cloudflare Pages, sem comando de build).
- `origem/og.html` modelo da imagem de compartilhamento.
- `ferramentas/` scripts de apoio: fontes, imagens, favicons, imagem de compartilhamento, servidor local e verificações.
- `PENDENCIAS.md` cada item que depende do Henrique, com arquivo e trecho.
- `_qa/` capturas e relatório da verificação (fora do repositório).

## Pendências

Todo item faltante está marcado com `PENDENTE` (ou `seudominio` para domínio e e-mail). Para listar:

```
python3 ferramentas/checar_pendentes.py
```

## Publicar

1. Troque os marcadores da lista em `PENDENCIAS.md` (Tally, domínio, e-mail, textos da privacidade, data).
2. Em `index.html`, `privacidade.html` e `404.html`, troque `data-modo="rascunho"` por `data-modo="publicado"`. Em `index.html` e `privacidade.html`, troque `noindex, nofollow` por `index, follow`.
3. Rode `python3 ferramentas/checar_pendentes.py --publicar`. Só publique se terminar sem erro.
4. Envie ao GitHub e conecte o repositório ao Cloudflare Pages com framework `None`, comando de build vazio (ou `exit 0`) e diretório de saída `public`.

## Regerar arquivos

- Fontes: `bash ferramentas/gerar_fontes.sh` (precisa de fontTools e brotli).
- Imagens: `python3 ferramentas/exportar_imagens.py` (precisa de Pillow).
- Favicons: `python3 ferramentas/gerar_favicons.py`.
- Imagem de compartilhamento: `python3 ferramentas/gerar_og.py` (precisa de Playwright e do Chromium).
- Verificação completa: `python3 ferramentas/qa_playwright.py` com o servidor local ligado.
