# Dot — regras de uso

Indicador visual de status. Um círculo colorido, opcionalmente com um glifo dentro.

Fonte: Figma `04. CORE-Basics (Audit)` `BWdzK06j2tX1Dt62ZSxNR1` — `Dot` 992:1153, component set
`16645:256367` (eixo `tone`, 5 variantes) e `.Master Dot` `16645:256354` (eixo `Size`, 3
variantes). Lido ao vivo via MCP em 2026-09-22, junto com a especificação `dot.rules.md`
recebida com a tarefa.

---

## A regra que manda em todas as outras

**O Dot nunca pode ser a única fonte da informação de status.**

Ele comunica por cor, e só por cor. O glifo opcional não muda de forma entre os tons — um
Success e um Error com glifo são o mesmo desenho em cores diferentes. Quem não distingue as
cores não distingue os status. É WCAG 1.4.1 (Uso de Cor).

Por isso, uma destas duas formas é obrigatória:

```html
<!-- 1. Há texto visível ao lado: o Dot é decoração. -->
<span class="bmb-dot bmb-dot--success bmb-dot--md" aria-hidden="true"></span> Ativo

<!-- 2. Não há texto visível: o Dot precisa de rótulo próprio. -->
<span class="bmb-dot bmb-dot--error bmb-dot--md" role="img" aria-label="Offline"></span>
```

Um `.bmb-dot` que não tem nem `aria-hidden="true"` nem `role="img"` + `aria-label` **reprova na
validação**. Não é recomendação.

Um detalhe que costuma escapar: dentro de um componente maior, o texto do item nem sempre
resolve. Numa lista de pessoas, `Maria` + Dot verde não nomeia o status — `Maria` diz quem, não
diz como ela está. O texto precisa nomear o **status**.

---

## Dot vs Button vs Hyperlink

| | Dot | Button | Hyperlink |
| --- | --- | --- | --- |
| Para quê | informar | executar uma ação | levar a outro destino |
| Elemento | `<span>` | `<button>` | `<a href>` |
| Interativo | **não** | sim | sim |
| Estados | **nenhum** | 6 | 6 |
| Recebe foco | **não** | sim | sim |

O Dot não é acionável. Se algo precisa ser clicado, o componente é outro. Não acrescente
`onClick`, `tabindex`, `:hover`, `:focus` nem `role="button"` — a validação reprova o CSS se
qualquer pseudo-classe de interação aparecer nele.

Isto não é preferência de implementação: está na descrição do componente no Figma, em palavras.
A propriedade foi **renomeada de `State` para `tone`** exatamente por isso — os cinco valores
são tons, não estados.

---

## Os cinco tons

`tone` é o eixo do component set. O default é `Base`.

| Tom | Quando usar | Fundo | Glifo |
| --- | --- | --- | --- |
| `base` | status sem categoria — contagem genérica, presença neutra | `base-default-alt` | `on-base-alt` |
| `primary` | remete à **marca** — novidade, plano, feature | `primary-default` | `on-primary` |
| `success` | positivo — online, ativo, aprovado, concluído | `success-default` | `on-success` |
| `warning` | exige atenção, mas não é falha — pendente, atrasado | `warning-default` | `on-warning` |
| `error` | negativo ou crítico — offline, falhou, bloqueado | `error-default` | `on-error` |

**`primary` não é `success`.** É o erro de semântica mais fácil de cometer aqui: o tom Primary
existe para remeter à marca, não para dizer que algo deu certo. Um cadastro aprovado é
`success`, mesmo que o verde da marca seja mais bonito naquela tela.

### A cor do glifo não é constante entre as marcas

`on-{tom}` muda por marca, e não por pouco:

| | employer | epays | bne-cia |
| --- | --- | --- | --- |
| `success-default` | `#0f6c31` | `#0f6c31` | `#00bd3f` |
| `on-success` | `#fafafa` | `#fafafa` | **`#000000`** |

Em bne-cia o verde de sucesso é muito mais claro, então o glifo resolve para **preto**. Cravar
`#fafafa` — ou `white`, ou qualquer hex — quebraria o componente numa das três marcas.

Nenhum hex é escrito em `dist/dot.css`, nem como fallback. A validação reprova se aparecer.

---

## Geometria

Do `.Master Dot`. O diâmetro total é `padding + glifo + padding`:

| Tamanho | Diâmetro | Padding | Glifo |
| --- | --- | --- | --- |
| `sm` (Small) | 8px | 1px | 6px |
| `md` (Medium) — default | 16px | 3px | 10px |
| `lg` (Large) | 24px | 4px | 16px |

O raio é `--bmb-radius-full` (1000px), que é o mesmo `border-radius-full` do Figma. Sempre
pílula — não há variante quadrada.

A conta é verificada no build: se alguém mexer em `dot.tokens.json` e `pad + icon + pad` deixar
de bater com `box`, o gerador quebra com o nome do tamanho em vez de emitir um círculo errado.

### Onde o eixo `Size` mora no Figma

