#!/usr/bin/env node
/* Gera o CSS do Dot a partir de src/dot.tokens.json + o mapeamento tom -> token que vive
 * AQUI, do mesmo jeito que build-css.mjs faz para o Button e build-hyperlink-css.mjs para o
 * Hyperlink.
 *
 * COR: só tokens semânticos --bmb-color-*, que já existem em dist/brands.css. O Dot não
 * introduz nenhum token novo: os 10 tokens que o Figma usa foram conferidos um a um contra o
 * repositório. Nenhum hex é escrito aqui — nem como fallback. A validação reprova se aparecer.
 *
 * RAIO: --bmb-radius-full, o mesmo `border-radius-full` (1000) que o Figma aplica.
 *
 * GEOMETRIA: literais do Figma (dot.tokens.json) — não são tokens.
 *
 * NÃO INTERATIVO: o Dot não tem hover, foco, disabled nem cursor. A descrição do componente
 * no Figma é explícita ("Dot não é interativo — não tem hover, foco nem disabled"), e a
 * validação reprova se qualquer pseudo-classe de interação aparecer neste CSS.
 *
 * Não edite dist/ à mão.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
fs.mkdirSync(DIST, { recursive: true });
const d = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/dot.tokens.json'), 'utf8'));

const SZ = { Small: 'sm', Medium: 'md', Large: 'lg' };

/* Tom -> par de tokens (fundo, glifo).
 *
 * Lido em get_variable_defs, variante a variante, no set 16645:256367. Cada tom liga
 * exatamente dois tokens de cor: o fundo do círculo e a cor do glifo.
 *
 *   tone=Primary 16645:256370 -> primary-default #1b2439 · on-primary #fafafa
 *   tone=Success 16645:256372 -> success-default #0f6c31 · on-success #fafafa
 *   tone=Warning 16645:256374 -> warning-default #925004 · on-warning #fafafa
 *   tone=Error   16645:256376 -> error-default   #951818 · on-error   #fafafa
 *   tone=Base    16645:256368 -> base-default-alt #171717 · on-base-alt #a3a3a3
 *
 * ATENÇÃO, Base: a variante liga TRÊS tokens, não dois — `on-base-alt` (#a3a3a3) e também
 * `on-surface-base-alt` (#e5e5e5). Os dois são cor de "on"; só um pinta o glifo, e o MCP não
 * diz qual. Ver "Divergência aberta: a cor do glifo do tom Base" em src/dot.rules.md. Aqui
 * está `on-base-alt`, que é o que a especificação recebida declara.
 *
 * `fg` só aparece na tela quando há glifo (showIcon). Ainda assim é emitido sempre: é
 * `currentColor` do conteúdo, e um glifo acrescentado depois herda a cor certa sem precisar
 * de classe nova. */
const TONS = {
    base: { bg: 'base-backgrounds-base-default-alt', fg: 'base-on-on-base-alt' },
    primary: { bg: 'primary-backgrounds-primary-default', fg: 'primary-on-on-primary' },
    success: { bg: 'success-backgrounds-success-default', fg: 'success-on-on-success' },
    warning: { bg: 'warning-backgrounds-warning-default', fg: 'warning-on-on-warning' },
    error: { bg: 'error-backgrounds-error-default', fg: 'error-on-on-error' },
};

const linhas = [];
const p = (s = '') => linhas.push(s);

p('/* ---------------------------------------------------------------------------');
p(' * Dot — 5 tons × 3 tamanhos. Sem estados: o componente não é interativo.');
p(` * Fonte: ${d._source}`);
p(' * COR: só tokens semânticos --bmb-color-*. Precisa de brands.css carregado antes.');
p(' * GEOMETRIA: literais do Figma (dot.tokens.json) — não são tokens.');
p(' * GERADO por build-dot-css.mjs — não edite à mão.');
p(' * ------------------------------------------------------------------------ */');
p();
p('@layer components {');

/* Estrutura. O Dot é um <span>: conteúdo inline que acompanha o texto de status ao lado.
 *
 * `box-sizing: border-box` faz o padding caber DENTRO do diâmetro. É o que reproduz a conta do
 * Figma (1+6+1 = 8, 3+10+3 = 16, 4+16+4 = 24) e, de quebra, mantém o diâmetro correto quando
 * não há glifo — showIcon=false deixa o elemento sem conteúdo, e sem tamanho explícito ele
 * colapsaria para zero. */
p('    .bmb-dot {');
p('        box-sizing: border-box;');
p('        display: inline-flex;');
p('        flex: 0 0 auto;');
p('        align-items: center;');
p('        justify-content: center;');
p('        overflow: hidden;');
p(`        border-radius: var(--bmb-radius-${d.radius});`);
p('        background-color: var(--_bmb-dot-bg);');
p('        color: var(--_bmb-dot-fg);');
p('        inline-size: var(--_bmb-dot-box);');
p('        block-size: var(--_bmb-dot-box);');
p('        padding: var(--_bmb-dot-pad);');
p('    }');
p();

/* Defaults do Figma (tone=Base, Size=Medium) dentro de :where(), que tem especificidade ZERO.
 *
 * O Button e o Hyperlink não têm default — o Figma deles não define um, e os contratos exigem
 * a classe. O Dot define: `tone` tem default Base e `Size` tem default Medium. Então
 * `.bmb-dot` sozinho precisa render alguma coisa, e precisa ser exatamente essa.
 *
 * :where() em vez de um bloco normal porque, com a mesma especificidade, quem venceria seria a
 * última regra do arquivo — e aí o default passaria a depender da ordem em que este script
 * imprime. Com especificidade zero, qualquer classe de tom ou tamanho ganha sempre. */
