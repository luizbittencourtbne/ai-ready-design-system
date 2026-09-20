#!/usr/bin/env node
/* Gera o CSS do Hyperlink a partir de src/hyperlink.tokens.json + o mapeamento tema -> token
 * que vive AQUI, do mesmo jeito que scripts/build-css.mjs faz para o Button.
 *
 * COR: só tokens semânticos --bmb-color-*, que já existem em dist/brands.css. O Hyperlink não
 * introduziu nenhum token novo: as 23 variáveis que o Figma usa (13 na primeira leitura, mais
 * os 9 anéis de foco e o `on-surface-base` que vieram no ajuste de 2026-09-18) foram
 * conferidas uma a uma contra o repositório e todas já existiam, com o mesmo valor.
 *
 * GEOMETRIA: literais do Figma (hyperlink.tokens.json) — não são tokens.
 *
 * Não edite dist/ à mão.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
fs.mkdirSync(DIST, { recursive: true });
const d = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/hyperlink.tokens.json'), 'utf8'));

const SZ = { XSmall: 'xs', Small: 'sm', Medium: 'md', Large: 'lg' };

/* Tamanho da fonte por tamanho de link.
 *
 * Conferido ao vivo no Figma: os estilos de texto do Hiperlink são `Button/XSmall`,
 * `Button/Small`, `Button/Medium` e `Button/Large` — os mesmos do Button. Cada um aponta o
 * `size` para o `paragraph-*` correspondente, com peso semibold e entrelinha 1,3. Ou seja, o
 * Hyperlink não tem escala tipográfica própria: reusa a do Design System inteira. */
const FONT = {
    xs: 'paragraph-xsmall',
    sm: 'paragraph-small',
    md: 'paragraph-medium',
    lg: 'paragraph-large',
};

/* Tema -> token de cor do texto, por estado.
 *
 * `cor` é o token usado em Default, Hover, Active, Selected, Focus e Disabled, salvo o que
 * estiver sobrescrito em `porEstado`.
 *
 * VERIFICAÇÃO (o que foi lido variante a variante, e o que não foi):
 *   - Primary: os 6 estados foram abertos. Todos usam `on-surface-primary`; a cor NÃO muda
 *     por estado. Só mudam sublinhado (hover/selected/focus) e opacidade (disabled).
 *   - Base: Default (`on-base`), Hover (`base-hover-alt`) e Selected (`base-selected-alt`)
 *     foram abertos. O padrão é por estado, e `base-active-alt` e `border-base-focus-alt`
 *     aparecem na lista de variáveis do set — por isso estão mapeados abaixo, mas Active e
 *     Focus do Base NÃO foram abertos um a um. Ver "decisões a validar" em hyperlink.rules.md.
 *   - Success: o Hover foi aberto, e usa `on-surface-success` no texto e no sublinhado — o
 *     mesmo token do Default. Confirma a dedução abaixo por amostra.
 *   - Os outros 6 temas: nenhum estado aberto individualmente, mas a união de variáveis do
 *     set mostra que Secondary, Tertiary, Quaternary, Warning, Error e Invert têm EXATAMENTE
 *     dois tokens de cor cada — texto e anel de foco. Sem um segundo token de texto, não há
 *     como variarem a cor por estado. O Base é o único com tokens por estado (tem 8).
 *
 * A união do set inclui ainda `primary-selected` (que é do Button), `border-primary-subtle`,
 * `base-default-alt` e `on-surface-base`. Nenhum é consumido pelo Hyperlink, e por isso não
 * estão mapeados aqui. Ver "Tokens da união que não são do Hyperlink" em hyperlink.rules.md. */
