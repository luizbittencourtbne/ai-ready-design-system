# Switch

Fonte de verdade: o componente **Switch** em **04. CORE-Basics (Audit)**
`BWdzK06j2tX1Dt62ZSxNR1`, página **✅ 08. Controls** `827:887` — component set `16715:1144`
(`tone` × `state` × `checked`, 18 variantes) e `.Master Switch` `1468:1255` (`size`, 3
variantes, privado).

Dados lidos **ao vivo** do Figma via MCP em 24/09/2026, com `skipInvisibleInstanceChildren =
false`: descrição do set, das 18 variantes e do master; variáveis ligadas a cada camada,
incluindo a opacidade; geometria medida nos nós, incluindo a posição da camada
`thumb-checked`. Junto veio a especificação `switch.rules.md` recebida com a tarefa (conferida
pelo design em 23/09/2026), reescrita aqui no formato deste repositório. Nenhum valor foi
inventado.

**Não confundir com o `Switch (descontinuado)` `1697:1842`**, que fica na mesma página e não é
fonte de nada aqui — ver a seção própria no fim deste arquivo.

## Switch vs os outros dois

| | Switch | Checkbox | Radio |
| --- | --- | --- | --- |
| Para quê | configuração com **efeito imediato** | opção **independente** | escolha **única** num grupo |
| Quando vale | **na hora**, sem confirmar | ao **enviar** o formulário | ao enviar o formulário |
| Elemento | `<input type="checkbox" role="switch">` | `<input type="checkbox">` | `<input type="radio">` em `<fieldset>` |
| O estado se vê por | **posição do pino** | glifo | ponto |
| Hover | **nenhum** (D7) | borda passa a 2px | borda passa a 2px |
| `indeterminate` | não | sim, só no pai de um grupo | não |
| Teclado | Espaço | Espaço; Tab por caixa | setas dentro do grupo |

A pergunta que decide: **a mudança acontece no clique, sem botão de salvar?** Se acontece, é
Switch. Se só vale quando a pessoa envia o formulário, é Checkbox — mesmo que o desenho de um
interruptor pareça mais bonito ali.

## Quando usar

- Configurações que se aplicam na hora: "Notificações", "Modo escuro", "Mostrar saldo".
- Ligar ou desligar um recurso numa tela de preferências sem botão de salvar.

## Quando não usar

- Opção de formulário que só vale no envio ("Aceito os termos") → Checkbox.
- Escolha entre opções → Radio.
- Ação que dispara algo e não fica ligada ("Enviar agora") → Button.
- Terceiro estado, "no meio" → não existe. Se a mudança depende de rede, mostre o novo estado
  na hora e reverta com mensagem se falhar.

## Anatomia

`[ trilho [ pino ] ] [ rótulo ]` — `<label>` flex horizontal, alinhado ao centro, `gap: 8px`.

```html
<label class="bmb-switch bmb-switch--neutral bmb-switch--md">
    <input type="checkbox" role="switch" class="bmb-switch__input" name="notificacoes" checked>
    <span class="bmb-switch__label">Notificações</span>
</label>
```

- O `<label>` é o componente e recebe tom e tamanho.
- O **trilho é o próprio input**, com `appearance: none`; o **pino é o `::before`** dele.
- O rótulo descreve **a configuração, não o estado**: "Notificações", e não
  "Ativado"/"Desativado". Não troque o texto ao alternar.

## Props

| Prop | Valores | Default | Onde mora no Figma |
| --- | --- | --- | --- |
| `tone` | `neutral` · `brand` · `invert` | `neutral` | set `Switch` |
| `size` | `sm` · `md` · `lg` | `md` | `.Master Switch` aninhado |
| `checked` | `false` · `true` | `false` | set `Switch` |
| `state=disabled` | atributo `disabled` no input | — | set `Switch` |
| `state=focus` | — (pseudo-classe) | — | set `Switch` |
| rótulo | conteúdo do `<span class="bmb-switch__label">` | — | `Copy` no master |

O set tem **três estados**, não quatro: `default`, `focus`, `disabled`. **Não existe hover**
(D7). São 3 tons, não os 13 temas do Button nem os 9 do Hyperlink.

## Cor

A cor vem dos tokens semânticos e muda com `data-brand` e `data-theme`. O mapeamento
tom → token está em `../scripts/build-switch-css.mjs`.

| Tom | Trilho desligado | Trilho ligado | Pino | Rótulo | Anel |
| --- | --- | --- | --- | --- | --- |
| `neutral` | `border-base-subtle-alt` | `on-surface-base` | `base-default` | `on-surface-base` | `border-base-focus-alt` |
| `brand` | `border-base-subtle-alt` | `on-surface-primary` | `base-default` | `on-surface-primary` | `border-base-focus-alt` |
| `invert` | `on-surface-subtle-brand` | `on-surface-neutral-brand` | `surface-brand` | `on-surface-neutral-brand` | `on-surface-neutral-brand` |

