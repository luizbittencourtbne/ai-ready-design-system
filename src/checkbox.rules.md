# Checkbox

Fonte de verdade: o componente **Checkbox** em **04. CORE-Basics (Audit)**
`BWdzK06j2tX1Dt62ZSxNR1`, página **✅ 08. Controls** `827:887` — component set `1451:1360`
(`tone` × `state` × `checked`, 36 variantes) e `.Master Checkbox` `1451:1285` (`size`, 3
variantes, privado).

Dados lidos **ao vivo** do Figma via MCP em 24/09/2026, com `skipInvisibleInstanceChildren =
false`: descrição do set, das 36 variantes e do master; variáveis ligadas a cada camada,
incluindo a opacidade; geometria medida nos nós; path dos glifos. Junto veio a especificação
`checkbox.rules.md` recebida com a tarefa (conferida pelo design em 23/09/2026), reescrita
aqui no formato deste repositório. Nenhum valor foi inventado.

## Checkbox vs os outros dois

| | Checkbox | Radio | Switch |
| --- | --- | --- | --- |
| Para quê | opção **independente** | escolha **única** num grupo | configuração com **efeito imediato** |
| Quando vale | ao **enviar** o formulário | ao enviar o formulário | **na hora**, sem confirmar |
| Elemento | `<input type="checkbox">` | `<input type="radio">` em `<fieldset>` | `<input type="checkbox" role="switch">` |
| Sozinho | pode | **nunca** — mínimo 2 | pode |
| `indeterminate` | **sim**, só no pai de um grupo | não | não |
| Hover | borda passa a 2px | borda passa a 2px | **nenhum** |
| Teclado | Espaço; Tab por caixa | setas dentro do grupo; um Tab por grupo | Espaço |

A pergunta que decide: **marcar esta opção muda alguma outra?** Se muda — marcar uma desmarca
as outras —, é Radio. Se não muda, pergunte de novo: **o efeito acontece no clique, sem
botão de salvar?** Se acontece, é Switch. Se só vale quando a pessoa envia, é Checkbox.

## Quando usar

- Aceitar termos, marcar preferências que só valem ao salvar.
- Listas de opções independentes: "Quais canais você usa?" com várias respostas possíveis.
- O "selecionar todos" no cabeçalho de Table ou List — é o único uso do `indeterminate`.

## Quando não usar

- Escolha única entre opções → Radio.
- Ligar ou desligar algo com efeito imediato ("Notificações", "Modo escuro") → Switch.
- Terceiro estado de negócio ("talvez", "parcial") → não existe; o `indeterminate` é só do pai.
- Disparar efeito colateral no clique → Switch ou Button.

## Anatomia

`[ caixa ] [ rótulo ]` — `<label>` flex horizontal, alinhado ao centro, `gap: 8px`.

```html
<label class="bmb-checkbox bmb-checkbox--neutral bmb-checkbox--md">
    <input type="checkbox" class="bmb-checkbox__input" name="termos">
    <span class="bmb-checkbox__label">Aceito os termos</span>
</label>
```

- O `<label>` é o componente e recebe tom e tamanho. Ele envolve o input, então o rótulo
  inteiro é área clicável.
- O `<input type="checkbox">` é **nativo**, com `appearance: none`. Não troque por `<div>` ou
  `<span>`: a semântica, o teclado e o envio no formulário vêm dele.
- O glifo é desenho do componente, não slot: é o `::before` do input, com o path medido no
  Figma.

## Props

| Prop | Valores | Default | Onde mora no Figma |
| --- | --- | --- | --- |
| `tone` | `neutral` · `brand` · `invert` | `neutral` | set `Checkbox` |
| `size` | `sm` · `md` · `lg` | `md` | `.Master Checkbox` aninhado |
| `checked` | `false` · `true` · `indeterminate` | `false` | set `Checkbox` |
| `state=disabled` | atributo `disabled` no input | — | set `Checkbox` |
| `state=hover` / `focus` | — (pseudo-classe) | — | set `Checkbox` |
| rótulo | conteúdo do `<span class="bmb-checkbox__label">` | — | `Text` no master |

Em CSS, `tone` e `size` viram **classes irmãs** (`bmb-checkbox--brand bmb-checkbox--lg`),
como no Dot. `checked`, `hover`, `focus` e `disabled` **não são classes**: vêm do input
nativo.

São **3 tons**, não os 13 temas do Button nem os 9 do Hyperlink. O eixo se chama `tone`, não
`theme`. Não copie a escala do Button.

## Cor

A cor vem dos tokens semânticos e muda com `data-brand` e `data-theme`. O mapeamento
tom → token está em `../scripts/build-checkbox-css.mjs`.

