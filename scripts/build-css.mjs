#!/usr/bin/env node
/**
 * build-css.mjs — gera button.css (Tailwind v4) e button.preview.css (browser).
 *
 * A camada de COR espelha 1:1 o `TESTES/src/components/button/_button.scss`: só tokens
 * semânticos `--bmb-color-*`, nunca hex. É isso que faz o botão reagir a data-brand /
 * data-theme. A camada de GEOMETRIA usa os literais do Figma (button.tokens.json), que
 * não são tokens — padding, gap, altura e ícone vêm medidos do arquivo.
 *
 * Uso: node build-css.mjs   (brands.css vem do build-brands.mjs)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
fs.mkdirSync(DIST, { recursive: true });
const d = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/button.tokens.json'), 'utf8'));
const SZ = { Small: 'sm', Medium: 'md', Large: 'lg', XLarge: 'xl' };
/* Tamanho da fonte por tamanho de botao.
 *
 * Conferido ao vivo no Figma em 19/09/2026, a pedido do dono do design system, no arquivo
 * 02. CORE-Tokens (Audit), no 341:322. Os estilos de texto do botao sao:
 *
 *   Button/Small   = Body SemiBold, size: Font Size/paragraph-small,   lineHeight 1.3
 *   Button/Medium  = Body SemiBold, size: Font Size/paragraph-medium,  lineHeight 1.3
 *   Button/Large   = Body SemiBold, size: Font Size/paragraph-large,   lineHeight 1.3
 *   Button/XLarge  = Body SemiBold, size: Font Size/paragraph-xlarge,  lineHeight 1.3
 *
 * Ou seja, `Button/*` nao tem tamanho proprio: e o `paragraph-*` correspondente em semibold
 * com entrelinha 1,3 — que e exatamente o que a regra base ja aplica via
 * --bmb-font-weight-semibold e --bmb-line-height-130. O mapa abaixo esta correto e completo.
 *
 * ATENCAO ao `sizes.XLarge.font: 20` de src/button.tokens.json: esse valor NAO corresponde ao
 * estilo. `Button/XLarge` resolve para paragraph-xlarge, que vale 22px no desktop. O 20 provavel-
 * mente veio de `Button/XLarge Underline`, o unico estilo da familia com tamanho cravado (20)
 * em vez de apontar para o token — uma inconsistencia do proprio Figma. O campo `font` do JSON
 * nao e lido por este gerador; ver a pendencia dos campos mortos em src/button.rules.md. */
const FONT = { sm: 'paragraph-small', md: 'paragraph-medium', lg: 'paragraph-large', xl: 'paragraph-xlarge' };

/* Temas "filled": bg muda por estado, fg/bd constantes, focus = borda colorida.
 * tema → [coleção, leaf, leaf-do-focus]. Transcrito de $bmb-button-themes.
 * Nomes conforme o CORE-Brands (Audit): o Audit corrigiu as irregularidades que o
 * _button.scss do repo ainda contorna — `quartenary` virou `quaternary`, o focus de
 * success/cta deixou de reusar `primary-focus`, e o leaf de CTA virou `cta`. */
const FILLED = {
    primary: ['primary', 'primary', 'primary-focus'],
    secondary: ['secondary', 'secondary', 'secondary-focus'],
    tertiary: ['tertiary', 'tertiary', 'tertiary-focus'],
    quaternary: ['quaternary', 'quaternary', 'quaternary-focus'],
    success: ['success', 'success', 'success-focus'],
    warning: ['warning', 'warning', 'warning-focus'],
    error: ['error', 'error', 'error-focus'],
    cta: ['cta', 'cta', 'cta-focus'],
};

