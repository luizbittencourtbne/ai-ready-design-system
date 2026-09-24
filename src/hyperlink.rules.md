# Hyperlink

Fonte de verdade: o componente **Hiperlink** em **04. CORE-Basics (Audit)**
`BWdzK06j2tX1Dt62ZSxNR1`, nó `240:1702` — component set `99:8725` (Theme × State) e
`.Master Hiperlink` `99:8672` (Size × Content).

Dados lidos **ao vivo** do Figma via MCP, em duas passadas: 20/09/2026 (primeira) e 20/09/2026
(segunda, depois do ajuste de 18/09 no componente). Nenhum valor foi inventado.

> **O que o ajuste de 18/09/2026 trouxe:** anel de foco próprio por tema, Hit Area de 24px em
> todas as variantes de tamanho, remoção da altura fixa do master, ícone do Large alinhado
> entre os dois conteúdos, e — na descrição do componente — decisões escritas sobre link
> visitado, link externo, `inline-flex` e comportamento do Disabled. Nove das onze pendências
> que a primeira leitura tinha registrado foram resolvidas na origem.

## Hyperlink vs Button

| | Hyperlink | Button |
| --- | --- | --- |
| Para quê | **navegar** para outro destino | **executar** uma ação |
| Elemento | `<a href="...">` | `<button type="...">` |
| Sem destino | não existe — sem `href` não é link | normal |
| Tecla | Enter | Enter e Espaço |
| Menu de contexto | abrir em nova aba, copiar endereço | não se aplica |

A pergunta que decide: **depois do clique, a pessoa vai para outro lugar?** Se vai, Hyperlink.
Se algo acontece na mesma página — salvar, enviar, abrir modal, alternar — é Button, mesmo que
o desenho pareça um link.

Se o seu caso é uma ação que **parece** um link, isso não é Hyperlink. Ou é um Button com
aparência de link, que hoje **não existe** neste Design System, ou é uma decisão de design a
tomar. Não use Hyperlink para contornar aparência.

## Quando usar

- Navegação interna entre páginas ou rotas.
- Navegação externa para outro site — ver "Link externo".
- Link dentro de um parágrafo.
- Link isolado, fora de texto corrido.

## Quando não usar

- Enviar formulário → `<button type="submit">`.
- Abrir modal, drawer, menu ou tooltip → Button.
- Alternar estado, curtir, favoritar, expandir → Button.
- Disparar qualquer coisa que não muda de destino → Button.

## Anatomia

`[ ícone esquerdo ] [ label ] [ ícone direito ]` — flex horizontal, alinhado ao centro,
`gap: 4px` (`Values/spacing-xs`), padding `0` (`Values/none`).

A variante `Content = Label & Icon` tem **os dois slots de ícone**. Não há propriedade de
posição: quem consome decide usar um, outro ou os dois.

Há ainda uma camada invisível, `Hit Area`, em todas as 8 variantes de tamanho — ver
"Acessibilidade".

## Props

| Prop | Valores | Obrigatório no CSS |
| --- | --- | --- |
| `theme` | Base · Primary · Secondary · Tertiary · Quaternary · Success · Warning · Error · Invert | **sim** — sem classe de tema não há cor nem anel de foco |
| `size` | XSmall · Small · Medium · Large | **sim** — sem classe de tamanho não há fonte nem ícone |
| `state` | Default · Hover · Active · Selected · Focus · Disabled | não — Default é a ausência das outras |
| `content` | Label & Icon · Icon Only | não — Label & Icon é o padrão |

São **9 temas**, não 13: o Hyperlink não tem Plain, Plain Invert, CTA nem Plain Error. E os
tamanhos são **XSmall/Small/Medium/Large**, não Small/Medium/Large/XLarge como no Button. Não
copie a escala do Button.

## Cor

A cor vem dos tokens semânticos e muda com `data-brand` e `data-theme`. O mapeamento
tema → token está em `../scripts/build-hyperlink-css.mjs`.

**O Hyperlink não introduziu nenhum token novo.** As 23 variáveis que o Figma usa foram
conferidas uma a uma contra `../dist/brands.css`: todas já existiam, com 6 definições cada
(3 marcas × 2 modos) e o mesmo valor resolvido que o Figma reporta.