| Tom | Caixa desmarcada | Caixa marcada | Glifo | Borda | Rótulo | Anel |
| --- | --- | --- | --- | --- | --- | --- |
| `neutral` | `base-default` | `base-default-alt` | `on-surface-base-alt` | `on-surface-base` | `on-surface-base` | `border-base-focus-alt` |
| `brand` | `on-primary` ⚠️ DS-053 | `primary-default` | `on-primary` | `on-surface-primary` | `on-surface-primary` | `border-base-focus-alt` |
| `invert` | `surface-brand` | `surface-brand` | `on-surface-neutral-brand` | `on-surface-neutral-brand` | `on-surface-neutral-brand` | `on-surface-subtle-brand` |

Todos com o prefixo `--bmb-color-` e o grupo do token (por exemplo
`--bmb-color-base-on-on-surface-base`). Os nomes completos estão no contrato, em
`tokens.perTone`.

**Zero tokens novos.** Os 11 tokens distintos que as 36 variantes ligam foram conferidos um a
um contra `../dist/brands.css`: todos já existiam, com 6 definições cada (3 marcas × 2
modos). Em Employer claro e escuro — os dois modos que o arquivo do Figma expõe — o valor
resolvido é o mesmo que o Figma reporta.

**A cor não muda por estado.** Hover só engrossa a borda, focus acrescenta o anel e disabled
aplica opacidade. Conferido nas 36 variantes.

### `on-*` e `base-default` não são constantes

| | employer | epays | bne-cia |
| --- | --- | --- | --- |
| `on-primary` (dark) | `#fafafa` | `#fafafa` | **`#000000`** |
| `base-default` (dark) | **`#000000`** | `#0e141c` | `#0e1c13` |
| `on-surface-primary` (dark) | `#a5b3d5` | `#90a1de` | `#7bffde` |

Resolva sempre pelo token. Nenhum hex é escrito em `dist/checkbox.css`, nem como fallback; a
validação reprova se aparecer.

## Estados

| Estado | Como acontece | O que muda |
| --- | --- | --- |
| default | input em repouso | — |
| hover | `:hover` no `<label>` | borda de 1px por dentro → 2px centralizada; nenhuma cor muda |
| focus | `:focus-visible` no input | anel de 2px com folga de 2px em volta de caixa + rótulo |
| disabled | atributo `disabled` no input | opacidade 0,4 no controle inteiro, sem hover e sem foco |
| checked | `:checked` | fundo da caixa marcada + glifo `check` |
| indeterminate | `:indeterminate` (`input.indeterminate = true`) | fundo da caixa marcada + traço horizontal |

`indeterminate` **não tem atributo HTML**: é definido por script. Existe só para o pai de um
grupo parcialmente marcado. Clicar nele marca todos os filhos.

## Geometria

Medida nos nós do `.Master Checkbox`, não nos valores declarados.

| | `sm` | `md` | `lg` |
| --- | --- | --- | --- |
| Caixa | 14 | 16 | 18 |
| Glifo `check` (L × A) | 5,09 × 3,5 | 8 × 5,5 | 9 × 6,19 |
| Posição do `check` | 4, 5 | 4, 5 | 4,5, 5,625 |
| Traço do `indeterminate` | 6 | 8 | 10 |
| Posição do traço | 4, 7 | 4, 8 | 4, 9 |

- Traço dos dois glifos: **1,6666px**. `check` com ponta e junção arredondadas;
  `indeterminate` com ponta arredondada.
- Borda: 1px por dentro. No hover, 2px centralizada.
- Raio da caixa: `--bmb-radius-sm` — o mesmo `border-radius-sm` que o Figma liga (4px no
  Desktop, 2px abaixo de 1024px).
- Distância caixa ↔ rótulo: 8px.

A conta é verificada no build: o traço do `indeterminate` é centrado nos dois eixos
(`x + w + x = caixa`, `y × 2 = caixa`) e o `check` precisa caber na caixa com meia espessura
de folga. Se alguém mexer em `checkbox.tokens.json` e a conta deixar de fechar, o gerador
quebra com o nome do tamanho.

## Anel de foco

- `outline: 2px solid var(--_bmb-checkbox-ring)` com `outline-offset: 2px`, no `<label>`,
  a partir do `:focus-visible` do input, via `:has()`. O anel envolve caixa + rótulo.
- Token: `border-base-focus-alt` em `neutral` e `brand`; `on-surface-subtle-brand` em
  `invert`.
- **Não** é `border-{tom}-focus`: `border-base-focus` e `border-primary-focus` reprovam 3:1
  (DS-046/047). Decisão fechada, não é lacuna.
- **O foco não muda o tamanho do componente.** `outline` não ocupa espaço. Nunca `border`,
  `padding` ou `box-shadow` no foco.