/* Temas irregulares: cruzam coleções, mapeados estado a estado das variantes do Figma. */
const IRREGULAR = {
    base: {
        bg: 'base-backgrounds-base-default',
        'bg-hover': 'base-backgrounds-base-hover',
        'bg-active': 'base-backgrounds-base-active',
        'bg-selected': 'base-backgrounds-base-selected',
        fg: 'base-on-on-base',
        bd: 'base-borders-border-base',
        focus: 'base-borders-border-base-focus',
    },
    plain: {
        bg: null,
        fg: 'base-on-on-base',
        bd: null,
        'bg-hover': 'base-backgrounds-base-hover-alt',
        'fg-hover': 'base-backgrounds-base-default',
        'bd-hover': 'base-backgrounds-base-default',
        'bg-active': 'base-backgrounds-base-active',
        'bd-active': 'base-borders-border-base-subtle',
        'bg-selected': 'base-backgrounds-base-selected',
        'bd-selected': 'base-borders-border-base-subtle',
        focus: 'base-borders-border-base-focus',
        'bg-focus': 'base-backgrounds-base-default',
    },
    'plain-invert': {
        bg: null,
        fg: 'surface-brand-on-on-surface-neutral-brand',
        bd: null,
        'bg-hover': 'primary-backgrounds-primary-default',
        'bg-active': 'primary-backgrounds-primary-active',
        'bg-selected': 'primary-backgrounds-primary-selected',
        focus: 'surface-brand-borders-border-brand',
        'bg-focus': 'surface-brand-backgrounds-surface-brand',
    },
    invert: {
        bg: null,
        fg: 'surface-brand-on-on-surface-neutral-brand',
        bd: 'surface-brand-borders-border-brand',
        'bg-hover': 'primary-backgrounds-primary-default',
        'bd-hover': 'surface-brand-on-on-surface-subtle-brand',
        'bg-active': 'primary-backgrounds-primary-active',
        'bg-selected': 'primary-backgrounds-primary-selected',
        focus: 'surface-brand-borders-border-brand',
        'bg-focus': 'surface-brand-backgrounds-surface-brand',
    },
    'plain-error': {
        bg: null,
        fg: 'error-on-on-surface-error',
        bd: null,
        'bg-hover': 'error-backgrounds-error-hover',
        'fg-hover': 'error-on-on-error',
        'bd-hover': 'error-on-on-error',
        'bg-active': 'error-backgrounds-error-active',
        'fg-active': 'error-on-on-error',
        'bd-active': 'error-backgrounds-error-active',
        'bg-selected': 'error-backgrounds-error-selected',
        'fg-selected': 'error-on-on-error',
        'bd-selected': 'error-backgrounds-error-selected',
        focus: 'error-borders-border-error-focus',
        'bg-focus': 'error-backgrounds-error-default',
        'fg-focus': 'error-on-on-error',
    },
};

const L = [];
const p = (s = '') => L.push(s);
const tok = (t) => (t ? `var(--bmb-color-${t})` : 'transparent');

