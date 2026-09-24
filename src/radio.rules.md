# Radio

Fonte de verdade: o componente **Radio** em **04. CORE-Basics (Audit)**
`BWdzK06j2tX1Dt62ZSxNR1`, página **✅ 08. Controls** `827:887` — component set `1575:189`
(`tone` × `state` × `checked`, 24 variantes) e `.Master Radio` `1575:175` (`size`, 3
variantes, privado). No Figma existe **só o item**: o grupo é regra de código.

Dados lidos **ao vivo** do Figma via MCP em 24/09/2026, com `skipInvisibleInstanceChildren =
false`: descrição do set, das 24 variantes e do master; variáveis ligadas a cada camada,
incluindo a opacidade; geometria medida nos nós. Junto veio a especificação `radio.rules.md`
recebida com a tarefa (conferida pelo design em 23/09/2026), reescrita aqui no formato deste
repositório. Nenhum valor foi inventado.

## Radio vs os outros dois

| | Radio | Checkbox | Switch |
| --- | --- | --- | --- |
| Para quê | escolha **única** num grupo | opção **independente** | configuração com **efeito imediato** |
| Quando vale | ao **enviar** o formulário | ao enviar o formulário | **na hora**, sem confirmar |
| Elemento | `<input type="radio">` em `<fieldset>` | `<input type="checkbox">` | `<input type="checkbox" role="switch">` |
| Sozinho | **nunca** — mínimo 2 | pode | pode |
| `indeterminate` | **não** | sim, só no pai de um grupo | não |
| Hover | borda passa a 2px | borda passa a 2px | **nenhum** |
| Teclado | **um Tab por grupo**; setas movem a seleção | Espaço; Tab por caixa | Espaço |

A pergunta que decide: **marcar esta opção desmarca as outras?** Se desmarca, é Radio. Se as
opções convivem, é Checkbox. Se a escolha tem efeito imediato, sem botão de salvar, é Switch.

## Quando usar

- Escolha única entre 2 a ~6 opções visíveis ao mesmo tempo: "Forma de pagamento", "Plano".
- Quando comparar as opções lado a lado ajuda a decidir.

## Quando não usar

- Uma opção só ("Aceito os termos") → Checkbox. Um Radio sozinho não se desmarca.
- Opções independentes → Checkbox.
- Mais de ~6 opções → Dropdown: radio longo empurra a decisão para baixo da dobra.
- Efeito imediato → Switch.
- Permitir "nenhuma escolha" desmarcando → não existe; inclua uma opção explícita "Nenhum".

## Anatomia

`[ círculo ] [ rótulo ]` por item — `<label>` flex horizontal, alinhado ao centro,
`gap: 8px` —, sempre dentro de um grupo.

```html
<fieldset>
    <legend>Forma de pagamento</legend>
    <label class="bmb-radio bmb-radio--neutral bmb-radio--md">
        <input type="radio" class="bmb-radio__input" name="pagamento" value="pix" checked>
        <span class="bmb-radio__label">Pix</span>
    </label>
    <label class="bmb-radio bmb-radio--neutral bmb-radio--md">
        <input type="radio" class="bmb-radio__input" name="pagamento" value="boleto">
        <span class="bmb-radio__label">Boleto</span>
    </label>
</fieldset>
```

- O `<label>` é o componente e recebe tom e tamanho.
- O `<input type="radio">` é **nativo**, com `appearance: none`. O mesmo `name` em todos os
  itens é o que dá o comportamento de grupo — um valor só, um ponto de Tab, setas.
- O ponto é desenho do componente: o `::before` do input.

## Props

| Prop | Valores | Default | Onde mora |
| --- | --- | --- | --- |
| `tone` | `neutral` · `brand` · `invert` | `neutral` | set `Radio`; **igual em todo o grupo** |
| `size` | `sm` · `md` · `lg` | `md` | `.Master Radio` aninhado; **igual em todo o grupo** |
| `checked` | `false` · `true` | `false` | set `Radio`; em código, um input marcado por `name` |
| `state=disabled` | atributo `disabled` no input ou no `<fieldset>` | — | set `Radio` |
| `state=hover` / `focus` | — (pseudo-classe) | — | set `Radio` |
| rótulo | conteúdo do `<span class="bmb-radio__label">` | — | `Text` no master |
| nome do grupo | `name` em todos os inputs + `<legend>` | obrigatório | — (regra de código) |

### `tone` e `size` são do grupo

A especificação recebida descreve `tone` e `size` como props do `RadioGroup`, herdadas pelos
itens: opções do mesmo grupo não devem variar entre si. **Este pacote é CSS** e não tem
`RadioGroup`. A regra vira: **todas as classes de tom e de tamanho iguais dentro do mesmo
`<fieldset>`**. A validação reprova uma demo que misture tons ou tamanhos no mesmo grupo.

São **3 tons**, não os 13 temas do Button nem os 9 do Hyperlink. O eixo se chama `tone`.

## Cor