- Raio: no Figma o anel é um retângulo em −4px, com traço de 2px por dentro e
  `border-radius-md` na borda externa. O `<label>` recebe
  `calc(var(--bmb-radius-md) - 4px)`, e a borda externa do outline dá 8px no Desktop e 4px
  abaixo de 1024px, como no Figma.

## Tipografia

| | `sm` | `md` | `lg` |
| --- | --- | --- | --- |
| Estilo do Figma | `Paragraph/Small/Regular` | `Paragraph/Medium/Regular` | `Paragraph/Large/Regular` |
| Token | `--bmb-font-size-paragraph-small` | `--bmb-font-size-paragraph-medium` | `--bmb-font-size-paragraph-large` |

Família `--bmb-font-family-body`, peso `--bmb-font-weight-regular`, entrelinha
`--bmb-line-height-130` (130% no Figma). Nenhum px de fonte é cravado: os tokens
`paragraph-*` encolhem abaixo de 1024px, como no Button e no Hyperlink.

## Desvios do Figma (autorizados)

**1. Hover por sombra externa, não por borda de 2px.** No Figma a borda passa a 2px
centralizada, ou seja, 1px a mais para fora. Em CSS, trocar `border-width` mudaria a caixa e
empurraria o rótulo. A borda fica em 1px e uma `box-shadow: 0 0 0 1px` na cor da borda
acrescenta o pixel de fora — o desenho é o mesmo e a caixa não muda.

**2. Anel por `outline` no `<label>`, não por retângulo.** O Figma desenha o anel como um
retângulo absoluto em −4px. `outline` com `outline-offset: 2px` reproduz a folga e a espessura
sem ocupar espaço.

**3. Anel nativo do input transparente.** O navegador desenharia um segundo anel em volta da
caixa. Ele é neutralizado com `outline: 2px solid transparent`, não com `outline: none`, que a
validação proíbe. Efeito colateral: em cores forçadas o sistema pinta esse outline, e aparecem
dois anéis concêntricos — ambos visíveis.

**4. Glifo por máscara SVG.** O glifo é o `::before` do input, recortado por uma máscara com o
path do Figma e pintado pelo token do tom. A máscara só recorta; a cor não está nela.
Risco: `::before` num `<input>` com `appearance: none` funciona em Chromium, Firefox e WebKit,
mas não é garantido pela especificação do HTML. Não foi testado em navegador.

**5. Defaults em `:where()`.** O Figma define `tone=neutral` e as variantes públicas usam
`size=md`. `.bmb-checkbox` sozinho renderiza exatamente isso, com especificidade zero, como no
Dot.

**6. Cores forçadas — acréscimo.** O sistema substitui fundo e borda, e um glifo pintado por
`background-color` sumiria. O glifo sai do ajuste automático e fica em `CanvasText`; a borda
em `CanvasText` e o anel em `Highlight`.

## Acessibilidade

- `<input type="checkbox">` nativo dentro de `<label>`. Sem rótulo visível, `aria-label` no
  input é obrigatório.
- Espaço alterna. Tab entra e sai de cada caixa — não é grupo com setas.
- Grupo com título: `<fieldset>` + `<legend>`.
- **Estado nunca só pela cor:** marcado e indeterminado se distinguem pelo glifo. No `invert` a
  caixa marcada tem o mesmo fundo da desmarcada, e só o glifo muda.
- `indeterminate`: com o input nativo, o leitor de tela anuncia o estado misto a partir de
  `input.indeterminate`. `aria-checked="mixed"` só se aplica a `role="checkbox"`, que este
  pacote não usa.
- Proibido: `role="switch"` (é outro componente) e `aria-pressed` (é botão de alternância).
- Disabled: atributo `disabled` nativo. Ele já tira do Tab.
- **A borda do controle marcado não pode ser removida.** No `brand` marcado, o preenchimento
  `primary-default` fica abaixo de 3:1 contra a página no modo escuro; quem delimita o controle
  é a borda `on-surface-primary`.

### Contraste

**Medido no Figma** (especificação recebida, 23/09/2026, 3 marcas × 2 temas): borda e rótulo
≥ 4,5:1 nos três tons; `on-surface-primary` ≥ 6,04; anel ≥ 3:1 — pior 3,78 com
`border-base-focus-alt` e 3,22 com `on-surface-subtle-brand` sobre o navy; `brand` marcado
abaixo de 3:1 no Dark (Employer 2,81, Epays 1,45).

**Recalculado a partir de `dist/brands.css`** (24/09/2026, fórmula da WCAG, contra
`base-default` e, no `invert`, contra `surface-brand`): borda `neutral` ≥ 15,82; borda e
rótulo `brand` ≥ 7,34; borda e rótulo `invert` ≥ 14,52; glifo sobre a caixa marcada ≥ 5,17;
anel `border-base-focus-alt` ≥ 6,49; anel `on-surface-subtle-brand` ≥ 3,48; `brand` marcado
2,45 em epays/dark e 3,90 em employer/dark.

