/* GERADO por scripts/build-docs-data.mjs — não edite à mão.
 * Snapshot de contrato e regras para o site de documentação funcionar por file://,
 * onde fetch é bloqueado por CORS. Servido por HTTP, a página prefere os arquivos reais.
 */
window.BMB_DOCS = {
  "button": {
    "contrato": {
      "component": "Button",
      "version": "experimental",
      "source": {
        "geometry": "src/button.tokens.json",
        "themeMappings": "scripts/build-css.mjs",
        "brandColors": "audit/core-brands-audit.json",
        "rules": "src/button.rules.md"
      },
      "element": {
        "action": "button",
        "navigation": "a"
      },
      "baseClass": "bmb-button",
      "variants": {
        "theme": {
          "required": true,
          "noDefault": "sem classe de tema o botao nao tem fundo nem cor de texto; nenhuma das 13 e implicita",
          "classPrefix": "bmb-button--",
          "values": [
            "base",
            "primary",
            "secondary",
            "tertiary",
            "quaternary",
            "success",
            "warning",
            "error",
            "invert",
            "plain",
            "plain-invert",
            "cta",
            "plain-error"
          ]
        },
        "size": {
          "required": true,
          "noDefault": "sem classe de tamanho o botao nao tem font-size, height nem padding",
          "classPrefix": "bmb-button--",
          "values": [
            "sm",
            "md",
            "lg",
            "xl"
          ]
        },
        "radius": {
          "required": false,
          "default": "round",
          "classes": {
            "round": null,
            "straight": "bmb-button--straight",
            "pill": "bmb-button--pill"
          }
        },
        "content": {
          "default": "labelAndIcon",
          "required": false,
          "labelAndIcon": {
            "iconClass": "bmb-button__icon",
            "iconMarkup": "<span class=\"bmb-button__icon\" aria-hidden=\"true\"><svg>…</svg></span> — a classe vai no wrapper, nao no <svg>; a regra .bmb-button__icon svg depende disso",
            "labelClass": "bmb-button__label",
            "dotClass": "bmb-button__dot"
          },
          "iconOnly": {
            "class": "bmb-button--icon-only",
            "requiresAccessibleName": true
          }
        }
      },
      "states": {
        "default": "base styles",
        "hover": ":hover",
        "active": ":active",
        "selected": "bmb-button--selected",
        "focus": ":focus-visible",
        "disabled": "disabled attribute"
      },
      "globalTheme": {
        "brandAttribute": "data-brand",
        "brands": [
          "employer",
          "epays",
          "bne-cia"
        ],
        "modeAttribute": "data-theme",
        "modes": [
          "light",
          "dark"
        ]
      },
      "accessibility": {
        "iconOnlyRequiresAccessibleName": true,
        "decorativeIconsAriaHidden": true,
        "useNativeDisabled": true,
        "disabledClassRemoved": "there is no .bmb-button--disabled; only the native disabled attribute disables the button (removed 2026-09-19)",
        "focusVisible": "inset box-shadow 3px; bg/fg do foco nao se aplicam a .bmb-button--selected",
        "forcedColors": "@media (forced-colors: active) restores outline: 3px solid Highlight, because box-shadow is not painted in that mode",
        "resolvedException": "warning theme used to ship a transparent focus ring copied from the Figma source; restored to its own token on 2026-09-19 — see src/button.rules.md, 'Desvios do Figma (autorizados)' item 5"
      },
      "generatedFiles": [
        "dist/brands.css",
        "dist/button.css",
        "dist/button.preview.css",
        "dist/button.tokens.js"
      ]
    },
    "regras": "# Button\n\nFonte de verdade: **snapshots** dos arquivos **(Audit)** do Figma, materializados em\n`../audit/core-brands-audit.json` (cor) e `button.tokens.json` (geometria). São cópias tiradas\nno passado, não uma ligação viva: ao ler isto, assuma que o Figma pode ter andado desde então.\nNenhum valor foi inventado.\n\n> **`button.tokens.json` não contém cor.** Ele guardava um bloco `\"themes\"` com a cor de cada\n> tema e estado que **nenhum gerador lia** — `build-css.mjs` consome apenas `sizeOrder`,\n> `sizes` e `disabledOpacity`. O bloco era um snapshot histórico, já divergia do que o\n> navegador renderiza e causou dois diagnósticos errados, então foi **removido em 19/09/2026**.\n> Hoje o arquivo é só geometria. Para a cor vigente use `../demo/playground.html` ou\n> `../dist/brands.css`.\n\n## Anatomia\n\n`[ ícone esquerdo? ] [ label? ] [ ícone direito? ]` — auto-layout horizontal, centralizado.\n\n## Props\n\n**Atenção: \"padrão\" significa duas coisas diferentes aqui.** No Figma é a variante que aparece\nao inserir o componente. No CSS é o que você obtém sem passar classe. Não são a mesma coisa, e\nconfundir as duas já gerou uma divergência aparente entre este documento, o contrato e a demo.\nA coluna do CSS é a que vale para quem escreve HTML.\n\n| Prop      | Valores                                                | Variante padrão (Figma) | Sem classe, no CSS |\n| --------- | ------------------------------------------------------ | ----------------------- | ------------------ |\n| `theme`   | 13 temas (tabela abaixo)                               | `Base`                  | **obrigatório** — sem classe de tema o botão não tem fundo nem cor de texto |\n| `state`   | Default · Hover · Active · Selected · Focus · Disabled | `Default`               | `Default` |\n| `size`    | Small · Medium · Large · XLarge                        | `Small`                 | **obrigatório** — sem classe de tamanho o botão não tem fonte, altura nem padding |\n| `content` | Icon Only · Label & Icon                               | `Icon Only`             | `Label & Icon` (Icon Only exige `.bmb-button--icon-only`) |\n| `radius`  | round (8) · straight (0) · pill (100)                  | `round`                 | `round` — único default real do CSS, vem da regra base |\n\nA coluna do Figma segue a ordem de `themeOrder` e `sizeOrder` em `button.tokens.json`, que\ncomeçam em `Base` e `Small`. O `../demo/playground.html` abre em Primary / Medium / Label & Icon:\né escolha de demonstração, não afirmação de default — está anotado no código dele.\n\n## Cor — os 13 temas\n\nA cor **não está congelada aqui de propósito**: ela vem dos tokens semânticos e muda com\n`data-brand` e `data-theme`. Fixar hex neste doc garantiria que ele ficasse velho — foi o que\naconteceu com a versão anterior. Para ver os valores vigentes, abra `../demo/playground.html` e use o\npainel \"Tokens ativos\", que mostra o nome do token e o hex resolvido na marca/modo atuais.\n\nO mapeamento tema → token está em `../scripts/build-css.mjs` (`FILLED` e `IRREGULAR`) e é o mesmo do\n`_button.scss` do repo, com os nomes atualizados para o Audit.\n\nEstrutura por tema filled: `bg`/`bg-hover`/`bg-active`/`bg-selected` saem de\n`<coleção>-backgrounds-<leaf>-*`; o texto de `<coleção>-on-on-<leaf>`, com variantes\n`on-hover-*` e `on-selected-*`; o anel de foco de `<coleção>-borders-border-<leaf>-focus`.\nTemas transparentes (Invert, Plain, Plain Invert, Plain Error) cruzam coleções e estão\nmapeados estado a estado.\n\n## Direção do hover / selected / active\n\nDecisão do dono do design system, 19/09/2026, implementada em\n`../scripts/build-core-brands.mjs`.\n\n**Escurecer é o padrão.** A exceção são as cores quase pretas, que não têm para onde escurecer:\no estado fica invisível. O gerador testa cada cor com o menor overlay (hover, 12%); se nem ele\nalcança 1,10:1 contra a base, aquela cor **clareia** em vez de escurecer, e os três estados\nacompanham para não misturar direções dentro do mesmo tema.\n\nHoje isso separa 5 células — Primary nas três marcas, Secondary em Employer e Epays — das 19\nrestantes. O critério é **por cor, não por nome de tema**: se uma marca trocar de paleta, a\nclassificação acompanha sozinha. Onde escurecer funciona, o valor da página Brand Colors é\nmantido como está, sem recálculo.\n\nO modo dark fica fora da exceção: conferimos as 24 células e lá escurecer já rende de 1,17:1 a\n1,31:1, então nenhuma se qualifica. Não é uma regra separada para dark — é a mesma regra, que\nsimplesmente nunca dispara ali.\n\nHistórico: antes disso o gerador clareava **tudo** no modo claro, o que deixava três células do\nBNE CIA invisíveis (Quaternary 1,01:1, Success e Error 1,10:1). Escurecer tudo deixaria cinco\ninvisíveis. A regra por cor não quebra em nenhuma das duas pontas: pior caso hoje é 1,12:1.\n\n## Achados conhecidos — mantidos por decisão\n\nOs dois itens abaixo foram avaliados em 19/09/2026 e o dono do design system decidiu **mantê-los\ncomo estão**. Não são pendências esquecidas nem bugs a corrigir: são escolhas registradas.\nSe você veio até aqui para \"consertar\" um deles, converse antes de mexer.\n\n### 1. `bne-cia` / light / Secondary reprova contraste AA — mantido\n\n`#009b34` com texto `#fafafa` = **3,51:1**, abaixo do mínimo de texto normal. Com `#000000`\ndaria 5,74:1, que é o que as outras rampas verdes da marca (Success, Quaternary, Error) usam.\nA origem é `04-Secondary/Light/OnColor` no CORE-Brands (Audit); a correção seria lá, não aqui.\n\nAs outras 47 das 48 combinações (3 marcas × 2 modos × 8 temas filled) passam.\n\n**O que isso significa na prática:** este par vai para produção reprovando o critério, e é fundo\nde um botão de ação. Se aparecer exigência formal de acessibilidade, é aqui que ela bate.\nOs dois números acima vêm da documentação anterior e **não foram medidos com ferramenta** nesta\nrevisão — confirme antes de usá-los em qualquer laudo.\n\n### 2. CTA coincide com Success — mantido\n\nEm employer e epays no modo claro, e nas três marcas no modo escuro, CTA e Success resolvem\npara a mesma cor. Divergem apenas em bne-cia claro: `#00bd3f` contra `#0f6c2e`.\n\nA decisão foi manter. Ou seja: **CTA é, na prática, um apelido de Success com uma exceção de\nmarca.** Escolher entre os dois temas é semântica de código, não diferença visual — menos em\nbne-cia claro. Não tente \"consertar\" a coincidência igualando também o bne-cia, nem dando cor\nprópria ao CTA, sem uma nova decisão.\n\n## Geometria\n\nFonte: Figma **04. CORE-Basics (Audit)** `BWdzK06j2tX1Dt62ZSxNR1`, `.Master Button` `9:170`.\nDerivada das posições dos filhos de cada variante, não de valores declarados.\n\n### Content = Label & Icon\n\n| Size | Altura | Padding (V · H) | Gap | Fonte (token) | Ícone |\n| --- | --- | --- | --- | --- | --- |\n| Small | 32px | 8 · 8 | 4px | `paragraph-small` | 13,167px |\n| Medium | 40px | 8 · 16 | 8px | `paragraph-medium` | 18,167px |\n| Large | 48px | 8 · 16 | 8px | `paragraph-large` | 21,5px |\n| XLarge | 64px | 12 · 24 | 16px | `paragraph-xlarge` | 28,167px |\n\nPadding e gap correspondem aos tokens `Values/spacing-*` ligados a cada variante:\nSmall usa `xs`(4)+`sm`(8), Medium e Large usam `sm`(8)+`md`(16), XLarge usa `md`(16)+`lg`(24).\n\n**Sobre a coluna \"Fonte (token)\"** — conferido ao vivo no Figma em 19/09/2026, no arquivo\n`02. CORE-Tokens (Audit)`, nó `341:322`. O botão usa estilos de texto próprios, e eles apenas\nreapontam para os `paragraph-*`:\n\n```\nButton/Small   = Body SemiBold, size: Font Size/paragraph-small,   lineHeight 1.3\nButton/Medium  = Body SemiBold, size: Font Size/paragraph-medium,  lineHeight 1.3\nButton/Large   = Body SemiBold, size: Font Size/paragraph-large,   lineHeight 1.3\nButton/XLarge  = Body SemiBold, size: Font Size/paragraph-xlarge,  lineHeight 1.3\n```\n\nO semibold e a entrelinha 1,3 já vêm da regra base (`--bmb-font-weight-semibold`,\n`--bmb-line-height-130`), então o mapeamento em `build-css.mjs` está correto e completo.\n\n⚠️ O campo `sizes.XLarge.font: 20` de `button.tokens.json` **contradiz** isso:\n`Button/XLarge` resolve para `paragraph-xlarge`, que vale 22px no desktop. O 20 provavelmente\nveio de `Button/XLarge Underline`, o único estilo da família com tamanho cravado em vez de\napontar para o token — inconsistência do próprio Figma. O campo não é lido pelo gerador.\n\n### Content = Icon Only\n\nCaixa quadrada de lado igual à altura (32/40/48/64), ícone centralizado. **O ícone é o mesmo da\nLabel & Icon em todos os tamanhos** — a assimetria antiga do Large (20,5 vs 21,5) não existe mais.\n\nRadius: `8px` (`--bmb-radius-button-round`).\n\n> ⚠️ **A fonte é responsiva e diverge do Figma abaixo de 1024px.** `paragraph-small` vale 12px\n> até 1024px e 14px acima; o Figma desenha no valor de desktop. Idem para os outros tamanhos.\n> A altura do botão não muda por isso (é fixa), só o texto encolhe.\n\n## Desvios do Figma (autorizados)\n\n1. **Anel de foco via `box-shadow: inset`, não `border`.** O Figma reporta a variante\n   Focus com stroke de 3px e altura idêntica à Default (126×40), ou seja, o traço é\n   desenhado para dentro. Uma `border` de 3px em CSS empurraria o conteúdo e mudaria a\n   altura; o `inset box-shadow` reproduz o desenho preservando a geometria.\n2. **Disabled é `opacity: 0.4`, não um fill próprio.** O export mostra o mesmo `#1b2439`\n   da Default — confirmado contra `TESTES/src/components/button/_button.scss:186`.\n3. **`height` fixa, não `min-height`.** No Figma a variante tem altura fixa e o stroke é\n   desenhado para dentro, sem somar ao box. Em CSS a borda soma: com `min-height` o Small\n   crescia para 33,2px (linha 15,6 + padding 16 + borda 1,6). Como o label não quebra\n   (`white-space: nowrap`), altura fixa é seguro e reproduz o Figma.\n4. **Plain e Plain Error têm fundo no estado Selected.** O Audit registrava o Selected desses\n   dois temas sem fundo, o que abria a possibilidade de texto claro sobre fundo transparente.\n   O CSS resolve emparelhando fundo e texto: `plain-error` usa\n   `error-backgrounds-error-selected` com `error-on-on-error`, e `plain` usa\n   `base-backgrounds-base-selected` mantendo `base-on-on-base`. O risco descrito no\n   `../README.md` não se materializa; o desvio estava implementado sem estar registrado, e\n   passa a estar aqui.\n5. **Warning tem anel de foco visível, contra o Figma.** O Figma desenha o Focus do Warning com\n   stroke transparente, e o gerador replicava isso: o tema ficava sem nenhuma indicação de foco\n   por teclado. Como o componente vai para uso real, o anel foi restaurado por decisão do dono\n   do design system em 19/09/2026. **Não há cor nova:** o token\n   `warning-borders-border-warning-focus` já existia e resolve para `#faa645` (employer),\n   `#ffb124` (epays) e `#ffc524` (bne-cia) no modo claro. O tema passou a usar o próprio token,\n   como os outros doze. A correção na origem continua pendente.\n\n## Acessibilidade\n\n- Use `<button>` real. **Só o atributo `disabled` nativo desabilita.** A classe\n  `.bmb-button--disabled` foi removida em 19/09/2026: ela pintava o botão de desabilitado mas\n  não desabilitava nada — os guards testam `:not(:disabled)`, então hover, active, foco, ordem\n  de Tab e o clique continuavam funcionando. Um `<a>` não aceita `disabled`; nesse caso não\n  renderize o link, em vez de simular o estado.\n- Foco é `:focus-visible` — não aparece em clique de mouse.\n- **O foco não apaga mais o estado selecionado.** Até 19/09/2026 `.bmb-button:focus-visible`\n  (0-2-0) sobrescrevia `.bmb-button--selected` (0-1-0) e, como os temas filled não definem\n  `--_bmb-btn-bg-focus`, o botão selecionado voltava ao fundo default ao receber foco. O anel\n  agora vem de uma regra própria, e o bg/fg de foco ficam em\n  `:focus-visible:not(.bmb-button--selected)` — mesmo critério já usado no `:hover`.\n- **Modo de cores forçadas coberto.** O anel usa `box-shadow`, que não é pintado em\n  `forced-colors: active`; somado ao `outline: none`, o foco sumiria por completo no alto\n  contraste do Windows. Há um bloco `@media (forced-colors: active)` que devolve\n  `outline: 3px solid Highlight` com as mesmas medidas do anel.\n- Icon Only exige `aria-label`; o `<svg>` leva `aria-hidden=\"true\"`.\n- Contraste `#ffffff` sobre `#1b2439` = 14.6:1 (AAA).\n\n> Nada disto substitui teste real: nenhuma razão de contraste deste documento foi medida com\n> ferramenta nesta revisão, e teclado, leitor de tela e cores forçadas não foram executados.\n\n## Campos que não geram CSS\n\nO bloco `themes` foi removido em 19/09/2026 (ver o aviso no topo). O que sobrou em\n`button.tokens.json` é geometria, mas nem tudo ali vira CSS:\n\n| Campo | Gera CSS? | Quem usa |\n| --- | --- | --- |\n| `sizeOrder`, `sizes.*.h/padY/padX/gap/icon/iconOnlyIcon` | **sim** | `build-css.mjs` |\n| `disabledOpacity` | **sim** | `build-css.mjs` |\n| `sizes.*.font` | não — o tamanho vem do token (ver Geometria) | round-trip + `validate.mjs` |\n| `sizes.*.iconOnlyPad` | não | round-trip + `validate.mjs` |\n| `radius` | não — o raio vem de `--bmb-radius-button-*` | round-trip + `validate.mjs` |\n| `themeOrder`, `stateOrder` | não | `validate.mjs`, para conferir o contrato |\n\n\"Round-trip\" significa que o campo é copiado para `../dist/button.tokens.js` e comparado de\nvolta por `validate.mjs`. Ele passa na validação sem influenciar o CSS — ou seja, **a\nvalidação não protege esses valores de ficarem errados**, só de ficarem dessincronizados.\nFoi assim que `sizes.XLarge.font: 20` sobreviveu contradizendo o estilo real.\n",
    "origem": {
      "contrato": "src/button.contract.json",
      "regras": "src/button.rules.md"
    }
  },
  "hyperlink": {
    "contrato": {
      "component": "Hyperlink",
      "version": "experimental",
      "purpose": "navegação: leva a pessoa para outro destino",
      "notAnAction": "Se o alvo executa uma ação em vez de navegar, o componente correto é o Button. Ver src/hyperlink.rules.md, 'Hyperlink vs Button'.",
      "source": {
        "figma": "04. CORE-Basics (Audit) BWdzK06j2tX1Dt62ZSxNR1 — Hiperlink 240:1702, set 99:8725, master 99:8672",
        "figmaRevision": "2026-09-18 — anel de foco por tema, Hit Area de 24px, altura fixa removida, ícone do Large alinhado; decisões de visited, link externo e Disabled registradas na descrição do componente",
        "geometry": "src/hyperlink.tokens.json",
        "themeMappings": "scripts/build-hyperlink-css.mjs",
        "brandColors": "audit/core-brands-audit.json",
        "rules": "src/hyperlink.rules.md"
      },
      "element": {
        "required": "a",
        "requiresHref": true,
        "forbidden": [
          "button",
          "div",
          "span"
        ],
        "forbiddenHref": [
          "#",
          "javascript:void(0)"
        ],
        "why": "Sem href real o elemento não é um link: não recebe foco, não aparece na lista de links do leitor de tela e não abre em nova aba. Não existe fallback genérico neste componente.",
        "hrefExceptionWhenDisabled": "O estado desabilitado é a única situação em que o <a> fica SEM href — é justamente o que o torna não focável e não clicável. Ver states.disabled."
      },
      "baseClass": "bmb-hyperlink",
      "variants": {
        "theme": {
          "required": true,
          "noDefault": "sem classe de tema o link não tem cor nem anel de foco",
          "classPrefix": "bmb-hyperlink--",
          "values": [
            "base",
            "primary",
            "secondary",
            "tertiary",
            "quaternary",
            "success",
            "warning",
            "error",
            "invert"
          ]
        },
        "size": {
          "required": true,
          "noDefault": "sem classe de tamanho o link não tem font-size nem tamanho de ícone",
          "classPrefix": "bmb-hyperlink--",
          "values": [
            "xs",
            "sm",
            "md",
            "lg"
          ],
          "figmaNames": {
            "xs": "XSmall",
            "sm": "Small",
            "md": "Medium",
            "lg": "Large"
          }
        },
        "content": {
          "required": false,
          "default": "labelAndIcon",
          "labelAndIcon": {
            "labelClass": "bmb-hyperlink__label",
            "iconClass": "bmb-hyperlink__icon",
            "iconMarkup": "<span class=\"bmb-hyperlink__icon\" aria-hidden=\"true\"><svg>…</svg></span> — a classe vai no wrapper, não no <svg>",
            "iconPositions": [
              "leading",
              "trailing"
            ],
            "iconPositionNote": "Não há propriedade de posição no Figma: a variante Label & Icon tem os dois slots (Left Icon e Right Icon). Usar um, outro ou os dois é decisão de quem consome."
          },
          "iconOnly": {
            "class": "bmb-hyperlink--icon-only",
            "requiresAccessibleName": true
          }
        }
      },
      "states": {
        "default": {
          "style": "estilos base, SEM sublinhado — decisão do time, registrada no Figma em 2026-09-18",
          "usageConstraint": {
            "rule": "Antes de aplicar em texto corrido, meça o contraste entre a cor do link e a cor do texto ao redor. É cor-contra-cor, não texto-contra-fundo.",
            "criterion": "WCAG 1.4.1 (Uso de Cor), mínimo 3:1",
            "measured": "1,16:1 em Employer/Light/Primary (#24304d contra #262626) — reprova",
            "ifBelow": "sublinhar o link nesse contexto, com o mesmo token on-surface-{tema} usado em Hover e Active, ou escolher outro Theme com contraste suficiente contra aquele texto de corpo",
            "notApplicable": "link isolado, fora de texto corrido — não há texto ao redor para confundir",
            "howToApply": "classe bmb-hyperlink--force-underline — ver forceUnderline neste contrato"
          }
        },
        "hover": ":hover — sublinhado",
        "active": ":active — sublinhado, igual ao Hover (corrigido no Figma em 2026-09-18)",
        "selected": "bmb-hyperlink--selected — sublinhado",
        "focus": {
          "selector": ":focus-visible",
          "ring": "outline de 2px na cor <tema>-borders-border-<tema>-focus, offset 2px, raio 4px",
          "underline": true,
          "figmaSource": "variante Focus do set, ajuste de 2026-09-18"
        },
        "disabled": {
          "class": "bmb-hyperlink--disabled-appearance",
          "appearanceOnly": false,
          "figmaHasIt": true,
          "spec": "Especificação registrada no Figma em 2026-09-18.",
          "requiredMarkup": {
            "removeHref": true,
            "ariaDisabled": "true",
            "class": "bmb-hyperlink--disabled-appearance"
          },
          "behavior": [
            "não navega nem dispara ação ao clicar ou pressionar Enter/Espaço",
            "não recebe foco por teclado: o Tab pula o elemento",
            "cursor never pointer — o CSS aplica not-allowed"
          ],
          "why": "<a> não tem atributo disabled. Remover o href é o que torna o elemento não focável e não clicável pelo padrão do HTML; o aria-disabled reforça o estado para o leitor de tela.",
          "alternativePreferred": "Na maioria dos casos, não renderizar o link é melhor do que desabilitá-lo. Ver src/hyperlink.rules.md."
        }
      },
      "forceUnderline": {
        "class": "bmb-hyperlink--force-underline",
        "figmaProperty": "Force Underline",
        "figmaType": "BOOLEAN",
        "figmaDefault": false,
        "figmaDrawsNothing": true,
        "whyCodeOnly": "No Figma a propriedade é só sinalização. A tentativa de desenhar o sublinhado lá dentro (retângulo atrás do texto) foi testada e descartada em 2026-09-18: o retângulo fica fora da instância aninhada .Master Hiperlink e não enxerga se Show Left Icon / Show Right Icon estão ligados, então a margem calibrada para uma configuração desalinha nas outras. O sublinhado nativo do CSS acompanha a largura real do texto e não tem esse problema.",
        "color": "currentColor, que já é o token on-surface-{tema} — o mesmo de Hover e Active. Nenhuma cor nova.",
        "whenToUse": "quando o contraste entre a cor do link e a cor do texto ao redor ficar abaixo de 3:1 — ver states.default.usageConstraint",
        "figmaFullFixOutOfScope": "resolver dentro do Figma exigiria desaninhar o .Master Hiperlink dos 78 nós; registrado como fora de escopo"
      },
      "externalLink": {
        "isVariant": false,
        "pattern": "Não é variante nova de State nem de Theme: usa o slot Right Icon já existente, com o ícone arrow-up-right-01-round (categoria Arrows, em 03. CORE-Media).",
        "figmaSource": "descrição do componente, 2026-09-18",
        "accessibility": "Se abrir em nova aba, use target=\"_blank\" com rel=\"noopener noreferrer\" e avise no texto ou no nome acessível. O ícone sozinho, sendo decorativo (aria-hidden), não anuncia nada."
      },
      "globalTheme": {
        "brandAttribute": "data-brand",
        "brands": [
          "employer",
          "epays",
          "bne-cia"
        ],
        "modeAttribute": "data-theme",
        "modes": [
          "light",
          "dark"
        ]
      },
      "invalidCombinations": [
        {
          "combination": "bmb-hyperlink--icon-only sem nome acessível",
          "why": "link sem texto e sem aria-label não é anunciável"
        },
        {
          "combination": "bmb-hyperlink em <button>",
          "why": "Hyperlink é navegação; ação é Button"
        },
        {
          "combination": "bmb-hyperlink--disabled-appearance mantendo o href",
          "why": "a aparência prometeria indisponibilidade enquanto o link continua navegável e focável"
        },
        {
          "combination": "<a> sem href fora do estado desabilitado, ou com href=\"#\"",
          "why": "não é um link para o navegador nem para a tecnologia assistiva"
        }
      ],
      "notSupported": {
        "visited": {
          "status": "decisão registrada, não é lacuna",
          "date": "2026-09-18",
          "why": "Navegadores restringem :visited a poucas propriedades desde que a pseudo-classe virou vetor de detecção de histórico. O DS optou por não diferenciar, por privacidade.",
          "ifRevisited": "exigiria uma variante nova de State (Visited) e uma cor a calibrar por tema"
        },
        "inlineVsStandalone": {
          "status": "decisão registrada, não é lacuna",
          "date": "2026-09-18",
          "why": "inline-flex é intencional: resolve inline (participa do fluxo de texto) e flex (organiza ícone e label) ao mesmo tempo, como o elemento de link nativo do HTML."
        },
        "radius": "O Figma reporta border-radius-null = 0 no estado normal. O raio de 4px existe apenas no anel de foco."
      },
      "accessibility": {
        "iconOnlyRequiresAccessibleName": true,
        "decorativeIconsAriaHidden": true,
        "focusRing": "outline de 2px na cor do tema, com offset. Vem do Figma.",
        "neverRemoveOutline": "Não há outline:none no CSS gerado, e a validação reprova se alguém acrescentar.",
        "forcedColors": "@media (forced-colors: active) aplica outline: 2px solid Highlight",
        "minimumTargetSize": {
          "px": 24,
          "criterion": "WCAG 2.5.8",
          "how": "pseudo-elemento ::after invisível amplia o alvo sem ocupar espaço no fluxo do texto",
          "figmaSource": "camada 'Hit Area (invisível, min 24x24 WCAG 2.5.8)' presente nas 8 variantes de tamanho"
        },
        "ariaDisabled": "Usado APENAS no estado desabilitado, junto com a remoção do href — ver states.disabled. Não aplicar aria-disabled a um link que continua navegável.",
        "newTab": "target=\"_blank\" exige rel=\"noopener noreferrer\" e aviso no nome acessível."
      },
      "generatedFiles": [
        "dist/hyperlink.css",
        "dist/hyperlink.preview.css",
        "dist/hyperlink.tokens.js"
      ]
    },
    "regras": "# Hyperlink\n\nFonte de verdade: o componente **Hiperlink** em **04. CORE-Basics (Audit)**\n`BWdzK06j2tX1Dt62ZSxNR1`, nó `240:1702` — component set `99:8725` (Theme × State) e\n`.Master Hiperlink` `99:8672` (Size × Content).\n\nDados lidos **ao vivo** do Figma via MCP, em duas passadas: 20/09/2026 (primeira) e 20/09/2026\n(segunda, depois do ajuste de 18/09 no componente). Nenhum valor foi inventado.\n\n> **O que o ajuste de 18/09/2026 trouxe:** anel de foco próprio por tema, Hit Area de 24px em\n> todas as variantes de tamanho, remoção da altura fixa do master, ícone do Large alinhado\n> entre os dois conteúdos, e — na descrição do componente — decisões escritas sobre link\n> visitado, link externo, `inline-flex` e comportamento do Disabled. Nove das onze pendências\n> que a primeira leitura tinha registrado foram resolvidas na origem.\n\n## Hyperlink vs Button\n\n| | Hyperlink | Button |\n| --- | --- | --- |\n| Para quê | **navegar** para outro destino | **executar** uma ação |\n| Elemento | `<a href=\"...\">` | `<button type=\"...\">` |\n| Sem destino | não existe — sem `href` não é link | normal |\n| Tecla | Enter | Enter e Espaço |\n| Menu de contexto | abrir em nova aba, copiar endereço | não se aplica |\n\nA pergunta que decide: **depois do clique, a pessoa vai para outro lugar?** Se vai, Hyperlink.\nSe algo acontece na mesma página — salvar, enviar, abrir modal, alternar — é Button, mesmo que\no desenho pareça um link.\n\nSe o seu caso é uma ação que **parece** um link, isso não é Hyperlink. Ou é um Button com\naparência de link, que hoje **não existe** neste Design System, ou é uma decisão de design a\ntomar. Não use Hyperlink para contornar aparência.\n\n## Quando usar\n\n- Navegação interna entre páginas ou rotas.\n- Navegação externa para outro site — ver \"Link externo\".\n- Link dentro de um parágrafo.\n- Link isolado, fora de texto corrido.\n\n## Quando não usar\n\n- Enviar formulário → `<button type=\"submit\">`.\n- Abrir modal, drawer, menu ou tooltip → Button.\n- Alternar estado, curtir, favoritar, expandir → Button.\n- Disparar qualquer coisa que não muda de destino → Button.\n\n## Anatomia\n\n`[ ícone esquerdo ] [ label ] [ ícone direito ]` — flex horizontal, alinhado ao centro,\n`gap: 4px` (`Values/spacing-xs`), padding `0` (`Values/none`).\n\nA variante `Content = Label & Icon` tem **os dois slots de ícone**. Não há propriedade de\nposição: quem consome decide usar um, outro ou os dois.\n\nHá ainda uma camada invisível, `Hit Area`, em todas as 8 variantes de tamanho — ver\n\"Acessibilidade\".\n\n## Props\n\n| Prop | Valores | Obrigatório no CSS |\n| --- | --- | --- |\n| `theme` | Base · Primary · Secondary · Tertiary · Quaternary · Success · Warning · Error · Invert | **sim** — sem classe de tema não há cor nem anel de foco |\n| `size` | XSmall · Small · Medium · Large | **sim** — sem classe de tamanho não há fonte nem ícone |\n| `state` | Default · Hover · Active · Selected · Focus · Disabled | não — Default é a ausência das outras |\n| `content` | Label & Icon · Icon Only | não — Label & Icon é o padrão |\n\nSão **9 temas**, não 13: o Hyperlink não tem Plain, Plain Invert, CTA nem Plain Error. E os\ntamanhos são **XSmall/Small/Medium/Large**, não Small/Medium/Large/XLarge como no Button. Não\ncopie a escala do Button.\n\n## Cor\n\nA cor vem dos tokens semânticos e muda com `data-brand` e `data-theme`. O mapeamento\ntema → token está em `../scripts/build-hyperlink-css.mjs`.\n\n**O Hyperlink não introduziu nenhum token novo.** As 23 variáveis que o Figma usa foram\nconferidas uma a uma contra `../dist/brands.css`: todas já existiam, com 6 definições cada\n(3 marcas × 2 modos) e o mesmo valor resolvido que o Figma reporta.\n\n| Tema | Texto | Anel de foco |\n| --- | --- | --- |\n| Base | `base-on-on-base` + tokens por estado | `base-borders-border-base-focus` |\n| Primary | `primary-on-on-surface-primary` | `primary-borders-border-primary-focus` |\n| Secondary | `secondary-on-on-surface-secondary` | `secondary-borders-border-secondary-focus` |\n| Tertiary | `tertiary-on-on-surface-tertiary` | `tertiary-borders-border-tertiary-focus` |\n| Quaternary | `quaternary-on-on-surface-quaternary` | `quaternary-borders-border-quaternary-focus` |\n| Success | `success-on-on-surface-success` | `success-borders-border-success-focus` |\n| Warning | `warning-on-on-surface-warning` | `warning-borders-border-warning-focus` |\n| Error | `error-on-on-surface-error` | `error-borders-border-error-focus` |\n| Invert | `surface-brand-on-on-surface-neutral-brand` | `surface-brand-borders-border-brand` |\n\n### Tokens da união que não são do Hyperlink\n\nA união de variáveis do component set inclui quatro tokens que **o CSS do Hyperlink não\nreferencia**: `primary-backgrounds-primary-selected` (que é do **Button**, onde está mapeado em\n`build-css.mjs`), `primary-borders-border-primary-subtle`, `base-backgrounds-base-default-alt`\ne `base-on-on-surface-base`. Os três últimos não são consumidos por componente nenhum hoje.\n\nEstão anotados aqui só para que ninguém refaça a pergunta ao comparar o set com o CSS. Não são\npendência do Hyperlink.\n\n### Como sabemos que a cor é única por tema\n\nForam abertas 10 das 54 variantes do set: os 6 estados do Primary, 3 do Base e o Hover do\nSuccess. As outras 44 não foram lidas uma a uma — e não precisam ser.\n\nA união de variáveis do component set lista tudo que qualquer variante usa. Contando os tokens\nde cor por tema: Secondary, Tertiary, Quaternary, Success, Warning, Error e Invert têm\n**exatamente dois cada** — um de texto e um de anel de foco. Sem um segundo token de texto,\nesses temas **não têm como** variar a cor por estado. O Base é a exceção, com 8 tokens.\n\nConfirmado por amostra em Success/Hover: texto e sublinhado usam `on-surface-success`, o mesmo\ntoken do Success/Default.\n\nDescontados os quatro tokens da seção anterior, que não são do Hyperlink, a união está\nexplicada e o argumento fecha.\n\nO **Base é o único tema que troca o token do texto por estado**: `base-hover-alt` no hover,\n`base-active-alt` no active, `base-selected-alt` no selected, `border-base-focus-alt` no focus.\nNos demais, a cor do texto não muda — só o sublinhado, o anel e a opacidade.\n\n## Estados\n\n| Estado | Sublinhado | Anel | Cor do texto | Opacidade |\n| --- | --- | --- | --- | --- |\n| Default | não | não | token do tema | 1 |\n| Hover | **sim** | não | token do tema (Base: `base-hover-alt`) | 1 |\n| Active | **sim** | não | token do tema (Base: `base-active-alt`) | 1 |\n| Selected | **sim** | não | token do tema (Base: `base-selected-alt`) | 1 |\n| Focus | **sim** | **sim, 2px** | token do tema (Base: `border-base-focus-alt`) | 1 |\n| Disabled | não | não | token do tema | **0,4** |\n\n**Só o Default e o Disabled ficam sem sublinhado.** O Active passou a sublinhar no ajuste de\n18/09/2026 — antes era idêntico ao Default, e quem apertava o link não recebia retorno visual.\nConferido ao vivo na Plugin API pelo time: a camada `Copy` do Active tem stroke visível, peso 1,\nno token `on-surface-{tema}`, nos 9 temas.\n\n## Geometria\n\nMedida nos nós do Figma, não em valores declarados.\n\n| Size | Ícone | Gap | Fonte | Caixa do Icon Only |\n| --- | --- | --- | --- | --- |\n| XSmall | 8,981px | 4px | `paragraph-xsmall` | 8,915px |\n| Small | 12px | 4px | `paragraph-small` | 12px |\n| Medium | 16px | 4px | `paragraph-medium` | 16px |\n| Large | 18,917px | 4px | `paragraph-large` | 18,917px |\n\nA caixa do Icon Only **é o próprio ícone** — o ajuste de 18/09 removeu a folga que existia\nantes. O alvo de toque de 24px passou a vir da Hit Area, não do tamanho da caixa, que é o\ncaminho certo: aumenta a área clicável sem inflar o desenho.\n\nNo XSmall o ícone do Label & Icon (8,981) e o do Icon Only (8,915) diferem em 0,066px —\narredondamento do mesmo glifo. O gerador usa 8,981 nos dois.\n\n### Anel de foco\n\nBorda de 2px, padding 2px na vertical e 4px na horizontal, raio 4px, na cor\n`<tema>-borders-border-<tema>-focus`.\n\n### Tipografia\n\nOs estilos de texto são `Button/XSmall`, `Button/Small`, `Button/Medium` e `Button/Large` —\n**os mesmos do Button**. Cada um aponta o `size` para o `paragraph-*` correspondente, com peso\nsemibold e entrelinha 1,3. O Hyperlink não tem escala tipográfica própria: reusa a do Design\nSystem inteira, incluindo o encolhimento abaixo de 1024px.\n\n## Desvios do Figma (autorizados)\n\n1. **Sublinhado por `text-decoration`, não por `border-bottom`.** O Figma desenha o sublinhado\n   como borda inferior no wrapper do texto. Em CSS, `text-decoration: underline` acompanha a\n   quebra de linha, é o que o modo de cores forçadas preserva e é o que a tecnologia assistiva\n   entende como sublinhado de link. Uma borda inferior num contêiner flex ficaria presa a uma\n   linha só. Visualmente equivalente no caso de linha única.\n2. **Anel de foco por `outline`, não por `border` + `padding`.** O Figma desenha borda de 2px\n   com padding de 2px/4px, o que aumenta o elemento. Em CSS isso empurraria o texto ao redor a\n   cada Tab, dentro de um parágrafo. `outline` desenha por fora sem ocupar espaço no fluxo.\n   **Efeito colateral:** o afastamento fica uniforme (2px), em vez dos 2px verticais e 4px\n   horizontais do Figma.\n3. **Hit Area por `::after`, não por retângulo.** O Figma usa um retângulo invisível. Um\n   elemento real ocuparia espaço; o pseudo-elemento absoluto amplia o alvo sem afetar o\n   layout. Mesmo resultado para quem toca, nenhum para quem lê.\n4. **Sem `height`.** Não emitimos altura. Na primeira leitura isso era desvio — o master tinha\n   24px fixos. O ajuste de 18/09 **removeu a altura fixa** e registrou a mesma preocupação\n   como ponto em aberto na descrição. Deixou de ser desvio: virou acordo.\n\n## Acessibilidade\n\n- **Use `<a href=\"...\">` com destino real.** Sem `href`, o elemento não recebe foco, não entra\n  na lista de links do leitor de tela e não abre em nova aba. `href=\"#\"` não é fallback. A\n  única exceção é o estado desabilitado, onde a ausência de `href` é justamente o mecanismo.\n- **Anel de foco:** vem do Figma, 2px na cor do tema. Não há `outline: none` no CSS gerado, e\n  a validação reprova se alguém acrescentar.\n- **Alvo mínimo de 24px (WCAG 2.5.8):** garantido pela Hit Area, um `::after` invisível. Sem\n  ela, o XSmall teria ~9px de altura de alvo.\n- **Modo de cores forçadas:** `@media (forced-colors: active)` aplica\n  `outline: 2px solid Highlight`.\n- **Icon Only exige nome acessível** — `aria-label` no `<a>`. O `<svg>` decorativo leva\n  `aria-hidden=\"true\"`.\n- **`aria-disabled` só no estado desabilitado**, junto com a remoção do `href`. Nunca em um\n  link que continua navegável.\n- **Sublinhado como identificação de link:** no Default o link **não** é sublinhado, por\n  decisão do time. Isso tem uma regra de uso obrigatória atrelada — ver \"Regra de uso\n  obrigatória: o Default depende do contexto\". Não aplique o componente em texto corrido sem\n  fazer essa verificação.\n- **Contraste não foi medido.** Nenhuma razão de contraste deste componente foi calculada com\n  ferramenta. A combinação texto-sobre-fundo depende do fundo onde o link for colocado, que o\n  componente não controla.\n\n## Disabled\n\n**`<a>` não tem estado desabilitado nativo.** Especificação registrada no Figma em 18/09/2026:\n\n- não deve navegar nem disparar ação ao clicar ou pressionar Enter/Espaço;\n- não deve receber foco por teclado — o Tab pula o elemento;\n- **na prática, remover o atributo `href`** já resolve os dois: um `<a>` sem `href` não é\n  focável nem clicável pelo padrão do HTML;\n- **marcar `aria-disabled=\"true\"` mesmo assim**, para reforçar o estado no leitor de tela;\n- cursor `not-allowed` ou `default` no hover, **nunca `pointer`**.\n\nMarkup correto:\n\n```html\n<span class=\"bmb-hyperlink bmb-hyperlink--primary bmb-hyperlink--md bmb-hyperlink--disabled-appearance\"\n      aria-disabled=\"true\">\n    <span class=\"bmb-hyperlink__label\">Hiperlink</span>\n</span>\n```\n\nOu, mantendo a tag `<a>` sem `href`:\n\n```html\n<a class=\"bmb-hyperlink bmb-hyperlink--primary bmb-hyperlink--md bmb-hyperlink--disabled-appearance\"\n   aria-disabled=\"true\">\n    <span class=\"bmb-hyperlink__label\">Hiperlink</span>\n</a>\n```\n\nA classe `bmb-hyperlink--disabled-appearance` aplica a opacidade de 0,4 e o cursor. Ela **não**\nremove o `href` sozinha — isso é responsabilidade de quem renderiza.\n\n**Ainda assim, considere não renderizar o link.** Um link desabilitado raramente ajuda: se o\ndestino não está disponível, texto simples costuma comunicar melhor. A especificação existe\npara quando a decisão for mantê-lo.\n\n## Link externo\n\nRegistrado no Figma em 18/09/2026. **Não é variante nova de State nem de Theme.**\n\nUse o slot **Right Icon** já existente, com o ícone `arrow-up-right-01-round` (categoria\nArrows, em **03. CORE-Media**). A estrutura e o ícone já existiam; faltava documentar o uso.\n\nAcessibilidade do link externo:\n\n- Se abrir em nova aba, use `target=\"_blank\"` **com** `rel=\"noopener noreferrer\"`.\n- O ícone é decorativo (`aria-hidden`), então **não anuncia nada**. Avise no texto do link ou\n  no nome acessível que ele abre em nova aba.\n- Abrir em nova aba sem avisar quebra a expectativa de quem usa leitor de tela e de quem\n  depende do botão Voltar.\n\n## Ícones\n\n- **Decorativo** (o caso padrão): `<span class=\"bmb-hyperlink__icon\" aria-hidden=\"true\">` com o\n  `<svg>` dentro. A classe vai no wrapper, não no `<svg>` — a regra\n  `.bmb-hyperlink__icon svg` depende disso.\n- **Semântico** (o ícone carrega informação que o texto não dá): precisa de nome acessível\n  próprio e não pode ser `aria-hidden`. Nesse caso, prefira colocar a informação no texto.\n- **Tamanho e alinhamento** saem da classe de tamanho; não defina no markup.\n- O `Icon Stroke` do Figma é 1,5 — use ícones com essa espessura.\n\n## Conteúdo\n\nRegra que veio da descrição do componente no Figma:\n\n> Os rótulos para os hiperlinks devem seguir o critério de capitalizar apenas a primeira letra\n> da sentença, com o restante em minúsculas.\n\nAlém disso:\n\n- O texto do link deve descrever o destino fora de contexto. Leitores de tela navegam por lista\n  de links.\n- Evite \"clique aqui\", \"saiba mais\", \"leia mais\" sozinhos.\n- Não coloque o endereço cru como texto, salvo quando o endereço for a informação.\n- Se o link abre em nova aba, diga isso no texto ou no nome acessível.\n\n## Decisões registradas (não são lacunas)\n\nEstas foram **decididas** no Figma em 18/09/2026. Não reabra sem conversar.\n\n1. **Não existe link visitado.** A pseudo-classe `:visited` é restrita pelos navegadores a\n   poucas propriedades desde que virou vetor de detecção de histórico. O DS optou por não\n   diferenciar, por privacidade. Reverter exigiria uma variante nova de State e uma cor a\n   calibrar por tema.\n2. **`inline` vs `standalone` não é propriedade.** O `inline-flex` é intencional: resolve\n   inline (participa do fluxo de texto) e flex (organiza ícone e label) ao mesmo tempo, como o\n   link nativo do HTML já faz.\n3. **Link externo não é variante** — é o slot Right Icon com um ícone específico. Ver acima.\n4. **Comportamento do Disabled** — especificado. Ver acima.\n5. **Default sem sublinhado** — decisão consciente, com o custo de acessibilidade medido\n   (1,16:1 contra o mínimo de 3:1) e uma regra de uso obrigatória em contrapartida.\n6. **Active com sublinhado** — corrigido em 18/09/2026; antes era idêntico ao Default.\n\n## Regra de uso obrigatória: o Default depende do contexto\n\nO Default **não é sublinhado**, por escolha visual do time — decisão registrada no Figma em\n18/09/2026, com o custo medido e aceito, não esquecida.\n\nO custo: entre a cor do link e a cor do texto de corpo ao redor, o contraste medido foi\n**1,16:1** (Employer / Light / Primary: `#24304d` contra `#262626`). A WCAG 1.4.1 exige **3:1**\nquando a cor é a única pista visual. Nesse cenário, reprova.\n\nPor isso **existe uma verificação obrigatória antes de aplicar o componente numa tela nova**:\n\n> Meça o contraste entre a **cor do link** e a **cor do texto ao redor**. Atenção: é\n> cor-contra-cor, **não** o teste de texto-contra-fundo que valida os outros tokens deste\n> arquivo. São coisas diferentes e dão números diferentes.\n>\n> - **≥ 3:1** → pode usar o Default como está, sem sublinhado.\n> - **< 3:1** → **não confie só na cor.** Sublinhe o link nesse contexto, com o mesmo\n>   tratamento de Hover e Active (token `on-surface-{tema}`), ou escolha outro Theme que tenha\n>   contraste suficiente contra aquele texto de corpo específico.\n\nFora de texto corrido — link isolado, em lista, em card — a questão não se aplica: não há texto\nao redor para confundir.\n\nPara o caso `< 3:1`, use a classe **`bmb-hyperlink--force-underline`** — ver a seção abaixo.\n\n## Force Underline\n\n`bmb-hyperlink--force-underline` sublinha o link no estado de repouso. É a contraparte em\ncódigo da propriedade booleana **`Force Underline`** (BOOLEAN, `false` por padrão) que existe\nno component set.\n\n```html\n<a href=\"/contrato\" class=\"bmb-hyperlink bmb-hyperlink--primary bmb-hyperlink--md bmb-hyperlink--force-underline\">\n    <span class=\"bmb-hyperlink__label\">Ver contrato</span>\n</a>\n```\n\nA cor do sublinhado sai de `currentColor`, que já é o token `on-surface-{tema}` — o mesmo que\nHover e Active usam. **Nenhuma cor é cravada.**\n\n### Por que isso mora no código, e não no Figma\n\nNo Figma a propriedade **não desenha nada**: é só sinalização de quando o sublinhado deve\nexistir. A tentativa de desenhá-lo lá dentro foi feita e descartada em 18/09/2026.\n\nO motivo é estrutural: o retângulo de sublinhado fica **fora** da instância aninhada\n`.Master Hiperlink` e não tem como enxergar se `Show Left Icon` e `Show Right Icon` estão\nligados naquela instância. A margem calibrada para uma configuração de ícone desalinha em\nqualquer outra — confirmado com prints em duas configurações diferentes. O retângulo foi\nremovido.\n\nO sublinhado nativo do CSS não tem esse problema: acompanha a largura real do texto, seja qual\nfor a combinação de ícones. Resolver de vez dentro do Figma exigiria desaninhar o\n`.Master Hiperlink` dos 78 nós — mudança estrutural grande, registrada como fora de escopo.\n\n**A leitura correta:** a decisão é do design system e está expressa na prop; o desenho dela é\nresponsabilidade do código. Não é valor solto na aplicação — é a implementação do que o DS já\ndeclara.\n\nHá ainda um **ponto em aberto registrado pelo próprio Figma**: altura fixa em px pode não bater\ncom o `line-height` do texto ao redor quando o link fica embutido em parágrafo — não testado.\nNa implementação em CSS isso não se aplica, porque não emitimos altura; a altura sai da\nentrelinha. Vale reconferir em uso real se aparecer deslocamento vertical.\n",
    "origem": {
      "contrato": "src/hyperlink.contract.json",
      "regras": "src/hyperlink.rules.md"
    }
  },
  "dot": {
    "contrato": {
      "component": "Dot",
      "version": "experimental",
      "purpose": "indicador visual de status: reforça, com cor, um estado que o texto ao lado já nomeia",
      "notAnAction": "O Dot não é acionável. Se algo precisa ser clicado, o componente é o Button; se leva a outro destino, é o Hyperlink. Ver src/dot.rules.md, 'Dot vs Button vs Hyperlink'.",
      "source": {
        "figma": "04. CORE-Basics (Audit) BWdzK06j2tX1Dt62ZSxNR1 — Dot 992:1153, set 16645:256367 (tone), master 16645:256354 (Size)",
        "spec": "dot.rules.md recebido com a tarefa em 2026-09-22 — mapeamento variante↔prop, defaults e notas de acessibilidade",
        "geometry": "src/dot.tokens.json",
        "toneMappings": "scripts/build-dot-css.mjs",
        "brandColors": "audit/core-brands-audit.json",
        "rules": "src/dot.rules.md"
      },
      "element": {
        "required": "span",
        "forbidden": [
          "button",
          "a",
          "input",
          "summary"
        ],
        "why": "O Dot é conteúdo inline sem comportamento. Qualquer elemento interativo o colocaria na ordem de tabulação e prometeria uma ação que não existe.",
        "forbiddenAttributes": [
          "tabindex",
          "onclick",
          "href",
          "role=\"button\""
        ]
      },
      "baseClass": "bmb-dot",
      "variants": {
        "tone": {
          "required": false,
          "default": "base",
          "defaultBehaviour": "sem classe de tom o Dot renderiza como base — o default vem do Figma e está em :where(.bmb-dot), com especificidade zero",
          "classPrefix": "bmb-dot--",
          "values": [
            "base",
            "primary",
            "success",
            "warning",
            "error"
          ],
          "figmaNames": {
            "base": "Base",
            "primary": "Primary",
            "success": "Success",
            "warning": "Warning",
            "error": "Error"
          },
          "meaning": {
            "base": "status padrão, sem significado semântico — contagem genérica, presença neutra",
            "primary": "remete à MARCA, não a um estado semântico — destaque de novidade, plano ou feature. Não é sinônimo de sucesso",
            "success": "status positivo — online, ativo, aprovado, concluído",
            "warning": "exige atenção, mas não é falha — pendente, atrasado, aguardando revisão",
            "error": "status negativo ou crítico — offline, falhou, bloqueado"
          }
        },
        "size": {
          "required": false,
          "default": "md",
          "defaultBehaviour": "sem classe de tamanho o Dot renderiza como md — o default vem do Figma e está em :where(.bmb-dot), com especificidade zero",
          "classPrefix": "bmb-dot--",
          "values": [
            "sm",
            "md",
            "lg"
          ],
          "figmaNames": {
            "sm": "Small",
            "md": "Medium",
            "lg": "Large"
          },
          "figmaAxisLocation": "No Figma o eixo Size não fica no set Dot: fica na instância aninhada .Master Dot. Em CSS os dois eixos viram classes irmãs."
        },
        "showIcon": {
          "required": false,
          "default": false,
          "figmaProperty": "Show icon",
          "figmaPropertyLocation": ".Master Dot aninhado (16645:256354)",
          "howToEnable": "acrescente o filho <span class=\"bmb-dot__icon\" aria-hidden=\"true\"><svg>…</svg></span>. Não existe classe para ligar/desligar: o glifo é a presença do filho.",
          "iconClass": "bmb-dot__icon",
          "iconIsDecorative": "O glifo NÃO muda de forma entre os tons: só a cor diferencia. Ele não é um diferenciador visual independente da cor e nunca deve ser lido como tal.",
          "iconColor": "currentColor, que resolve para o token on-{tom}. O SVG de quem consome precisa usar currentColor em fill ou stroke."
        },
        "icon": {
          "required": false,
          "figmaProperty": "Icon (instance swap, só relevante se Show icon estiver ligado)",
          "implementation": "slot: o SVG é fornecido por quem consome, dentro de .bmb-dot__icon. O Design System não embute nenhum ícone."
        }
      },
      "states": {},
      "statesWhy": "O Dot não tem estados. A descrição do componente no Figma é explícita: 'Dot não é interativo — não tem hover, foco nem disabled'. A propriedade foi renomeada de State para tone justamente porque os valores são tons, não estados.",
      "notSupported": {
        "hover": "não existe. O CSS gerado não pode conter :hover — a validação reprova.",
        "focus": "não existe. O Dot não recebe foco de teclado e não deve ganhar tabindex.",
        "active": "não existe.",
        "disabled": "não existe.",
        "selected": "não existe.",
        "onClick": "não existe. Um Dot clicável é um componente diferente, não este.",
        "tone=Primary como sucesso": "Primary remete à marca. Usar Primary para comunicar 'deu certo' é erro de semântica — o tom é Success."
      },
      "accessibility": {
        "colorOnly": "O Dot comunica status MAJORITARIAMENTE POR COR. WCAG 1.4.1 (Uso de Cor).",
        "requiredPairing": "O Dot nunca pode ser a única fonte da informação de status. Uma das duas formas é obrigatória:",
        "patterns": {
          "decorativo": {
            "when": "há texto visível nomeando o status ao lado do Dot",
            "markup": "<span class=\"bmb-dot bmb-dot--success bmb-dot--md\" aria-hidden=\"true\"></span> Ativo",
            "why": "o texto já carrega a informação; o Dot repetido no leitor de tela seria ruído"
          },
          "standalone": {
            "when": "não há texto visível ao lado",
            "markup": "<span class=\"bmb-dot bmb-dot--error bmb-dot--md\" role=\"img\" aria-label=\"Offline\"></span>",
            "why": "sem rótulo o Dot é um retângulo colorido sem significado para quem não enxerga a cor"
          }
        },
        "forbidden": "Um .bmb-dot sem aria-hidden=\"true\" e sem role=\"img\"+aria-label. A validação reprova.",
        "insideLargerComponent": "Num item de lista com nome + Dot de status, o texto do item costuma satisfazer o requisito — mas confirme que ele NOMEIA o status, e não só a entidade. 'Maria' não diz se ela está online.",
        "forcedColors": "Em alto contraste o fundo é substituído pelo sistema e os cinco tons ficam iguais. Isso não é corrigido de propósito; é mais uma razão para o texto ao lado ser obrigatório. Ver src/dot.rules.md.",
        "keyboard": "nenhuma interação de teclado: o Dot não é focável."
      },
      "tokens": {
        "radius": "--bmb-radius-full (1000px) — o mesmo border-radius-full do Figma",
        "noHardcodedColor": "Nenhum hex pode aparecer em dist/dot.css, nem como fallback. A validação reprova.",
        "perTone": {
          "base": {
            "bg": "--bmb-color-base-backgrounds-base-default-alt",
            "fg": "--bmb-color-base-on-on-base-alt"
          },
          "primary": {
            "bg": "--bmb-color-primary-backgrounds-primary-default",
            "fg": "--bmb-color-primary-on-on-primary"
          },
          "success": {
            "bg": "--bmb-color-success-backgrounds-success-default",
            "fg": "--bmb-color-success-on-on-success"
          },
          "warning": {
            "bg": "--bmb-color-warning-backgrounds-warning-default",
            "fg": "--bmb-color-warning-on-on-warning"
          },
          "error": {
            "bg": "--bmb-color-error-backgrounds-error-default",
            "fg": "--bmb-color-error-on-on-error"
          }
        },
        "onColorIsNotConstant": "on-{tom} NÃO é a mesma cor nas três marcas. Em bne-cia, on-success resolve para #000000, não #fafafa, porque o success-default daquela marca é um verde muito mais claro. Nunca cravar a cor do glifo."
      },
      "globalTheme": {
        "brands": [
          "employer",
          "epays",
          "bne-cia"
        ],
        "modes": [
          "light",
          "dark"
        ],
        "howToSwitch": "atributos data-brand e data-theme no <html>"
      },
      "openDivergences": [
        "Cor do glifo no tom Base: a variante liga on-base-alt (#a3a3a3) e on-surface-base-alt (#e5e5e5); o SVG exportado renderiza #e5e5e5. Implementado como on-base-alt, seguindo a especificação recebida. Ver src/dot.rules.md.",
        "Default de Show icon: a especificação diz false; todas as variantes do Figma renderizam com glifo. Implementado como false. Ver src/dot.rules.md."
      ]
    },
    "regras": "# Dot — regras de uso\n\nIndicador visual de status. Um círculo colorido, opcionalmente com um glifo dentro.\n\nFonte: Figma `04. CORE-Basics (Audit)` `BWdzK06j2tX1Dt62ZSxNR1` — `Dot` 992:1153, component set\n`16645:256367` (eixo `tone`, 5 variantes) e `.Master Dot` `16645:256354` (eixo `Size`, 3\nvariantes). Lido ao vivo via MCP em 2026-09-22, junto com a especificação `dot.rules.md`\nrecebida com a tarefa.\n\n---\n\n## A regra que manda em todas as outras\n\n**O Dot nunca pode ser a única fonte da informação de status.**\n\nEle comunica por cor, e só por cor. O glifo opcional não muda de forma entre os tons — um\nSuccess e um Error com glifo são o mesmo desenho em cores diferentes. Quem não distingue as\ncores não distingue os status. É WCAG 1.4.1 (Uso de Cor).\n\nPor isso, uma destas duas formas é obrigatória:\n\n```html\n<!-- 1. Há texto visível ao lado: o Dot é decoração. -->\n<span class=\"bmb-dot bmb-dot--success bmb-dot--md\" aria-hidden=\"true\"></span> Ativo\n\n<!-- 2. Não há texto visível: o Dot precisa de rótulo próprio. -->\n<span class=\"bmb-dot bmb-dot--error bmb-dot--md\" role=\"img\" aria-label=\"Offline\"></span>\n```\n\nUm `.bmb-dot` que não tem nem `aria-hidden=\"true\"` nem `role=\"img\"` + `aria-label` **reprova na\nvalidação**. Não é recomendação.\n\nUm detalhe que costuma escapar: dentro de um componente maior, o texto do item nem sempre\nresolve. Numa lista de pessoas, `Maria` + Dot verde não nomeia o status — `Maria` diz quem, não\ndiz como ela está. O texto precisa nomear o **status**.\n\n---\n\n## Dot vs Button vs Hyperlink\n\n| | Dot | Button | Hyperlink |\n| --- | --- | --- | --- |\n| Para quê | informar | executar uma ação | levar a outro destino |\n| Elemento | `<span>` | `<button>` | `<a href>` |\n| Interativo | **não** | sim | sim |\n| Estados | **nenhum** | 6 | 6 |\n| Recebe foco | **não** | sim | sim |\n\nO Dot não é acionável. Se algo precisa ser clicado, o componente é outro. Não acrescente\n`onClick`, `tabindex`, `:hover`, `:focus` nem `role=\"button\"` — a validação reprova o CSS se\nqualquer pseudo-classe de interação aparecer nele.\n\nIsto não é preferência de implementação: está na descrição do componente no Figma, em palavras.\nA propriedade foi **renomeada de `State` para `tone`** exatamente por isso — os cinco valores\nsão tons, não estados.\n\n---\n\n## Os cinco tons\n\n`tone` é o eixo do component set. O default é `Base`.\n\n| Tom | Quando usar | Fundo | Glifo |\n| --- | --- | --- | --- |\n| `base` | status sem categoria — contagem genérica, presença neutra | `base-default-alt` | `on-base-alt` |\n| `primary` | remete à **marca** — novidade, plano, feature | `primary-default` | `on-primary` |\n| `success` | positivo — online, ativo, aprovado, concluído | `success-default` | `on-success` |\n| `warning` | exige atenção, mas não é falha — pendente, atrasado | `warning-default` | `on-warning` |\n| `error` | negativo ou crítico — offline, falhou, bloqueado | `error-default` | `on-error` |\n\n**`primary` não é `success`.** É o erro de semântica mais fácil de cometer aqui: o tom Primary\nexiste para remeter à marca, não para dizer que algo deu certo. Um cadastro aprovado é\n`success`, mesmo que o verde da marca seja mais bonito naquela tela.\n\n### A cor do glifo não é constante entre as marcas\n\n`on-{tom}` muda por marca, e não por pouco:\n\n| | employer | epays | bne-cia |\n| --- | --- | --- | --- |\n| `success-default` | `#0f6c31` | `#0f6c31` | `#00bd3f` |\n| `on-success` | `#fafafa` | `#fafafa` | **`#000000`** |\n\nEm bne-cia o verde de sucesso é muito mais claro, então o glifo resolve para **preto**. Cravar\n`#fafafa` — ou `white`, ou qualquer hex — quebraria o componente numa das três marcas.\n\nNenhum hex é escrito em `dist/dot.css`, nem como fallback. A validação reprova se aparecer.\n\n---\n\n## Geometria\n\nDo `.Master Dot`. O diâmetro total é `padding + glifo + padding`:\n\n| Tamanho | Diâmetro | Padding | Glifo |\n| --- | --- | --- | --- |\n| `sm` (Small) | 8px | 1px | 6px |\n| `md` (Medium) — default | 16px | 3px | 10px |\n| `lg` (Large) | 24px | 4px | 16px |\n\nO raio é `--bmb-radius-full` (1000px), que é o mesmo `border-radius-full` do Figma. Sempre\npílula — não há variante quadrada.\n\nA conta é verificada no build: se alguém mexer em `dot.tokens.json` e `pad + icon + pad` deixar\nde bater com `box`, o gerador quebra com o nome do tamanho em vez de emitir um círculo errado.\n\n### Onde o eixo `Size` mora no Figma\n\n`tone` está no set `Dot`; `Size` está na instância aninhada `.Master Dot`. São dois níveis\ndiferentes na árvore. Em CSS não existe essa hierarquia — as duas viram classes irmãs\n(`.bmb-dot--success .bmb-dot--lg`). Vale saber ao comparar com o Figma.\n\n---\n\n## O glifo é opcional\n\n`Show icon` é um booleano do `.Master Dot`, com default `false`. Em CSS não existe classe para\nligar ou desligar: o glifo **é a presença do filho**.\n\n```html\n<!-- sem glifo: círculo liso -->\n<span class=\"bmb-dot bmb-dot--success bmb-dot--md\" aria-hidden=\"true\"></span>\n\n<!-- com glifo -->\n<span class=\"bmb-dot bmb-dot--success bmb-dot--lg\" aria-hidden=\"true\">\n    <span class=\"bmb-dot__icon\"><svg>…</svg></span>\n</span>\n```\n\nO SVG vem de quem consome (no Figma é um instance swap). Ele precisa usar `currentColor` em\n`fill` ou `stroke` — é assim que o token `on-{tom}` chega até ele.\n\nSem glifo o elemento fica sem conteúdo. É por isso que o diâmetro é explícito (`inline-size` /\n`block-size`) em vez de sair do padding: senão o círculo colapsaria para zero.\n\n---\n\n## Desvios e acréscimos em relação ao Figma\n\n**1. `outline` em alto contraste — acréscimo.** No modo de cores forçadas o sistema substitui\n`background-color`, e os cinco tons ficam idênticos. O Dot perde a única coisa que os\ndiferencia.\n\nIsso **não** é corrigido com `forced-color-adjust: none`. Devolver a cor à força atropelaria a\npaleta que a pessoa escolheu justamente por precisar dela. O que carrega o significado nesse\nmodo é o texto ao lado — mais uma razão para a regra de uso ser obrigatória.\n\nO que o bloco faz é garantir que o círculo continue **visível**: sem ele, o fundo forçado pode\ncoincidir com o da página e o indicador some. `outline` com `outline-offset: -1px` em vez de\n`border`, para não comer o padding e encolher o glifo.\n\n**2. Defaults em `:where()` — implementação.** O Figma define defaults (`tone=Base`,\n`Size=Medium`), diferente do Button e do Hyperlink, cujos contratos exigem a classe. Então\n`.bmb-dot` sozinho precisa renderizar, e precisa renderizar exatamente isso.\n\nOs defaults ficam em `:where(.bmb-dot)`, que tem especificidade **zero**. Num bloco normal a\nespecificidade empataria com `.bmb-dot--lg`, e quem venceria seria a última regra do arquivo —\no default passaria a depender da ordem em que o gerador imprime. Com zero, qualquer classe de\ntom ou tamanho ganha sempre.\n\n---\n\n## Divergências abertas\n\nRegistradas, não resolvidas por conta própria. `AGENTS.md` pede que uma diferença entre Figma,\naudit e especificação seja exposta com a fonte de cada versão, em vez de escolhida em silêncio.\n\n### 1. A cor do glifo no tom Base\n\n| Fonte | Diz |\n| --- | --- |\n| Especificação recebida | `on-base-alt` — `#a3a3a3` |\n| Variáveis ligadas na variante (`get_variable_defs` em 16645:256368) | `on-base-alt` **e** `on-surface-base-alt` — as duas |\n| SVG exportado da variante | renderiza `#e5e5e5`, que é `on-surface-base-alt` |\n\nOs outros quatro tons ligam exatamente dois tokens (fundo + `on`), sem ambiguidade. Só o Base\nliga três.\n\nO SVG exportado não decide a questão: nos outros quatro tons ele sai com `fill=\"white\"`\n(`#ffffff`), e nenhum deles usa `#ffffff` — `on-primary` é `#fafafa`. Ou seja, o exportador não\nestá resolvendo a cor ligada nessas variantes, e por isso o `#e5e5e5` do Base também não serve\ncomo prova.\n\n**Implementado:** `on-base-alt`, seguindo a especificação.\n\n**Como fechar:** abrir a variante `tone=Base` no Figma e olhar a que camada cada um dos dois\ntokens está ligado. Se o glifo for `on-surface-base-alt`, trocar em `TONS.base.fg` dentro de\n`scripts/build-dot-css.mjs` — é uma linha, e a tabela acima precisa ser atualizada junto.\n\n### 2. O default de `Show icon`\n\nA especificação diz `false`. A descrição do componente no Figma confirma que o ícone é\nopcional. Mas **todas** as variantes renderizam com o glifo, e o valor default de uma\npropriedade booleana não é legível pelo MCP.\n\n**Implementado:** `false` — círculo liso quando nada é escrito.\n\n**Como fechar:** abrir o `.Master Dot` no Figma e ler o valor default da propriedade\n`Show icon` no painel de propriedades do componente.\n\n---\n\n## Decisões registradas\n\n- **`<span>`, não `<div>`.** O Dot acompanha texto; um elemento de bloco quebraria a linha.\n- **Sem `transition`.** Não há estado para transicionar. Uma transição aqui só serviria para\n  animar uma troca de tom feita por JavaScript, e isso é decisão de quem consome, não do\n  componente.\n- **Sem `cursor`.** `cursor: pointer` num elemento que não faz nada é promessa falsa.\n- **O glifo não é fornecido pelo Design System.** No Figma é instance swap; aqui é slot. Embutir\n  um ícone fixo inventaria uma decisão que o componente não toma.\n",
    "origem": {
      "contrato": "src/dot.contract.json",
      "regras": "src/dot.rules.md"
    }
  },
  "checkbox": {
    "contrato": {
      "component": "Checkbox",
      "version": "experimental",
      "purpose": "opção independente: cada caixa liga ou desliga uma opção sem afetar as outras, e o valor só vale quando o formulário é enviado",
      "notTheOthers": "Escolha única entre opções é o Radio. Configuração com efeito imediato, sem confirmar, é o Switch. Ver src/checkbox.rules.md, 'Checkbox vs os outros dois'.",
      "source": {
        "figma": "04. CORE-Basics (Audit) BWdzK06j2tX1Dt62ZSxNR1, página ✅ 08. Controls 827:887 — set Checkbox 1451:1360 (tone × state × checked, 36 variantes) e .Master Checkbox 1451:1285 (size). Lido ao vivo via MCP em 2026-09-24.",
        "spec": "checkbox.rules.md recebido com a tarefa (conferido pelo design em 2026-09-23) — mapeamento variante↔prop, cores por tom e notas de acessibilidade. Reescrito em src/checkbox.rules.md.",
        "geometry": "src/checkbox.tokens.json",
        "toneMappings": "scripts/build-checkbox-css.mjs",
        "brandColors": "audit/core-brands-audit.json",
        "rules": "src/checkbox.rules.md"
      },
      "element": {
        "required": "label",
        "input": "input[type=\"checkbox\"]",
        "markup": "<label class=\"bmb-checkbox\"><input type=\"checkbox\" class=\"bmb-checkbox__input\"> <span class=\"bmb-checkbox__label\">Rótulo</span></label>",
        "forbidden": [
          "div",
          "span",
          "button"
        ],
        "forbiddenAttributes": [
          "role=\"switch\"",
          "aria-pressed",
          "role=\"checkbox\" num elemento que não é input"
        ],
        "why": "A semântica, o teclado (Espaço alterna) e o envio no formulário vêm do <input type=\"checkbox\"> nativo. O <label> que o envolve faz o rótulo inteiro ser área clicável. Trocar o input por <div> ou <span> perde as três coisas; role=\"switch\" transformaria a caixa em interruptor, que é outro componente."
      },
      "baseClass": "bmb-checkbox",
      "parts": {
        "input": "bmb-checkbox__input",
        "label": "bmb-checkbox__label"
      },
      "variants": {
        "tone": {
          "required": false,
          "default": "neutral",
          "defaultBehaviour": "sem classe de tom o Checkbox renderiza como neutral — o default vem do Figma e está em :where(.bmb-checkbox), com especificidade zero",
          "classPrefix": "bmb-checkbox--",
          "values": [
            "neutral",
            "brand",
            "invert"
          ],
          "figmaNames": {
            "neutral": "neutral",
            "brand": "brand",
            "invert": "invert"
          },
          "meaning": {
            "neutral": "padrão, para formulários e listas comuns",
            "brand": "só quando a escolha precisa remeter à marca",
            "invert": "só sobre o painel da marca (surface-brand); valor transitório, até invert virar modo de superfície"
          }
        },
        "size": {
          "required": false,
          "default": "md",
          "defaultBehaviour": "sem classe de tamanho o Checkbox renderiza como md — ver a divergência sobre o default em openDivergences",
          "classPrefix": "bmb-checkbox--",
          "values": [
            "sm",
            "md",
            "lg"
          ],
          "figmaNames": {
            "sm": "sm",
            "md": "md",
            "lg": "lg"
          },
          "figmaAxisLocation": "No Figma o eixo size não fica no set Checkbox: fica na instância aninhada .Master Checkbox. Em CSS os dois eixos viram classes irmãs."
        }
      },
      "checked": {
        "values": [
          "false",
          "true",
          "indeterminate"
        ],
        "figmaProperty": "checked (VARIANT de três valores no set)",
        "howToApply": {
          "false": "input sem o atributo checked",
          "true": "atributo checked no input, ou input.checked = true",
          "indeterminate": "input.indeterminate = true por script — não existe atributo HTML. A pseudo-classe é :indeterminate."
        },
        "indeterminateRule": "Só para o controle pai de um grupo parcialmente marcado, como o 'selecionar todos' de Table e List. Nunca como terceiro estado de negócio ('talvez', 'parcial'). Clicar num pai indeterminado marca todos os filhos."
      },
      "states": {
        "default": "repouso — o <input> sem pseudo-classe",
        "hover": ":hover no <label> — a borda passa de 1px por dentro para 2px centralizada (sombra externa de 1px). Nenhuma cor muda. Não é classe nem prop.",
        "focus": {
          "selector": ".bmb-checkbox:has(.bmb-checkbox__input:focus-visible)",
          "ring": "outline de 2px, outline-offset 2px, no <label> — envolve caixa + rótulo e não muda o tamanho do componente",
          "token": "--_bmb-checkbox-ring: border-base-focus-alt em neutral e brand; on-surface-subtle-brand em invert"
        },
        "disabled": {
          "requiredMarkup": "atributo disabled nativo no <input>",
          "style": "opacidade 0.4 no <label> inteiro, mantendo a cor do tom; sem hover e sem foco",
          "token": "nenhum — DS-037"
        }
      },
      "notSupported": {
        "selected": "não existe. A seleção se chama checked (decisão D2).",
        "active": "não existe no Figma.",
        "stateClasses": "Não há bmb-checkbox--hover, --focus, --disabled nem --checked. Estado vem do input nativo.",
        "showCopy": "O booleano Show copy do master não vira classe (DS-049): o rótulo é conteúdo, e a presença do texto é o mecanismo. Sem rótulo visível, aria-label no input é obrigatório.",
        "diagonalGlyph": "O traço diagonal oculto (Icon 1840:3860, 1840:3388, 1840:3426) é uma camada escondida do master. Não é implementado."
      },
      "accessibility": {
        "keyboard": "Espaço alterna. Tab entra e sai de cada caixa individualmente — não é grupo com setas.",
        "label": "O <label> envolve o input e o rótulo: a área clicável inclui o texto. Sem rótulo visível, aria-label no input.",
        "group": "Grupo de checkboxes com título: <fieldset> + <legend>.",
        "stateNotColorOnly": "Marcado e indeterminado se distinguem pelo glifo, não só pela cor da caixa. No invert a caixa marcada tem o mesmo fundo da desmarcada — só o glifo muda.",
        "indeterminate": "Com o input nativo, o leitor de tela anuncia 'misto' a partir de input.indeterminate. aria-checked=\"mixed\" só se aplica a quem usar role=\"checkbox\", o que este pacote não faz.",
        "focusRing": "outline de 2px com offset de 2px no <label>. Nunca outline: none — a validação reprova.",
        "forcedColors": "@media (forced-colors: active) mantém borda e glifo em CanvasText e o anel em Highlight.",
        "keepCheckedBorder": "No brand marcado, o preenchimento primary-default fica abaixo de 3:1 contra a página no modo escuro. Quem delimita o controle é a borda on-surface-primary. A borda do controle marcado NÃO pode ser removida.",
        "notVerified": "Nada disto foi exercitado em navegador, teclado ou leitor de tela. O contraste citado nas regras foi medido no Figma (especificação) e recalculado a partir de dist/brands.css, não no navegador."
      },
      "tokens": {
        "radius": "--bmb-radius-sm na caixa (4px no Desktop, 2px abaixo de 1024px) — o border-radius-sm do Figma",
        "typography": "--bmb-font-family-body, --bmb-font-weight-regular, --bmb-font-size-paragraph-{small,medium,large}, --bmb-line-height-130",
        "noHardcodedColor": "Nenhum hex pode aparecer em dist/checkbox.css, nem como fallback. A validação reprova.",
        "perTone": {
          "neutral": {
            "bg": "--bmb-color-base-backgrounds-base-default",
            "bgChecked": "--bmb-color-base-backgrounds-base-default-alt",
            "glyph": "--bmb-color-base-on-on-surface-base-alt",
            "border": "--bmb-color-base-on-on-surface-base",
            "label": "--bmb-color-base-on-on-surface-base",
            "ring": "--bmb-color-base-borders-border-base-focus-alt"
          },
          "brand": {
            "bg": "--bmb-color-primary-on-on-primary",
            "bgChecked": "--bmb-color-primary-backgrounds-primary-default",
            "glyph": "--bmb-color-primary-on-on-primary",
            "border": "--bmb-color-primary-on-on-surface-primary",
            "label": "--bmb-color-primary-on-on-surface-primary",
            "ring": "--bmb-color-base-borders-border-base-focus-alt"
          },
          "invert": {
            "bg": "--bmb-color-surface-brand-backgrounds-surface-brand",
            "bgChecked": "--bmb-color-surface-brand-backgrounds-surface-brand",
            "glyph": "--bmb-color-surface-brand-on-on-surface-neutral-brand",
            "border": "--bmb-color-surface-brand-on-on-surface-neutral-brand",
            "label": "--bmb-color-surface-brand-on-on-surface-neutral-brand",
            "ring": "--bmb-color-surface-brand-on-on-surface-subtle-brand"
          }
        },
        "onColorIsNotConstant": "on-* e base-default mudam por marca e tema: on-primary é #000000 em bne-cia/dark, base-default é #000000 em employer/dark. Nunca cravar a cor."
      },
      "globalTheme": {
        "brands": [
          "employer",
          "epays",
          "bne-cia"
        ],
        "modes": [
          "light",
          "dark"
        ],
        "howToSwitch": "atributos data-brand e data-theme no <html>"
      },
      "openDivergences": [
        "DS-053: no brand desmarcado, o fundo da caixa é on-primary, um token de texto usado como fundo. Implementado como o Figma mostra.",
        "Default de size: a propriedade do .Master Checkbox diz sm; as 36 variantes públicas instanciam md e a especificação diz md. Implementado md.",
        "Glifo check do sm: 5,09 × 3,5 em (4, 5) numa caixa de 14 — fora do centro e proporcionalmente menor que no md e no lg. Implementado como medido.",
        "Rótulo: o Figma aplica leading-trim CAP_HEIGHT; o CSS não implementa (suporte parcial a text-box-trim).",
        "Contraste: os números da especificação (Figma) e os recalculados a partir de dist/brands.css não coincidem. Ver src/checkbox.rules.md."
      ],
      "generatedFiles": [
        "dist/checkbox.css",
        "dist/checkbox.preview.css",
        "dist/checkbox.tokens.js"
      ]
    },
    "regras": "# Checkbox\n\nFonte de verdade: o componente **Checkbox** em **04. CORE-Basics (Audit)**\n`BWdzK06j2tX1Dt62ZSxNR1`, página **✅ 08. Controls** `827:887` — component set `1451:1360`\n(`tone` × `state` × `checked`, 36 variantes) e `.Master Checkbox` `1451:1285` (`size`, 3\nvariantes, privado).\n\nDados lidos **ao vivo** do Figma via MCP em 24/09/2026, com `skipInvisibleInstanceChildren =\nfalse`: descrição do set, das 36 variantes e do master; variáveis ligadas a cada camada,\nincluindo a opacidade; geometria medida nos nós; path dos glifos. Junto veio a especificação\n`checkbox.rules.md` recebida com a tarefa (conferida pelo design em 23/09/2026), reescrita\naqui no formato deste repositório. Nenhum valor foi inventado.\n\n## Checkbox vs os outros dois\n\n| | Checkbox | Radio | Switch |\n| --- | --- | --- | --- |\n| Para quê | opção **independente** | escolha **única** num grupo | configuração com **efeito imediato** |\n| Quando vale | ao **enviar** o formulário | ao enviar o formulário | **na hora**, sem confirmar |\n| Elemento | `<input type=\"checkbox\">` | `<input type=\"radio\">` em `<fieldset>` | `<input type=\"checkbox\" role=\"switch\">` |\n| Sozinho | pode | **nunca** — mínimo 2 | pode |\n| `indeterminate` | **sim**, só no pai de um grupo | não | não |\n| Hover | borda passa a 2px | borda passa a 2px | **nenhum** |\n| Teclado | Espaço; Tab por caixa | setas dentro do grupo; um Tab por grupo | Espaço |\n\nA pergunta que decide: **marcar esta opção muda alguma outra?** Se muda — marcar uma desmarca\nas outras —, é Radio. Se não muda, pergunte de novo: **o efeito acontece no clique, sem\nbotão de salvar?** Se acontece, é Switch. Se só vale quando a pessoa envia, é Checkbox.\n\n## Quando usar\n\n- Aceitar termos, marcar preferências que só valem ao salvar.\n- Listas de opções independentes: \"Quais canais você usa?\" com várias respostas possíveis.\n- O \"selecionar todos\" no cabeçalho de Table ou List — é o único uso do `indeterminate`.\n\n## Quando não usar\n\n- Escolha única entre opções → Radio.\n- Ligar ou desligar algo com efeito imediato (\"Notificações\", \"Modo escuro\") → Switch.\n- Terceiro estado de negócio (\"talvez\", \"parcial\") → não existe; o `indeterminate` é só do pai.\n- Disparar efeito colateral no clique → Switch ou Button.\n\n## Anatomia\n\n`[ caixa ] [ rótulo ]` — `<label>` flex horizontal, alinhado ao centro, `gap: 8px`.\n\n```html\n<label class=\"bmb-checkbox bmb-checkbox--neutral bmb-checkbox--md\">\n    <input type=\"checkbox\" class=\"bmb-checkbox__input\" name=\"termos\">\n    <span class=\"bmb-checkbox__label\">Aceito os termos</span>\n</label>\n```\n\n- O `<label>` é o componente e recebe tom e tamanho. Ele envolve o input, então o rótulo\n  inteiro é área clicável.\n- O `<input type=\"checkbox\">` é **nativo**, com `appearance: none`. Não troque por `<div>` ou\n  `<span>`: a semântica, o teclado e o envio no formulário vêm dele.\n- O glifo é desenho do componente, não slot: é o `::before` do input, com o path medido no\n  Figma.\n\n## Props\n\n| Prop | Valores | Default | Onde mora no Figma |\n| --- | --- | --- | --- |\n| `tone` | `neutral` · `brand` · `invert` | `neutral` | set `Checkbox` |\n| `size` | `sm` · `md` · `lg` | `md` | `.Master Checkbox` aninhado |\n| `checked` | `false` · `true` · `indeterminate` | `false` | set `Checkbox` |\n| `state=disabled` | atributo `disabled` no input | — | set `Checkbox` |\n| `state=hover` / `focus` | — (pseudo-classe) | — | set `Checkbox` |\n| rótulo | conteúdo do `<span class=\"bmb-checkbox__label\">` | — | `Text` no master |\n\nEm CSS, `tone` e `size` viram **classes irmãs** (`bmb-checkbox--brand bmb-checkbox--lg`),\ncomo no Dot. `checked`, `hover`, `focus` e `disabled` **não são classes**: vêm do input\nnativo.\n\nSão **3 tons**, não os 13 temas do Button nem os 9 do Hyperlink. O eixo se chama `tone`, não\n`theme`. Não copie a escala do Button.\n\n## Cor\n\nA cor vem dos tokens semânticos e muda com `data-brand` e `data-theme`. O mapeamento\ntom → token está em `../scripts/build-checkbox-css.mjs`.\n\n| Tom | Caixa desmarcada | Caixa marcada | Glifo | Borda | Rótulo | Anel |\n| --- | --- | --- | --- | --- | --- | --- |\n| `neutral` | `base-default` | `base-default-alt` | `on-surface-base-alt` | `on-surface-base` | `on-surface-base` | `border-base-focus-alt` |\n| `brand` | `on-primary` ⚠️ DS-053 | `primary-default` | `on-primary` | `on-surface-primary` | `on-surface-primary` | `border-base-focus-alt` |\n| `invert` | `surface-brand` | `surface-brand` | `on-surface-neutral-brand` | `on-surface-neutral-brand` | `on-surface-neutral-brand` | `on-surface-subtle-brand` |\n\nTodos com o prefixo `--bmb-color-` e o grupo do token (por exemplo\n`--bmb-color-base-on-on-surface-base`). Os nomes completos estão no contrato, em\n`tokens.perTone`.\n\n**Zero tokens novos.** Os 11 tokens distintos que as 36 variantes ligam foram conferidos um a\num contra `../dist/brands.css`: todos já existiam, com 6 definições cada (3 marcas × 2\nmodos). Em Employer claro e escuro — os dois modos que o arquivo do Figma expõe — o valor\nresolvido é o mesmo que o Figma reporta.\n\n**A cor não muda por estado.** Hover só engrossa a borda, focus acrescenta o anel e disabled\naplica opacidade. Conferido nas 36 variantes.\n\n### `on-*` e `base-default` não são constantes\n\n| | employer | epays | bne-cia |\n| --- | --- | --- | --- |\n| `on-primary` (dark) | `#fafafa` | `#fafafa` | **`#000000`** |\n| `base-default` (dark) | **`#000000`** | `#0e141c` | `#0e1c13` |\n| `on-surface-primary` (dark) | `#a5b3d5` | `#90a1de` | `#7bffde` |\n\nResolva sempre pelo token. Nenhum hex é escrito em `dist/checkbox.css`, nem como fallback; a\nvalidação reprova se aparecer.\n\n## Estados\n\n| Estado | Como acontece | O que muda |\n| --- | --- | --- |\n| default | input em repouso | — |\n| hover | `:hover` no `<label>` | borda de 1px por dentro → 2px centralizada; nenhuma cor muda |\n| focus | `:focus-visible` no input | anel de 2px com folga de 2px em volta de caixa + rótulo |\n| disabled | atributo `disabled` no input | opacidade 0,4 no controle inteiro, sem hover e sem foco |\n| checked | `:checked` | fundo da caixa marcada + glifo `check` |\n| indeterminate | `:indeterminate` (`input.indeterminate = true`) | fundo da caixa marcada + traço horizontal |\n\n`indeterminate` **não tem atributo HTML**: é definido por script. Existe só para o pai de um\ngrupo parcialmente marcado. Clicar nele marca todos os filhos.\n\n## Geometria\n\nMedida nos nós do `.Master Checkbox`, não nos valores declarados.\n\n| | `sm` | `md` | `lg` |\n| --- | --- | --- | --- |\n| Caixa | 14 | 16 | 18 |\n| Glifo `check` (L × A) | 5,09 × 3,5 | 8 × 5,5 | 9 × 6,19 |\n| Posição do `check` | 4, 5 | 4, 5 | 4,5, 5,625 |\n| Traço do `indeterminate` | 6 | 8 | 10 |\n| Posição do traço | 4, 7 | 4, 8 | 4, 9 |\n\n- Traço dos dois glifos: **1,6666px**. `check` com ponta e junção arredondadas;\n  `indeterminate` com ponta arredondada.\n- Borda: 1px por dentro. No hover, 2px centralizada.\n- Raio da caixa: `--bmb-radius-sm` — o mesmo `border-radius-sm` que o Figma liga (4px no\n  Desktop, 2px abaixo de 1024px).\n- Distância caixa ↔ rótulo: 8px.\n\nA conta é verificada no build: o traço do `indeterminate` é centrado nos dois eixos\n(`x + w + x = caixa`, `y × 2 = caixa`) e o `check` precisa caber na caixa com meia espessura\nde folga. Se alguém mexer em `checkbox.tokens.json` e a conta deixar de fechar, o gerador\nquebra com o nome do tamanho.\n\n## Anel de foco\n\n- `outline: 2px solid var(--_bmb-checkbox-ring)` com `outline-offset: 2px`, no `<label>`,\n  a partir do `:focus-visible` do input, via `:has()`. O anel envolve caixa + rótulo.\n- Token: `border-base-focus-alt` em `neutral` e `brand`; `on-surface-subtle-brand` em\n  `invert`.\n- **Não** é `border-{tom}-focus`: `border-base-focus` e `border-primary-focus` reprovam 3:1\n  (DS-046/047). Decisão fechada, não é lacuna.\n- **O foco não muda o tamanho do componente.** `outline` não ocupa espaço. Nunca `border`,\n  `padding` ou `box-shadow` no foco.\n- Raio: no Figma o anel é um retângulo em −4px, com traço de 2px por dentro e\n  `border-radius-md` na borda externa. O `<label>` recebe\n  `calc(var(--bmb-radius-md) - 4px)`, e a borda externa do outline dá 8px no Desktop e 4px\n  abaixo de 1024px, como no Figma.\n\n## Tipografia\n\n| | `sm` | `md` | `lg` |\n| --- | --- | --- | --- |\n| Estilo do Figma | `Paragraph/Small/Regular` | `Paragraph/Medium/Regular` | `Paragraph/Large/Regular` |\n| Token | `--bmb-font-size-paragraph-small` | `--bmb-font-size-paragraph-medium` | `--bmb-font-size-paragraph-large` |\n\nFamília `--bmb-font-family-body`, peso `--bmb-font-weight-regular`, entrelinha\n`--bmb-line-height-130` (130% no Figma). Nenhum px de fonte é cravado: os tokens\n`paragraph-*` encolhem abaixo de 1024px, como no Button e no Hyperlink.\n\n## Desvios do Figma (autorizados)\n\n**1. Hover por sombra externa, não por borda de 2px.** No Figma a borda passa a 2px\ncentralizada, ou seja, 1px a mais para fora. Em CSS, trocar `border-width` mudaria a caixa e\nempurraria o rótulo. A borda fica em 1px e uma `box-shadow: 0 0 0 1px` na cor da borda\nacrescenta o pixel de fora — o desenho é o mesmo e a caixa não muda.\n\n**2. Anel por `outline` no `<label>`, não por retângulo.** O Figma desenha o anel como um\nretângulo absoluto em −4px. `outline` com `outline-offset: 2px` reproduz a folga e a espessura\nsem ocupar espaço.\n\n**3. Anel nativo do input transparente.** O navegador desenharia um segundo anel em volta da\ncaixa. Ele é neutralizado com `outline: 2px solid transparent`, não com `outline: none`, que a\nvalidação proíbe. Efeito colateral: em cores forçadas o sistema pinta esse outline, e aparecem\ndois anéis concêntricos — ambos visíveis.\n\n**4. Glifo por máscara SVG.** O glifo é o `::before` do input, recortado por uma máscara com o\npath do Figma e pintado pelo token do tom. A máscara só recorta; a cor não está nela.\nRisco: `::before` num `<input>` com `appearance: none` funciona em Chromium, Firefox e WebKit,\nmas não é garantido pela especificação do HTML. Não foi testado em navegador.\n\n**5. Defaults em `:where()`.** O Figma define `tone=neutral` e as variantes públicas usam\n`size=md`. `.bmb-checkbox` sozinho renderiza exatamente isso, com especificidade zero, como no\nDot.\n\n**6. Cores forçadas — acréscimo.** O sistema substitui fundo e borda, e um glifo pintado por\n`background-color` sumiria. O glifo sai do ajuste automático e fica em `CanvasText`; a borda\nem `CanvasText` e o anel em `Highlight`.\n\n## Acessibilidade\n\n- `<input type=\"checkbox\">` nativo dentro de `<label>`. Sem rótulo visível, `aria-label` no\n  input é obrigatório.\n- Espaço alterna. Tab entra e sai de cada caixa — não é grupo com setas.\n- Grupo com título: `<fieldset>` + `<legend>`.\n- **Estado nunca só pela cor:** marcado e indeterminado se distinguem pelo glifo. No `invert` a\n  caixa marcada tem o mesmo fundo da desmarcada, e só o glifo muda.\n- `indeterminate`: com o input nativo, o leitor de tela anuncia o estado misto a partir de\n  `input.indeterminate`. `aria-checked=\"mixed\"` só se aplica a `role=\"checkbox\"`, que este\n  pacote não usa.\n- Proibido: `role=\"switch\"` (é outro componente) e `aria-pressed` (é botão de alternância).\n- Disabled: atributo `disabled` nativo. Ele já tira do Tab.\n- **A borda do controle marcado não pode ser removida.** No `brand` marcado, o preenchimento\n  `primary-default` fica abaixo de 3:1 contra a página no modo escuro; quem delimita o controle\n  é a borda `on-surface-primary`.\n\n### Contraste\n\n**Medido no Figma** (especificação recebida, 23/09/2026, 3 marcas × 2 temas): borda e rótulo\n≥ 4,5:1 nos três tons; `on-surface-primary` ≥ 6,04; anel ≥ 3:1 — pior 3,78 com\n`border-base-focus-alt` e 3,22 com `on-surface-subtle-brand` sobre o navy; `brand` marcado\nabaixo de 3:1 no Dark (Employer 2,81, Epays 1,45).\n\n**Recalculado a partir de `dist/brands.css`** (24/09/2026, fórmula da WCAG, contra\n`base-default` e, no `invert`, contra `surface-brand`): borda `neutral` ≥ 15,82; borda e\nrótulo `brand` ≥ 7,34; borda e rótulo `invert` ≥ 14,52; glifo sobre a caixa marcada ≥ 5,17;\nanel `border-base-focus-alt` ≥ 6,49; anel `on-surface-subtle-brand` ≥ 3,48; `brand` marcado\n2,45 em epays/dark e 3,90 em employer/dark.\n\nNenhum dos dois conjuntos foi medido no navegador. Eles não coincidem — ver \"Divergências\nabertas\".\n\n## Divergências abertas\n\nRegistradas, não resolvidas por conta própria. `AGENTS.md` pede que uma diferença entre Figma,\naudit e especificação seja exposta com a fonte de cada versão, em vez de escolhida em silêncio.\n\n### 1. DS-053 — token de texto como fundo\n\n| Fonte | Diz |\n| --- | --- |\n| Figma, `tone=brand, checked=false` (as 4 variantes) | fundo da caixa = `on-primary` |\n| Especificação recebida | `on-primary`, com o aviso ⚠️ DS-053 |\n\n`on-primary` é um token de **texto** usado como fundo. **Implementado** como o Figma mostra.\n**Como fechar:** decidir no `01. CORE-Brands` se existe um fundo de controle da marca; se\nexistir, trocar `TONS.brand.bg` em `scripts/build-checkbox-css.mjs`.\n\n### 2. O default de `size`\n\n| Fonte | Diz |\n| --- | --- |\n| Propriedade `size` do `.Master Checkbox` 1451:1285 | default **`sm`** |\n| As 36 variantes públicas do set 1451:1360 | todas instanciam **`md`** |\n| Especificação recebida | **`md`** |\n\n**Implementado:** `md`. **Como fechar:** trocar o default da propriedade do master para `md`,\nou decidir que é `sm` e mudar `defaults.size` em `src/checkbox.tokens.json`.\n\n### 3. O glifo `check` do `sm`\n\n| Tamanho | Caixa | `check` | Centro do `check` | Centro da caixa |\n| --- | --- | --- | --- | --- |\n| `sm` | 14 | 5,09 × 3,5 em (4, 5) | 6,55, 6,75 | 7, 7 |\n| `md` | 16 | 8 × 5,5 em (4, 5) | 8, 7,75 | 8, 8 |\n| `lg` | 18 | 9 × 6,19 em (4,5, 5,625) | 9, 8,72 | 9, 9 |\n\nNo `sm` o glifo está deslocado meio pixel para a esquerda e para cima, e é proporcionalmente\nmenor (36% da caixa, contra 50% no `md` e no `lg`). Parece que o glifo foi reduzido sem ser\nrecentrado. **Implementado** como medido. **Como fechar:** o design confirma ou corrige o\n`check` do `sm` no `.Master Checkbox`.\n\n### 4. O `leading-trim` do rótulo\n\nO texto do master usa `leading-trim: CAP_HEIGHT`. O CSS não implementa: `text-box-trim` ainda\ntem suporte parcial nos navegadores. A entrelinha de 130% está implementada.\n\n### 5. Contraste: especificação × `brands.css`\n\nOs números da especificação e os recalculados a partir de `dist/brands.css` (seção\n\"Contraste\") não coincidem — por exemplo, o pior anel `border-base-focus-alt` é 3,78 num e\n6,49 no outro, e o `brand` marcado em epays/dark é 1,45 num e 2,45 no outro. A superfície de\nreferência da medição do Figma não está registrada. Os dois conjuntos concordam no que\nimporta: tudo passa, exceto o preenchimento `brand` marcado no escuro, e é por isso que a borda\nfica.\n\n### 6. `on-surface-primary` na bne-cia/dark\n\nA especificação recebida diz que `on-surface-primary` é `#00F4B7` na bne-cia/dark.\n`dist/brands.css` resolve para `#7bffde`; `#00f4b7` é o `primary-default` dessa marca e modo.\nNão afeta o CSS (a cor sai do token), só o texto da especificação.\n\n## Decisões registradas (não são lacunas)\n\n- **D0 — `tone`, não `theme`.** Três valores: `neutral`, `brand`, `invert`. `invert` só sobre o\n  painel da marca (`surface-brand`).\n- **D1 — disabled sem token.** Mesma cor do tom em repouso, opacidade 0,4 no controle inteiro\n  (DS-037).\n- **D2 — `checked`, não `selected`.**\n- **D3 — `size` no master.** Em CSS, classe irmã, como no Dot.\n- **D4 — `indeterminate` só no Checkbox.**\n- **D5 — anel `border-base-focus-alt`.** Não `border-{tom}-focus` (DS-046/047).\n- **D6 — o foco não muda o tamanho.** `outline` + `outline-offset`, nunca `border`, `padding`\n  ou `box-shadow`.\n- **DS-049 — sem classe para o rótulo.** O master tem o booleano `Show copy`; em código o\n  rótulo é conteúdo e a presença do texto é o mecanismo. Não existe `--show-label`.\n- **Traço diagonal oculto não é implementado.** As camadas `Icon` `1840:3860`, `1840:3388` e\n  `1840:3426` do `.Master Checkbox` estão escondidas nas três variantes de tamanho.\n- **O rótulo não recebe `user-select: none`.** Selecionar o texto de um rótulo é comportamento\n  do navegador, e o componente não decide isso.\n",
    "origem": {
      "contrato": "src/checkbox.contract.json",
      "regras": "src/checkbox.rules.md"
    }
  },
  "radio": {
    "contrato": {
      "component": "Radio",
      "version": "experimental",
      "purpose": "escolha única dentro de um grupo: marcar uma opção desmarca as outras, e o valor só vale quando o formulário é enviado",
      "notTheOthers": "Opções independentes são o Checkbox. Configuração com efeito imediato, sem confirmar, é o Switch. Ver src/radio.rules.md, 'Radio vs os outros dois'.",
      "source": {
        "figma": "04. CORE-Basics (Audit) BWdzK06j2tX1Dt62ZSxNR1, página ✅ 08. Controls 827:887 — set Radio 1575:189 (tone × state × checked, 24 variantes) e .Master Radio 1575:175 (size). Lido ao vivo via MCP em 2026-09-24. No Figma existe só o item; o grupo é regra de código.",
        "spec": "radio.rules.md recebido com a tarefa (conferido pelo design em 2026-09-23) — mapeamento variante↔prop (incluindo o RadioGroup), cores por tom e notas de acessibilidade. Reescrito em src/radio.rules.md.",
        "geometry": "src/radio.tokens.json",
        "toneMappings": "scripts/build-radio-css.mjs",
        "brandColors": "audit/core-brands-audit.json",
        "rules": "src/radio.rules.md"
      },
      "element": {
        "required": "label",
        "input": "input[type=\"radio\"]",
        "group": "fieldset + legend",
        "markup": "<fieldset><legend>Título</legend><label class=\"bmb-radio\"><input type=\"radio\" class=\"bmb-radio__input\" name=\"grupo\" value=\"a\"> <span class=\"bmb-radio__label\">A</span></label> … </fieldset>",
        "forbidden": [
          "div",
          "span",
          "button"
        ],
        "forbiddenAttributes": [
          "aria-pressed",
          "role=\"radio\" num elemento que não é input"
        ],
        "why": "O <input type=\"radio\"> nativo com o mesmo name dá o comportamento de grupo sem JavaScript: um único ponto de Tab, setas movendo foco e seleção, e só um valor enviado no formulário. O <fieldset> + <legend> dá o nome do grupo ao leitor de tela. Trocar o input por <div> perde tudo isso."
      },
      "baseClass": "bmb-radio",
      "parts": {
        "input": "bmb-radio__input",
        "label": "bmb-radio__label"
      },
      "group": {
        "minimum": 2,
        "rule": "Sempre em grupo de duas ou mais opções, dentro do mesmo <fieldset>, com o mesmo name. Nunca um Radio sozinho.",
        "uniformToneAndSize": "tone e size são iguais em todos os itens do mesmo grupo. A especificação descreve isso como prop do RadioGroup; este pacote é CSS, então a regra vira: todas as classes de tom e de tamanho iguais dentro do <fieldset>. A validação reprova uma demo que misture tons ou tamanhos no mesmo grupo.",
        "noDeselect": "Um radio marcado não se desmarca com um novo clique. Se o produto precisa permitir 'nenhuma escolha', inclua uma opção explícita, como 'Nenhum'.",
        "tooMany": "Com mais de ~6 opções, prefira Dropdown."
      },
      "variants": {
        "tone": {
          "required": false,
          "default": "neutral",
          "defaultBehaviour": "sem classe de tom o Radio renderiza como neutral — o default vem do Figma e está em :where(.bmb-radio), com especificidade zero",
          "classPrefix": "bmb-radio--",
          "values": [
            "neutral",
            "brand",
            "invert"
          ],
          "figmaNames": {
            "neutral": "neutral",
            "brand": "brand",
            "invert": "invert"
          },
          "meaning": {
            "neutral": "padrão, para formulários e listas comuns",
            "brand": "só quando a escolha precisa remeter à marca",
            "invert": "só sobre o painel da marca (surface-brand); valor transitório, até invert virar modo de superfície"
          }
        },
        "size": {
          "required": false,
          "default": "md",
          "defaultBehaviour": "sem classe de tamanho o Radio renderiza como md — ver a divergência sobre o default em openDivergences",
          "classPrefix": "bmb-radio--",
          "values": [
            "sm",
            "md",
            "lg"
          ],
          "figmaNames": {
            "sm": "sm",
            "md": "md",
            "lg": "lg"
          },
          "figmaAxisLocation": "No Figma o eixo size não fica no set Radio: fica na instância aninhada .Master Radio. Em CSS os dois eixos viram classes irmãs."
        }
      },
      "checked": {
        "values": [
          "false",
          "true"
        ],
        "figmaProperty": "checked (VARIANT de dois valores no set)",
        "howToApply": {
          "false": "input sem o atributo checked",
          "true": "atributo checked em UM input do grupo — o navegador desmarca os outros do mesmo name"
        }
      },
      "states": {
        "default": "repouso — o <input> sem pseudo-classe",
        "hover": ":hover no <label> — a borda do círculo passa de 1px por dentro para 2px centralizada (sombra externa de 1px). Nenhuma cor muda. Não é classe nem prop.",
        "focus": {
          "selector": ".bmb-radio:has(.bmb-radio__input:focus-visible)",
          "ring": "outline de 2px, outline-offset 2px, no <label> — envolve círculo + rótulo e não muda o tamanho do componente",
          "token": "--_bmb-radio-ring: border-base-focus-alt em neutral e brand; on-surface-neutral-brand em invert (não o subtle, que já é a cor da borda)"
        },
        "disabled": {
          "requiredMarkup": "atributo disabled nativo no <input> (ou no <fieldset>, para o grupo inteiro)",
          "style": "opacidade 0.4 no <label> inteiro, mantendo a cor do tom; sem hover e sem foco",
          "token": "nenhum — DS-037"
        }
      },
      "notSupported": {
        "indeterminate": "não existe no Radio (decisão D4). O CSS gerado não pode ter a pseudo-classe — a validação reprova.",
        "single": "Radio sozinho não existe: o mínimo é 2 no grupo.",
        "selected": "não existe. A seleção se chama checked (decisão D2).",
        "stateClasses": "Não há bmb-radio--hover, --focus, --disabled nem --checked. Estado vem do input nativo.",
        "radioGroupComponent": "Não há classe de grupo. O grupo é o <fieldset> nativo; tom e tamanho ficam iguais em todos os itens.",
        "showCopy": "O booleano Show copy do master não vira classe (DS-049): o rótulo é conteúdo, e a presença do texto é o mecanismo."
      },
      "accessibility": {
        "keyboard": "O grupo tem UM ponto de Tab — o item marcado, ou o primeiro se nenhum estiver. Setas movem foco e seleção. Tudo isso é nativo com o mesmo name; não implemente roving tabindex à mão.",
        "label": "O <label> envolve o input e o rótulo: a área clicável inclui o texto.",
        "group": "<fieldset> + <legend> dão o nome do grupo ao leitor de tela.",
        "stateNotColorOnly": "Marcado se distingue pelo ponto, não só pelo preenchimento.",
        "focusRing": "outline de 2px com offset de 2px no <label>. Nunca outline: none — a validação reprova.",
        "forcedColors": "@media (forced-colors: active) mantém borda e ponto em CanvasText e o anel em Highlight.",
        "keepCheckedBorder": "No brand marcado, o preenchimento primary-default fica abaixo de 3:1 contra a página no modo escuro. Quem delimita o controle é a borda. A borda do controle marcado NÃO pode ser removida.",
        "notVerified": "Leitor de tela e alto contraste real não foram exercitados. O contraste citado nas regras foi medido no Figma (especificação) e recalculado a partir de dist/brands.css, não no navegador."
      },
      "tokens": {
        "radius": "--bmb-radius-full no círculo e no ponto — o border-radius-full do Figma",
        "typography": "--bmb-font-family-body, --bmb-font-weight-regular, --bmb-font-size-paragraph-{small,medium,large}, --bmb-line-height-130",
        "noHardcodedColor": "Nenhum hex pode aparecer em dist/radio.css, nem como fallback. A validação reprova.",
        "perTone": {
          "neutral": {
            "border": "--bmb-color-base-on-on-surface-base",
            "fill": "--bmb-color-base-backgrounds-base-default-alt",
            "dot": "--bmb-color-base-on-on-surface-base-alt",
            "label": "--bmb-color-base-on-on-surface-base",
            "ring": "--bmb-color-base-borders-border-base-focus-alt"
          },
          "brand": {
            "border": "--bmb-color-primary-on-on-surface-primary",
            "fill": "--bmb-color-primary-backgrounds-primary-default",
            "dot": "--bmb-color-primary-on-on-primary",
            "label": "--bmb-color-primary-on-on-surface-primary",
            "ring": "--bmb-color-base-borders-border-base-focus-alt"
          },
          "invert": {
            "border": "--bmb-color-surface-brand-on-on-surface-subtle-brand",
            "fill": "--bmb-color-surface-brand-on-on-surface-subtle-brand",
            "dot": "--bmb-color-surface-brand-backgrounds-background-brand",
            "label": "--bmb-color-surface-brand-on-on-surface-neutral-brand",
            "ring": "--bmb-color-surface-brand-on-on-surface-neutral-brand"
          }
        },
        "onColorIsNotConstant": "on-* muda por marca e tema: on-primary é #000000 em bne-cia/dark. Nunca cravar a cor."
      },
      "globalTheme": {
        "brands": [
          "employer",
          "epays",
          "bne-cia"
        ],
        "modes": [
          "light",
          "dark"
        ],
        "howToSwitch": "atributos data-brand e data-theme no <html>"
      },
      "openDivergences": [
        "Default de size: a propriedade do .Master Radio diz sm; as 24 variantes públicas instanciam md e a especificação diz md. Implementado md.",
        "Ponto: medido 4,375 / 5 / 5,625; a especificação arredonda para 4,4 / 5 / 5,6. Implementado o medido.",
        "Gap: o Figma liga o gap do master à variável spacing-sm, que não existe em dist/brands.css. Implementado o literal 8px, sem token novo.",
        "Rótulo: o Figma aplica leading-trim CAP_HEIGHT; o CSS não implementa.",
        "Contraste: os números da especificação e os recalculados a partir de dist/brands.css não coincidem. Ver src/radio.rules.md."
      ],
      "generatedFiles": [
        "dist/radio.css",
        "dist/radio.preview.css",
        "dist/radio.tokens.js"
      ]
    },
    "regras": "# Radio\n\nFonte de verdade: o componente **Radio** em **04. CORE-Basics (Audit)**\n`BWdzK06j2tX1Dt62ZSxNR1`, página **✅ 08. Controls** `827:887` — component set `1575:189`\n(`tone` × `state` × `checked`, 24 variantes) e `.Master Radio` `1575:175` (`size`, 3\nvariantes, privado). No Figma existe **só o item**: o grupo é regra de código.\n\nDados lidos **ao vivo** do Figma via MCP em 24/09/2026, com `skipInvisibleInstanceChildren =\nfalse`: descrição do set, das 24 variantes e do master; variáveis ligadas a cada camada,\nincluindo a opacidade; geometria medida nos nós. Junto veio a especificação `radio.rules.md`\nrecebida com a tarefa (conferida pelo design em 23/09/2026), reescrita aqui no formato deste\nrepositório. Nenhum valor foi inventado.\n\n## Radio vs os outros dois\n\n| | Radio | Checkbox | Switch |\n| --- | --- | --- | --- |\n| Para quê | escolha **única** num grupo | opção **independente** | configuração com **efeito imediato** |\n| Quando vale | ao **enviar** o formulário | ao enviar o formulário | **na hora**, sem confirmar |\n| Elemento | `<input type=\"radio\">` em `<fieldset>` | `<input type=\"checkbox\">` | `<input type=\"checkbox\" role=\"switch\">` |\n| Sozinho | **nunca** — mínimo 2 | pode | pode |\n| `indeterminate` | **não** | sim, só no pai de um grupo | não |\n| Hover | borda passa a 2px | borda passa a 2px | **nenhum** |\n| Teclado | **um Tab por grupo**; setas movem a seleção | Espaço; Tab por caixa | Espaço |\n\nA pergunta que decide: **marcar esta opção desmarca as outras?** Se desmarca, é Radio. Se as\nopções convivem, é Checkbox. Se a escolha tem efeito imediato, sem botão de salvar, é Switch.\n\n## Quando usar\n\n- Escolha única entre 2 a ~6 opções visíveis ao mesmo tempo: \"Forma de pagamento\", \"Plano\".\n- Quando comparar as opções lado a lado ajuda a decidir.\n\n## Quando não usar\n\n- Uma opção só (\"Aceito os termos\") → Checkbox. Um Radio sozinho não se desmarca.\n- Opções independentes → Checkbox.\n- Mais de ~6 opções → Dropdown: radio longo empurra a decisão para baixo da dobra.\n- Efeito imediato → Switch.\n- Permitir \"nenhuma escolha\" desmarcando → não existe; inclua uma opção explícita \"Nenhum\".\n\n## Anatomia\n\n`[ círculo ] [ rótulo ]` por item — `<label>` flex horizontal, alinhado ao centro,\n`gap: 8px` —, sempre dentro de um grupo.\n\n```html\n<fieldset>\n    <legend>Forma de pagamento</legend>\n    <label class=\"bmb-radio bmb-radio--neutral bmb-radio--md\">\n        <input type=\"radio\" class=\"bmb-radio__input\" name=\"pagamento\" value=\"pix\" checked>\n        <span class=\"bmb-radio__label\">Pix</span>\n    </label>\n    <label class=\"bmb-radio bmb-radio--neutral bmb-radio--md\">\n        <input type=\"radio\" class=\"bmb-radio__input\" name=\"pagamento\" value=\"boleto\">\n        <span class=\"bmb-radio__label\">Boleto</span>\n    </label>\n</fieldset>\n```\n\n- O `<label>` é o componente e recebe tom e tamanho.\n- O `<input type=\"radio\">` é **nativo**, com `appearance: none`. O mesmo `name` em todos os\n  itens é o que dá o comportamento de grupo — um valor só, um ponto de Tab, setas.\n- O ponto é desenho do componente: o `::before` do input.\n\n## Props\n\n| Prop | Valores | Default | Onde mora |\n| --- | --- | --- | --- |\n| `tone` | `neutral` · `brand` · `invert` | `neutral` | set `Radio`; **igual em todo o grupo** |\n| `size` | `sm` · `md` · `lg` | `md` | `.Master Radio` aninhado; **igual em todo o grupo** |\n| `checked` | `false` · `true` | `false` | set `Radio`; em código, um input marcado por `name` |\n| `state=disabled` | atributo `disabled` no input ou no `<fieldset>` | — | set `Radio` |\n| `state=hover` / `focus` | — (pseudo-classe) | — | set `Radio` |\n| rótulo | conteúdo do `<span class=\"bmb-radio__label\">` | — | `Text` no master |\n| nome do grupo | `name` em todos os inputs + `<legend>` | obrigatório | — (regra de código) |\n\n### `tone` e `size` são do grupo\n\nA especificação recebida descreve `tone` e `size` como props do `RadioGroup`, herdadas pelos\nitens: opções do mesmo grupo não devem variar entre si. **Este pacote é CSS** e não tem\n`RadioGroup`. A regra vira: **todas as classes de tom e de tamanho iguais dentro do mesmo\n`<fieldset>`**. A validação reprova uma demo que misture tons ou tamanhos no mesmo grupo.\n\nSão **3 tons**, não os 13 temas do Button nem os 9 do Hyperlink. O eixo se chama `tone`.\n\n## Cor\n\nA cor vem dos tokens semânticos e muda com `data-brand` e `data-theme`. O mapeamento\ntom → token está em `../scripts/build-radio-css.mjs`.\n\n| Tom | Borda | Preenchimento marcado | Ponto | Rótulo | Anel |\n| --- | --- | --- | --- | --- | --- |\n| `neutral` | `on-surface-base` | `base-default-alt` | `on-surface-base-alt` | `on-surface-base` | `border-base-focus-alt` |\n| `brand` | `on-surface-primary` | `primary-default` | `on-primary` | `on-surface-primary` | `border-base-focus-alt` |\n| `invert` | `on-surface-subtle-brand` | `on-surface-subtle-brand` | `background-brand` | `on-surface-neutral-brand` | `on-surface-neutral-brand` |\n\n**Desmarcado não tem preenchimento:** o círculo mostra a superfície de trás. Conferido nas 12\nvariantes desmarcadas — a camada do círculo não tem fill.\n\n**Zero tokens novos.** Os 10 tokens distintos que as 24 variantes ligam foram conferidos um a\num contra `../dist/brands.css`: todos já existiam, com 6 definições cada. Em Employer claro e\nescuro, o valor resolvido é o mesmo que o Figma reporta.\n\n**A cor não muda por estado.** Conferido nas 24 variantes.\n\n`on-*` não é constante entre marcas e temas: `on-primary` é `#000000` em bne-cia/dark, e\n`on-surface-primary` é `#7bffde` ali. Resolva sempre pelo token; nenhum hex é escrito em\n`dist/radio.css`.\n\n## Estados\n\n| Estado | Como acontece | O que muda |\n| --- | --- | --- |\n| default | input em repouso | — |\n| hover | `:hover` no `<label>` | borda de 1px por dentro → 2px centralizada; nenhuma cor muda |\n| focus | `:focus-visible` no input | anel de 2px com folga de 2px em volta de círculo + rótulo |\n| disabled | atributo `disabled` no input (ou no `<fieldset>`) | opacidade 0,4 no controle inteiro, sem hover e sem foco |\n| checked | `:checked` | preenchimento + ponto |\n\n**Não existe `indeterminate` no Radio** (D4). Um radio marcado não se desmarca com um novo\nclique.\n\n## Geometria\n\nMedida nos nós do `.Master Radio`, não nos valores declarados.\n\n| | `sm` | `md` | `lg` |\n| --- | --- | --- | --- |\n| Círculo | 14 | 16 | 18 |\n| Ponto | 4,375 | 5 | 5,625 |\n| Posição do ponto | 4,8125 | 5,5 | 6,1875 |\n\n- Borda: 1px por dentro. No hover, 2px centralizada.\n- Raio do círculo e do ponto: `--bmb-radius-full` — o mesmo `border-radius-full` do Figma.\n- Distância círculo ↔ rótulo: 8px.\n\nA conta é verificada no build: o ponto é centrado (`posição × 2 + ponto = círculo`) e precisa\ncaber dentro da borda. Se a conta deixar de fechar, o gerador quebra com o nome do tamanho.\n\n## Anel de foco\n\n- `outline: 2px solid var(--_bmb-radio-ring)` com `outline-offset: 2px`, no `<label>`, a\n  partir do `:focus-visible` do input, via `:has()`. O anel envolve círculo + rótulo.\n- Token: `border-base-focus-alt` em `neutral` e `brand`; **`on-surface-neutral-brand`** em\n  `invert`.\n- **Não** use `on-surface-subtle-brand` no `invert`, como o Checkbox faz: no Radio ele já é a\n  cor da borda do círculo, e o anel se fundiria com ela. A descrição do set diz isso em\n  palavras.\n- **Não** é `border-{tom}-focus`: reprovam 3:1 (DS-046/047).\n- O foco não muda o tamanho: `outline` não ocupa espaço.\n- Raio: `calc(var(--bmb-radius-md) - 4px)` no `<label>`, para a borda externa do anel bater\n  com o `border-radius-md` do retângulo de foco do Figma.\n\n## Tipografia\n\n| | `sm` | `md` | `lg` |\n| --- | --- | --- | --- |\n| Estilo do Figma | `Paragraph/Small/Regular` | `Paragraph/Medium/Regular` | `Paragraph/Large/Regular` |\n| Token | `--bmb-font-size-paragraph-small` | `--bmb-font-size-paragraph-medium` | `--bmb-font-size-paragraph-large` |\n\nFamília `--bmb-font-family-body`, peso `--bmb-font-weight-regular`, entrelinha\n`--bmb-line-height-130`. Nenhum px de fonte é cravado.\n\n## Desvios do Figma (autorizados)\n\n**1. Hover por sombra externa.** Borda de 1px + `box-shadow: 0 0 0 1px` na cor da borda, que\nreproduz os 2px centralizados do Figma sem mudar o círculo.\n\n**2. Anel por `outline` no `<label>`**, não pelo retângulo absoluto do Figma.\n\n**3. Anel nativo do input transparente**, não `outline: none`. Em cores forçadas aparecem dois\nanéis concêntricos, ambos visíveis.\n\n**4. Ponto por `::before`.** Risco: `::before` num `<input>` com `appearance: none` funciona em\nChromium, Firefox e WebKit, mas não é garantido pela especificação do HTML.\n\n**5. Defaults em `:where()`**: `tone=neutral`, `size=md`.\n\n**6. Cores forçadas — acréscimo**: borda e ponto em `CanvasText`, anel em `Highlight`.\n\n**7. Grupo por `<fieldset>` nativo.** O `RadioGroup` da especificação não vira classe: o\ncomportamento de grupo vem do `name`, e o nome do grupo vem do `<legend>`. Nenhum JavaScript\nde roving tabindex.\n\n## Acessibilidade\n\n- `<input type=\"radio\">` nativo dentro de `<label>`, com o **mesmo `name`** em todos os itens,\n  dentro de `<fieldset>` + `<legend>`.\n- **Teclado de grupo:** um único ponto de Tab — o item marcado, ou o primeiro se nenhum\n  estiver. Setas movem foco **e** seleção; Espaço marca o item focado. Tudo nativo: não\n  implemente roving tabindex à mão.\n- **Estado nunca só pela cor:** o marcado se distingue pelo ponto.\n- **Mínimo de 2 no grupo.** Um Radio sozinho não se desmarca e não é escolha.\n- Disabled: atributo `disabled` nativo, no item ou no `<fieldset>` inteiro.\n- Proibido: `aria-pressed`, `indeterminate`.\n- **A borda do controle marcado não pode ser removida.** No `brand` marcado, o preenchimento\n  `primary-default` fica abaixo de 3:1 contra a página no modo escuro.\n\n### Contraste\n\n**Medido no Figma** (especificação recebida, 23/09/2026, 3 marcas × 2 temas): borda ≥ 3:1,\npior 3,22 no `invert`; rótulo ≥ 4,5:1; ponto sobre o preenchimento ≥ 3:1; anel ≥ 3:1;\n`on-surface-primary` ≥ 6,04.\n\n**Recalculado a partir de `dist/brands.css`** (24/09/2026, fórmula da WCAG, contra\n`base-default` e, no `invert`, contra `surface-brand`): borda `neutral` ≥ 15,82; borda e\nrótulo `brand` ≥ 7,34; borda `invert` ≥ 3,48 (epays/light); rótulo `invert` ≥ 14,52; ponto\nsobre o preenchimento ≥ 3,55 (`invert`, epays/light); anel `border-base-focus-alt` ≥ 6,49;\nanel `on-surface-neutral-brand` ≥ 14,52; `brand` marcado 2,45 em epays/dark.\n\nNenhum dos dois conjuntos foi medido no navegador. Eles não coincidem — ver \"Divergências\nabertas\".\n\n## Divergências abertas\n\nRegistradas, não resolvidas por conta própria.\n\n### 1. O default de `size`\n\n| Fonte | Diz |\n| --- | --- |\n| Propriedade `size` do `.Master Radio` 1575:175 | default **`sm`** |\n| As 24 variantes públicas do set 1575:189 | todas instanciam **`md`** |\n| Especificação recebida | **`md`** |\n\n**Implementado:** `md`. **Como fechar:** trocar o default da propriedade do master, ou mudar\n`defaults.size` em `src/radio.tokens.json`.\n\n### 2. O tamanho do ponto\n\n| Fonte | `sm` | `md` | `lg` |\n| --- | --- | --- | --- |\n| Nós do `.Master Radio` | 4,375 | 5 | 5,625 |\n| Especificação recebida | 4,4 | 5 | 5,6 |\n\nA especificação arredonda. **Implementado** o medido.\n\n### 3. O gap ligado a uma variável que não existe no repositório\n\n| Fonte | Diz |\n| --- | --- |\n| `.Master Radio`, `itemSpacing` | ligado à variável `spacing-sm` (8) |\n| `dist/brands.css` | não tem nenhum `--bmb-spacing-*` |\n\n**Implementado:** o literal `8px`, como o `gap` do Hyperlink — sem criar token. O Checkbox usa\n8 cru no Figma. **Como fechar:** levar os espaçamentos ao audit, se o time quiser que o gap\nvenha de token.\n\n### 4. O `leading-trim` do rótulo\n\nO texto do master usa `leading-trim: CAP_HEIGHT`. O CSS não implementa (suporte parcial a\n`text-box-trim`).\n\n### 5. Contraste: especificação × `brands.css`\n\nOs números não coincidem (ver \"Contraste\"): o pior `invert` é 3,22 na especificação e 3,48 no\nrecálculo. A superfície de referência da medição do Figma não está registrada. Os dois\nconjuntos concordam que tudo passa, exceto o preenchimento `brand` marcado no escuro.\n\n## Decisões registradas (não são lacunas)\n\n- **D0 — `tone`, não `theme`.** `invert` só sobre o painel da marca.\n- **D1 — disabled sem token** (DS-037). Opacidade 0,4.\n- **D2 — `checked`, não `selected`.**\n- **D3 — `size` no master**, classe irmã em CSS.\n- **D4 — sem `indeterminate`.** Só o Checkbox tem.\n- **D5 — anel `border-base-focus-alt`** em `neutral` e `brand`; `on-surface-neutral-brand` em\n  `invert`.\n- **D6 — o foco não muda o tamanho.**\n- **DS-049 — sem classe para o rótulo.** `Show copy` do master não vira classe.\n- **Sem desmarcar por clique.** É comportamento nativo e é a regra da especificação.\n",
    "origem": {
      "contrato": "src/radio.contract.json",
      "regras": "src/radio.rules.md"
    }
  }
};