const TEMAS = {
    base: {
        cor: 'base-on-on-base',
        anel: 'base-borders-border-base-focus',
        porEstado: {
            hover: 'base-backgrounds-base-hover-alt',
            active: 'base-backgrounds-base-active-alt',
            selected: 'base-backgrounds-base-selected-alt',
            focus: 'base-borders-border-base-focus-alt',
        },
    },
    primary: { cor: 'primary-on-on-surface-primary', anel: 'primary-borders-border-primary-focus' },
    secondary: { cor: 'secondary-on-on-surface-secondary', anel: 'secondary-borders-border-secondary-focus' },
    tertiary: { cor: 'tertiary-on-on-surface-tertiary', anel: 'tertiary-borders-border-tertiary-focus' },
    quaternary: { cor: 'quaternary-on-on-surface-quaternary', anel: 'quaternary-borders-border-quaternary-focus' },
    success: { cor: 'success-on-on-surface-success', anel: 'success-borders-border-success-focus' },
    warning: { cor: 'warning-on-on-surface-warning', anel: 'warning-borders-border-warning-focus' },
    error: { cor: 'error-on-on-surface-error', anel: 'error-borders-border-error-focus' },
    invert: { cor: 'surface-brand-on-on-surface-neutral-brand', anel: 'surface-brand-borders-border-brand' },
};

const linhas = [];
const p = (s = '') => linhas.push(s);

p('/* ---------------------------------------------------------------------------');
p(' * Hyperlink — 9 temas × 6 estados × 4 tamanhos × 2 conteúdos');
p(` * Fonte: ${d._source}`);
p(' * COR: só tokens semânticos --bmb-color-*. Precisa de brands.css carregado antes.');
p(' * GEOMETRIA: literais do Figma (hyperlink.tokens.json) — não são tokens.');
p(' * GERADO por build-hyperlink-css.mjs — não edite à mão.');
p(' * ------------------------------------------------------------------------ */');
p();
p('@layer components {');

/* Base do componente. É um <a>: conteúdo inline que flui com o texto.
 *
 * Não emitimos `height`. Na primeira leitura isso era um desvio deliberado: o master tinha
 * altura fixa de 24px e um link com altura fixa quebra dentro de um parágrafo. No ajuste de
 * 2026-09-18 o Figma REMOVEU a altura fixa do master e registrou a mesma preocupação como
 * ponto em aberto na descrição do componente. Ou seja: deixou de ser desvio e virou acordo.
 * A altura sai da própria entrelinha, como num link de verdade. */
p('    .bmb-hyperlink {');
p('        position: relative;');
p('        display: inline-flex;');
p('        align-items: center;');
p(`        gap: ${d.gap}px;`);
p('        color: var(--_bmb-link-fg);');
p('        font-family: var(--bmb-font-family-body);');
p('        font-weight: var(--bmb-font-weight-semibold);');
p('        line-height: var(--bmb-line-height-130);');
p('        text-decoration: none;');
p('        cursor: pointer;');
p('        transition: color 120ms ease, text-decoration-color 120ms ease;');
p('    }');
p();
p('    .bmb-hyperlink__label { display: inline; }');
p();
p('    .bmb-hyperlink__icon {');
p('        display: inline-flex;');
p('        flex: 0 0 auto;');
p('        align-items: center;');
p('        justify-content: center;');
p('    }');
p('    .bmb-hyperlink__icon svg { width: 100%; height: 100%; }');
p();

/* Hit Area. O Figma acrescentou um retângulo invisível de 24px em todas as 8 variantes de
 * tamanho, nomeado "Hit Area (invisível, min 24x24 WCAG 2.5.8)", centralizado sobre o
 * conteúdo. No XSmall o conteúdo tem 9px de altura, então sem isso o alvo de toque ficava
 * muito abaixo do mínimo. Reproduzimos com ::after absoluto: amplia o alvo sem ocupar espaço
 * no fluxo do texto, que é o que um retângulo de verdade faria. */
p(`    /* Hit Area invisível: alvo de no mínimo ${d.hitArea}px (WCAG 2.5.8). Não afeta o layout. */`);
p('    .bmb-hyperlink::after {');
p("        content: '';");
p('        position: absolute;');
p('        inset-inline: 0;');
p('        top: 50%;');
p('        translate: 0 -50%;');
p(`        block-size: max(100%, ${d.hitArea}px);`);
p('    }');
p();
p('    /* Icon Only é quadrado e pequeno: o alvo precisa crescer nos dois eixos. */');
p('    .bmb-hyperlink--icon-only::after {');
p('        inset-inline: auto;');
p('        left: 50%;');
p('        translate: -50% -50%;');
p(`        inline-size: max(100%, ${d.hitArea}px);`);
p('    }');
p();

