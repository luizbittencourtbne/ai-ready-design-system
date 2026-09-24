#!/usr/bin/env node
/* Gera o CSS do Radio a partir de src/radio.tokens.json + o mapeamento tom -> token que vive
 * AQUI, do mesmo jeito que build-checkbox-css.mjs faz para o Checkbox.
 *
 * COR: só tokens semânticos --bmb-color-*, que já existem em dist/brands.css. O Radio não
 * introduz nenhum token novo: os 10 tokens de cor que o Figma liga no set 1575:189 foram
 * conferidos um a um contra o repositório, com o mesmo valor resolvido em Employer claro e
 * escuro. Nenhum hex é escrito aqui — nem como fallback. A validação reprova se aparecer.
 *
 * GEOMETRIA: literais medidos nos nós do .Master Radio 1575:175 (radio.tokens.json) — círculo
 * e ponto. Não são tokens. O raio é --bmb-radius-full, o mesmo `border-radius-full` que o
 * Figma liga no círculo.
 *
 * TIPOGRAFIA: --bmb-font-size-paragraph-*, que encolhem abaixo de 1024px.
 *
 * ESTADOS: o <input type="radio"> nativo carrega :checked, :disabled e :focus-visible, e o
 * teclado de grupo (um ponto de Tab, setas movendo a seleção) vem do mesmo `name`. NÃO existe
 * indeterminate no Radio (D4): este arquivo não gera essa pseudo-classe, e a validação reprova
 * se ela aparecer.
 *
 * Não edite dist/ à mão.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
fs.mkdirSync(DIST, { recursive: true });
const d = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/radio.tokens.json'), 'utf8'));

/* Tom -> token por papel.
 *
 * Lido em cada uma das 24 variantes do set 1575:189, camada por camada (círculo, borda,
 * ponto, texto, anel). Desmarcado NÃO tem preenchimento: o círculo mostra a superfície de
 * trás. A cor não muda por estado.
 *
 *   neutral  borda on-surface-base · marcado base-default-alt · ponto on-surface-base-alt
 *            rótulo on-surface-base · anel border-base-focus-alt
 *   brand    borda on-surface-primary · marcado primary-default · ponto on-primary
 *            rótulo on-surface-primary · anel border-base-focus-alt
 *   invert   borda on-surface-subtle-brand · marcado on-surface-subtle-brand
 *            ponto background-brand · rótulo on-surface-neutral-brand
 *            anel on-surface-neutral-brand
 *
 * O anel do invert é on-surface-NEUTRAL-brand, e não o on-surface-subtle-brand do Checkbox:
 * aqui o subtle já é a cor da borda do círculo, e o anel se fundiria com ela. A descrição do
 * set diz isso em palavras. */
const TONS = {
    neutral: {
        border: 'base-on-on-surface-base',
        fill: 'base-backgrounds-base-default-alt',
        dot: 'base-on-on-surface-base-alt',
        label: 'base-on-on-surface-base',
        ring: 'base-borders-border-base-focus-alt',
    },
    brand: {
        border: 'primary-on-on-surface-primary',
        fill: 'primary-backgrounds-primary-default',
        dot: 'primary-on-on-primary',
        label: 'primary-on-on-surface-primary',
        ring: 'base-borders-border-base-focus-alt',
    },
    invert: {
        border: 'surface-brand-on-on-surface-subtle-brand',
        fill: 'surface-brand-on-on-surface-subtle-brand',
        dot: 'surface-brand-backgrounds-background-brand',
        label: 'surface-brand-on-on-surface-neutral-brand',
        ring: 'surface-brand-on-on-surface-neutral-brand',
    },
};
const PAPEIS = ['border', 'fill', 'dot', 'label', 'ring'];

/* Geometria que não fecha quebra o build com o nome do tamanho. No Figma o ponto é centrado
 * no círculo (dotAt × 2 + dot = círculo) e precisa caber dentro da borda. */
function conferirGeometria(nome, z) {
    if (Math.abs(z.dotAt * 2 + z.dot - z.box) > 1e-9) {
        throw new Error(`geometria inconsistente em ${nome}: ponto ${z.dotAt}+${z.dot}+${z.dotAt} != ${z.box}`);
    }
    if (z.dot >= z.box - d.border.rest * 2) {
        throw new Error(`geometria inconsistente em ${nome}: ponto de ${z.dot} não cabe no círculo de ${z.box} com borda de ${d.border.rest}`);
    }
}

const linhas = [];
const p = (s = '') => linhas.push(s);