| Tema | Texto | Anel de foco |
| --- | --- | --- |
| Base | `base-on-on-base` + tokens por estado | `base-borders-border-base-focus` |
| Primary | `primary-on-on-surface-primary` | `primary-borders-border-primary-focus` |
| Secondary | `secondary-on-on-surface-secondary` | `secondary-borders-border-secondary-focus` |
| Tertiary | `tertiary-on-on-surface-tertiary` | `tertiary-borders-border-tertiary-focus` |
| Quaternary | `quaternary-on-on-surface-quaternary` | `quaternary-borders-border-quaternary-focus` |
| Success | `success-on-on-surface-success` | `success-borders-border-success-focus` |
| Warning | `warning-on-on-surface-warning` | `warning-borders-border-warning-focus` |
| Error | `error-on-on-surface-error` | `error-borders-border-error-focus` |
| Invert | `surface-brand-on-on-surface-neutral-brand` | `surface-brand-borders-border-brand` |

### Tokens da união que não são do Hyperlink

A união de variáveis do component set inclui quatro tokens que **o CSS do Hyperlink não
referencia**: `primary-backgrounds-primary-selected` (que é do **Button**, onde está mapeado em
`build-css.mjs`), `primary-borders-border-primary-subtle`, `base-backgrounds-base-default-alt`
e `base-on-on-surface-base`. Os três últimos não são consumidos por componente nenhum hoje.

Estão anotados aqui só para que ninguém refaça a pergunta ao comparar o set com o CSS. Não são
pendência do Hyperlink.

### Como sabemos que a cor é única por tema

Foram abertas 10 das 54 variantes do set: os 6 estados do Primary, 3 do Base e o Hover do
Success. As outras 44 não foram lidas uma a uma — e não precisam ser.

A união de variáveis do component set lista tudo que qualquer variante usa. Contando os tokens
de cor por tema: Secondary, Tertiary, Quaternary, Success, Warning, Error e Invert têm
**exatamente dois cada** — um de texto e um de anel de foco. Sem um segundo token de texto,
esses temas **não têm como** variar a cor por estado. O Base é a exceção, com 8 tokens.

Confirmado por amostra em Success/Hover: texto e sublinhado usam `on-surface-success`, o mesmo
token do Success/Default.

Descontados os quatro tokens da seção anterior, que não são do Hyperlink, a união está
explicada e o argumento fecha.

O **Base é o único tema que troca o token do texto por estado**: `base-hover-alt` no hover,
`base-active-alt` no active, `base-selected-alt` no selected, `border-base-focus-alt` no focus.
Nos demais, a cor do texto não muda — só o sublinhado, o anel e a opacidade.

## Estados

| Estado | Sublinhado | Anel | Cor do texto | Opacidade |
| --- | --- | --- | --- | --- |
| Default | não | não | token do tema | 1 |
| Hover | **sim** | não | token do tema (Base: `base-hover-alt`) | 1 |
| Active | **sim** | não | token do tema (Base: `base-active-alt`) | 1 |
| Selected | **sim** | não | token do tema (Base: `base-selected-alt`) | 1 |
| Focus | **sim** | **sim, 2px** | token do tema (Base: `border-base-focus-alt`) | 1 |
| Disabled | não | não | token do tema | **0,4** |

**Só o Default e o Disabled ficam sem sublinhado.** O Active passou a sublinhar no ajuste de
18/09/2026 — antes era idêntico ao Default, e quem apertava o link não recebia retorno visual.
Conferido ao vivo na Plugin API pelo time: a camada `Copy` do Active tem stroke visível, peso 1,
no token `on-surface-{tema}`, nos 9 temas.

## Geometria

Medida nos nós do Figma, não em valores declarados.

| Size | Ícone | Gap | Fonte | Caixa do Icon Only |
| --- | --- | --- | --- | --- |
| XSmall | 8,981px | 4px | `paragraph-xsmall` | 8,915px |
| Small | 12px | 4px | `paragraph-small` | 12px |
| Medium | 16px | 4px | `paragraph-medium` | 16px |
| Large | 18,917px | 4px | `paragraph-large` | 18,917px |