p('    /* Defaults do Figma: tone=Base, Size=Medium. Especificidade zero de propósito —');
p('     * qualquer .bmb-dot--* vence, independente da ordem deste arquivo. */');
p('    :where(.bmb-dot) {');
p(`        --_bmb-dot-bg: var(--bmb-color-${TONS[d.defaults.tone.toLowerCase()].bg});`);
p(`        --_bmb-dot-fg: var(--bmb-color-${TONS[d.defaults.tone.toLowerCase()].fg});`);
p(`        --_bmb-dot-box: ${d.sizes[d.defaults.size].box}px;`);
p(`        --_bmb-dot-pad: ${d.sizes[d.defaults.size].pad}px;`);
p(`        --_bmb-dot-icon: ${d.sizes[d.defaults.size].icon}px;`);
p('    }');
p();

/* Glifo. No Figma é um instance swap ("Icon"), opcional pelo booleano "Show icon" do
 * .Master Dot aninhado. Aqui é um slot: existe se quem consome escrever o filho. Sem filho, o
 * círculo fica liso — que é o default da especificação (showIcon=false).
 *
 * A cor sai de `currentColor`, ou seja do token on-{tom} do bloco acima. O SVG de quem consome
 * precisa usar `currentColor` em fill ou stroke; nada de cor é cravado aqui. */
p('    /* Slot do glifo (instance swap "Icon" no Figma). A cor vem de currentColor = on-{tom}. */');
p('    .bmb-dot__icon {');
p('        display: inline-flex;');
p('        flex: 0 0 auto;');
p('        align-items: center;');
p('        justify-content: center;');
p('        inline-size: var(--_bmb-dot-icon);');
p('        block-size: var(--_bmb-dot-icon);');
p('    }');
p('    .bmb-dot__icon svg { display: block; inline-size: 100%; block-size: 100%; }');
p();

p('    /* ----- tons ----- */');
for (const nome of d.toneOrder) {
    const k = nome.toLowerCase();
    const t = TONS[k];
    if (!t) throw new Error(`tom sem mapeamento em build-dot-css.mjs: ${nome}`);
    p(`    .bmb-dot--${k} {`);
    p(`        --_bmb-dot-bg: var(--bmb-color-${t.bg});`);
    p(`        --_bmb-dot-fg: var(--bmb-color-${t.fg});`);
    p('    }');
}
p();

p('    /* ----- tamanhos: literais do Figma. box = pad + icon + pad ----- */');
for (const nome of d.sizeOrder) {
    const z = d.sizes[nome];
    if (z.pad * 2 + z.icon !== z.box) {
        throw new Error(`geometria inconsistente em ${nome}: ${z.pad}+${z.icon}+${z.pad} != ${z.box}`);
    }
    p(`    .bmb-dot--${SZ[nome]} {`);
    p(`        --_bmb-dot-box: ${z.box}px;`);
    p(`        --_bmb-dot-pad: ${z.pad}px;`);
    p(`        --_bmb-dot-icon: ${z.icon}px;`);
    p('    }');
}
p();

/* Cores forçadas. Neste modo o sistema substitui background-color, então os cinco tons ficam
 * iguais — o Dot perde a única coisa que os diferencia. Isso NÃO é corrigido aqui de
 * propósito: forçar a cor de volta (forced-color-adjust: none) atropelaria a paleta que a
 * pessoa escolheu justamente por precisar dela. Quem carrega o significado é o texto ao lado,
 * que a regra de uso já torna obrigatório.
 *
 * O que o bloco faz é garantir que o círculo continue VISÍVEL: sem isto o fundo forçado pode
 * coincidir com o da página e o indicador some. `outline` com offset negativo em vez de
 * `border` para não comer o padding e mudar o tamanho do glifo.
 *
 * Acréscimo que não vem do Figma — registrado em src/dot.rules.md. */
p('    /* Alto contraste do Windows: o fundo é substituído pelo sistema e os tons ficam iguais.');
p('     * Este bloco só garante que o círculo continue visível; o significado fica com o texto. */');
p('    @media (forced-colors: active) {');
p('        .bmb-dot {');
p('            outline: 1px solid CanvasText;');
p('            outline-offset: -1px;');
p('        }');
p('    }');

p('}');
p();

const corpo = linhas.join('\n');
fs.writeFileSync(path.join(DIST, 'dot.css'), `@import 'tailwindcss';\n\n${corpo}`, 'utf8');
fs.writeFileSync(path.join(DIST, 'dot.preview.css'), corpo, 'utf8');

const toneTokens = Object.fromEntries(
    d.toneOrder.map((nome) => {
        const k = nome.toLowerCase();
        return [k, { bg: TONS[k].bg, fg: TONS[k].fg }];
    }),
);
/* As marcas saem do audit, não de uma lista fixa aqui: se alguém acrescentar uma marca, o
 * build quebra com nome em vez de deixar a documentação silenciosamente incompleta. */
const ROTULOS = { employer: 'Employer', epays: 'ePays', 'bne-cia': 'BNE CIA' };
const brands = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'audit/core-brands-audit.json'), 'utf8'),
).brands.map((id) => {
    if (!ROTULOS[id]) throw new Error(`marca sem rótulo em build-dot-css.mjs: ${id}`);
    return { id, label: ROTULOS[id] };
});

fs.writeFileSync(
    path.join(DIST, 'dot.tokens.js'),
    `window.BMB_DOT_TOKENS = ${JSON.stringify({ ...d, toneTokens, brands }, null, 2)};\n`,
    'utf8',
);

console.log(`dot.css escrito — ${corpo.split('\n').length} linhas`);
console.log(`  ${d.toneOrder.length} tons · ${d.sizeOrder.length} tamanhos · 0 estados (não é interativo)`);
console.log('dot.preview.css + dot.tokens.js escritos');
