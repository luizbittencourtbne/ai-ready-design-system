#!/usr/bin/env node
/* Gera o CSS do Switch a partir de src/switch.tokens.json + o mapeamento tom -> token que vive
 * AQUI, do mesmo jeito que build-checkbox-css.mjs e build-radio-css.mjs fazem para os outros
 * dois controles.
 *
 * COR: só tokens semânticos --bmb-color-*, que já existem em dist/brands.css. O Switch não
 * introduz nenhum token novo: os 8 tokens de cor que o Figma liga no set 16715:1144 foram
 * conferidos um a um contra o repositório, com o mesmo valor resolvido em Employer claro e
 * escuro. Nenhum hex é escrito aqui — nem como fallback.
 *
 * GEOMETRIA: literais medidos nos nós do .Master Switch 1468:1255 (switch.tokens.json) —
 * trilho, pino, folga e a posição do pino ligado (camada thumb-checked). Não são tokens. O
 * raio do trilho e do pino é --bmb-radius-full, o `border-radius-full` que o Figma liga.
 *
 * SEM HOVER (D7): o Switch não tem borda para o delta de hover dos irmãos, e o set não tem a
 * variante. Este arquivo não gera NENHUMA regra de :hover; o único efeito ao passar o mouse é
 * o cursor, que já vem do <label>. A validação reprova qualquer :hover que não seja só cursor.
 *
 * SEM INDETERMINATE (D4).
 *
 * O Switch (descontinuado) 1697:1842 não é fonte de nada aqui. Ver src/switch.rules.md.
 *
 * Não edite dist/ à mão.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
fs.mkdirSync(DIST, { recursive: true });
const d = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/switch.tokens.json'), 'utf8'));

/* Duração do deslize do pino. NÃO vem do Figma — o componente não define animação, porque
 * lá ligado e desligado são camadas diferentes (thumb e thumb-checked). É a mesma duração das
 * transições do Hyperlink, e é zerada em prefers-reduced-motion. */
const DURACAO = '120ms';

/* Tom -> token por papel.
 *
 * Lido em cada uma das 18 variantes do set 16715:1144 (trilho, pino desligado, pino ligado,
 * texto, anel). O pino tem a mesma cor ligado e desligado; o trilho é que muda.
 *
 *   neutral  trilho off border-base-subtle-alt · on on-surface-base · pino base-default
 *            rótulo on-surface-base · anel border-base-focus-alt
 *   brand    trilho off border-base-subtle-alt · on on-surface-primary · pino base-default
 *            rótulo on-surface-primary · anel border-base-focus-alt
 *   invert   trilho off on-surface-subtle-brand · on on-surface-neutral-brand
 *            pino surface-brand · rótulo on-surface-neutral-brand · anel on-surface-neutral-brand
 *
 * POR QUE ESSES TOKENS: o Switch não tem borda, então o próprio trilho precisa passar 3:1
 * contra a página. Os tokens do legado reprovavam (on-base-alt 2,18; border-brand 1,67).
 * Não troque o trilho por um token de fundo "mais suave" sem medir. */
const TONS = {
    neutral: {
        track: 'base-borders-border-base-subtle-alt',
        'track-on': 'base-on-on-surface-base',
        thumb: 'base-backgrounds-base-default',
        label: 'base-on-on-surface-base',
        ring: 'base-borders-border-base-focus-alt',
    },
    brand: {
        track: 'base-borders-border-base-subtle-alt',
        'track-on': 'primary-on-on-surface-primary',
        thumb: 'base-backgrounds-base-default',
        label: 'primary-on-on-surface-primary',
        ring: 'base-borders-border-base-focus-alt',
    },
    invert: {
        track: 'surface-brand-on-on-surface-subtle-brand',
        'track-on': 'surface-brand-on-on-surface-neutral-brand',
        thumb: 'surface-brand-backgrounds-surface-brand',
        label: 'surface-brand-on-on-surface-neutral-brand',
        ring: 'surface-brand-on-on-surface-neutral-brand',
    },
};
const PAPEIS = ['track', 'track-on', 'thumb', 'label', 'ring'];

/* Geometria que não fecha quebra o build com o nome do tamanho. O pino fica a `pad` das
 * bordas do trilho: pino + 2 × pad = altura, e o pino ligado do Figma (thumb-checked) está em
 * largura - pino - pad. O deslize em CSS é a diferença entre as duas posições. */
function conferirGeometria(nome, z) {
    if (z.thumb + z.pad * 2 !== z.track.h) {
        throw new Error(`geometria inconsistente em ${nome}: pino ${z.thumb} + 2 × ${z.pad} != altura do trilho ${z.track.h}`);
    }
    if (z.track.w - z.thumb - z.pad !== z.thumbCheckedX) {
        throw new Error(`geometria inconsistente em ${nome}: pino ligado do Figma em x=${z.thumbCheckedX}, mas ${z.track.w} - ${z.thumb} - ${z.pad} = ${z.track.w - z.thumb - z.pad}`);
    }
    return z.thumbCheckedX - z.pad;
}