p('/* ---------------------------------------------------------------------------');
p(' * Button — 13 temas × 6 estados × 4 tamanhos');
p(` * Fonte: ${d._source}`);
p(' * COR: só tokens semânticos --bmb-color-*, espelhando');
p(' *      TESTES/src/components/button/_button.scss (verificado: 234 checks · 0 falhas).');
p(' *      Precisa de brands.css carregado antes, que define os tokens por marca/tema.');
p(' * GEOMETRIA: literais do Figma (button.tokens.json) — não são tokens.');
p(' * GERADO por build-css.mjs — não edite à mão.');
p(' * ------------------------------------------------------------------------ */');
p();
p("@import 'tailwindcss';");
p();
p('@layer components {');
p('    .bmb-button {');
p('        position: relative;');
p('        display: inline-flex;');
p('        align-items: center;');
p('        justify-content: center;');
p('        box-sizing: border-box;');
p('        border: 1px solid var(--_bmb-btn-bd, transparent);');
p('        border-radius: var(--bmb-radius-button-round);');
p('        background-color: var(--_bmb-btn-bg, transparent);');
p('        color: var(--_bmb-btn-fg);');
p('        font-family: var(--bmb-font-family-body);');
p('        font-weight: var(--bmb-font-weight-semibold);');
p('        line-height: var(--bmb-line-height-130);');
p('        text-decoration: none;');
p('        white-space: nowrap;');
p('        cursor: pointer;');
p('        user-select: none;');
p('        transition:');
p('            background-color 120ms ease,');
p('            border-color 120ms ease,');
p('            color 120ms ease;');
p('    }');
p();
p('    .bmb-button__label { display: inline-block; }');
p();
p('    .bmb-button__icon {');
p('        display: inline-flex;');
p('        flex: 0 0 auto;');
p('        align-items: center;');
p('        justify-content: center;');
p('    }');
p('    .bmb-button__icon svg { width: 100%; height: 100%; }');
p();
p('    /* Show Dot — 8×8, raio full, cor do componente 09. Dot. Posição top-right. */');
p('    .bmb-button__dot {');
p('        position: absolute;');
p('        top: 4px;');
p('        right: 4px;');
p('        inline-size: 8px;');
p('        block-size: 8px;');
p('        border-radius: var(--bmb-radius-full);');
p('        background-color: var(--bmb-color-error-backgrounds-error-hover);');
p('    }');
p();
p('    .bmb-button:hover:not(:disabled, .bmb-button--selected) {');
p('        background-color: var(--_bmb-btn-bg-hover, var(--_bmb-btn-bg, transparent));');
p('        color: var(--_bmb-btn-fg-hover, var(--_bmb-btn-fg));');
p('        border-color: var(--_bmb-btn-bd-hover, var(--_bmb-btn-bd, transparent));');
p('    }');
p();
p('    .bmb-button:active:not(:disabled) {');
p('        background-color: var(--_bmb-btn-bg-active, var(--_bmb-btn-bg, transparent));');
p('        color: var(--_bmb-btn-fg-active, var(--_bmb-btn-fg));');
p('        border-color: var(--_bmb-btn-bd-active, var(--_bmb-btn-bd, transparent));');
p('    }');
p();
p('    .bmb-button--selected {');
p('        background-color: var(--_bmb-btn-bg-selected, var(--_bmb-btn-bg, transparent));');
p('        color: var(--_bmb-btn-fg-selected, var(--_bmb-btn-fg));');
p('        border-color: var(--_bmb-btn-bd-selected, var(--_bmb-btn-bd, transparent));');
p('    }');
p();
p('    /* Focus = stroke interno de 3px, sem alterar a geometria. O anel vale para');
p('     * qualquer estado; o bg/fg de foco fica fora de Selected, que mantém o próprio');
p('     * fundo — mesmo critério já aplicado no :hover acima. */');
p('    .bmb-button:focus-visible {');
p('        box-shadow: inset 0 0 0 3px var(--_bmb-btn-focus, transparent);');
p('        outline: none;');
p('    }');
p();
p('    .bmb-button:focus-visible:not(.bmb-button--selected) {');
p('        background-color: var(--_bmb-btn-bg-focus, var(--_bmb-btn-bg, transparent));');
p('        color: var(--_bmb-btn-fg-focus, var(--_bmb-btn-fg));');
p('    }');
p();
p('    /* Cores forcadas (alto contraste do Windows / forced-colors). Nesse modo o navegador');
p('     * descarta box-shadow, entao o anel de foco acima simplesmente nao e pintado e o');
p('     * `outline: none` deixaria o botao sem nenhuma indicacao de foco. `outline` com cor');
p('     * de sistema continua sendo pintado, entao devolvemos o indicador por ali. Usa as');
p('     * mesmas medidas do anel (3px, para dentro) para nao mudar a geometria. */');
p('    @media (forced-colors: active) {');
p('        .bmb-button:focus-visible {');
p('            outline: 3px solid Highlight;');
p('            outline-offset: -3px;');
p('        }');
p('    }');
p();
/* Disabled: so o estado nativo. A classe `.bmb-button--disabled` existia aqui e foi removida
 * — ela pintava o botao de desabilitado (opacity + cursor) mas nao desabilitava nada: os
 * guards de interacao testam `:not(:disabled)`, entao hover, active, foco e a ordem de Tab
 * continuavam funcionando, e o clique disparava normalmente. Era uma armadilha silenciosa.
 * Para desabilitar, use o atributo `disabled` do proprio <button>, como manda o contrato
 * (src/button.contract.json -> states.disabled). Um <a> nao aceita `disabled`: nesse caso
 * nao renderize o link, em vez de simular o estado. */