`tone` está no set `Dot`; `Size` está na instância aninhada `.Master Dot`. São dois níveis
diferentes na árvore. Em CSS não existe essa hierarquia — as duas viram classes irmãs
(`.bmb-dot--success .bmb-dot--lg`). Vale saber ao comparar com o Figma.

---

## O glifo é opcional

`Show icon` é um booleano do `.Master Dot`, com default `false`. Em CSS não existe classe para
ligar ou desligar: o glifo **é a presença do filho**.

```html
<!-- sem glifo: círculo liso -->
<span class="bmb-dot bmb-dot--success bmb-dot--md" aria-hidden="true"></span>

<!-- com glifo -->
<span class="bmb-dot bmb-dot--success bmb-dot--lg" aria-hidden="true">
    <span class="bmb-dot__icon"><svg>…</svg></span>
</span>
```

O SVG vem de quem consome (no Figma é um instance swap). Ele precisa usar `currentColor` em
`fill` ou `stroke` — é assim que o token `on-{tom}` chega até ele.

Sem glifo o elemento fica sem conteúdo. É por isso que o diâmetro é explícito (`inline-size` /
`block-size`) em vez de sair do padding: senão o círculo colapsaria para zero.

---

## Desvios e acréscimos em relação ao Figma

**1. `outline` em alto contraste — acréscimo.** No modo de cores forçadas o sistema substitui
`background-color`, e os cinco tons ficam idênticos. O Dot perde a única coisa que os
diferencia.

Isso **não** é corrigido com `forced-color-adjust: none`. Devolver a cor à força atropelaria a
paleta que a pessoa escolheu justamente por precisar dela. O que carrega o significado nesse
modo é o texto ao lado — mais uma razão para a regra de uso ser obrigatória.

O que o bloco faz é garantir que o círculo continue **visível**: sem ele, o fundo forçado pode
coincidir com o da página e o indicador some. `outline` com `outline-offset: -1px` em vez de
`border`, para não comer o padding e encolher o glifo.

**2. Defaults em `:where()` — implementação.** O Figma define defaults (`tone=Base`,
`Size=Medium`), diferente do Button e do Hyperlink, cujos contratos exigem a classe. Então
`.bmb-dot` sozinho precisa renderizar, e precisa renderizar exatamente isso.

Os defaults ficam em `:where(.bmb-dot)`, que tem especificidade **zero**. Num bloco normal a
especificidade empataria com `.bmb-dot--lg`, e quem venceria seria a última regra do arquivo —
o default passaria a depender da ordem em que o gerador imprime. Com zero, qualquer classe de
tom ou tamanho ganha sempre.

---

## Divergências abertas

Registradas, não resolvidas por conta própria. `AGENTS.md` pede que uma diferença entre Figma,
audit e especificação seja exposta com a fonte de cada versão, em vez de escolhida em silêncio.

### 1. A cor do glifo no tom Base

| Fonte | Diz |
| --- | --- |
| Especificação recebida | `on-base-alt` — `#a3a3a3` |
| Variáveis ligadas na variante (`get_variable_defs` em 16645:256368) | `on-base-alt` **e** `on-surface-base-alt` — as duas |
| SVG exportado da variante | renderiza `#e5e5e5`, que é `on-surface-base-alt` |

Os outros quatro tons ligam exatamente dois tokens (fundo + `on`), sem ambiguidade. Só o Base
liga três.

O SVG exportado não decide a questão: nos outros quatro tons ele sai com `fill="white"`
(`#ffffff`), e nenhum deles usa `#ffffff` — `on-primary` é `#fafafa`. Ou seja, o exportador não
está resolvendo a cor ligada nessas variantes, e por isso o `#e5e5e5` do Base também não serve
como prova.

**Implementado:** `on-base-alt`, seguindo a especificação.

**Como fechar:** abrir a variante `tone=Base` no Figma e olhar a que camada cada um dos dois
tokens está ligado. Se o glifo for `on-surface-base-alt`, trocar em `TONS.base.fg` dentro de
`scripts/build-dot-css.mjs` — é uma linha, e a tabela acima precisa ser atualizada junto.

### 2. O default de `Show icon`

A especificação diz `false`. A descrição do componente no Figma confirma que o ícone é
opcional. Mas **todas** as variantes renderizam com o glifo, e o valor default de uma
propriedade booleana não é legível pelo MCP.

**Implementado:** `false` — círculo liso quando nada é escrito.

**Como fechar:** abrir o `.Master Dot` no Figma e ler o valor default da propriedade
`Show icon` no painel de propriedades do componente.

---

## Decisões registradas

- **`<span>`, não `<div>`.** O Dot acompanha texto; um elemento de bloco quebraria a linha.
- **Sem `transition`.** Não há estado para transicionar. Uma transição aqui só serviria para
  animar uma troca de tom feita por JavaScript, e isso é decisão de quem consome, não do
  componente.
- **Sem `cursor`.** `cursor: pointer` num elemento que não faz nada é promessa falsa.
- **O glifo não é fornecido pelo Design System.** No Figma é instance swap; aqui é slot. Embutir
  um ícone fixo inventaria uma decisão que o componente não toma.
