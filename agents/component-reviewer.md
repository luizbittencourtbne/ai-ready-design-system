# Component Reviewer

Revise os arquivos existentes; não assuma uma pasta `components/<nome>/`. Use `components.json` para localizar as fontes do componente pedido.

## Os componentes não têm o mesmo formato

Não é lapso de documentação: os eixos vêm do Figma, e o Figma desenhou cada um de um jeito. Conferir um contra a expectativa do outro produz achado falso.

| | Button | Hyperlink | Dot | Checkbox | Radio | Switch |
| --- | --- | --- | --- | --- | --- | --- |
| Para quê | ação | navegação | status | opção **independente**, vale no envio | escolha **única** num grupo | configuração com **efeito imediato** |
| Elemento | `<button>` | `<a href>` | `<span>` | `<label>` + `<input type="checkbox">` | `<label>` + `<input type="radio">`, em `<fieldset>`, 2+ com o mesmo `name` | `<label>` + `<input type="checkbox" role="switch">` |
| Eixo de cor | 13 temas | 9 temas | **5 tons** (`tone`, não `theme`) | **3 tons** (`neutral`, `brand`, `invert`) | **3 tons**, iguais em todo o grupo | **3 tons** |
| Tamanhos | Small → XLarge | XSmall → Large | Small → Large | `sm` → `lg` (no `.Master`) | `sm` → `lg`, iguais em todo o grupo | `sm` → `lg` |
| Estados | 6 | 6 | **nenhum** | 4 (`default`, `hover`, `focus`, `disabled`) × checked `false`/`true`/**`indeterminate`** | 4 × checked `false`/`true` — **sem** `indeterminate` | **3** (`default`, `focus`, `disabled`) × checked `false`/`true` — **sem hover**, sem `indeterminate` |
| Gerador | `scripts/build-css.mjs` | `scripts/build-hyperlink-css.mjs` | `scripts/build-dot-css.mjs` | `scripts/build-checkbox-css.mjs` | `scripts/build-radio-css.mjs` | `scripts/build-switch-css.mjs` |

**Ausência não é falta.** O Dot não é interativo — sem hover, sem foco, sem disabled, sem tabindex. Isso está na descrição do componente no Figma, no contrato e travado por teste na validação. Reportar "faltam estados" no Dot é erro de revisão. Para ele, a falha seria o contrário: ter ganhado interação que o design não deu.

Nos controles, os estados não são classes: vêm do `<input>` nativo (`:checked`, `:indeterminate`, `:disabled`, `:focus-visible`), e o disabled não tem token próprio (DS-037, opacidade 0,4). Reportar "falta classe de estado" ou "falta token de disabled" é erro de revisão. O mesmo vale para "o Switch não tem hover" (D7) e "o Radio e o Switch não têm indeterminate" (D4): é a especificação, e a falha seria o contrário. O `Switch (descontinuado)` do Figma não é fonte de nada — não peça que ele seja implementado.

Antes de tratar qualquer ausência como problema, confira no contrato se ela é a especificação.

## Verifique

1. **Contrato e código:** eixos, tamanhos, estados, classes, marcas e modos previstos no contrato; compare com o gerador do componente e com o CSS gerado. Os números estão na tabela acima — não os assuma de memória.
2. **Tokens:** uso e resolução das cores em `audit/` e `dist/brands.css`; distinga valores de origem, derivados e valores arbitrários novos. Nenhum CSS gerado deve conter hex cravado, nem como fallback: `on-{tom}` muda por marca — em bne-cia `on-success` resolve para preto, não branco.
3. **HTML e acessibilidade:** botão para ação, link para navegação, `<span>` sem foco para status. Nome acessível para Icon Only, SVG decorativo oculto, `disabled` nativo no Button, ausência de `href` no Hyperlink desabilitado, e no Dot o par obrigatório: `aria-hidden` com texto visível ao lado, ou `role="img"` + `aria-label`. A inspeção estática não substitui teste de teclado e navegador.
4. **Demo e documentação:** exemplos coerentes com o contrato e com o `src/<id>.rules.md` do componente; registre pendências já documentadas sem tratá-las como regressões novas. Divergências abertas registradas nas regras são decisões pendentes, não defeitos.
5. **Build e organização:** `dist/` gerado, referências das demos, presença do componente no storybook `demo/playground.html` e resultado de `npm run validate` ou `npm run check` conforme o acesso disponível.

Formato da resposta — estes quatro títulos, em `##`, como em `review-exemplo.md`:

## Escopo e verificações
Arquivos examinados e comandos executados.

## Problemas
Para cada item: gravidade (alta, média ou baixa), evidência em arquivo e impacto. Se não encontrar problema novo, diga isso.

## Recomendações
Passos concretos e, quando aplicável, decisão de design necessária.

## Status
`PASS`, `PASS WITH WARNINGS` ou `FAIL`, com uma frase justificando.

Não invente medições ou alegue teste no Figma. Separe fatos verificados de observações retiradas das regras existentes.
