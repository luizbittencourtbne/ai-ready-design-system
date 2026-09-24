#!/usr/bin/env node
/* Gera o CSS do Checkbox a partir de src/checkbox.tokens.json + o mapeamento tom -> token que
 * vive AQUI, do mesmo jeito que build-hyperlink-css.mjs faz para o Hyperlink e
 * build-dot-css.mjs para o Dot.
 *
 * COR: só tokens semânticos --bmb-color-*, que já existem em dist/brands.css. O Checkbox não
 * introduz nenhum token novo: os 11 tokens de cor que o Figma liga no set 1451:1360 foram
 * conferidos um a um contra o repositório, com o mesmo valor resolvido em Employer claro e
 * escuro (os dois modos que o arquivo do Figma expõe). Nenhum hex é escrito aqui — nem como
 * fallback. A validação reprova se aparecer.
 *
 * GEOMETRIA: literais medidos nos nós do .Master Checkbox 1451:1285 (checkbox.tokens.json) —
 * caixa, posição e path do glifo. Não são tokens. O raio da caixa é --bmb-radius-sm, o mesmo
 * `border-radius-sm` que o Figma liga (4px no Desktop, 2px abaixo de 1024px).
 *
 * TIPOGRAFIA: --bmb-font-size-paragraph-*, que encolhem abaixo de 1024px, como no Button e no
 * Hyperlink. Nenhum px de fonte é cravado aqui.
 *
 * ESTADOS: o <input type="checkbox"> nativo carrega tudo — :checked, :indeterminate,
 * :disabled, :focus-visible — e o <label> que o envolve recebe hover, anel e opacidade via
 * :has(). Não existe classe de estado.
 *
 * Não edite dist/ à mão.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
fs.mkdirSync(DIST, { recursive: true });
const d = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/checkbox.tokens.json'), 'utf8'));

/* Tom -> token por papel.
 *
 * Lido em cada uma das 36 variantes do set 1451:1360, camada por camada (caixa, borda, glifo
 * check, glifo indeterminate, texto). A cor NÃO muda por estado: hover só engrossa a borda,
 * focus acrescenta o anel e disabled aplica opacidade. Por isso cada tom tem um mapa só.
 *
 *   neutral  caixa base-default · marcada base-default-alt · glifo on-surface-base-alt
 *            borda on-surface-base · rótulo on-surface-base · anel border-base-focus-alt
 *   brand    caixa on-primary (DS-053) · marcada primary-default · glifo on-primary
 *            borda on-surface-primary · rótulo on-surface-primary · anel border-base-focus-alt
 *   invert   caixa surface-brand · marcada surface-brand · glifo on-surface-neutral-brand
 *            borda on-surface-neutral-brand · rótulo on-surface-neutral-brand
 *            anel on-surface-subtle-brand
 *
 * DS-053: no brand desmarcado, o fundo da caixa é `on-primary` — um token de TEXTO usado como
 * fundo. Implementado como o Figma mostra; registrado em src/checkbox.rules.md.
 *
 * O anel NÃO é border-{tom}-focus: border-base-focus e border-primary-focus reprovam 3:1
 * (DS-046/047). A descrição do set é explícita sobre isso. */
const TONS = {
    neutral: {
        bg: 'base-backgrounds-base-default',
        bgChecked: 'base-backgrounds-base-default-alt',
        glyph: 'base-on-on-surface-base-alt',
        border: 'base-on-on-surface-base',
        label: 'base-on-on-surface-base',
        ring: 'base-borders-border-base-focus-alt',
    },
    brand: {
        bg: 'primary-on-on-primary',
        bgChecked: 'primary-backgrounds-primary-default',
        glyph: 'primary-on-on-primary',
        border: 'primary-on-on-surface-primary',
        label: 'primary-on-on-surface-primary',
        ring: 'base-borders-border-base-focus-alt',
    },
    invert: {
        bg: 'surface-brand-backgrounds-surface-brand',
        bgChecked: 'surface-brand-backgrounds-surface-brand',
        glyph: 'surface-brand-on-on-surface-neutral-brand',
        border: 'surface-brand-on-on-surface-neutral-brand',
        label: 'surface-brand-on-on-surface-neutral-brand',
        ring: 'surface-brand-on-on-surface-subtle-brand',
    },
};
const PAPEIS = ['bg', 'bgChecked', 'glyph', 'border', 'label', 'ring'];
const VAR = { bg: 'bg', bgChecked: 'bg-checked', glyph: 'glyph', border: 'border', label: 'label', ring: 'ring' };

