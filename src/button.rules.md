# Button

Fonte de verdade: **snapshots** dos arquivos **(Audit)** do Figma, materializados em
`../audit/core-brands-audit.json` (cor) e `button.tokens.json` (geometria). São cópias tiradas
no passado, não uma ligação viva: ao ler isto, assuma que o Figma pode ter andado desde então.
Nenhum valor foi inventado.

> **`button.tokens.json` não contém cor.** Ele guardava um bloco `"themes"` com a cor de cada
> tema e estado que **nenhum gerador lia** — `build-css.mjs` consome apenas `sizeOrder`,
> `sizes` e `disabledOpacity`. O bloco era um snapshot histórico, já divergia do que o
> navegador renderiza e causou dois diagnósticos errados, então foi **removido em 19/09/2026**.
> Hoje o arquivo é só geometria. Para a cor vigente use `../demo/playground.html` ou
> `../dist/brands.css`.

## Anatomia

`[ ícone esquerdo? ] [ label? ] [ ícone direito? ]` — auto-layout horizontal, centralizado.

## Props

**Atenção: "padrão" significa duas coisas diferentes aqui.** No Figma é a variante que aparece
ao inserir o componente. No CSS é o que você obtém sem passar classe. Não são a mesma coisa, e
confundir as duas já gerou uma divergência aparente entre este documento, o contrato e a demo.
A coluna do CSS é a que vale para quem escreve HTML.

| Prop      | Valores                                                | Variante padrão (Figma) | Sem classe, no CSS |
| --------- | ------------------------------------------------------ | ----------------------- | ------------------ |
| `theme`   | 13 temas (tabela abaixo)                               | `Base`                  | **obrigatório** — sem classe de tema o botão não tem fundo nem cor de texto |
| `state`   | Default · Hover · Active · Selected · Focus · Disabled | `Default`               | `Default` |
| `size`    | Small · Medium · Large · XLarge                        | `Small`                 | **obrigatório** — sem classe de tamanho o botão não tem fonte, altura nem padding |
| `content` | Icon Only · Label & Icon                               | `Icon Only`             | `Label & Icon` (Icon Only exige `.bmb-button--icon-only`) |
| `radius`  | round (8) · straight (0) · pill (100)                  | `round`                 | `round` — único default real do CSS, vem da regra base |

A coluna do Figma segue a ordem de `themeOrder` e `sizeOrder` em `button.tokens.json`, que
começam em `Base` e `Small`. O `../demo/playground.html` abre em Primary / Medium / Label & Icon:
é escolha de demonstração, não afirmação de default — está anotado no código dele.

## Cor — os 13 temas

A cor **não está congelada aqui de propósito**: ela vem dos tokens semânticos e muda com
`data-brand` e `data-theme`. Fixar hex neste doc garantiria que ele ficasse velho — foi o que
aconteceu com a versão anterior. Para ver os valores vigentes, abra `../demo/playground.html` e use o
painel "Tokens ativos", que mostra o nome do token e o hex resolvido na marca/modo atuais.

O mapeamento tema → token está em `../scripts/build-css.mjs` (`FILLED` e `IRREGULAR`) e é o mesmo do
`_button.scss` do repo, com os nomes atualizados para o Audit.

Estrutura por tema filled: `bg`/`bg-hover`/`bg-active`/`bg-selected` saem de
`<coleção>-backgrounds-<leaf>-*`; o texto de `<coleção>-on-on-<leaf>`, com variantes
`on-hover-*` e `on-selected-*`; o anel de foco de `<coleção>-borders-border-<leaf>-focus`.
Temas transparentes (Invert, Plain, Plain Invert, Plain Error) cruzam coleções e estão
mapeados estado a estado.

## Direção do hover / selected / active

Decisão do dono do design system, 19/09/2026, implementada em
`../scripts/build-core-brands.mjs`.

**Escurecer é o padrão.** A exceção são as cores quase pretas, que não têm para onde escurecer:
o estado fica invisível. O gerador testa cada cor com o menor overlay (hover, 12%); se nem ele
alcança 1,10:1 contra a base, aquela cor **clareia** em vez de escurecer, e os três estados
acompanham para não misturar direções dentro do mesmo tema.

Hoje isso separa 5 células — Primary nas três marcas, Secondary em Employer e Epays — das 19
restantes. O critério é **por cor, não por nome de tema**: se uma marca trocar de paleta, a
classificação acompanha sozinha. Onde escurecer funciona, o valor da página Brand Colors é
mantido como está, sem recálculo.

O modo dark fica fora da exceção: conferimos as 24 células e lá escurecer já rende de 1,17:1 a
1,31:1, então nenhuma se qualifica. Não é uma regra separada para dark — é a mesma regra, que
simplesmente nunca dispara ali.

Histórico: antes disso o gerador clareava **tudo** no modo claro, o que deixava três células do
BNE CIA invisíveis (Quaternary 1,01:1, Success e Error 1,10:1). Escurecer tudo deixaria cinco
invisíveis. A regra por cor não quebra em nenhuma das duas pontas: pior caso hoje é 1,12:1.