A caixa do Icon Only **é o próprio ícone** — o ajuste de 18/09 removeu a folga que existia
antes. O alvo de toque de 24px passou a vir da Hit Area, não do tamanho da caixa, que é o
caminho certo: aumenta a área clicável sem inflar o desenho.

No XSmall o ícone do Label & Icon (8,981) e o do Icon Only (8,915) diferem em 0,066px —
arredondamento do mesmo glifo. O gerador usa 8,981 nos dois.

### Anel de foco

Borda de 2px, padding 2px na vertical e 4px na horizontal, raio 4px, na cor
`<tema>-borders-border-<tema>-focus`.

### Tipografia

Os estilos de texto são `Button/XSmall`, `Button/Small`, `Button/Medium` e `Button/Large` —
**os mesmos do Button**. Cada um aponta o `size` para o `paragraph-*` correspondente, com peso
semibold e entrelinha 1,3. O Hyperlink não tem escala tipográfica própria: reusa a do Design
System inteira, incluindo o encolhimento abaixo de 1024px.

## Desvios do Figma (autorizados)

1. **Sublinhado por `text-decoration`, não por `border-bottom`.** O Figma desenha o sublinhado
   como borda inferior no wrapper do texto. Em CSS, `text-decoration: underline` acompanha a
   quebra de linha, é o que o modo de cores forçadas preserva e é o que a tecnologia assistiva
   entende como sublinhado de link. Uma borda inferior num contêiner flex ficaria presa a uma
   linha só. Visualmente equivalente no caso de linha única.
2. **Anel de foco por `outline`, não por `border` + `padding`.** O Figma desenha borda de 2px
   com padding de 2px/4px, o que aumenta o elemento. Em CSS isso empurraria o texto ao redor a
   cada Tab, dentro de um parágrafo. `outline` desenha por fora sem ocupar espaço no fluxo.
   **Efeito colateral:** o afastamento fica uniforme (2px), em vez dos 2px verticais e 4px
   horizontais do Figma.
3. **Hit Area por `::after`, não por retângulo.** O Figma usa um retângulo invisível. Um
   elemento real ocuparia espaço; o pseudo-elemento absoluto amplia o alvo sem afetar o
   layout. Mesmo resultado para quem toca, nenhum para quem lê.
4. **Sem `height`.** Não emitimos altura. Na primeira leitura isso era desvio — o master tinha
   24px fixos. O ajuste de 18/09 **removeu a altura fixa** e registrou a mesma preocupação
   como ponto em aberto na descrição. Deixou de ser desvio: virou acordo.

## Acessibilidade

- **Use `<a href="...">` com destino real.** Sem `href`, o elemento não recebe foco, não entra
  na lista de links do leitor de tela e não abre em nova aba. `href="#"` não é fallback. A
  única exceção é o estado desabilitado, onde a ausência de `href` é justamente o mecanismo.
- **Anel de foco:** vem do Figma, 2px na cor do tema. Não há `outline: none` no CSS gerado, e
  a validação reprova se alguém acrescentar.
- **Alvo mínimo de 24px (WCAG 2.5.8):** garantido pela Hit Area, um `::after` invisível. Sem
  ela, o XSmall teria ~9px de altura de alvo.
- **Modo de cores forçadas:** `@media (forced-colors: active)` aplica
  `outline: 2px solid Highlight`.
- **Icon Only exige nome acessível** — `aria-label` no `<a>`. O `<svg>` decorativo leva
  `aria-hidden="true"`.
- **`aria-disabled` só no estado desabilitado**, junto com a remoção do `href`. Nunca em um
  link que continua navegável.
- **Sublinhado como identificação de link:** no Default o link **não** é sublinhado, por
  decisão do time. Isso tem uma regra de uso obrigatória atrelada — ver "Regra de uso
  obrigatória: o Default depende do contexto". Não aplique o componente em texto corrido sem
  fazer essa verificação.