A cor vem dos tokens semânticos e muda com `data-brand` e `data-theme`. O mapeamento
tom → token está em `../scripts/build-radio-css.mjs`.

| Tom | Borda | Preenchimento marcado | Ponto | Rótulo | Anel |
| --- | --- | --- | --- | --- | --- |
| `neutral` | `on-surface-base` | `base-default-alt` | `on-surface-base-alt` | `on-surface-base` | `border-base-focus-alt` |
| `brand` | `on-surface-primary` | `primary-default` | `on-primary` | `on-surface-primary` | `border-base-focus-alt` |
| `invert` | `on-surface-subtle-brand` | `on-surface-subtle-brand` | `background-brand` | `on-surface-neutral-brand` | `on-surface-neutral-brand` |

**Desmarcado não tem preenchimento:** o círculo mostra a superfície de trás. Conferido nas 12
variantes desmarcadas — a camada do círculo não tem fill.

**Zero tokens novos.** Os 10 tokens distintos que as 24 variantes ligam foram conferidos um a
um contra `../dist/brands.css`: todos já existiam, com 6 definições cada. Em Employer claro e
escuro, o valor resolvido é o mesmo que o Figma reporta.

**A cor não muda por estado.** Conferido nas 24 variantes.

`on-*` não é constante entre marcas e temas: `on-primary` é `#000000` em bne-cia/dark, e
`on-surface-primary` é `#7bffde` ali. Resolva sempre pelo token; nenhum hex é escrito em
`dist/radio.css`.

## Estados

| Estado | Como acontece | O que muda |
| --- | --- | --- |
| default | input em repouso | — |
| hover | `:hover` no `<label>` | borda de 1px por dentro → 2px centralizada; nenhuma cor muda |
| focus | `:focus-visible` no input | anel de 2px com folga de 2px em volta de círculo + rótulo |
| disabled | atributo `disabled` no input (ou no `<fieldset>`) | opacidade 0,4 no controle inteiro, sem hover e sem foco |
| checked | `:checked` | preenchimento + ponto |

**Não existe `indeterminate` no Radio** (D4). Um radio marcado não se desmarca com um novo
clique.

## Geometria

Medida nos nós do `.Master Radio`, não nos valores declarados.

| | `sm` | `md` | `lg` |
| --- | --- | --- | --- |
| Círculo | 14 | 16 | 18 |
| Ponto | 4,375 | 5 | 5,625 |
| Posição do ponto | 4,8125 | 5,5 | 6,1875 |

- Borda: 1px por dentro. No hover, 2px centralizada.
- Raio do círculo e do ponto: `--bmb-radius-full` — o mesmo `border-radius-full` do Figma.
- Distância círculo ↔ rótulo: 8px.

A conta é verificada no build: o ponto é centrado (`posição × 2 + ponto = círculo`) e precisa
caber dentro da borda. Se a conta deixar de fechar, o gerador quebra com o nome do tamanho.

## Anel de foco

- `outline: 2px solid var(--_bmb-radio-ring)` com `outline-offset: 2px`, no `<label>`, a
  partir do `:focus-visible` do input, via `:has()`. O anel envolve círculo + rótulo.
- Token: `border-base-focus-alt` em `neutral` e `brand`; **`on-surface-neutral-brand`** em
  `invert`.
- **Não** use `on-surface-subtle-brand` no `invert`, como o Checkbox faz: no Radio ele já é a
  cor da borda do círculo, e o anel se fundiria com ela. A descrição do set diz isso em
  palavras.
- **Não** é `border-{tom}-focus`: reprovam 3:1 (DS-046/047).
- O foco não muda o tamanho: `outline` não ocupa espaço.
- Raio: `calc(var(--bmb-radius-md) - 4px)` no `<label>`, para a borda externa do anel bater
  com o `border-radius-md` do retângulo de foco do Figma.

## Tipografia

| | `sm` | `md` | `lg` |
| --- | --- | --- | --- |
| Estilo do Figma | `Paragraph/Small/Regular` | `Paragraph/Medium/Regular` | `Paragraph/Large/Regular` |
| Token | `--bmb-font-size-paragraph-small` | `--bmb-font-size-paragraph-medium` | `--bmb-font-size-paragraph-large` |

Família `--bmb-font-family-body`, peso `--bmb-font-weight-regular`, entrelinha
`--bmb-line-height-130`. Nenhum px de fonte é cravado.

## Desvios do Figma (autorizados)

**1. Hover por sombra externa.** Borda de 1px + `box-shadow: 0 0 0 1px` na cor da borda, que
reproduz os 2px centralizados do Figma sem mudar o círculo.

**2. Anel por `outline` no `<label>`**, não pelo retângulo absoluto do Figma.

**3. Anel nativo do input transparente**, não `outline: none`. Em cores forçadas aparecem dois
anéis concêntricos, ambos visíveis.

**4. Ponto por `::before`.** Risco: `::before` num `<input>` com `appearance: none` funciona em
Chromium, Firefox e WebKit, mas não é garantido pela especificação do HTML.