const linhas = [];
const p = (s = '') => linhas.push(s);

p('/* ---------------------------------------------------------------------------');
p(' * Switch — 3 tons × 3 tamanhos; estados do <input type="checkbox" role="switch">.');
p(' * Sem hover e sem indeterminate.');
p(` * Fonte: ${d._source}`);
p(' * COR: só tokens semânticos --bmb-color-*. Precisa de brands.css carregado antes.');
p(' * GEOMETRIA: literais do Figma (switch.tokens.json) — não são tokens.');
p(' * GERADO por build-switch-css.mjs — não edite à mão.');
p(' * ------------------------------------------------------------------------ */');
p();
p('@layer components {');

/* O <label> é o componente: área clicável inclui o rótulo, e o anel envolve trilho + rótulo.
 * O cursor de ponteiro é o ÚNICO efeito de passar o mouse (D7) — e ele mora aqui, não num
 * :hover. */
p('    /* O cursor é o único efeito de passar o mouse: o Switch não tem hover (D7). */');
p('    .bmb-switch {');
p('        display: inline-flex;');
p('        align-items: center;');
p(`        gap: ${d.gap}px;`);
p('        color: var(--_bmb-switch-label);');
p('        font-family: var(--bmb-font-family-body);');
p('        font-weight: var(--bmb-font-weight-regular);');
p('        font-size: var(--_bmb-switch-font);');
p('        line-height: var(--bmb-line-height-130);');
p(`        border-radius: calc(var(--bmb-radius-${d.focus.ringRadius}) - ${d.focus.offset + d.focus.width}px);`);
p('        cursor: pointer;');
p('    }');
p();

const t0 = TONS[d.defaults.tone];
const z0 = d.sizes[d.defaults.size];
const curso0 = conferirGeometria(d.defaults.size, z0);
p(`    /* Defaults: tone=${d.defaults.tone}, size=${d.defaults.size}. Especificidade zero de propósito —`);
p('     * qualquer .bmb-switch--* vence, independente da ordem deste arquivo. */');
p('    :where(.bmb-switch) {');
for (const k of PAPEIS) p(`        --_bmb-switch-${k}: var(--bmb-color-${t0[k]});`);
p(`        --_bmb-switch-w: ${z0.track.w}px;`);
p(`        --_bmb-switch-h: ${z0.track.h}px;`);
p(`        --_bmb-switch-thumb-size: ${z0.thumb}px;`);
p(`        --_bmb-switch-pad: ${z0.pad}px;`);
p(`        --_bmb-switch-travel: ${curso0}px;`);
p(`        --_bmb-switch-font: var(--bmb-font-size-${z0.font});`);
p('    }');
p();

p('    /* O trilho é o próprio <input type="checkbox" role="switch">, sem a aparência do sistema.');
p('     * Sem borda: o trilho em si precisa passar 3:1 contra a página. O tamanho é o mesmo');
p('     * ligado e desligado — só o pino se move. */');
p('    .bmb-switch__input {');
p('        appearance: none;');
p('        -webkit-appearance: none;');
p('        position: relative;');
p('        flex: 0 0 auto;');
p('        box-sizing: border-box;');
p('        margin: 0;');
p('        border: 0;');
p('        inline-size: var(--_bmb-switch-w);');
p('        block-size: var(--_bmb-switch-h);');
p('        border-radius: var(--bmb-radius-full);');
p('        background-color: var(--_bmb-switch-track);');
p('        cursor: inherit;');
p('    }');
p('    .bmb-switch__input:checked { background-color: var(--_bmb-switch-track-on); }');
p();

p('    /* Pino: a `pad` das bordas do trilho — à esquerda desligado, à direita ligado. A posição');
p('     * muda por transform, que não mexe no layout nem no tamanho do trilho. O estado nunca é');
p('     * comunicado só pela cor: a posição do pino também muda. */');
p('    .bmb-switch__input::before {');
p("        content: '';");
p('        position: absolute;');
p('        inset-block-start: var(--_bmb-switch-pad);');
p('        inset-inline-start: var(--_bmb-switch-pad);');
p('        inline-size: var(--_bmb-switch-thumb-size);');
p('        block-size: var(--_bmb-switch-thumb-size);');
p('        border-radius: var(--bmb-radius-full);');
p('        background-color: var(--_bmb-switch-thumb);');
p(`        transition: transform ${DURACAO} ease;`);
p('    }');
p('    .bmb-switch__input:checked::before { transform: translateX(var(--_bmb-switch-travel)); }');
p('    /* Em RTL o pino ligado fica à esquerda. */');
p('    .bmb-switch__input:dir(rtl):checked::before { transform: translateX(calc(-1 * var(--_bmb-switch-travel))); }');
p();
p('    /* Movimento reduzido: o pino troca de lado sem deslizar. */');
p('    @media (prefers-reduced-motion: reduce) {');
p('        .bmb-switch__input::before { transition: none; }');
p('    }');
p();