- **Contraste não foi medido.** Nenhuma razão de contraste deste componente foi calculada com
  ferramenta. A combinação texto-sobre-fundo depende do fundo onde o link for colocado, que o
  componente não controla.

## Disabled

**`<a>` não tem estado desabilitado nativo.** Especificação registrada no Figma em 18/09/2026:

- não deve navegar nem disparar ação ao clicar ou pressionar Enter/Espaço;
- não deve receber foco por teclado — o Tab pula o elemento;
- **na prática, remover o atributo `href`** já resolve os dois: um `<a>` sem `href` não é
  focável nem clicável pelo padrão do HTML;
- **marcar `aria-disabled="true"` mesmo assim**, para reforçar o estado no leitor de tela;
- cursor `not-allowed` ou `default` no hover, **nunca `pointer`**.

Markup correto:

```html
<span class="bmb-hyperlink bmb-hyperlink--primary bmb-hyperlink--md bmb-hyperlink--disabled-appearance"
      aria-disabled="true">
    <span class="bmb-hyperlink__label">Hiperlink</span>
</span>
```

Ou, mantendo a tag `<a>` sem `href`:

```html
<a class="bmb-hyperlink bmb-hyperlink--primary bmb-hyperlink--md bmb-hyperlink--disabled-appearance"
   aria-disabled="true">
    <span class="bmb-hyperlink__label">Hiperlink</span>
</a>
```

A classe `bmb-hyperlink--disabled-appearance` aplica a opacidade de 0,4 e o cursor. Ela **não**
remove o `href` sozinha — isso é responsabilidade de quem renderiza.

**Ainda assim, considere não renderizar o link.** Um link desabilitado raramente ajuda: se o
destino não está disponível, texto simples costuma comunicar melhor. A especificação existe
para quando a decisão for mantê-lo.

## Link externo

Registrado no Figma em 18/09/2026. **Não é variante nova de State nem de Theme.**

Use o slot **Right Icon** já existente, com o ícone `arrow-up-right-01-round` (categoria
Arrows, em **03. CORE-Media**). A estrutura e o ícone já existiam; faltava documentar o uso.

Acessibilidade do link externo:

- Se abrir em nova aba, use `target="_blank"` **com** `rel="noopener noreferrer"`.
- O ícone é decorativo (`aria-hidden`), então **não anuncia nada**. Avise no texto do link ou
  no nome acessível que ele abre em nova aba.
- Abrir em nova aba sem avisar quebra a expectativa de quem usa leitor de tela e de quem
  depende do botão Voltar.

## Ícones

- **Decorativo** (o caso padrão): `<span class="bmb-hyperlink__icon" aria-hidden="true">` com o
  `<svg>` dentro. A classe vai no wrapper, não no `<svg>` — a regra
  `.bmb-hyperlink__icon svg` depende disso.
- **Semântico** (o ícone carrega informação que o texto não dá): precisa de nome acessível
  próprio e não pode ser `aria-hidden`. Nesse caso, prefira colocar a informação no texto.
- **Tamanho e alinhamento** saem da classe de tamanho; não defina no markup.
- O `Icon Stroke` do Figma é 1,5 — use ícones com essa espessura.

## Conteúdo

Regra que veio da descrição do componente no Figma:

> Os rótulos para os hiperlinks devem seguir o critério de capitalizar apenas a primeira letra
> da sentença, com o restante em minúsculas.

Além disso:

- O texto do link deve descrever o destino fora de contexto. Leitores de tela navegam por lista
  de links.
- Evite "clique aqui", "saiba mais", "leia mais" sozinhos.
- Não coloque o endereço cru como texto, salvo quando o endereço for a informação.
- Se o link abre em nova aba, diga isso no texto ou no nome acessível.

## Decisões registradas (não são lacunas)

Estas foram **decididas** no Figma em 18/09/2026. Não reabra sem conversar.

1. **Não existe link visitado.** A pseudo-classe `:visited` é restrita pelos navegadores a
   poucas propriedades desde que virou vetor de detecção de histórico. O DS optou por não
   diferenciar, por privacidade. Reverter exigiria uma variante nova de State e uma cor a
   calibrar por tema.
