# BambooDS — AI-ready component prototype

Este repositório é um experimento de Design System estruturado para consumo por humanos, código e agentes de IA.

Atualmente contém:
- Button
- Hyperlink
- Dot
- Checkbox
- Radio
- Switch

## Componentes

### Button
Ação: executa alguma coisa na página. Para levar a pessoa a outro destino, o componente é o
Hyperlink.

O elemento é `<button>` quando age e `<a>` quando navega — essa é a escolha que decide se a
tecla Enter, o Espaço e o menu de contexto se comportam como a pessoa espera. Tema e tamanho
são **obrigatórios**: não há classe implícita, e sem elas o botão fica sem fundo nem cor.

Treze temas, quatro tamanhos (`sm`, `md`, `lg`, `xl`), seis estados e três raios (`round`,
`straight`, `pill`). Dois achados estão documentados como **decisão tomada, não pendência** —
`bne-cia` / light / Secondary reprova contraste AA, e CTA coincide com Success fora do bne-cia
claro. Ambos em `src/button.rules.md`, seção "Achados conhecidos"; não os trate como regressão.

Arquivos em `components.json` sob o id `button`; demo em `demo/index.html` e no storybook.

### Hyperlink
Navegação: leva a pessoa para outro destino. Para executar uma ação, o componente é o Button.

Exige `<a>` com `href` real. `<button>` é proibido e `href="#"` também — sem destino de verdade
o elemento não entra na lista de links do leitor de tela nem abre em nova aba. O estado
desabilitado é a **ausência** do `href`, mais `aria-disabled`: é o que de fato tira o link do
Tab. A validação reprova as três violações.

Nove temas, quatro tamanhos (`xs`, `sm`, `md`, `lg`) e seis estados. O Default **não é
sublinhado**, por decisão registrada, com o custo medido: 1,16:1 entre a cor do link e o texto
ao redor, contra os 3:1 da WCAG 1.4.1. Em texto corrido, meça o contraste e ligue
`bmb-hyperlink--force-underline` quando ficar abaixo disso.

Arquivos em `components.json` sob o id `hyperlink`; demo em `demo/hyperlink.html` e no
storybook.

### Dot
Indicador de status: um círculo colorido, com glifo opcional. **Não é interativo** — não tem
estados, não recebe foco e não é clicável.

Comunica por cor, e só por cor, então **nunca pode ser a única fonte da informação**: ou vem com
texto visível ao lado (e `aria-hidden="true"`), ou carrega `role="img"` + `aria-label`. A
validação reprova as duas violações.

Cinco tons (`base`, `primary`, `success`, `warning`, `error`) e três tamanhos (8, 16, 24px).
Arquivos em `components.json` sob o id `dot`; demo em `demo/dot.html` e no storybook.

### Checkbox
Opção independente: cada caixa liga ou desliga uma opção sem afetar as outras, e o valor só
vale quando o formulário é enviado. Escolha única é o Radio; efeito imediato é o Switch.

O componente é um `<label>` que envolve um `<input type="checkbox">` **nativo** — é dele que
vêm a semântica, o Espaço e o envio no formulário. Hover, foco, disabled, `checked` e
`indeterminate` **não são classes**: vêm do input. O `indeterminate` existe só para o pai de
um grupo parcialmente marcado ("selecionar todos") e é definido por script
(`input.indeterminate = true`).

Três tons (`neutral`, `brand`, `invert` — o último só sobre o painel da marca) e três
tamanhos (`sm`, `md`, `lg`), com default `neutral`/`md`. O foco é um anel de 2px com folga
de 2px que não muda o tamanho; o disabled é opacidade 0,4, sem token próprio. Seis
divergências com o Figma estão registradas em `src/checkbox.rules.md`, "Divergências
abertas" — entre elas a DS-053 (token de texto como fundo no `brand` desmarcado); não as trate
como regressão.

Arquivos em `components.json` sob o id `checkbox`; demo em `demo/checkbox.html` e no
storybook.

### Radio
Escolha única: marcar uma opção desmarca as outras do mesmo grupo. Opções independentes são o
Checkbox; efeito imediato é o Switch.

**Nunca sozinho.** É sempre um grupo de 2 ou mais `<label>` com `<input type="radio">` nativo e
o mesmo `name`, dentro de `<fieldset>` + `<legend>`. É o `name` que dá o comportamento de
grupo sem JavaScript — um valor enviado, um ponto de Tab, setas movendo a seleção. Um radio
marcado não se desmarca: "nenhuma escolha" é uma opção explícita. Não existe `indeterminate`.

Três tons e três tamanhos, como o Checkbox, mas **do grupo**: a especificação os põe num
`RadioGroup`, e aqui, sem componente de grupo, a regra é "classes de tom e tamanho iguais em
todo o `<fieldset>`". A validação reprova grupo com menos de 2 itens, fora de `<fieldset>`,
com `name` diferente ou misturando tom ou tamanho. No `invert` o anel de foco é
`on-surface-neutral-brand`, não o `subtle` do Checkbox — ali o `subtle` já é a cor da borda.

Arquivos em `components.json` sob o id `radio`; demo em `demo/radio.html` e no storybook.

### Switch
Configuração com efeito imediato: liga ou desliga na hora, sem botão de salvar. Valor que só
vale no envio é o Checkbox; escolha única é o Radio.

O elemento é `<input type="checkbox" role="switch">` nativo dentro de `<label>` — o
`role="switch"` é obrigatório, e `aria-pressed` é proibido. O trilho é o próprio input e o
pino é o `::before`, que anda por `transform` sem mudar o tamanho do trilho; o deslize some em
`prefers-reduced-motion`. O rótulo nomeia a configuração, não o estado.

**Não tem hover** (D7): passar o mouse só muda o cursor, e a validação reprova qualquer
`:hover` que não seja só `cursor`. Também não tem `indeterminate`. Os tokens do trilho foram
escolhidos para passar 3:1 sem borda; não os troque por um fundo "mais suave" sem medir.

O `Switch (descontinuado)` que fica na mesma página do Figma **não gera código, mockup nem
variante**. O mapa de migração do legado está em `src/switch.rules.md`.

Arquivos em `components.json` sob o id `switch`; demo em `demo/switch.html` e no storybook.

## Arquitetura

A descoberta dos componentes é feita por `components.json`.

Cada componente possui, conforme necessário:
- contract
- rules
- tokens
- implementação
- demo
- arquivos gerados em `dist`

Fluxo geral:

Figma / audit
→ source
→ tokens
→ build
→ dist
→ validation

## Como adicionar um componente

1. adicionar o componente ao `components.json`;
2. criar contract;
3. criar rules;
4. criar tokens quando necessário;
5. implementar;
6. criar demo;
7. adicionar build/validação necessários;
8. rodar `npm run check`;
9. confirmar que o detector reconhece o componente.

## Build

Para gerar os artefatos:

```bash
npm run build
```

Para gerar e validar de uma vez:

```bash
npm run check
```