**Zero tokens novos.** Os 8 tokens distintos que as 18 variantes ligam foram conferidos um a
um contra `../dist/brands.css`: todos já existiam, com 6 definições cada. Em Employer claro e
escuro, o valor resolvido é o mesmo que o Figma reporta.

**Por que esses tokens.** O Switch não tem borda, então o próprio trilho precisa passar 3:1
contra a página. Os tokens do legado reprovavam: `on-base-alt` (trilho desligado) dava 2,18,
`primary-default` (brand ligado) 1,45 no Dark e `border-brand` (invert desligado) 1,67. **Não
troque o trilho por um token de fundo "mais suave" sem medir.**

`base-default` não é constante: é `#000000` em employer/dark, `#0e141c` em epays/dark e
`#0e1c13` em bne-cia/dark. Resolva sempre pelo token; nenhum hex é escrito em
`dist/switch.css`.

## Estados

| Estado | Como acontece | O que muda |
| --- | --- | --- |
| default | input em repouso | — |
| focus | `:focus-visible` no input | anel de 2px com folga de 2px em volta de trilho + rótulo |
| disabled | atributo `disabled` no input | opacidade 0,4 no controle inteiro, mantendo tom e posição do pino; sem foco |
| checked | `:checked` | trilho troca de cor e o pino vai para a direita |
| hover | — | **nada.** Só o cursor, que já vem do `<label>` |

**Não existe hover** (D7): o Switch não tem borda para o delta de hover dos irmãos, e um hover
igual ao repouso seria variante redundante. O CSS gerado não tem nenhuma regra de `:hover`, e
a validação reprova qualquer `:hover` que não seja só `cursor`.

**Não existe `indeterminate`** (D4).

## Geometria

Medida nos nós do `.Master Switch`, não nos valores declarados.

| | `sm` | `md` | `lg` |
| --- | --- | --- | --- |
| Trilho (L × A) | 30 × 16 | 34 × 20 | 46 × 24 |
| Pino | 12 | 16 | 20 |
| Folga do pino | 2 | 2 | 2 |
| Pino desligado (`thumb`) em x | 2 | 2 | 2 |
| Pino ligado (`thumb-checked`) em x | 16 | 16 | 24 |
| Deslize em CSS | 14 | 14 | 22 |

- O pino fica a 2px das bordas do trilho: à esquerda desligado, à direita ligado.
- Raio do trilho e do pino: `--bmb-radius-full`.
- Distância trilho ↔ rótulo: 8px.
- **O trilho não muda de tamanho** entre desligado e ligado. Em CSS, o pino anda por
  `transform: translateX(...)`, que não mexe no layout.

A conta é verificada no build: `pino + 2 × folga = altura do trilho` e
`largura − pino − folga = posição do thumb-checked`. Se alguém mexer em `switch.tokens.json` e
a conta deixar de fechar, o gerador quebra com o nome do tamanho.

## Anel de foco

- `outline: 2px solid var(--_bmb-switch-ring)` com `outline-offset: 2px`, no `<label>`, a
  partir do `:focus-visible` do input, via `:has()`. O anel envolve trilho + rótulo.
- Token: `border-base-focus-alt` em `neutral` e `brand`; `on-surface-neutral-brand` em
  `invert`.
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

**1. Uma camada de pino, não duas.** No Figma, desligado e ligado usam camadas próprias
(`thumb` e `thumb-checked`), e por isso o pino fica certo em qualquer tamanho. Em CSS há um
pino só, o `::before`, que anda `translateX(largura − pino − 2 × folga)`. A posição final é a
mesma da camada `thumb-checked` — o build confere.

**2. Deslize de 120ms — acréscimo.** O Figma não define animação. A duração é a mesma das
transições do Hyperlink, e **`prefers-reduced-motion: reduce` a zera**: o pino troca de lado
sem deslizar.

**3. RTL — acréscimo.** O pino usa `inset-inline-start` e, em `:dir(rtl)`, desliza para a
esquerda. O Figma não desenha RTL.

**4. Anel por `outline` no `<label>`**, não pelo retângulo absoluto do Figma; **anel nativo do
input transparente**, não `outline: none`.

**5. Defaults em `:where()`**: `tone=neutral`, `size=md`.

**6. Cores forçadas — acréscimo.** O sistema substitui o fundo, e um trilho sem borda sumiria.
Um `outline` de 1px para dentro desenha o contorno sem mudar o tamanho; o pino fica em
`CanvasText` e o anel em `Highlight`. É a posição do pino que diz se está ligado.

Risco comum aos três controles: `::before` num `<input>` com `appearance: none` funciona em
Chromium, Firefox e WebKit, mas não é garantido pela especificação do HTML.

## Acessibilidade