p('    /* Anel de foco: 2px, folga de 2px, em volta de trilho + rótulo. `outline` não ocupa');
p('     * espaço, então o componente não muda de tamanho. Nunca use outline: none aqui. */');
p('    .bmb-switch:has(.bmb-switch__input:focus-visible) {');
p(`        outline: ${d.focus.width}px solid var(--_bmb-switch-ring);`);
p(`        outline-offset: ${d.focus.offset}px;`);
p('    }');
p('    /* O anel é do <label>; o do input fica transparente para não duplicar. */');
p('    .bmb-switch__input:focus-visible {');
p(`        outline: ${d.focus.width}px solid transparent;`);
p(`        outline-offset: ${d.focus.offset}px;`);
p('    }');
p();

p(`    /* Disabled: atributo nativo no input, opacidade ${d.disabledOpacity} no controle inteiro, mantendo o`);
p('     * tom e a posição do pino, sem token próprio (DS-037). */');
p('    .bmb-switch:has(.bmb-switch__input:disabled) {');
p(`        opacity: ${d.disabledOpacity};`);
p('        cursor: not-allowed;');
p('    }');
p();

p('    /* ----- tons ----- */');
for (const k of d.toneOrder) {
    const t = TONS[k];
    if (!t) throw new Error(`tom sem mapeamento em build-switch-css.mjs: ${k}`);
    for (const papel of PAPEIS) {
        if (!t[papel]) throw new Error(`tom ${k} sem token para o papel ${papel} em build-switch-css.mjs`);
    }
    p(`    .bmb-switch--${k} {`);
    for (const papel of PAPEIS) p(`        --_bmb-switch-${papel}: var(--bmb-color-${t[papel]});`);
    p('    }');
}
p();

p('    /* ----- tamanhos: literais do Figma; fonte via token paragraph-* ----- */');
for (const k of d.sizeOrder) {
    const z = d.sizes[k];
    if (!z) throw new Error(`tamanho sem geometria em switch.tokens.json: ${k}`);
    const curso = conferirGeometria(k, z);
    p(`    .bmb-switch--${k} {`);
    p(`        --_bmb-switch-w: ${z.track.w}px;`);
    p(`        --_bmb-switch-h: ${z.track.h}px;`);
    p(`        --_bmb-switch-thumb-size: ${z.thumb}px;`);
    p(`        --_bmb-switch-pad: ${z.pad}px;`);
    p(`        --_bmb-switch-travel: ${curso}px;`);
    p(`        --_bmb-switch-font: var(--bmb-font-size-${z.font});`);
    p('    }');
}
p();

/* Cores forçadas. O sistema substitui o fundo, e um trilho sem borda sumiria. Um outline de
 * 1px para dentro desenha o contorno sem mudar o tamanho; o pino sai do ajuste automático e
 * fica em CanvasText, e é a posição dele que diz se está ligado. */
p('    /* Alto contraste do Windows: contorno do trilho, pino em CanvasText e anel em Highlight. */');
p('    @media (forced-colors: active) {');
p('        .bmb-switch__input { outline: 1px solid CanvasText; outline-offset: -1px; }');
p('        .bmb-switch__input::before { forced-color-adjust: none; background-color: CanvasText; }');
p('        .bmb-switch:has(.bmb-switch__input:focus-visible) {');
p(`            outline: ${d.focus.width}px solid Highlight;`);
p(`            outline-offset: ${d.focus.offset}px;`);
p('        }');
p('    }');

p('}');
p();

const corpo = linhas.join('\n');
fs.writeFileSync(path.join(DIST, 'switch.css'), `@import 'tailwindcss';\n\n${corpo}`, 'utf8');
fs.writeFileSync(path.join(DIST, 'switch.preview.css'), corpo, 'utf8');

const toneTokens = Object.fromEntries(d.toneOrder.map((k) => [k, { ...TONS[k] }]));
/* As marcas saem do audit, não de uma lista fixa aqui. */
const ROTULOS = { employer: 'Employer', epays: 'ePays', 'bne-cia': 'BNE CIA' };
const brands = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'audit/core-brands-audit.json'), 'utf8'),
).brands.map((id) => {
    if (!ROTULOS[id]) throw new Error(`marca sem rótulo em build-switch-css.mjs: ${id}`);
    return { id, label: ROTULOS[id] };
});

fs.writeFileSync(
    path.join(DIST, 'switch.tokens.js'),
    `window.BMB_SWITCH_TOKENS = ${JSON.stringify({ ...d, toneTokens, brands }, null, 2)};\n`,
    'utf8',
);

console.log(`switch.css escrito — ${corpo.split('\n').length} linhas`);
console.log(`  ${d.toneOrder.length} tons · ${d.sizeOrder.length} tamanhos · ${d.stateOrder.length} estados (sem hover) · checked ${d.checkedOrder.join('/')}`);
console.log('switch.preview.css + switch.tokens.js escritos');