Nenhum dos dois conjuntos foi medido no navegador. Eles não coincidem — ver "Divergências
abertas".

## Divergências abertas

Registradas, não resolvidas por conta própria. `AGENTS.md` pede que uma diferença entre Figma,
audit e especificação seja exposta com a fonte de cada versão, em vez de escolhida em silêncio.

### 1. DS-053 — token de texto como fundo

| Fonte | Diz |
| --- | --- |
| Figma, `tone=brand, checked=false` (as 4 variantes) | fundo da caixa = `on-primary` |
| Especificação recebida | `on-primary`, com o aviso ⚠️ DS-053 |

`on-primary` é um token de **texto** usado como fundo. **Implementado** como o Figma mostra.
**Como fechar:** decidir no `01. CORE-Brands` se existe um fundo de controle da marca; se
existir, trocar `TONS.brand.bg` em `scripts/build-checkbox-css.mjs`.

### 2. O default de `size`

| Fonte | Diz |
| --- | --- |
| Propriedade `size` do `.Master Checkbox` 1451:1285 | default **`sm`** |
| As 36 variantes públicas do set 1451:1360 | todas instanciam **`md`** |
| Especificação recebida | **`md`** |

**Implementado:** `md`. **Como fechar:** trocar o default da propriedade do master para `md`,
ou decidir que é `sm` e mudar `defaults.size` em `src/checkbox.tokens.json`.

### 3. O glifo `check` do `sm`

| Tamanho | Caixa | `check` | Centro do `check` | Centro da caixa |
| --- | --- | --- | --- | --- |
| `sm` | 14 | 5,09 × 3,5 em (4, 5) | 6,55, 6,75 | 7, 7 |
| `md` | 16 | 8 × 5,5 em (4, 5) | 8, 7,75 | 8, 8 |
| `lg` | 18 | 9 × 6,19 em (4,5, 5,625) | 9, 8,72 | 9, 9 |

No `sm` o glifo está deslocado meio pixel para a esquerda e para cima, e é proporcionalmente
menor (36% da caixa, contra 50% no `md` e no `lg`). Parece que o glifo foi reduzido sem ser
recentrado. **Implementado** como medido. **Como fechar:** o design confirma ou corrige o
`check` do `sm` no `.Master Checkbox`.

### 4. O `leading-trim` do rótulo

O texto do master usa `leading-trim: CAP_HEIGHT`. O CSS não implementa: `text-box-trim` ainda
tem suporte parcial nos navegadores. A entrelinha de 130% está implementada.

### 5. Contraste: especificação × `brands.css`

Os números da especificação e os recalculados a partir de `dist/brands.css` (seção
"Contraste") não coincidem — por exemplo, o pior anel `border-base-focus-alt` é 3,78 num e
6,49 no outro, e o `brand` marcado em epays/dark é 1,45 num e 2,45 no outro. A superfície de
referência da medição do Figma não está registrada. Os dois conjuntos concordam no que
importa: tudo passa, exceto o preenchimento `brand` marcado no escuro, e é por isso que a borda
fica.

### 6. `on-surface-primary` na bne-cia/dark

A especificação recebida diz que `on-surface-primary` é `#00F4B7` na bne-cia/dark.
`dist/brands.css` resolve para `#7bffde`; `#00f4b7` é o `primary-default` dessa marca e modo.
Não afeta o CSS (a cor sai do token), só o texto da especificação.

## Decisões registradas (não são lacunas)

- **D0 — `tone`, não `theme`.** Três valores: `neutral`, `brand`, `invert`. `invert` só sobre o
  painel da marca (`surface-brand`).
- **D1 — disabled sem token.** Mesma cor do tom em repouso, opacidade 0,4 no controle inteiro
  (DS-037).
- **D2 — `checked`, não `selected`.**
- **D3 — `size` no master.** Em CSS, classe irmã, como no Dot.
- **D4 — `indeterminate` só no Checkbox.**
- **D5 — anel `border-base-focus-alt`.** Não `border-{tom}-focus` (DS-046/047).
- **D6 — o foco não muda o tamanho.** `outline` + `outline-offset`, nunca `border`, `padding`
  ou `box-shadow`.
- **DS-049 — sem classe para o rótulo.** O master tem o booleano `Show copy`; em código o
  rótulo é conteúdo e a presença do texto é o mecanismo. Não existe `--show-label`.
- **Traço diagonal oculto não é implementado.** As camadas `Icon` `1840:3860`, `1840:3388` e
  `1840:3426` do `.Master Checkbox` estão escondidas nas três variantes de tamanho.
- **O rótulo não recebe `user-select: none`.** Selecionar o texto de um rótulo é comportamento
  do navegador, e o componente não decide isso.