2. **`inline` vs `standalone` não é propriedade.** O `inline-flex` é intencional: resolve
   inline (participa do fluxo de texto) e flex (organiza ícone e label) ao mesmo tempo, como o
   link nativo do HTML já faz.
3. **Link externo não é variante** — é o slot Right Icon com um ícone específico. Ver acima.
4. **Comportamento do Disabled** — especificado. Ver acima.
5. **Default sem sublinhado** — decisão consciente, com o custo de acessibilidade medido
   (1,16:1 contra o mínimo de 3:1) e uma regra de uso obrigatória em contrapartida.
6. **Active com sublinhado** — corrigido em 18/09/2026; antes era idêntico ao Default.

## Regra de uso obrigatória: o Default depende do contexto

O Default **não é sublinhado**, por escolha visual do time — decisão registrada no Figma em
18/09/2026, com o custo medido e aceito, não esquecida.

O custo: entre a cor do link e a cor do texto de corpo ao redor, o contraste medido foi
**1,16:1** (Employer / Light / Primary: `#24304d` contra `#262626`). A WCAG 1.4.1 exige **3:1**
quando a cor é a única pista visual. Nesse cenário, reprova.

Por isso **existe uma verificação obrigatória antes de aplicar o componente numa tela nova**:

> Meça o contraste entre a **cor do link** e a **cor do texto ao redor**. Atenção: é
> cor-contra-cor, **não** o teste de texto-contra-fundo que valida os outros tokens deste
> arquivo. São coisas diferentes e dão números diferentes.
>
> - **≥ 3:1** → pode usar o Default como está, sem sublinhado.
> - **< 3:1** → **não confie só na cor.** Sublinhe o link nesse contexto, com o mesmo
>   tratamento de Hover e Active (token `on-surface-{tema}`), ou escolha outro Theme que tenha
>   contraste suficiente contra aquele texto de corpo específico.

Fora de texto corrido — link isolado, em lista, em card — a questão não se aplica: não há texto
ao redor para confundir.

Para o caso `< 3:1`, use a classe **`bmb-hyperlink--force-underline`** — ver a seção abaixo.

## Force Underline

`bmb-hyperlink--force-underline` sublinha o link no estado de repouso. É a contraparte em
código da propriedade booleana **`Force Underline`** (BOOLEAN, `false` por padrão) que existe
no component set.

```html
<a href="/contrato" class="bmb-hyperlink bmb-hyperlink--primary bmb-hyperlink--md bmb-hyperlink--force-underline">
    <span class="bmb-hyperlink__label">Ver contrato</span>
</a>
```

A cor do sublinhado sai de `currentColor`, que já é o token `on-surface-{tema}` — o mesmo que
Hover e Active usam. **Nenhuma cor é cravada.**

### Por que isso mora no código, e não no Figma

No Figma a propriedade **não desenha nada**: é só sinalização de quando o sublinhado deve
existir. A tentativa de desenhá-lo lá dentro foi feita e descartada em 18/09/2026.

O motivo é estrutural: o retângulo de sublinhado fica **fora** da instância aninhada
`.Master Hiperlink` e não tem como enxergar se `Show Left Icon` e `Show Right Icon` estão
ligados naquela instância. A margem calibrada para uma configuração de ícone desalinha em
qualquer outra — confirmado com prints em duas configurações diferentes. O retângulo foi
removido.

O sublinhado nativo do CSS não tem esse problema: acompanha a largura real do texto, seja qual
for a combinação de ícones. Resolver de vez dentro do Figma exigiria desaninhar o
`.Master Hiperlink` dos 78 nós — mudança estrutural grande, registrada como fora de escopo.

**A leitura correta:** a decisão é do design system e está expressa na prop; o desenho dela é
responsabilidade do código. Não é valor solto na aplicação — é a implementação do que o DS já
declara.

Há ainda um **ponto em aberto registrado pelo próprio Figma**: altura fixa em px pode não bater
com o `line-height` do texto ao redor quando o link fica embutido em parágrafo — não testado.
Na implementação em CSS isso não se aplica, porque não emitimos altura; a altura sai da
entrelinha. Vale reconferir em uso real se aparecer deslocamento vertical.