## Achados conhecidos — mantidos por decisão

Os dois itens abaixo foram avaliados em 19/09/2026 e o dono do design system decidiu **mantê-los
como estão**. Não são pendências esquecidas nem bugs a corrigir: são escolhas registradas.
Se você veio até aqui para "consertar" um deles, converse antes de mexer.

### 1. `bne-cia` / light / Secondary reprova contraste AA — mantido

`#009b34` com texto `#fafafa` = **3,51:1**, abaixo do mínimo de texto normal. Com `#000000`
daria 5,74:1, que é o que as outras rampas verdes da marca (Success, Quaternary, Error) usam.
A origem é `04-Secondary/Light/OnColor` no CORE-Brands (Audit); a correção seria lá, não aqui.

As outras 47 das 48 combinações (3 marcas × 2 modos × 8 temas filled) passam.

**O que isso significa na prática:** este par vai para produção reprovando o critério, e é fundo
de um botão de ação. Se aparecer exigência formal de acessibilidade, é aqui que ela bate.
Os dois números acima vêm da documentação anterior e **não foram medidos com ferramenta** nesta
revisão — confirme antes de usá-los em qualquer laudo.

### 2. CTA coincide com Success — mantido

Em employer e epays no modo claro, e nas três marcas no modo escuro, CTA e Success resolvem
para a mesma cor. Divergem apenas em bne-cia claro: `#00bd3f` contra `#0f6c2e`.

A decisão foi manter. Ou seja: **CTA é, na prática, um apelido de Success com uma exceção de
marca.** Escolher entre os dois temas é semântica de código, não diferença visual — menos em
bne-cia claro. Não tente "consertar" a coincidência igualando também o bne-cia, nem dando cor
própria ao CTA, sem uma nova decisão.

## Geometria

Fonte: Figma **04. CORE-Basics (Audit)** `BWdzK06j2tX1Dt62ZSxNR1`, `.Master Button` `9:170`.
Derivada das posições dos filhos de cada variante, não de valores declarados.

### Content = Label & Icon

| Size | Altura | Padding (V · H) | Gap | Fonte (token) | Ícone |
| --- | --- | --- | --- | --- | --- |
| Small | 32px | 8 · 8 | 4px | `paragraph-small` | 13,167px |
| Medium | 40px | 8 · 16 | 8px | `paragraph-medium` | 18,167px |
| Large | 48px | 8 · 16 | 8px | `paragraph-large` | 21,5px |
| XLarge | 64px | 12 · 24 | 16px | `paragraph-xlarge` | 28,167px |

Padding e gap correspondem aos tokens `Values/spacing-*` ligados a cada variante:
Small usa `xs`(4)+`sm`(8), Medium e Large usam `sm`(8)+`md`(16), XLarge usa `md`(16)+`lg`(24).

**Sobre a coluna "Fonte (token)"** — conferido ao vivo no Figma em 19/09/2026, no arquivo
`02. CORE-Tokens (Audit)`, nó `341:322`. O botão usa estilos de texto próprios, e eles apenas
reapontam para os `paragraph-*`:

```
Button/Small   = Body SemiBold, size: Font Size/paragraph-small,   lineHeight 1.3
Button/Medium  = Body SemiBold, size: Font Size/paragraph-medium,  lineHeight 1.3
Button/Large   = Body SemiBold, size: Font Size/paragraph-large,   lineHeight 1.3
Button/XLarge  = Body SemiBold, size: Font Size/paragraph-xlarge,  lineHeight 1.3
```

O semibold e a entrelinha 1,3 já vêm da regra base (`--bmb-font-weight-semibold`,
`--bmb-line-height-130`), então o mapeamento em `build-css.mjs` está correto e completo.

⚠️ O campo `sizes.XLarge.font: 20` de `button.tokens.json` **contradiz** isso:
`Button/XLarge` resolve para `paragraph-xlarge`, que vale 22px no desktop. O 20 provavelmente
veio de `Button/XLarge Underline`, o único estilo da família com tamanho cravado em vez de
apontar para o token — inconsistência do próprio Figma. O campo não é lido pelo gerador.

### Content = Icon Only

Caixa quadrada de lado igual à altura (32/40/48/64), ícone centralizado. **O ícone é o mesmo da
Label & Icon em todos os tamanhos** — a assimetria antiga do Large (20,5 vs 21,5) não existe mais.

Radius: `8px` (`--bmb-radius-button-round`).

> ⚠️ **A fonte é responsiva e diverge do Figma abaixo de 1024px.** `paragraph-small` vale 12px
> até 1024px e 14px acima; o Figma desenha no valor de desktop. Idem para os outros tamanhos.
> A altura do botão não muda por isso (é fixa), só o texto encolhe.

## Desvios do Figma (autorizados)