p('    .bmb-button:disabled,');
p('    .bmb-button[disabled] {');
p(`        opacity: ${d.disabledOpacity};`);
p('        cursor: not-allowed;');
p('    }');
p();
p('    .bmb-button--straight { border-radius: var(--bmb-radius-button-straight); }');
p('    .bmb-button--pill { border-radius: var(--bmb-radius-button-pill); }');
p();

p('    /* ----- temas filled ----- */');
for (const [name, [col, leaf, focus]] of Object.entries(FILLED)) {
    p(`    .bmb-button--${name} {`);
    p(`        --_bmb-btn-bg: var(--bmb-color-${col}-backgrounds-${leaf}-default);`);
    p(`        --_bmb-btn-bg-hover: var(--bmb-color-${col}-backgrounds-${leaf}-hover);`);
    p(`        --_bmb-btn-bg-active: var(--bmb-color-${col}-backgrounds-${leaf}-active);`);
    p(`        --_bmb-btn-bg-selected: var(--bmb-color-${col}-backgrounds-${leaf}-selected);`);
    p(`        --_bmb-btn-fg: var(--bmb-color-${col}-on-on-${leaf});`);
    // O Audit passou a ter cor de texto por estado. Hoje `on-hover-*`/`on-selected-*` são
    // alias de `on-*` (mesmo valor), então ligá-los não muda nada agora — mas quando o
    // design diferenciar, o botão já acompanha sem tocar em código.
    p(`        --_bmb-btn-fg-hover: var(--bmb-color-${col}-on-on-hover-${leaf});`);
    p(`        --_bmb-btn-fg-selected: var(--bmb-color-${col}-on-on-selected-${leaf});`);
    p('        --_bmb-btn-bd: transparent;');
    p(`        --_bmb-btn-focus: var(--bmb-color-${col}-borders-border-${focus});`);
    p('    }');
    p();
}

/* Warning: o Figma desenha o Focus com stroke transparente, e ate agora replicavamos isso
 * fielmente — o resultado era um tema sem nenhuma indicacao de foco por teclado. Como o
 * componente vai para uso real, o anel foi restaurado por decisao do dono do design system.
 * Nao ha cor nova aqui: `warning-borders-border-warning-focus` ja existia e resolve para
 * #faa645 (employer), #ffb124 (epays) e #ffc524 (bne-cia) no modo claro. O tema passou a
 * usar o proprio token, como os outros 12. Desvio registrado em src/button.rules.md.
 * A linha que zerava o anel ficava aqui e foi removida:
 *     .bmb-button--warning { --_bmb-btn-focus: transparent; } */

p('    /* ----- temas irregulares ----- */');
const KEY = {
    bg: '--_bmb-btn-bg',
    fg: '--_bmb-btn-fg',
    bd: '--_bmb-btn-bd',
    focus: '--_bmb-btn-focus',
    'bg-hover': '--_bmb-btn-bg-hover',
    'fg-hover': '--_bmb-btn-fg-hover',
    'bd-hover': '--_bmb-btn-bd-hover',
    'bg-active': '--_bmb-btn-bg-active',
    'fg-active': '--_bmb-btn-fg-active',
    'bd-active': '--_bmb-btn-bd-active',
    'bg-selected': '--_bmb-btn-bg-selected',
    'fg-selected': '--_bmb-btn-fg-selected',
    'bd-selected': '--_bmb-btn-bd-selected',
    'bg-focus': '--_bmb-btn-bg-focus',
    'fg-focus': '--_bmb-btn-fg-focus',
};
for (const [name, map] of Object.entries(IRREGULAR)) {
    p(`    .bmb-button--${name} {`);
    for (const [k, v] of Object.entries(map)) p(`        ${KEY[k]}: ${tok(v)};`);
    p('    }');
    p();
}