/* Sublinhado. No Figma ele é uma `border-b` no wrapper do texto; em CSS usamos
 * `text-decoration`, que acompanha a quebra de linha do texto e é o que um leitor de tela e o
 * modo de cores forçadas entendem como sublinhado de link. Registrado como desvio. */
p('    /* Sublinhado: presente em Hover, Active, Selected e Focus. Ausente só no Default e no');
p('     * Disabled. O Active ganhou sublinhado no ajuste de 2026-09-18 — antes era idêntico ao');
p('     * Default e quem apertava o link não recebia retorno visual. */');
p('    .bmb-hyperlink:hover,');
p('    .bmb-hyperlink:active,');
p('    .bmb-hyperlink--selected,');
p('    .bmb-hyperlink--force-underline,');
p('    .bmb-hyperlink:focus-visible {');
p('        text-decoration: underline;');
p('        text-underline-offset: 0.2em;');
p('    }');
p();

/* Force Underline. É a contraparte em código da propriedade booleana `Force Underline`
 * (BOOLEAN, false por padrão) do component set. No Figma ela é SÓ SINALIZAÇÃO: não desenha
 * nada. A tentativa de desenhar lá dentro — um retângulo atrás do texto — foi testada e
 * descartada em 2026-09-18, porque o retângulo mora fora da instância aninhada
 * `.Master Hiperlink` e não enxerga se Show Left Icon / Show Right Icon estão ligados; a
 * margem calibrada para uma configuração de ícone desalinha em qualquer outra.
 *
 * O sublinhado nativo do CSS não tem esse problema: acompanha a largura real do texto, seja
 * qual for a combinação de ícones. A cor sai de `currentColor`, que já é o token
 * `on-surface-{tema}` — o mesmo que Hover e Active usam. Nada é cravado aqui.
 *
 * Quando usar: a regra de 3:1 em src/hyperlink.rules.md, "Regra de uso obrigatória". */
p('    /* Contraparte da prop Force Underline do Figma, que lá é só sinalização.');
p('     * A cor vem de currentColor = o token on-surface-{tema}, igual ao Hover. */');
p();
p('    .bmb-hyperlink:hover { color: var(--_bmb-link-fg-hover, var(--_bmb-link-fg)); }');
p('    .bmb-hyperlink:active { color: var(--_bmb-link-fg-active, var(--_bmb-link-fg)); }');
p('    .bmb-hyperlink--selected { color: var(--_bmb-link-fg-selected, var(--_bmb-link-fg)); }');
p('    .bmb-hyperlink:focus-visible { color: var(--_bmb-link-fg-focus, var(--_bmb-link-fg)); }');
p();

/* Foco. O Figma passou a desenhar um anel próprio por tema (ajuste de 2026-09-18): borda de
 * 2px na cor `<tema>-borders-border-<tema>-focus`, padding 2px na vertical e 4px na
 * horizontal, raio 4px. A divergência de acessibilidade que existia na primeira leitura —
 * Focus idêntico a Hover — está resolvida na origem.
 *
 * DESVIO: usamos `outline`, não `border` + `padding`. Uma borda com padding aumentaria o
 * elemento ao receber foco e empurraria o texto ao redor a cada Tab, dentro de um parágrafo.
 * `outline` desenha por fora sem ocupar espaço. Efeito colateral: o offset fica uniforme
 * (2px), em vez dos 2px verticais e 4px horizontais do Figma. Registrado nas regras. */
p('    /* Anel de foco por tema, vindo do Figma. `outline` em vez de `border` para não');
p('     * empurrar o texto ao redor a cada Tab. Nunca use outline: none aqui. */');
p('    .bmb-hyperlink:focus-visible {');
p(`        outline: ${d.focus.borderWidth}px solid var(--_bmb-link-ring);`);
p(`        outline-offset: ${d.focus.padY}px;`);
p(`        border-radius: ${d.focus.radius}px;`);
p('    }');
p();