1. **Anel de foco via `box-shadow: inset`, não `border`.** O Figma reporta a variante
   Focus com stroke de 3px e altura idêntica à Default (126×40), ou seja, o traço é
   desenhado para dentro. Uma `border` de 3px em CSS empurraria o conteúdo e mudaria a
   altura; o `inset box-shadow` reproduz o desenho preservando a geometria.
2. **Disabled é `opacity: 0.4`, não um fill próprio.** O export mostra o mesmo `#1b2439`
   da Default — confirmado contra `TESTES/src/components/button/_button.scss:186`.
3. **`height` fixa, não `min-height`.** No Figma a variante tem altura fixa e o stroke é
   desenhado para dentro, sem somar ao box. Em CSS a borda soma: com `min-height` o Small
   crescia para 33,2px (linha 15,6 + padding 16 + borda 1,6). Como o label não quebra
   (`white-space: nowrap`), altura fixa é seguro e reproduz o Figma.
4. **Plain e Plain Error têm fundo no estado Selected.** O Audit registrava o Selected desses
   dois temas sem fundo, o que abria a possibilidade de texto claro sobre fundo transparente.
   O CSS resolve emparelhando fundo e texto: `plain-error` usa
   `error-backgrounds-error-selected` com `error-on-on-error`, e `plain` usa
   `base-backgrounds-base-selected` mantendo `base-on-on-base`. O risco descrito no
   `../README.md` não se materializa; o desvio estava implementado sem estar registrado, e
   passa a estar aqui.
5. **Warning tem anel de foco visível, contra o Figma.** O Figma desenha o Focus do Warning com
   stroke transparente, e o gerador replicava isso: o tema ficava sem nenhuma indicação de foco
   por teclado. Como o componente vai para uso real, o anel foi restaurado por decisão do dono
   do design system em 19/09/2026. **Não há cor nova:** o token
   `warning-borders-border-warning-focus` já existia e resolve para `#faa645` (employer),
   `#ffb124` (epays) e `#ffc524` (bne-cia) no modo claro. O tema passou a usar o próprio token,
   como os outros doze. A correção na origem continua pendente.

## Acessibilidade

- Use `<button>` real. **Só o atributo `disabled` nativo desabilita.** A classe
  `.bmb-button--disabled` foi removida em 19/09/2026: ela pintava o botão de desabilitado mas
  não desabilitava nada — os guards testam `:not(:disabled)`, então hover, active, foco, ordem
  de Tab e o clique continuavam funcionando. Um `<a>` não aceita `disabled`; nesse caso não
  renderize o link, em vez de simular o estado.
- Foco é `:focus-visible` — não aparece em clique de mouse.
- **O foco não apaga mais o estado selecionado.** Até 19/09/2026 `.bmb-button:focus-visible`
  (0-2-0) sobrescrevia `.bmb-button--selected` (0-1-0) e, como os temas filled não definem
  `--_bmb-btn-bg-focus`, o botão selecionado voltava ao fundo default ao receber foco. O anel
  agora vem de uma regra própria, e o bg/fg de foco ficam em
  `:focus-visible:not(.bmb-button--selected)` — mesmo critério já usado no `:hover`.
- **Modo de cores forçadas coberto.** O anel usa `box-shadow`, que não é pintado em
  `forced-colors: active`; somado ao `outline: none`, o foco sumiria por completo no alto
  contraste do Windows. Há um bloco `@media (forced-colors: active)` que devolve
  `outline: 3px solid Highlight` com as mesmas medidas do anel.
- Icon Only exige `aria-label`; o `<svg>` leva `aria-hidden="true"`.
- Contraste `#ffffff` sobre `#1b2439` = 14.6:1 (AAA).

> Nada disto substitui teste real: nenhuma razão de contraste deste documento foi medida com
> ferramenta nesta revisão, e teclado, leitor de tela e cores forçadas não foram executados.

## Campos que não geram CSS

O bloco `themes` foi removido em 19/09/2026 (ver o aviso no topo). O que sobrou em
`button.tokens.json` é geometria, mas nem tudo ali vira CSS:

| Campo | Gera CSS? | Quem usa |
| --- | --- | --- |
| `sizeOrder`, `sizes.*.h/padY/padX/gap/icon/iconOnlyIcon` | **sim** | `build-css.mjs` |
| `disabledOpacity` | **sim** | `build-css.mjs` |
| `sizes.*.font` | não — o tamanho vem do token (ver Geometria) | round-trip + `validate.mjs` |
| `sizes.*.iconOnlyPad` | não | round-trip + `validate.mjs` |
| `radius` | não — o raio vem de `--bmb-radius-button-*` | round-trip + `validate.mjs` |
| `themeOrder`, `stateOrder` | não | `validate.mjs`, para conferir o contrato |

"Round-trip" significa que o campo é copiado para `../dist/button.tokens.js` e comparado de
volta por `validate.mjs`. Ele passa na validação sem influenciar o CSS — ou seja, **a
validação não protege esses valores de ficarem errados**, só de ficarem dessincronizados.
Foi assim que `sizes.XLarge.font: 20` sobreviveu contradizendo o estilo real.