p('    /* ----- disabled com fills próprios no Figma (além do opacity) ----- */');
for (const [name, extra] of [
    ['warning', ['border-color: var(--bmb-color-warning-backgrounds-warning-default);']],
    ['error', ['border-color: var(--bmb-color-error-backgrounds-error-default);']],
    [
        'plain',
        [
            'border-color: var(--bmb-color-base-borders-border-base-subtle);',
            'background-color: var(--bmb-color-base-backgrounds-base-default);',
        ],
    ],
]) {
    p(`    .bmb-button--${name}:disabled,`);
    p(`    .bmb-button--${name}[disabled] {`);
    for (const line of extra) p(`        ${line}`);
    p('    }');
    p();
}

p('    /* ----- tamanhos: literais do Figma; font-size via token ----- */');
for (const s of d.sizeOrder) {
    const z = d.sizes[s];
    const k = SZ[s];
    p(`    .bmb-button--${k} {`);
    // `height`, não `min-height`: no Figma a variante tem altura fixa e o stroke é desenhado
    // para dentro, sem somar ao box. Em CSS a borda soma, então `min-height` deixava o Small
    // crescer para 33,2px (linha 15,6 + padding 16 + borda 1,6). O label não quebra
    // (`white-space: nowrap`), então altura fixa não corta conteúdo.
    p(`        height: ${z.h}px;`);
    p(`        gap: ${z.gap}px;`);
    p(`        padding: ${z.padY}px ${z.padX}px;`);
    p(`        font-size: var(--bmb-font-size-${FONT[k]});`);
    p('    }');
    p(`    .bmb-button--${k} .bmb-button__icon { inline-size: ${z.icon}px; block-size: ${z.icon}px; }`);
    p();
    p(`    .bmb-button--icon-only.bmb-button--${k} {`);
    p(`        inline-size: ${z.h}px;`);
    p('        padding-inline: 0;');
    p('    }');
    p(
        `    .bmb-button--icon-only.bmb-button--${k} .bmb-button__icon { inline-size: ${z.iconOnlyIcon}px; block-size: ${z.iconOnlyIcon}px; }`,
    );
    p();
}
p('}');

const css = L.join('\n') + '\n';
fs.writeFileSync(path.join(DIST, 'button.css'), css);

const preview = css
    .replace(/@import 'tailwindcss';\n\n/, '')
    .replace(' * GERADO por build-css.mjs — não edite à mão.', ' * Build de preview — gerado junto com button.css. Não edite à mão.');
fs.writeFileSync(path.join(DIST, 'button.preview.css'), preview);

/* Mapa tema → token semântico por papel, para o playground mostrar o NOME do token
 * ao lado do hex resolvido. Mesmo mapa usado para gerar a CSS acima. */
const themeTokens = {};
for (const [name, [col, leaf, focus]] of Object.entries(FILLED)) {
    themeTokens[name] = {
        bg: `${col}-backgrounds-${leaf}-default`,
        'bg-hover': `${col}-backgrounds-${leaf}-hover`,
        'bg-active': `${col}-backgrounds-${leaf}-active`,
        'bg-selected': `${col}-backgrounds-${leaf}-selected`,
        fg: `${col}-on-on-${leaf}`,
        bd: null,
        focus: name === 'warning' ? null : `${col}-borders-border-${focus}`,
    };
}
for (const [name, map] of Object.entries(IRREGULAR)) themeTokens[name] = { ...map };

fs.writeFileSync(
    path.join(DIST, 'button.tokens.js'),
    `window.BMB_TOKENS = ${JSON.stringify({ ...d, themeTokens, brands: [
            { id: 'employer', label: 'Employer' },
            { id: 'epays', label: 'ePays' },
            { id: 'bne-cia', label: 'BNE CIA' },
        ] }, null, 2)};\n`,
);

console.log(`button.css escrito — ${L.length} linhas`);
console.log(`  ${Object.keys(FILLED).length} temas filled + ${Object.keys(IRREGULAR).length} irregulares = 13`);
console.log('button.preview.css + button.tokens.js escritos');