- `<input type="checkbox" role="switch">` nativo dentro de `<label>`. O leitor de tela anuncia
  interruptor e o estado a partir do `checked` nativo. Sem rótulo visível, `aria-label` no
  input é obrigatório.
- **`role="switch"` é obrigatório** — sem ele é um Checkbox com outra roupa.
- **Proibido `aria-pressed`**: é botão de alternância, outro papel.
- Espaço alterna. Tab entra e sai.
- **Estado nunca só pela cor:** a posição do pino também muda.
- O rótulo descreve a configuração, não o estado.
- Disabled: atributo `disabled` nativo, mantendo a posição do pino.
- Movimento reduzido respeitado.

### Contraste

**Medido no Figma** (especificação recebida, 23/09/2026, 3 marcas × 2 temas): trilho ≥ 3:1
contra a página ou o painel, pior 3,22; pino ≥ 3:1 contra o trilho; rótulo ≥ 4,5:1; anel
≥ 3:1.

**Recalculado a partir de `dist/brands.css`** (24/09/2026, fórmula da WCAG, contra
`base-default` e, no `invert`, contra `surface-brand`): trilho desligado `neutral`/`brand`
≥ 6,49; trilho ligado `neutral` ≥ 15,82 e `brand` ≥ 7,34; trilho `invert` desligado ≥ 3,48
(epays/light) e ligado ≥ 14,52; pino contra o trilho ≥ 3,48 (`invert` desligado, epays/light);
rótulo `brand` ≥ 7,34; anel `border-base-focus-alt` ≥ 6,49 e `on-surface-neutral-brand`
≥ 14,52.

Nenhum dos dois conjuntos foi medido no navegador. Eles não coincidem — ver "Divergências
abertas".

## Divergências abertas

Registradas, não resolvidas por conta própria.

### 1. O default de `size`

| Fonte | Diz |
| --- | --- |
| Propriedade `size` do `.Master Switch` 1468:1255 | default **`sm`** |
| As 18 variantes públicas do set 16715:1144 | todas instanciam **`md`** |
| Especificação recebida | **`md`** |

**Implementado:** `md`. **Como fechar:** trocar o default da propriedade do master, ou mudar
`defaults.size` em `src/switch.tokens.json`.

### 2. O gap ligado a uma variável que não existe no repositório

| Fonte | Diz |
| --- | --- |
| `.Master Switch`, `itemSpacing` | ligado à variável `spacing-sm` (8) |
| `dist/brands.css` | não tem nenhum `--bmb-spacing-*` |

**Implementado:** o literal `8px`, sem criar token.

### 3. A animação

O Figma não define animação — ligado e desligado são camadas diferentes. O deslize de 120ms é
decisão de implementação (desvio 2). **Como fechar:** o design define duração e curva, ou
confirma que não deve haver deslize.

### 4. O `leading-trim` do rótulo

O texto do master usa `leading-trim: CAP_HEIGHT`. O CSS não implementa.

### 5. Contraste: especificação × `brands.css`

O pior trilho é 3,22 na especificação e 3,48 no recálculo. A superfície de referência da
medição do Figma não está registrada. Os dois conjuntos concordam que tudo passa.

## Decisões registradas (não são lacunas)

- **D0 — `tone`, não `theme`.** `invert` só sobre o painel da marca.
- **D1 — disabled sem token** (DS-037). Opacidade 0,4.
- **D2 — `checked`, não `selected`.**
- **D3 — `size` no master**, classe irmã em CSS.
- **D4 — sem `indeterminate`.**
- **D5 — anel `border-base-focus-alt`** em `neutral` e `brand`.
- **D6 — o foco não muda o tamanho.**
- **D7 — sem hover.** O único efeito de passar o mouse é o cursor.
- **DS-049 — sem classe para o rótulo.** `Show copy` do master não vira classe.

## Switch (descontinuado)

`Switch (descontinuado)` `1697:1842`, 24 variantes (`Enable` × `Size` × `Theme`), na mesma
página. Descontinuado em 23/09/2026.

> **Não gerar código, mockup nem variante a partir deste componente.**

Ele não é implementado neste pacote, não tem classe e não é fonte de nenhum valor aqui. As
cores mudaram **de propósito**: o trilho desligado e o `brand` do legado usavam tokens que
reprovavam 3:1. O Switch novo também não tem hover.

### Mapa de migração

| Legado | Switch novo |
| --- | --- |
| `Enable=Off` / `Enable=On` | `checked` `false` / `true` |
| `Theme=Base` / `Primary` / `Invert` | `tone` `neutral` / `brand` / `invert` |
| `Theme=Disabled` | atributo `disabled` + `tone` `neutral` |
| `Size=Small` / `Medium` / `Large` | `size` `sm` / `md` / `lg` (no `.Master Switch`) |

O mesmo mapa está na descrição do componente descontinuado no Figma e em
`deprecatedLegacy`, no contrato.