p('/* ---------------------------------------------------------------------------');
p(' * Radio — 3 tons × 3 tamanhos; estados do <input type="radio"> nativo. Sem indeterminate.');
p(` * Fonte: ${d._source}`);
p(' * COR: só tokens semânticos --bmb-color-*. Precisa de brands.css carregado antes.');
p(' * GEOMETRIA: literais do Figma (radio.tokens.json) — não são tokens.');
p(' * GERADO por build-radio-css.mjs — não edite à mão.');
p(' * ------------------------------------------------------------------------ */');
p();
p('@layer components {');

/* O <label> é o componente, pelo mesmo motivo do Checkbox: área clicável inclui o rótulo, e o
 * anel de foco precisa envolver círculo + rótulo. Raio radius-md - 4px para a borda externa do
 * anel bater com o `border-radius-md` do retângulo de foco do Figma. */
p('    .bmb-radio {');
p('        display: inline-flex;');
p('        align-items: center;');
p(`        gap: ${d.gap}px;`);
p('        color: var(--_bmb-radio-label);');
p('        font-family: var(--bmb-font-family-body);');
p('        font-weight: var(--bmb-font-weight-regular);');
p('        font-size: var(--_bmb-radio-font);');
p('        line-height: var(--bmb-line-height-130);');
p(`        border-radius: calc(var(--bmb-radius-${d.focus.ringRadius}) - ${d.focus.offset + d.focus.width}px);`);
p('        cursor: pointer;');
p('    }');
p();

/* Defaults: tone=neutral no set; size=md nas variantes públicas. O default da propriedade
 * `size` do .Master Radio é `sm` — divergência registrada em src/radio.rules.md. */
const t0 = TONS[d.defaults.tone];
const z0 = d.sizes[d.defaults.size];
p(`    /* Defaults: tone=${d.defaults.tone}, size=${d.defaults.size}. Especificidade zero de propósito —`);
p('     * qualquer .bmb-radio--* vence, independente da ordem deste arquivo. */');
p('    :where(.bmb-radio) {');
for (const k of PAPEIS) p(`        --_bmb-radio-${k}: var(--bmb-color-${t0[k]});`);
p(`        --_bmb-radio-box: ${z0.box}px;`);
p(`        --_bmb-radio-dot-size: ${z0.dot}px;`);
p(`        --_bmb-radio-font: var(--bmb-font-size-${z0.font});`);
p('    }');
p();

p('    /* O <input type="radio"> nativo, sem a aparência do sistema: a semântica, o teclado de');
p('     * grupo e o formulário continuam vindo dele. Borda de 1px por dentro, como no Figma.');
p('     * Desmarcado não tem preenchimento — o círculo mostra a superfície de trás. */');
p('    .bmb-radio__input {');
p('        appearance: none;');
p('        -webkit-appearance: none;');
p('        position: relative;');
p('        flex: 0 0 auto;');
p('        box-sizing: border-box;');
p('        margin: 0;');
p('        inline-size: var(--_bmb-radio-box);');
p('        block-size: var(--_bmb-radio-box);');
p(`        border: ${d.border.rest}px solid var(--_bmb-radio-border);`);
p('        border-radius: var(--bmb-radius-full);');
p('        background-color: transparent;');
p('        cursor: inherit;');
p('    }');
p();
p('    /* Marcado: o círculo ganha preenchimento e a borda FICA — no brand escuro o preenchimento');
p('     * sozinho não passa 3:1 contra a página. */');
p('    .bmb-radio__input:checked { background-color: var(--_bmb-radio-fill); }');
p();
p('    /* Ponto: centrado no círculo, do tamanho medido no Figma. Só aparece marcado — o estado');
p('     * nunca é comunicado só pela cor. */');
p('    .bmb-radio__input::before {');
p("        content: '';");
p('        position: absolute;');
p('        inset: 0;');
p('        margin: auto;');
p('        inline-size: var(--_bmb-radio-dot-size);');
p('        block-size: var(--_bmb-radio-dot-size);');
p('        border-radius: var(--bmb-radius-full);');
p('        background-color: var(--_bmb-radio-dot);');
p('        visibility: hidden;');
p('    }');
p('    .bmb-radio__input:checked::before { visibility: visible; }');
p();

p('    /* Hover: a borda passa a 2px centralizada, como no Figma — 1px de borda + 1px de sombra');
p('     * externa, sem mudar o tamanho do círculo. Nenhuma cor muda. Nunca em disabled. */');
p('    .bmb-radio:hover .bmb-radio__input:not(:disabled) {');
p(`        box-shadow: 0 0 0 ${d.border.hover - d.border.rest}px var(--_bmb-radio-border);`);
p('    }');
p();

