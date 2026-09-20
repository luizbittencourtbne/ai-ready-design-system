# Button — BambooDS (experimento)

Para usar a revisão guiada por IA no Cowork, comece em [`COWORK-LEIA-PRIMEIRO.md`](COWORK-LEIA-PRIMEIRO.md). As instruções do projeto estão em `CLAUDE.md` e `AGENTS.md`; o exemplo da primeira revisão está em `review-exemplo.md`.

Para chamar dois subagentes reais no Claude Code, veja [`CLAUDE-CODE-AGENTES.md`](CLAUDE-CODE-AGENTES.md). Eles ficam em `.claude/agents/`; o pacote ainda não inclui um gatilho automático para alterações de arquivos.

Componente HTML/CSS derivado dos audits do Figma, com três marcas e modos claro/escuro. Este pacote usa os dados incluídos no ZIP; o build não depende da pasta externa `TESTES`.

## Estrutura

| Pasta | Papel |
| --- | --- |
| `src/button.tokens.json` | Dados de geometria extraídos do Button no Figma; fonte editável para o CSS do botão |
| `src/button.contract.json` | API consultável: temas, tamanhos, classes, estados e requisitos de acessibilidade |
| `components.json` | Índice dos componentes e caminhos dos seus contratos, regras, código e demo |
| `src/button.rules.md` | Contexto, decisões, medidas e divergências conhecidas |
| `src/structural.css` | Snapshot editável de raio e tipografia do pacote original |
| `audit/audit-*-raw.json` | Tabelas brutas de cores primitivas e semânticas extraídas do Figma |
| `audit/prev-*.json` | Snapshots anteriores, preservados do pacote enviado |
| `audit/core-brands-audit.json` | Cores resolvidas geradas a partir das tabelas brutas |
| `scripts/` | Extração e geração; caminhos resolvidos a partir do próprio script |
| `scripts/validate.mjs` | Verifica contrato, dados, CSS, tokens e links após o build |
| `dist/` | CSS e JavaScript gerados; não editar manualmente |
| `demo/` | Playground interativo e página estática que consomem `dist/` |

**Fluxo de cores:** `audit/audit-*-raw.json` → `audit/core-brands-audit.json` → `dist/brands.css`. O snapshot `src/structural.css` completa `brands.css` com tipografia e raios.

**Fluxo do botão:** `src/button.tokens.json` + mapeamento dos temas em `scripts/build-css.mjs` → `dist/button.css`, `dist/button.preview.css` e `dist/button.tokens.js`. O mapeamento de temas ainda é mantido em JavaScript; o JSON de contrato descreve a API pública, mas não gera o CSS.

## Reconstruir e validar

Com Node.js e npm instalados, execute da raiz do pacote (não é preciso instalar dependências):

```bash
npm run check
```

O comando reconstrói os arquivos e **falha com uma mensagem** se contrato, dados do Figma, mapeamento de temas, seletores CSS, referências a tokens ou links das demos divergirem. Para rodar as etapas separadamente:

```bash
npm run build
npm run validate
```

Os scripts também funcionam com caminhos absolutos de outro diretório. Para testar visualmente, abra `demo/playground.html` no navegador. `demo/index.html` mostra exemplos estáticos. O preview usa CSS direto do navegador; `dist/button.css` mantém o `@import 'tailwindcss'` para o projeto que usa Tailwind v4.

### Ao adicionar outro componente

1. Crie seus arquivos de fonte, contrato, regras, gerador e demo seguindo o Button.
2. Adicione uma entrada ao array de `components.json`, com caminhos relativos à raiz.
3. Adicione verificações específicas ao `scripts/validate.mjs` para as propriedades e estados desse componente. Hoje a verificação detalhada cobre o **Button**; para outros componentes, o índice só verifica se os arquivos existem.
4. Acrescente o build do novo componente ao script `build` em `package.json` e rode `npm run check`.

O índice ajuda um agente a descobrir os componentes; ele não cria uma ferramenta de busca ou MCP por si só. O contrato lista a API, enquanto `scripts/build-css.mjs` continua responsável pelo mapeamento de temas. A validação detecta divergência entre eles, mas ainda não gera ambos a partir de um único arquivo.

Para atualizar os audits a partir de um dump de metadata do Figma, use `python scripts/extract-audit.py <dump.txt> audit/audit-brands-raw.json prims` e, para a outra tabela, `python scripts/extract-audit.py <dump.txt> audit/audit-semantic-raw.json sem`. Em seguida execute os três builds. `extract-audit.py` espera o formato do dump usado neste experimento; não consulta o Figma sozinho.

## Uso

Carregue `dist/brands.css` antes de `dist/button.preview.css` no navegador. A marca e o modo são escolhidos por `data-brand` e `data-theme` no elemento raiz. Consulte `src/button.contract.json` para as classes suportadas e `src/button.rules.md` para as decisões de desenho.

```html
<html data-brand="employer" data-theme="light">
  <head>
    <link rel="stylesheet" href="dist/brands.css">
    <link rel="stylesheet" href="dist/button.preview.css">
  </head>
  <body>
    <button type="button" class="bmb-button bmb-button--primary bmb-button--md">Continuar</button>
  </body>
</html>
```

## Origem e pendências

As cores vieram de **01. CORE-Brands (Audit)**, nós `341:88` e `341:162`; a geometria, de **04. CORE-Basics (Audit)**, Button `9:872` e `.Master Button` `9:170`. O modo dark mantém valores da tabela do Audit, pois não foi conferido contra amostras ao vivo. O foco usa um anel interno de 3px, mantendo a geometria do botão.

O Audit do Figma contém decisões ainda não resolvidas. Situação em 19/09/2026:

| Pendência | Situação |
| --- | --- |
| Warning com anel de foco transparente | **Resolvido no código.** O anel foi restaurado usando o próprio token do tema, por decisão do dono do design system. A origem no Figma continua transparente — ver `src/button.rules.md`, "Desvios do Figma (autorizados)" item 5. |
| CTA coincide com Success | **Mantido por decisão** (19/09/2026). A coincidência é parcial: bate em employer e epays no claro e nas três marcas no escuro, e diverge em bne-cia claro (`#00bd3f` vs `#0f6c2e`). Na prática CTA é um apelido de Success, com essa exceção. |
| Plain Error/Selected | **Resolvido.** O CSS emparelha fundo e cor de texto no Selected de `plain` e `plain-error`, então o texto claro sobre fundo transparente não acontece. O desvio estava implementado sem registro e agora consta em `src/button.rules.md`, "Desvios do Figma (autorizados)" item 4. |
| `bne-cia` / claro / Secondary reprova AA | **Mantido por decisão** (19/09/2026). Verde `#009b34` com texto `#fafafa`, 3,51:1. Vai para produção reprovando o critério de texto normal; ver `src/button.rules.md`, "Achados conhecidos — mantidos por decisão". |

Não há mais pendência de design em aberto nesta lista: as duas restantes foram decididas e mantidas. Nenhuma razão de contraste foi medida com ferramenta nesta revisão — os números vêm da documentação anterior.

O antigo componente SCSS no repositório `TESTES` não está incluído neste pacote. O snapshot `src/structural.css` preserva os valores de raio e tipografia que vieram no CSS original; se esses tokens mudarem no design system, atualize esse arquivo também.