/* Máscara SVG do glifo. O desenho é o path medido no Figma, na posição medida, dentro de um
 * viewBox do tamanho da caixa — assim o ::before cobre a caixa inteira e o traço cai
 * exatamente onde o Figma o põe. A COR não está aqui: a máscara só recorta, e quem pinta é o
 * background-color do ::before, que vem do token do tom. O `black` abaixo é o canal alfa da
 * máscara, não uma cor visível. */
const mascara = (box, x, y, pathData, cap, join) => {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${box} ${box}'>` +
        `<path transform='translate(${x} ${y})' d='${pathData}' fill='none' stroke='black' ` +
        `stroke-width='${d.glyph.stroke}' stroke-linecap='${cap}' stroke-linejoin='${join}'/></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

/* Geometria que não fecha quebra o build com o nome do tamanho, em vez de emitir um glifo
 * fora do lugar. O traço do indeterminate é centrado nos dois eixos no Figma (x*2 + w = caixa,
 * y*2 = caixa), e o check precisa caber dentro da caixa, com meia espessura de folga. */
function conferirGeometria(nome, z) {
    const meio = d.glyph.stroke / 2;
    if (z.dash.x * 2 + z.dash.w !== z.box) {
        throw new Error(`geometria inconsistente em ${nome}: traço do indeterminate ${z.dash.x}+${z.dash.w}+${z.dash.x} != ${z.box}`);
    }
    if (z.dash.y * 2 !== z.box) {
        throw new Error(`geometria inconsistente em ${nome}: traço do indeterminate fora do centro vertical (y=${z.dash.y}, caixa ${z.box})`);
    }
    if (z.check.x - meio < 0 || z.check.y - meio < 0 ||
        z.check.x + z.check.w + meio > z.box || z.check.y + z.check.h + meio > z.box) {
        throw new Error(`geometria inconsistente em ${nome}: o check ${z.check.w}×${z.check.h} em ${z.check.x},${z.check.y} não cabe na caixa ${z.box}`);
    }
}

const linhas = [];
const p = (s = '') => linhas.push(s);

p('/* ---------------------------------------------------------------------------');
p(' * Checkbox — 3 tons × 3 tamanhos; estados do <input type="checkbox"> nativo.');
p(` * Fonte: ${d._source}`);
p(' * COR: só tokens semânticos --bmb-color-*. Precisa de brands.css carregado antes.');
p(' * GEOMETRIA: literais do Figma (checkbox.tokens.json) — não são tokens.');
p(' * GERADO por build-checkbox-css.mjs — não edite à mão.');
p(' * ------------------------------------------------------------------------ */');
p();
p('@layer components {');

/* O <label> é o componente: envolve o input e o rótulo, então a área clicável inclui o texto.
 *
 * O raio do <label> não aparece — o label não tem fundo. Ele existe para o anel de foco: o
 * outline acompanha o border-radius do elemento, e o Figma desenha o anel com
 * `border-radius-md` na borda EXTERNA (retângulo em -4px, traço de 2px por dentro). A borda
 * externa de um outline é raio + offset + espessura, então o raio do label é
 * radius-md - 4px: 8 - 4 = 4 no Desktop, 4 - 4 = 0 abaixo de 1024px. Nenhum token novo. */
p('    .bmb-checkbox {');
p('        display: inline-flex;');
p('        align-items: center;');
p(`        gap: ${d.gap}px;`);
p('        color: var(--_bmb-checkbox-label);');
p('        font-family: var(--bmb-font-family-body);');
p('        font-weight: var(--bmb-font-weight-regular);');
p('        font-size: var(--_bmb-checkbox-font);');
p('        line-height: var(--bmb-line-height-130);');
p(`        border-radius: calc(var(--bmb-radius-${d.focus.ringRadius}) - ${d.focus.offset + d.focus.width}px);`);
p('        cursor: pointer;');
p('    }');
p();

/* Defaults do Figma (tone=neutral no set; size=md nas variantes públicas) em :where(), com
 * especificidade ZERO, pelo mesmo motivo do Dot: qualquer classe de tom ou tamanho ganha
 * sempre, independente da ordem em que este script imprime.
 *
 * O default de size é divergência registrada: a propriedade do .Master Checkbox diz `sm`, mas
 * as 36 variantes públicas instanciam `md` e a especificação recebida diz `md`. Ver
 * "Divergências abertas" em src/checkbox.rules.md. */
const t0 = TONS[d.defaults.tone];
const z0 = d.sizes[d.defaults.size];
p(`    /* Defaults: tone=${d.defaults.tone}, size=${d.defaults.size}. Especificidade zero de propósito —`);
p('     * qualquer .bmb-checkbox--* vence, independente da ordem deste arquivo. */');
p('    :where(.bmb-checkbox) {');
for (const k of PAPEIS) p(`        --_bmb-checkbox-${VAR[k]}: var(--bmb-color-${t0[k]});`);
p(`        --_bmb-checkbox-box: ${z0.box}px;`);
p(`        --_bmb-checkbox-font: var(--bmb-font-size-${z0.font});`);
p(`        --_bmb-checkbox-check: ${mascara(z0.box, z0.check.x, z0.check.y, z0.check.path, 'round', 'round')};`);
p(`        --_bmb-checkbox-dash: ${mascara(z0.box, z0.dash.x, z0.dash.y, `M 0 0 L ${z0.dash.w} 0`, 'round', 'miter')};`);
p('    }');
p();

/* O input nativo, sem a aparência do sistema. A semântica, o teclado e o envio no formulário
 * continuam vindo dele — por isso ele NÃO é trocado por <span>.
 *
 * Borda de 1px por dentro (border-box), como no Figma. */
p('    /* O <input type="checkbox"> nativo, sem a aparência do sistema: a semântica, o teclado e o');
p('     * formulário continuam vindo dele. Borda de 1px por dentro, como no Figma. */');
p('    .bmb-checkbox__input {');
p('        appearance: none;');
p('        -webkit-appearance: none;');
p('        position: relative;');
p('        flex: 0 0 auto;');
p('        box-sizing: border-box;');
p('        margin: 0;');
p('        inline-size: var(--_bmb-checkbox-box);');
p('        block-size: var(--_bmb-checkbox-box);');
p(`        border: ${d.border.rest}px solid var(--_bmb-checkbox-border);`);
p('        border-radius: var(--bmb-radius-sm);');
p('        background-color: var(--_bmb-checkbox-bg);');
p('        cursor: inherit;');
p('    }');
p();
p('    /* Marcado e indeterminado: a caixa troca de fundo. A borda fica — no brand escuro o');
p('     * preenchimento sozinho não passa 3:1 contra a página, e é a borda que delimita o controle. */');
p('    .bmb-checkbox__input:checked,');
p('    .bmb-checkbox__input:indeterminate {');
p('        background-color: var(--_bmb-checkbox-bg-checked);');
p('    }');
p();

/* Glifo. Cobre a caixa inteira (inclusive a borda, daí o -1px) para que as coordenadas do
 * Figma, medidas a partir da borda externa, valham sem conversão. Só aparece marcado ou
 * indeterminado: o estado nunca é comunicado só pela cor. */
p(`    /* Glifo: path e posição medidos no Figma. Cobre a caixa inteira (daí o -${d.border.rest}px da borda),`);
p('     * para que as coordenadas do Figma valham sem conversão. A cor vem do token do tom. */');
p('    .bmb-checkbox__input::before {');
p("        content: '';");
p('        position: absolute;');
p(`        inset: -${d.border.rest}px;`);
p('        background-color: var(--_bmb-checkbox-glyph);');
p('        -webkit-mask: var(--_bmb-checkbox-check) center / 100% 100% no-repeat;');
p('        mask: var(--_bmb-checkbox-check) center / 100% 100% no-repeat;');
p('        visibility: hidden;');
p('    }');
p('    .bmb-checkbox__input:checked::before { visibility: visible; }');
p('    /* indeterminate: só o pai de um grupo parcialmente marcado. Em código é');
p('     * input.indeterminate = true — não existe atributo HTML. */');
p('    .bmb-checkbox__input:indeterminate::before {');
p('        visibility: visible;');
p('        -webkit-mask-image: var(--_bmb-checkbox-dash);');
p('        mask-image: var(--_bmb-checkbox-dash);');
p('    }');
p();

/* Hover. No Figma a borda passa de 1px por dentro para 2px CENTRALIZADA — ou seja, 1px a
 * mais para fora. Uma sombra externa de 1px na cor da borda reproduz exatamente isso sem
 * mudar a caixa nem empurrar o rótulo. Desvio autorizado, registrado nas regras. */
p('    /* Hover: a borda passa a 2px centralizada, como no Figma — 1px de borda + 1px de sombra');
p('     * externa, sem mudar o tamanho da caixa. Nenhuma cor muda. Nunca em disabled. */');
p('    .bmb-checkbox:hover .bmb-checkbox__input:not(:disabled) {');
p(`        box-shadow: 0 0 0 ${d.border.hover - d.border.rest}px var(--_bmb-checkbox-border);`);
p('    }');
p();

/* Foco. O anel envolve controle + rótulo, então é desenhado no <label>, a partir do
 * :focus-visible do input, via :has(). `outline` não ocupa espaço: o componente não muda de
 * tamanho ao receber foco (D6).
 *
 * O anel nativo do input é neutralizado com um outline TRANSPARENTE, não com `outline: none`
 * — a validação proíbe o `none`, e o transparente continua lá para o modo de cores forçadas,
 * onde o sistema o pinta. */
p('    /* Anel de foco: 2px, folga de 2px, em volta de controle + rótulo. `outline` não ocupa');
p('     * espaço, então o componente não muda de tamanho. Nunca use outline: none aqui. */');
p('    .bmb-checkbox:has(.bmb-checkbox__input:focus-visible) {');
p(`        outline: ${d.focus.width}px solid var(--_bmb-checkbox-ring);`);
p(`        outline-offset: ${d.focus.offset}px;`);
p('    }');
p('    /* O anel é do <label>; o do input fica transparente para não duplicar. */');
p('    .bmb-checkbox__input:focus-visible {');
p(`        outline: ${d.focus.width}px solid transparent;`);
p(`        outline-offset: ${d.focus.offset}px;`);
p('    }');
p();

p(`    /* Disabled: atributo nativo no input, opacidade ${d.disabledOpacity} no controle inteiro, sem token`);
p('     * próprio (DS-037). O nativo já tira do Tab; o hover acima exclui :disabled. */');
p('    .bmb-checkbox:has(.bmb-checkbox__input:disabled) {');
p(`        opacity: ${d.disabledOpacity};`);
p('        cursor: not-allowed;');
p('    }');
p();

p('    /* ----- tons ----- */');
for (const k of d.toneOrder) {
    const t = TONS[k];
    if (!t) throw new Error(`tom sem mapeamento em build-checkbox-css.mjs: ${k}`);
    for (const papel of PAPEIS) {
        if (!t[papel]) throw new Error(`tom ${k} sem token para o papel ${papel} em build-checkbox-css.mjs`);
    }
    p(`    .bmb-checkbox--${k} {`);
    for (const papel of PAPEIS) p(`        --_bmb-checkbox-${VAR[papel]}: var(--bmb-color-${t[papel]});`);
    p('    }');
}
p();

p('    /* ----- tamanhos: literais do Figma; fonte via token paragraph-* ----- */');
for (const k of d.sizeOrder) {
    const z = d.sizes[k];
    if (!z) throw new Error(`tamanho sem geometria em checkbox.tokens.json: ${k}`);
    conferirGeometria(k, z);
    p(`    .bmb-checkbox--${k} {`);
    p(`        --_bmb-checkbox-box: ${z.box}px;`);
    p(`        --_bmb-checkbox-font: var(--bmb-font-size-${z.font});`);
    p(`        --_bmb-checkbox-check: ${mascara(z.box, z.check.x, z.check.y, z.check.path, 'round', 'round')};`);
    p(`        --_bmb-checkbox-dash: ${mascara(z.box, z.dash.x, z.dash.y, `M 0 0 L ${z.dash.w} 0`, 'round', 'miter')};`);
    p('    }');
}
p();

/* Cores forçadas. O sistema substitui fundo e borda, e um glifo pintado por background-color
 * sumiria junto com o fundo. O glifo sai do ajuste automático e passa a ser CanvasText; a
 * borda é garantida em CanvasText e o anel em Highlight. */
p('    /* Alto contraste do Windows: mantém caixa, glifo e anel visíveis com cores do sistema. */');
p('    @media (forced-colors: active) {');
p('        .bmb-checkbox__input { border-color: CanvasText; }');
p('        .bmb-checkbox__input::before { forced-color-adjust: none; background-color: CanvasText; }');
p('        .bmb-checkbox:has(.bmb-checkbox__input:focus-visible) {');
p(`            outline: ${d.focus.width}px solid Highlight;`);
p(`            outline-offset: ${d.focus.offset}px;`);
p('        }');
p('    }');

p('}');
p();

const corpo = linhas.join('\n');
fs.writeFileSync(path.join(DIST, 'checkbox.css'), `@import 'tailwindcss';\n\n${corpo}`, 'utf8');
fs.writeFileSync(path.join(DIST, 'checkbox.preview.css'), corpo, 'utf8');

const toneTokens = Object.fromEntries(d.toneOrder.map((k) => [k, { ...TONS[k] }]));
/* As marcas saem do audit, não de uma lista fixa aqui: se alguém acrescentar uma marca, o
 * build quebra com nome em vez de deixar a documentação silenciosamente incompleta. */
const ROTULOS = { employer: 'Employer', epays: 'ePays', 'bne-cia': 'BNE CIA' };
const brands = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'audit/core-brands-audit.json'), 'utf8'),
).brands.map((id) => {
    if (!ROTULOS[id]) throw new Error(`marca sem rótulo em build-checkbox-css.mjs: ${id}`);
    return { id, label: ROTULOS[id] };
});

fs.writeFileSync(
    path.join(DIST, 'checkbox.tokens.js'),
    `window.BMB_CHECKBOX_TOKENS = ${JSON.stringify({ ...d, toneTokens, brands }, null, 2)};\n`,
    'utf8',
);

console.log(`checkbox.css escrito — ${corpo.split('\n').length} linhas`);
console.log(`  ${d.toneOrder.length} tons · ${d.sizeOrder.length} tamanhos · ${d.stateOrder.length} estados · checked ${d.checkedOrder.join('/')}`);
console.log('checkbox.preview.css + checkbox.tokens.js escritos');