p('    /* Anel de foco: 2px, folga de 2px, em volta de círculo + rótulo. `outline` não ocupa');
p('     * espaço, então o componente não muda de tamanho. Nunca use outline: none aqui. */');
p('    .bmb-radio:has(.bmb-radio__input:focus-visible) {');
p(`        outline: ${d.focus.width}px solid var(--_bmb-radio-ring);`);
p(`        outline-offset: ${d.focus.offset}px;`);
p('    }');
p('    /* O anel é do <label>; o do input fica transparente para não duplicar. */');
p('    .bmb-radio__input:focus-visible {');
p(`        outline: ${d.focus.width}px solid transparent;`);
p(`        outline-offset: ${d.focus.offset}px;`);
p('    }');
p();

p(`    /* Disabled: atributo nativo no input, opacidade ${d.disabledOpacity} no controle inteiro, sem token`);
p('     * próprio (DS-037). O nativo já tira do Tab e das setas do grupo. */');
p('    .bmb-radio:has(.bmb-radio__input:disabled) {');
p(`        opacity: ${d.disabledOpacity};`);
p('        cursor: not-allowed;');
p('    }');
p();

p('    /* ----- tons ----- */');
for (const k of d.toneOrder) {
    const t = TONS[k];
    if (!t) throw new Error(`tom sem mapeamento em build-radio-css.mjs: ${k}`);
    for (const papel of PAPEIS) {
        if (!t[papel]) throw new Error(`tom ${k} sem token para o papel ${papel} em build-radio-css.mjs`);
    }
    p(`    .bmb-radio--${k} {`);
    for (const papel of PAPEIS) p(`        --_bmb-radio-${papel}: var(--bmb-color-${t[papel]});`);
    p('    }');
}
p();

p('    /* ----- tamanhos: literais do Figma; fonte via token paragraph-* ----- */');
for (const k of d.sizeOrder) {
    const z = d.sizes[k];
    if (!z) throw new Error(`tamanho sem geometria em radio.tokens.json: ${k}`);
    conferirGeometria(k, z);
    p(`    .bmb-radio--${k} {`);
    p(`        --_bmb-radio-box: ${z.box}px;`);
    p(`        --_bmb-radio-dot-size: ${z.dot}px;`);
    p(`        --_bmb-radio-font: var(--bmb-font-size-${z.font});`);
    p('    }');
}
p();

p('    /* Alto contraste do Windows: mantém círculo, ponto e anel visíveis com cores do sistema. */');
p('    @media (forced-colors: active) {');
p('        .bmb-radio__input { border-color: CanvasText; }');
p('        .bmb-radio__input::before { forced-color-adjust: none; background-color: CanvasText; }');
p('        .bmb-radio:has(.bmb-radio__input:focus-visible) {');
p(`            outline: ${d.focus.width}px solid Highlight;`);
p(`            outline-offset: ${d.focus.offset}px;`);
p('        }');
p('    }');

p('}');
p();

const corpo = linhas.join('\n');
fs.writeFileSync(path.join(DIST, 'radio.css'), `@import 'tailwindcss';\n\n${corpo}`, 'utf8');
fs.writeFileSync(path.join(DIST, 'radio.preview.css'), corpo, 'utf8');

const toneTokens = Object.fromEntries(d.toneOrder.map((k) => [k, { ...TONS[k] }]));
/* As marcas saem do audit, não de uma lista fixa aqui. */
const ROTULOS = { employer: 'Employer', epays: 'ePays', 'bne-cia': 'BNE CIA' };
const brands = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'audit/core-brands-audit.json'), 'utf8'),
).brands.map((id) => {
    if (!ROTULOS[id]) throw new Error(`marca sem rótulo em build-radio-css.mjs: ${id}`);
    return { id, label: ROTULOS[id] };
});

fs.writeFileSync(
    path.join(DIST, 'radio.tokens.js'),
    `window.BMB_RADIO_TOKENS = ${JSON.stringify({ ...d, toneTokens, brands }, null, 2)};\n`,
    'utf8',
);

console.log(`radio.css escrito — ${corpo.split('\n').length} linhas`);
console.log(`  ${d.toneOrder.length} tons · ${d.sizeOrder.length} tamanhos · ${d.stateOrder.length} estados · checked ${d.checkedOrder.join('/')} (sem indeterminate)`);
console.log('radio.preview.css + radio.tokens.js escritos');