/* "Disabled" do Figma. <a> não tem estado desabilitado nativo, então a classe pinta a
 * aparência e NADA MAIS: não desabilita, não tira do tab order, não adiciona aria-disabled.
 * Quem usa precisa decidir o comportamento — está explicado nas regras. */
p('    /* Aparência apenas. NÃO desabilita nada: <a> não tem disabled nativo.');
p('     * Ver "Disabled" em src/hyperlink.rules.md antes de usar. */');
p('    .bmb-hyperlink--disabled-appearance {');
p(`        opacity: ${d.disabledOpacity};`);
p('        cursor: not-allowed;');
p('    }');
p();

p('    /* ----- temas ----- */');
for (const nome of d.themeOrder) {
    const k = nome.toLowerCase();
    const t = TEMAS[k];
    if (!t) throw new Error(`tema sem mapeamento em build-hyperlink-css.mjs: ${nome}`);
    p(`    .bmb-hyperlink--${k} {`);
    p(`        --_bmb-link-fg: var(--bmb-color-${t.cor});`);
    p(`        --_bmb-link-ring: var(--bmb-color-${t.anel});`);
    for (const [estado, token] of Object.entries(t.porEstado ?? {})) {
        p(`        --_bmb-link-fg-${estado}: var(--bmb-color-${token});`);
    }
    p('    }');
}
p();

p('    /* ----- tamanhos: literais do Figma; font-size via token ----- */');
for (const nome of d.sizeOrder) {
    const z = d.sizes[nome];
    const k = SZ[nome];
    p(`    .bmb-hyperlink--${k} {`);
    p(`        font-size: var(--bmb-font-size-${FONT[k]});`);
    p('    }');
    p(`    .bmb-hyperlink--${k} .bmb-hyperlink__icon { inline-size: ${z.icon}px; block-size: ${z.icon}px; }`);
    p(`    .bmb-hyperlink--icon-only.bmb-hyperlink--${k} { inline-size: ${z.icon}px; block-size: ${z.icon}px; justify-content: center; }`);
}
p();

/* Cores forçadas: mesma proteção que o Button ganhou. O sublinhado por text-decoration
 * sobrevive nesse modo, mas o outline precisa de cor de sistema para ser pintado. */
p('    /* Alto contraste do Windows: garante indicador de foco pintado. */');
p('    @media (forced-colors: active) {');
p('        .bmb-hyperlink:focus-visible { outline: 2px solid Highlight; }');
p('    }');

p('}');
p();

const corpo = linhas.join('\n');
fs.writeFileSync(path.join(DIST, 'hyperlink.css'), `@import 'tailwindcss';\n\n${corpo}`, 'utf8');
fs.writeFileSync(path.join(DIST, 'hyperlink.preview.css'), corpo, 'utf8');

const themeTokens = Object.fromEntries(
    d.themeOrder.map((nome) => {
        const k = nome.toLowerCase();
        const t = TEMAS[k];
        return [k, { fg: t.cor, ...Object.fromEntries(Object.entries(t.porEstado ?? {}).map(([e, v]) => [`fg-${e}`, v])) }];
    }),
);
/* As marcas saem do audit, não de uma lista fixa aqui: se alguém acrescentar uma marca, o
 * build quebra com nome em vez de deixar o storybook silenciosamente incompleto. */
const ROTULOS = { employer: 'Employer', epays: 'ePays', 'bne-cia': 'BNE CIA' };
const brands = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'audit/core-brands-audit.json'), 'utf8'),
).brands.map((id) => {
    if (!ROTULOS[id]) throw new Error(`marca sem rótulo em build-hyperlink-css.mjs: ${id}`);
    return { id, label: ROTULOS[id] };
});

fs.writeFileSync(
    path.join(DIST, 'hyperlink.tokens.js'),
    `window.BMB_HYPERLINK_TOKENS = ${JSON.stringify({ ...d, themeTokens, brands }, null, 2)};\n`,
    'utf8',
);

console.log(`hyperlink.css escrito — ${corpo.split('\n').length} linhas`);
console.log(`  ${d.themeOrder.length} temas · ${d.sizeOrder.length} tamanhos · ${d.stateOrder.length} estados`);
console.log('hyperlink.preview.css + hyperlink.tokens.js escritos');