**5. Defaults em `:where()`**: `tone=neutral`, `size=md`.

**6. Cores forçadas — acréscimo**: borda e ponto em `CanvasText`, anel em `Highlight`.

**7. Grupo por `<fieldset>` nativo.** O `RadioGroup` da especificação não vira classe: o
comportamento de grupo vem do `name`, e o nome do grupo vem do `<legend>`. Nenhum JavaScript
de roving tabindex.

## Acessibilidade

- `<input type="radio">` nativo dentro de `<label>`, com o **mesmo `name`** em todos os itens,
  dentro de `<fieldset>` + `<legend>`.
- **Teclado de grupo:** um único ponto de Tab — o item marcado, ou o primeiro se nenhum
  estiver. Setas movem foco **e** seleção; Espaço marca o item focado. Tudo nativo: não
  implemente roving tabindex à mão.
- **Estado nunca só pela cor:** o marcado se distingue pelo ponto.
- **Mínimo de 2 no grupo.** Um Radio sozinho não se desmarca e não é escolha.
- Disabled: atributo `disabled` nativo, no item ou no `<fieldset>` inteiro.
- Proibido: `aria-pressed`, `indeterminate`.
- **A borda do controle marcado não pode ser removida.** No `brand` marcado, o preenchimento
  `primary-default` fica abaixo de 3:1 contra a página no modo escuro.

### Contraste

**Medido no Figma** (especificação recebida, 23/09/2026, 3 marcas × 2 temas): borda ≥ 3:1,
pior 3,22 no `invert`; rótulo ≥ 4,5:1; ponto sobre o preenchimento ≥ 3:1; anel ≥ 3:1;
`on-surface-primary` ≥ 6,04.

**Recalculado a partir de `dist/brands.css`** (24/09/2026, fórmula da WCAG, contra
`base-default` e, no `invert`, contra `surface-brand`): borda `neutral` ≥ 15,82; borda e
rótulo `brand` ≥ 7,34; borda `invert` ≥ 3,48 (epays/light); rótulo `invert` ≥ 14,52; ponto
sobre o preenchimento ≥ 3,55 (`invert`, epays/light); anel `border-base-focus-alt` ≥ 6,49;
anel `on-surface-neutral-brand` ≥ 14,52; `brand` marcado 2,45 em epays/dark.

Nenhum dos dois conjuntos foi medido no navegador. Eles não coincidem — ver "Divergências
abertas".

## Divergências abertas

Registradas, não resolvidas por conta própria.

### 1. O default de `size`

| Fonte | Diz |
| --- | --- |
| Propriedade `size` do `.Master Radio` 1575:175 | default **`sm`** |
| As 24 variantes públicas do set 1575:189 | todas instanciam **`md`** |
| Especificação recebida | **`md`** |

**Implementado:** `md`. **Como fechar:** trocar o default da propriedade do master, ou mudar
`defaults.size` em `src/radio.tokens.json`.

### 2. O tamanho do ponto

| Fonte | `sm` | `md` | `lg` |
| --- | --- | --- | --- |
| Nós do `.Master Radio` | 4,375 | 5 | 5,625 |
| Especificação recebida | 4,4 | 5 | 5,6 |

A especificação arredonda. **Implementado** o medido.

### 3. O gap ligado a uma variável que não existe no repositório

| Fonte | Diz |
| --- | --- |
| `.Master Radio`, `itemSpacing` | ligado à variável `spacing-sm` (8) |
| `dist/brands.css` | não tem nenhum `--bmb-spacing-*` |

**Implementado:** o literal `8px`, como o `gap` do Hyperlink — sem criar token. O Checkbox usa
8 cru no Figma. **Como fechar:** levar os espaçamentos ao audit, se o time quiser que o gap
venha de token.

### 4. O `leading-trim` do rótulo

O texto do master usa `leading-trim: CAP_HEIGHT`. O CSS não implementa (suporte parcial a
`text-box-trim`).

### 5. Contraste: especificação × `brands.css`

Os números não coincidem (ver "Contraste"): o pior `invert` é 3,22 na especificação e 3,48 no
recálculo. A superfície de referência da medição do Figma não está registrada. Os dois
conjuntos concordam que tudo passa, exceto o preenchimento `brand` marcado no escuro.

## Decisões registradas (não são lacunas)

- **D0 — `tone`, não `theme`.** `invert` só sobre o painel da marca.
- **D1 — disabled sem token** (DS-037). Opacidade 0,4.
- **D2 — `checked`, não `selected`.**
- **D3 — `size` no master**, classe irmã em CSS.
- **D4 — sem `indeterminate`.** Só o Checkbox tem.
- **D5 — anel `border-base-focus-alt`** em `neutral` e `brand`; `on-surface-neutral-brand` em
  `invert`.
- **D6 — o foco não muda o tamanho.**
- **DS-049 — sem classe para o rótulo.** `Show copy` do master não vira classe.
- **Sem desmarcar por clique.** É comportamento nativo e é a regra da especificação.
