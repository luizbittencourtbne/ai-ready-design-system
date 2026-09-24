#!/usr/bin/env node
// Valida o contrato contra os dados e o CSS produzidos pelo build.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = (p) => path.join(root, p);
const read = (p) => fs.readFileSync(file(p), 'utf8');
const json = (p) => JSON.parse(read(p));
const failures = [];
const check = (ok, message) => { if (!ok) failures.push(message); };
const same = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
const sameSet = (a, b) => same([...a].sort(), [...b].sort());
/* Tira os comentários de um CSS antes de procurar texto dentro dele. Os geradores escrevem
 * coisas como "Nunca use outline: none aqui", e uma checagem ingênua no texto bruto se reprova
 * sozinha. Usado pelo Hyperlink e pelo Dot. */
const semComentarios = (t) => t.split('/*').map((p, i) => (i === 0 ? p : p.split('*/')[1] ?? '')).join('');

const manifest = json('components.json');
check(manifest.schemaVersion === 1, 'Versão desconhecida do índice de componentes.');
check(Array.isArray(manifest.components), 'components.json precisa de uma lista de componentes.');
for (const item of manifest.components ?? []) {
    for (const key of ['id', 'name', 'contract', 'rules', 'tokens', 'css', 'browserCss', 'demo']) {
        check(Boolean(item[key]), `Componente ${item.id ?? '?'}: falta ${key}.`);
    }
    for (const key of ['contract', 'rules', 'tokens', 'css', 'browserCss', 'demo']) {
        if (item[key]) check(fs.existsSync(file(item[key])), `${item.id}: arquivo ausente ${item[key]}.`);
    }
}
const button = (manifest.components ?? []).find((item) => item.id === 'button');
check(Boolean(button), 'Button ausente do índice.');
if (!button || failures.length) {
    console.error(failures.join('\n'));
    process.exit(1);
}

const contract = json(button.contract);
const source = json(button.tokens);
const colors = json('audit/core-brands-audit.json');
const css = read(button.css);
const preview = read(button.browserCss);
const brandsCss = read('dist/brands.css');
const generatedText = read('dist/button.tokens.js');
const prefix = 'window.BMB_TOKENS = ';
check(generatedText.startsWith(prefix), 'Formato de dist/button.tokens.js inesperado.');
const generated = generatedText.startsWith(prefix)
    ? JSON.parse(generatedText.slice(prefix.length).replace(/;\s*$/, '')) : {};

check(contract.component === button.name, 'Nome do contrato difere do índice.');
check(sameSet(contract.variants.theme.values, Object.keys(generated.themeTokens ?? {})),
    'Temas do contrato diferem dos temas gerados pelo build-css.');
check(sameSet(contract.variants.theme.values.map((x) => x.toLowerCase().replace(/-/g, ' ')),
    source.themeOrder.map((x) => x.toLowerCase())),
    'Temas do contrato diferem dos dados do Figma.');
const sizeNames = { Small: 'sm', Medium: 'md', Large: 'lg', XLarge: 'xl' };
check(same(contract.variants.size.values, source.sizeOrder.map((name) => sizeNames[name])),
    'Tamanhos do contrato diferem dos dados do Figma.');
check(same(Object.keys(contract.states), source.stateOrder.map((x) => x.toLowerCase())),
    'Estados do contrato diferem dos dados do Figma.');
check(same(contract.globalTheme.brands, colors.brands) &&
    same(contract.globalTheme.brands, (generated.brands ?? []).map((b) => b.id)),
    'Marcas do contrato diferem do audit ou do JavaScript gerado.');
for (const key of ['themeOrder', 'stateOrder', 'sizeOrder', 'radius', 'sizes', 'disabledOpacity']) {
    check(JSON.stringify(source[key]) === JSON.stringify(generated[key]),
        `dist/button.tokens.js desatualizado em relação a src/button.tokens.json: ${key}.`);
}
for (const theme of contract.variants.theme.values) {
    check(css.includes(`.bmb-button--${theme} {`), `Tema sem CSS: ${theme}.`);
}
for (const size of contract.variants.size.values) {
    check(css.includes(`.bmb-button--${size} {`), `Tamanho sem CSS: ${size}.`);
}
for (const selector of [':hover', ':active', ':focus-visible', ':disabled', '.bmb-button--selected',
    '.bmb-button--icon-only', '.bmb-button--straight', '.bmb-button--pill']) {
    check(css.includes(selector), `Seletor necessário ausente: ${selector}.`);
}
check(css.includes('box-shadow: inset 0 0 0 3px') &&
    preview.includes('box-shadow: inset 0 0 0 3px'), 'Foco não usa anel interno de 3px.');
check(css.includes("@import 'tailwindcss';") && !preview.includes("@import 'tailwindcss';"),
    'CSS de produção/preview com import incorreto.');
const refs = new Set([...css.matchAll(/var\((--bmb-[\w-]+)/g)].map((m) => m[1]));
const defs = new Set([...brandsCss.matchAll(/\s(--bmb-[\w-]+):/g)].map((m) => m[1]));
for (const token of refs) check(defs.has(token), `Token CSS sem definição: ${token}.`);
for (const brand of contract.globalTheme.brands) {
    check(brandsCss.includes(`[data-brand='${brand}']`), `Marca sem CSS: ${brand}.`);
}
for (const mode of contract.globalTheme.modes) {
    check(mode === 'light' || brandsCss.includes(`[data-theme='${mode}']`),
        `Modo sem CSS: ${mode}.`);
}
for (const html of ['demo/index.html', button.demo]) {
    const content = read(html);
    for (const [, ref] of content.matchAll(/(?:href|src)="(\.\.\/dist\/[^\"]+)"/g)) {
        check(fs.existsSync(path.resolve(path.dirname(file(html)), ref)), `${html}: link quebrado ${ref}.`);
    }
}

/* ---- Hyperlink ---------------------------------------------------------------------
 * Checagens próprias do componente. NÃO reaproveitam nada do Button: a semântica é outra
 * (navegação, não ação), a escala de tamanho é outra (XSmall..Large) e os temas são 9, não 13.
 * Só roda se o Hyperlink estiver no índice — o laço genérico lá em cima já garantiu que os
 * seis arquivos dele existem. */
const link = (manifest.components ?? []).find((item) => item.id === 'hyperlink');
let linkRefs = new Set();
let lContract = null;
if (link) {
    lContract = json(link.contract);
    const lSource = json(link.tokens);
    const lCss = read(link.css);
    const lPreview = read(link.browserCss);

    check(lContract.component === link.name, 'Nome do contrato do Hyperlink difere do índice.');

    // Semântica: navegação. O contrato precisa exigir <a> e proibir <button>.
    check(lContract.element?.required === 'a', 'Hyperlink: o contrato precisa exigir o elemento <a>.');
    check(lContract.element?.requiresHref === true, 'Hyperlink: o contrato precisa exigir href.');
    check((lContract.element?.forbidden ?? []).includes('button'),
        'Hyperlink: o contrato precisa proibir <button> explicitamente.');

    check(sameSet(lContract.variants.theme.values, lSource.themeOrder.map((x) => x.toLowerCase())),
        'Temas do contrato do Hyperlink diferem dos dados do Figma.');
    const lSizeNames = { XSmall: 'xs', Small: 'sm', Medium: 'md', Large: 'lg' };
    check(same(lContract.variants.size.values, lSource.sizeOrder.map((n) => lSizeNames[n])),
        'Tamanhos do contrato do Hyperlink diferem dos dados do Figma.');
    check(same(Object.keys(lContract.states), lSource.stateOrder.map((x) => x.toLowerCase())),
        'Estados do contrato do Hyperlink diferem dos dados do Figma.');
    check(same(lContract.globalTheme.brands, colors.brands),
        'Marcas do contrato do Hyperlink diferem do audit.');

    for (const theme of lContract.variants.theme.values) {
        check(lCss.includes(`.bmb-hyperlink--${theme} {`), `Hyperlink: tema sem CSS: ${theme}.`);
    }
    for (const size of lContract.variants.size.values) {
        check(lCss.includes(`.bmb-hyperlink--${size} {`), `Hyperlink: tamanho sem CSS: ${size}.`);
    }
    for (const selector of [':hover', ':active', ':focus-visible', '.bmb-hyperlink--selected',
        '.bmb-hyperlink--icon-only', '.bmb-hyperlink--disabled-appearance']) {
        check(lCss.includes(selector), `Hyperlink: seletor necessário ausente: ${selector}.`);
    }

    // Acessibilidade travada por teste: o Figma não define anel de foco, então o outline
    // nativo do navegador é a ÚNICA indicação distinta de foco. Suprimi-lo quebraria o
    // componente para quem navega por teclado. Esta checagem existe para impedir que alguém
    // "limpe" o CSS no futuro sem perceber.
    /* Comentários fora: o próprio gerador escreve "Nunca use outline: none aqui", e uma
     * checagem ingênua no texto bruto se reprova sozinha. */
    check(!semComentarios(lCss).includes('outline: none') &&
        !semComentarios(lPreview).includes('outline: none'),
        'Hyperlink: o CSS não pode conter outline: none — é a única indicação de foco.');
    check(lCss.includes('forced-colors: active'),
        'Hyperlink: falta o bloco @media (forced-colors: active).');
    /* Sublinhado: Hover, Active, Selected e Focus. O Active entrou no ajuste de 2026-09-18 —
     * antes era idêntico ao Default e quem apertava o link não recebia retorno visual.
     * Só o Default e o Disabled ficam de fora, por decisão registrada. */
    const iSub = lCss.indexOf('text-decoration: underline');
    check(iSub >= 0, 'Hyperlink: falta o sublinhado de hover/active/selected/focus.');
    const grupoSub = iSub < 0 ? '' : lCss.slice(lCss.lastIndexOf('}', iSub), iSub);
    for (const [sel, nome] of [[':hover', 'hover'], [':active', 'active'],
        ['--selected', 'selected'], ['--force-underline', 'force-underline'],
        [':focus-visible', 'focus']]) {
        check(grupoSub.includes(`.bmb-hyperlink${sel}`),
            `Hyperlink: o estado ${nome} precisa sublinhar.`);
    }

    // Anel de foco por tema, vindo do Figma (ajuste de 2026-09-18).
    check(lCss.includes('solid var(--_bmb-link-ring)'),
        'Hyperlink: falta o anel de foco por tema (outline com --_bmb-link-ring).');
    for (const theme of lContract.variants.theme.values) {
        const abre = `.bmb-hyperlink--${theme} {`;
        const ini = lCss.indexOf(abre);
        const bloco = ini < 0 ? '' : lCss.slice(ini, lCss.indexOf('}', ini));
        check(bloco.includes('--_bmb-link-ring:'),
            `Hyperlink: tema sem token de anel de foco: ${theme}.`);
    }

    // Hit Area de 24px (WCAG 2.5.8) — o Figma pôs a camada nas 8 variantes de tamanho.
    check(lCss.includes('.bmb-hyperlink::after'),
        'Hyperlink: falta a Hit Area (::after) que garante o alvo mínimo.');
    check(lCss.includes(`max(100%, ${lSource.hitArea}px)`),
        `Hyperlink: a Hit Area precisa garantir ${lSource.hitArea}px (WCAG 2.5.8).`);

    check(lCss.includes("@import 'tailwindcss';") && !lPreview.includes("@import 'tailwindcss';"),
        'Hyperlink: CSS de produção/preview com import incorreto.');

    linkRefs = new Set([...lCss.matchAll(/var\((--bmb-[\w-]+)/g)].map((m) => m[1]));
    for (const token of linkRefs) check(defs.has(token), `Hyperlink: token CSS sem definição: ${token}.`);

    // A demo precisa praticar a semântica que as regras pregam.
    const lDemo = read(link.demo);
    check(!/<button[^>]*class="[^"]*bmb-hyperlink/.test(lDemo),
        'Hyperlink: a demo não pode aplicar o componente em <button>.');
    check(!/href="#"/.test(lDemo), 'Hyperlink: a demo não pode usar href="#" como destino.');
    for (const [, ref] of lDemo.matchAll(/(?:href|src)="(\.\.\/dist\/[^"]+)"/g)) {
        check(fs.existsSync(path.resolve(path.dirname(file(link.demo)), ref)),
            `${link.demo}: link quebrado ${ref}.`);
    }
    for (const iconOnly of lDemo.matchAll(/<a[^>]*bmb-hyperlink--icon-only[^>]*>/g)) {
        check(/aria-label=/.test(iconOnly[0]),
            'Hyperlink: link Icon Only sem aria-label na demo.');
    }

    /* Disabled: a especificação do Figma (2026-09-18) diz que o href tem de sair — é isso que
     * torna o elemento não focável e não clicável — e que o aria-disabled entra para reforçar
     * o estado no leitor de tela. Um link "desabilitado" que mantém href promete
     * indisponibilidade e continua navegável: pior do que não ter o estado. */
    for (const alvo of lDemo.matchAll(/<a[^>]*bmb-hyperlink--disabled-appearance[^>]*>/g)) {
        check(!/href=/.test(alvo[0]),
            'Hyperlink: link desabilitado na demo NÃO pode ter href — é o href que o mantém focável.');
        check(/aria-disabled="true"/.test(alvo[0]),
            'Hyperlink: link desabilitado na demo precisa de aria-disabled="true".');
    }
    check(lCss.includes('cursor: not-allowed'),
        'Hyperlink: o estado desabilitado precisa de cursor: not-allowed (nunca pointer).');

    /* Force Underline: contraparte da prop booleana do Figma. Se a classe existir no contrato,
     * tem de existir no CSS — e o contrato tem de dizer que a cor vem do token, não cravada. */
    if (lContract.forceUnderline) {
        check(lCss.includes(`.${lContract.forceUnderline.class}`),
            `Hyperlink: o contrato declara ${lContract.forceUnderline.class} e o CSS não tem.`);
        check(lContract.forceUnderline.figmaProperty === 'Force Underline',
            'Hyperlink: forceUnderline precisa citar a propriedade do Figma que o origina.');
    }

    // target="_blank" sem rel é buraco de segurança e de expectativa.
    for (const alvo of lDemo.matchAll(/<a[^>]*target="_blank"[^>]*>/g)) {
        check(/rel="noopener noreferrer"/.test(alvo[0]),
            'Hyperlink: target="_blank" na demo sem rel="noopener noreferrer".');
    }
}

/* ---- Dot ---------------------------------------------------------------------------
 * Checagens próprias. O Dot é o oposto dos outros dois: não é interativo, não tem estados e
 * não carrega informação sozinho. Quase tudo aqui é uma checagem NEGATIVA — existe para
 * impedir que alguém, no futuro, "melhore" o componente acrescentando o que o Figma
 * deliberadamente não deu a ele. */
const dot = (manifest.components ?? []).find((item) => item.id === 'dot');
let dotRefs = new Set();
let dContract = null;
if (dot) {
    dContract = json(dot.contract);
    const dSource = json(dot.tokens);
    const dCss = read(dot.css);
    const dPreview = read(dot.browserCss);
    const dLimpo = semComentarios(dCss);

    check(dContract.component === dot.name, 'Nome do contrato do Dot difere do índice.');

    // Semântica: informação, não ação. Nada de elemento interativo.
    check(dContract.element?.required === 'span', 'Dot: o contrato precisa exigir o elemento <span>.');
    for (const proibido of ['button', 'a']) {
        check((dContract.element?.forbidden ?? []).includes(proibido),
            `Dot: o contrato precisa proibir <${proibido}> explicitamente.`);
    }

    check(sameSet(dContract.variants.tone.values, dSource.toneOrder.map((x) => x.toLowerCase())),
        'Tons do contrato do Dot diferem dos dados do Figma.');
    const dSizeNames = { Small: 'sm', Medium: 'md', Large: 'lg' };
    check(same(dContract.variants.size.values, dSource.sizeOrder.map((n) => dSizeNames[n])),
        'Tamanhos do contrato do Dot diferem dos dados do Figma.');
    check(Object.keys(dContract.states ?? {}).length === 0,
        'Dot: o contrato não pode declarar estados — o componente não é interativo.');
    check(same(dContract.globalTheme.brands, colors.brands),
        'Marcas do contrato do Dot diferem do audit.');

    for (const tone of dContract.variants.tone.values) {
        const abre = `.bmb-dot--${tone} {`;
        const ini = dCss.indexOf(abre);
        check(ini >= 0, `Dot: tom sem CSS: ${tone}.`);
        const bloco = ini < 0 ? '' : dCss.slice(ini, dCss.indexOf('}', ini));
        check(bloco.includes('--_bmb-dot-bg:'), `Dot: tom sem token de fundo: ${tone}.`);
        check(bloco.includes('--_bmb-dot-fg:'), `Dot: tom sem token de glifo: ${tone}.`);
    }

    /* Geometria: o diâmetro do Figma é padding + glifo + padding. Se a conta não fechar, o
     * círculo sai com tamanho errado e ninguém percebe olhando um dot de 8px. */
    for (const nome of dSource.sizeOrder) {
        const z = dSource.sizes[nome];
        const k = dSizeNames[nome];
        check(z.pad * 2 + z.icon === z.box,
            `Dot: geometria de ${nome} não fecha — ${z.pad} + ${z.icon} + ${z.pad} != ${z.box}.`);
        const ini = dCss.indexOf(`.bmb-dot--${k} {`);
        const bloco = ini < 0 ? '' : dCss.slice(ini, dCss.indexOf('}', ini));
        check(bloco.includes(`--_bmb-dot-box: ${z.box}px;`), `Dot: tamanho ${k} sem diâmetro ${z.box}px.`);
        check(bloco.includes(`--_bmb-dot-icon: ${z.icon}px;`), `Dot: tamanho ${k} sem glifo ${z.icon}px.`);
    }

    /* Defaults. O Figma define tone=Base e Size=Medium, então `.bmb-dot` sozinho tem de
     * renderizar — e em :where(), com especificidade zero, para não depender da ordem em que o
     * gerador imprime os blocos. */
    check(dLimpo.includes(':where(.bmb-dot)'),
        'Dot: os defaults precisam estar em :where(.bmb-dot) — especificidade zero.');
    const iDefault = dCss.indexOf(':where(.bmb-dot)');
    const blocoDefault = iDefault < 0 ? '' : dCss.slice(iDefault, dCss.indexOf('}', iDefault));
    const zPadrao = dSource.sizes[dSource.defaults.size];
    check(blocoDefault.includes(`--_bmb-dot-box: ${zPadrao.box}px;`),
        `Dot: o default de tamanho precisa ser ${dSource.defaults.size} (${zPadrao.box}px).`);

    /* NÃO É INTERATIVO. A descrição do componente no Figma é explícita, e o eixo foi renomeado
     * de State para tone justamente por isso. Estas checagens são o que impede o componente de
     * ganhar de volta, por acidente, tudo o que o design tirou dele. */
    const interacao = dLimpo.match(/\.bmb-dot[\w-]*:(hover|active|focus|focus-visible|focus-within|checked|target)/);
    check(!interacao, `Dot: o CSS não pode ter pseudo-classe de interação — achei "${interacao?.[0]}".`);
    check(!dLimpo.includes('cursor:'),
        'Dot: o CSS não pode declarar cursor — o Dot não faz nada quando clicado.');
    check(!dLimpo.includes('transition'),
        'Dot: o CSS não pode declarar transition — não há estado para transicionar.');
    for (const classe of ['--selected', '--disabled']) {
        check(!dLimpo.includes(`.bmb-dot${classe}`), `Dot: o CSS não pode ter .bmb-dot${classe}.`);
    }

    /* Nenhum hex, nem como fallback. on-{tom} NÃO é a mesma cor nas três marcas: em bne-cia
     * on-success resolve para #000000, não #fafafa. Um fallback cravado quebraria justo ali. */
    const hex = dLimpo.match(/#[0-9a-fA-F]{3,8}\b/);
    check(!hex, `Dot: o CSS não pode conter cor cravada — achei "${hex?.[0]}". Use só tokens.`);
    check(dLimpo.includes(`var(--bmb-radius-${dSource.radius})`),
        `Dot: o raio precisa vir do token --bmb-radius-${dSource.radius}.`);

    check(dCss.includes('forced-colors: active'),
        'Dot: falta o bloco @media (forced-colors: active) que mantém o círculo visível.');
    check(dCss.includes("@import 'tailwindcss';") && !dPreview.includes("@import 'tailwindcss';"),
        'Dot: CSS de produção/preview com import incorreto.');

    dotRefs = new Set([...dCss.matchAll(/var\((--bmb-[\w-]+)/g)].map((m) => m[1]));
    for (const token of dotRefs) check(defs.has(token), `Dot: token CSS sem definição: ${token}.`);

    /* A demo precisa praticar a semântica que as regras pregam. */
    const dDemo = read(dot.demo).replace(/<!--[\s\S]*?-->/g, '');
    for (const tag of ['button', 'a']) {
        check(!new RegExp(`<${tag}[^>]*class="[^"]*bmb-dot`, 'i').test(dDemo),
            `Dot: a demo não pode aplicar o componente em <${tag}>.`);
    }
    for (const [, ref] of dDemo.matchAll(/(?:href|src)="(\.\.\/dist\/[^"]+)"/g)) {
        check(fs.existsSync(path.resolve(path.dirname(file(dot.demo)), ref)),
            `${dot.demo}: link quebrado ${ref}.`);
    }

    /* WCAG 1.4.1 — a regra que manda em todas as outras. Cada Dot da demo é decoração ao lado
     * de um texto que nomeia o status, ou carrega o rótulo ele mesmo. Não existe terceira
     * opção: um círculo colorido sem nenhuma das duas coisas não comunica nada a quem não
     * distingue as cores. */
    let dots = 0;
    for (const alvo of dDemo.matchAll(/<span[^>]*class="[^"]*\bbmb-dot\b[^"]*"[^>]*>/g)) {
        dots++;
        const marcacao = alvo[0];
        check(!/tabindex=/.test(marcacao), 'Dot: a demo não pode dar tabindex a um Dot.');
        check(!/onclick=/i.test(marcacao), 'Dot: a demo não pode dar onclick a um Dot.');
        const escondido = /aria-hidden="true"/.test(marcacao);
        const rotulado = /role="img"/.test(marcacao) && /aria-label="[^"]+"/.test(marcacao);
        check(escondido || rotulado,
            `Dot: ${marcacao.slice(0, 70)}… precisa de aria-hidden="true" (há texto ao lado) ` +
            'ou de role="img" + aria-label (não há).');
        if (escondido) {
            const texto = textoDoPai(dDemo, alvo.index);
            check(texto.length > 0,
                `Dot: ${marcacao.slice(0, 70)}… está com aria-hidden mas não há texto ao lado — ` +
                'assim o status não é comunicado a ninguém que não veja a cor.');
        }
    }
    check(dots >= dContract.variants.tone.values.length,
        `Dot: a demo precisa mostrar pelo menos os ${dContract.variants.tone.values.length} tons.`);
}

/* ---- Controles: Checkbox, Radio, Switch --------------------------------------------
 * Os três vêm da mesma página do Figma (✅ 08. Controls) e compartilham a arquitetura: um
 * <label> que envolve um <input> nativo, tom e tamanho como classes irmãs, estado vindo do
 * input. `validarControle` confere o que é igual nos três. O que é de cada um — indeterminate
 * só no Checkbox, grupo só no Radio, ausência de hover só no Switch — fica na seção própria
 * logo abaixo. Não é um componente "Controls": cada um tem contrato, tokens e gerador seus. */
const regrasDe = (css) => [...semComentarios(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .map((m) => ({ sel: m[1].trim(), corpo: m[2] }));
const blocoDe = (css, abre) => {
    const ini = css.indexOf(abre);
    return ini < 0 ? '' : css.slice(ini, css.indexOf('}', ini));
};
const semComentariosHtml = (t) => t.replace(/<!--[\s\S]*?-->/g, '');

/* Todo elemento da demo que carrega a classe base do componente. */
function ocorrencias(html, base) {
    const out = [];
    for (const m of html.matchAll(/<([a-zA-Z][\w-]*)\b[^>]*\bclass="([^"]*)"[^>]*>/g)) {
        if (!m[2].split(/\s+/).includes(base)) continue;
        const tag = m[1].toLowerCase();
        const fim = tag === 'label' ? html.indexOf('</label>', m.index) : m.index + m[0].length;
        out.push({ tag, pos: m.index, abertura: m[0], interno: html.slice(m.index + m[0].length, fim < 0 ? html.length : fim) });
    }
    return out;
}

function validarControle(item, cfg) {
    const N = item.name;
    const c = json(item.contract);
    const s = json(item.tokens);
    const cCss = read(item.css);
    const cPreview = read(item.browserCss);
    const limpo = semComentarios(cCss);
    const base = `bmb-${item.id}`;
    const input = `${base}__input`;
    const priv = `--_bmb-${item.id}`;

    const bruto = read(`dist/${item.id}.tokens.js`);
    const marca = `window.${cfg.global} = `;
    check(bruto.startsWith(marca), `Formato de dist/${item.id}.tokens.js inesperado.`);
    const gerado = bruto.startsWith(marca) ? JSON.parse(bruto.slice(marca.length).replace(/;\s*$/, '')) : {};

    check(c.component === item.name, `Nome do contrato do ${N} difere do índice.`);
    check(c.baseClass === base, `${N}: a classe base do contrato precisa ser ${base}.`);
    check(c.element?.required === 'label', `${N}: o contrato precisa exigir <label> envolvendo o input.`);
    check(c.element?.input === cfg.inputContrato, `${N}: o contrato precisa exigir ${cfg.inputContrato}.`);
    for (const proibido of ['div', 'span']) {
        check((c.element?.forbidden ?? []).includes(proibido),
            `${N}: o contrato precisa proibir <${proibido}> no lugar do input nativo.`);
    }

    // Eixos: contrato × tokens.json × JavaScript gerado × audit.
    check(same(c.variants.tone.values, s.toneOrder), `${N}: tons do contrato diferem de ${item.tokens}.`);
    check(same(c.variants.tone.values, Object.keys(gerado.toneTokens ?? {})),
        `${N}: tons do contrato diferem de dist/${item.id}.tokens.js.`);
    check(same(c.variants.size.values, s.sizeOrder), `${N}: tamanhos do contrato diferem de ${item.tokens}.`);
    check(same(Object.keys(c.states ?? {}), s.stateOrder), `${N}: estados do contrato diferem de ${item.tokens}.`);
    check(c.variants.tone.default === s.defaults.tone && c.variants.size.default === s.defaults.size,
        `${N}: defaults do contrato diferem de ${item.tokens}.`);
    check(same(c.globalTheme.brands, colors.brands) &&
        same(c.globalTheme.brands, (gerado.brands ?? []).map((b) => b.id)),
        `${N}: marcas do contrato diferem do audit ou de dist/${item.id}.tokens.js.`);
    for (const key of ['toneOrder', 'stateOrder', 'sizeOrder', 'defaults', 'disabledOpacity', 'gap', 'focus', 'sizes']) {
        check(JSON.stringify(s[key]) === JSON.stringify(gerado[key]),
            `dist/${item.id}.tokens.js desatualizado em relação a ${item.tokens}: ${key}.`);
    }

    // Cada tom precisa de token para cada papel. Um papel sem token herda o default em silêncio.
    for (const tom of c.variants.tone.values) {
        const bloco = blocoDe(cCss, `.${base}--${tom} {`);
        check(bloco.length > 0, `${N}: tom sem CSS: ${tom}.`);
        for (const papel of cfg.papeis) {
            check(bloco.includes(`${priv}-${papel}:`), `${N}: tom ${tom} sem token de ${papel}.`);
        }
    }
    for (const tam of c.variants.size.values) {
        check(cCss.includes(`.${base}--${tam} {`), `${N}: tamanho sem CSS: ${tam}.`);
    }
    check(limpo.includes(`:where(.${base})`), `${N}: os defaults precisam estar em :where(.${base}) — especificidade zero.`);

    // Nenhum hex, nem como fallback: on-* e base-default mudam por marca e tema.
    const hex = limpo.match(/#[0-9a-fA-F]{3,8}\b/);
    check(!hex, `${N}: o CSS não pode conter cor cravada — achei "${hex?.[0]}". Use só tokens.`);
    const refsC = new Set([...cCss.matchAll(/var\((--bmb-[\w-]+)/g)].map((m) => m[1]));
    for (const token of refsC) check(defs.has(token), `${N}: token CSS sem definição: ${token}.`);

    // Foco: nunca suprimir, nunca mudar a caixa.
    for (const t of [limpo, semComentarios(cPreview)]) {
        check(!/outline:\s*(none|0)\s*[;}]/.test(t), `${N}: o CSS não pode conter outline: none nem outline: 0.`);
    }
    const regras = regrasDe(cCss);
    const focos = regras.filter((r) => r.sel.includes(':focus-visible') && !r.sel.startsWith('@'));
    check(focos.length > 0, `${N}: falta a regra de :focus-visible.`);
    for (const r of focos) {
        check(/outline-offset:\s*2px/.test(r.corpo), `${N}: "${r.sel}" precisa de outline-offset: 2px.`);
        const muda = r.corpo.match(/(^|[\s;])(border(-[\w-]+)?|padding(-[\w-]+)?|box-shadow)\s*:/);
        check(!muda, `${N}: o foco não pode mudar a caixa — "${r.sel}" declara ${muda?.[2]}.`);
    }
    const anel = regras.find((r) => r.sel === `.${base}:has(.${input}:focus-visible)`);
    check(Boolean(anel) && anel.corpo.includes(`outline: 2px solid var(${priv}-ring)`),
        `${N}: o anel de foco precisa ser outline: 2px solid var(${priv}-ring) no <label>, via :has().`);

    // Disabled: opacidade 0,4, a mesma de tokens.json, no controle inteiro.
    check(s.disabledOpacity === 0.4, `${N}: disabledOpacity precisa ser 0.4 (DS-037).`);
    const desab = regras.find((r) => r.sel === `.${base}:has(.${input}:disabled)`);
    check(Boolean(desab) && new RegExp(`opacity:\\s*${s.disabledOpacity}\\s*;`).test(desab.corpo) &&
        s.disabledOpacity === 0.4,
        `${N}: o disabled precisa de opacity: 0.4 no <label> (.${base}:has(.${input}:disabled)).`);

    check(cCss.includes('forced-colors: active'), `${N}: falta o bloco @media (forced-colors: active).`);
    check(cCss.includes("@import 'tailwindcss';") && !cPreview.includes("@import 'tailwindcss';"),
        `${N}: CSS de produção/preview com import incorreto.`);

    // Demo: o markup que as pessoas copiam.
    const demo = semComentariosHtml(read(item.demo));
    for (const [, ref] of demo.matchAll(/(?:href|src)="(\.\.\/dist\/[^"]+)"/g)) {
        check(fs.existsSync(path.resolve(path.dirname(file(item.demo)), ref)), `${item.demo}: link quebrado ${ref}.`);
    }
    const achados = ocorrencias(demo, base);
    check(achados.length > 0, `${N}: a demo não usa o componente.`);
    let desabilitados = 0;
    for (const o of achados) {
        check(o.tag === 'label', `${N}: a demo aplica ${base} em <${o.tag}> — o componente é o <label>.`);
        const inp = o.interno.match(/<input\b[^>]*>/);
        const tipoOk = inp && new RegExp(`type="${cfg.inputType}"`).test(inp[0]) &&
            new RegExp(`class="[^"]*\\b${input}\\b`).test(inp[0]);
        check(Boolean(tipoOk),
            `${N}: ${o.abertura.slice(0, 70)}… precisa de <input type="${cfg.inputType}" class="${input}"> dentro.`);
        if (!inp) continue;
        check(!/aria-pressed/.test(inp[0]), `${N}: a demo não pode usar aria-pressed — é outro papel.`);
        check(!/aria-disabled/.test(inp[0]), `${N}: disabled é o atributo nativo, não aria-disabled.`);
        if (/\sdisabled\b/.test(inp[0])) desabilitados++;
        const texto = o.interno.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        check(texto.length > 0 || /aria-label="[^"]+"/.test(inp[0]),
            `${N}: ${inp[0].slice(0, 70)}… não tem rótulo visível nem aria-label.`);
        if (cfg.porInput) cfg.porInput(inp[0], o);
    }
    check(!new RegExp(`${base}--(disabled|hover|focus|checked|selected)\\b`).test(demo + limpo),
        `${N}: estado não vira classe — use o input nativo.`);
    check(desabilitados > 0, `${N}: a demo precisa mostrar o disabled com o atributo disabled nativo no input.`);

    return { contrato: c, fonte: s, css: cCss, limpo, demo, achados, refs: refsC };
}

/* ---- Checkbox ----------------------------------------------------------------------
 * Opção independente. É o ÚNICO dos três com indeterminate (D4), e o indeterminate só existe
 * para o pai de um grupo parcialmente marcado — por isso a demo precisa mostrar esse uso. */
const cbItem = (manifest.components ?? []).find((item) => item.id === 'checkbox');
let cb = null;
if (cbItem) {
    cb = validarControle(cbItem, {
        global: 'BMB_CHECKBOX_TOKENS',
        inputType: 'checkbox',
        inputContrato: 'input[type="checkbox"]',
        papeis: ['bg', 'bg-checked', 'glyph', 'border', 'label', 'ring'],
        porInput(inp) {
            check(!/role="switch"/.test(inp), 'Checkbox: um checkbox da demo tem role="switch" — isso é o Switch.');
        },
    });
    check(same(cb.contrato.checked?.values ?? [], cb.fonte.checkedOrder ?? []) &&
        (cb.fonte.checkedOrder ?? []).includes('indeterminate'),
        'Checkbox: checked precisa ser false/true/indeterminate no contrato e em checkbox.tokens.json.');
    check(regrasDe(cb.css).some((r) => r.sel.includes(':indeterminate')),
        'Checkbox: falta a regra de :indeterminate.');
    check(regrasDe(cb.css).some((r) => r.sel.includes(':checked')), 'Checkbox: falta a regra de :checked.');
    check(/data-select-all=/.test(cb.demo) && /\.indeterminate\s*=/.test(cb.demo),
        'Checkbox: a demo precisa de um pai indeterminado ("selecionar todos") definido por script.');
    for (const nome of cb.fonte.sizeOrder) {
        const z = cb.fonte.sizes[nome];
        check(z.dash.x * 2 + z.dash.w === z.box && z.dash.y * 2 === z.box,
            `Checkbox: o traço do indeterminate de ${nome} não está centrado na caixa de ${z.box}.`);
        check(blocoDe(cb.css, `.bmb-checkbox--${nome} {`).includes(`--_bmb-checkbox-box: ${z.box}px;`),
            `Checkbox: tamanho ${nome} sem caixa de ${z.box}px.`);
    }
}

/* ---- Radio -------------------------------------------------------------------------
 * Escolha única. Sem indeterminate (D4), e nunca sozinho: o comportamento de grupo — um valor,
 * um ponto de Tab, setas — vem do mesmo `name` dentro de um <fieldset>. A especificação põe
 * tone e size no RadioGroup; aqui, sem RadioGroup, a regra é: iguais em todo o <fieldset>. */
const rdItem = (manifest.components ?? []).find((item) => item.id === 'radio');
let rd = null;
if (rdItem) {
    rd = validarControle(rdItem, {
        global: 'BMB_RADIO_TOKENS',
        inputType: 'radio',
        inputContrato: 'input[type="radio"]',
        papeis: ['border', 'fill', 'dot', 'label', 'ring'],
    });
    const { notSupported, ...semAusencias } = rd.contrato;
    check(!/indeterminate/i.test(JSON.stringify(semAusencias)) && !/indeterminate/i.test(rd.limpo) &&
        !(rd.fonte.checkedOrder ?? []).includes('indeterminate'),
        'Radio: não existe indeterminate no Radio (D4) — o CSS, o contrato e os tokens não podem ter.');
    check(same(rd.contrato.checked?.values ?? [], rd.fonte.checkedOrder ?? []),
        'Radio: checked do contrato difere de radio.tokens.json.');
    check(regrasDe(rd.css).some((r) => r.sel.includes(':checked')), 'Radio: falta a regra de :checked.');
    for (const nome of rd.fonte.sizeOrder) {
        const z = rd.fonte.sizes[nome];
        check(Math.abs(z.dotAt * 2 + z.dot - z.box) < 1e-9,
            `Radio: o ponto de ${nome} não está centrado no círculo de ${z.box}.`);
        check(blocoDe(rd.css, `.bmb-radio--${nome} {`).includes(`--_bmb-radio-dot-size: ${z.dot}px;`),
            `Radio: tamanho ${nome} sem ponto de ${z.dot}px.`);
    }

    // Grupos da demo: todo radio dentro de um <fieldset> com <legend>, 2+ itens, mesmo name,
    // mesmo tom e mesmo tamanho.
    const grupos = [...rd.demo.matchAll(/<fieldset\b[^>]*>([\s\S]*?)<\/fieldset>/g)]
        .map((m) => ({ ini: m.index, fim: m.index + m[0].length, html: m[1] }));
    for (const o of rd.achados) {
        check(grupos.some((g) => o.pos > g.ini && o.pos < g.fim),
            `Radio: ${o.abertura.slice(0, 60)}… está fora de um <fieldset> — Radio nunca fica sozinho.`);
    }
    const eixo = (classes, valores) => classes.split(/\s+/).filter((c) => valores.some((v) => c === `bmb-radio--${v}`)).join(' ');
    for (const g of grupos) {
        const itens = ocorrencias(g.html, 'bmb-radio');
        if (!itens.length) continue;
        const rotulo = (g.html.match(/<legend[^>]*>([\s\S]*?)<\/legend>/) ?? [])[1] ?? '';
        const qual = rotulo.replace(/<[^>]*>/g, '').trim() || '(sem legend)';
        check(/<legend\b/.test(g.html) && qual !== '(sem legend)', 'Radio: grupo sem <legend> — o grupo precisa de nome.');
        check(itens.length >= 2, `Radio: o grupo "${qual}" tem ${itens.length} radio — o mínimo é 2.`);
        const nomes = new Set(itens.map((o) => (o.interno.match(/\bname="([^"]*)"/) ?? [])[1] ?? ''));
        check(nomes.size === 1 && !nomes.has(''), `Radio: o grupo "${qual}" tem name diferente entre os itens (ou sem name).`);
        const classesDe = (o) => (o.abertura.match(/class="([^"]*)"/) ?? [])[1] ?? '';
        const tons = new Set(itens.map((o) => eixo(classesDe(o), rd.fonte.toneOrder)));
        const tams = new Set(itens.map((o) => eixo(classesDe(o), rd.fonte.sizeOrder)));
        check(tons.size === 1, `Radio: o grupo "${qual}" mistura tons — o tom é do grupo inteiro.`);
        check(tams.size === 1, `Radio: o grupo "${qual}" mistura tamanhos — o tamanho é do grupo inteiro.`);
    }
}

/* ---- Switch ------------------------------------------------------------------------
 * Configuração com efeito imediato. É o checkbox nativo com role="switch", e as checagens
 * próprias são quase todas NEGATIVAS, como as do Dot: sem hover (D7), sem indeterminate (D4),
 * sem aria-pressed, e o trilho não muda de tamanho entre desligado e ligado. */
const swItem = (manifest.components ?? []).find((item) => item.id === 'switch');
let sw = null;
if (swItem) {
    sw = validarControle(swItem, {
        global: 'BMB_SWITCH_TOKENS',
        inputType: 'checkbox',
        inputContrato: 'input[type="checkbox"][role="switch"]',
        papeis: ['track', 'track-on', 'thumb', 'label', 'ring'],
        porInput(inp) {
            check(/role="switch"/.test(inp),
                `Switch: ${inp.slice(0, 70)}… precisa de role="switch" — sem ele é um Checkbox.`);
        },
    });
    const regras = regrasDe(sw.css);

    // D7: nenhum hover visual. Uma regra de :hover só pode declarar cursor.
    for (const r of regras.filter((x) => x.sel.includes(':hover'))) {
        const props = [...r.corpo.matchAll(/([\w-]+)\s*:/g)].map((m) => m[1]);
        check(props.every((pr) => pr === 'cursor'),
            `Switch: "${r.sel}" muda ${props.filter((pr) => pr !== 'cursor').join(', ')} no hover — o Switch não tem hover (D7).`);
    }
    check(!(sw.contrato.states ?? {}).hover && !sw.fonte.stateOrder.includes('hover'),
        'Switch: o contrato e os tokens não podem declarar hover (D7).');

    const { notSupported, ...semAusencias } = sw.contrato;
    check(!/indeterminate/i.test(JSON.stringify(semAusencias)) && !/indeterminate/i.test(sw.limpo) &&
        !(sw.fonte.checkedOrder ?? []).includes('indeterminate'),
        'Switch: não existe indeterminate no Switch (D4) — o CSS, o contrato e os tokens não podem ter.');
    check(!/aria-pressed/.test(sw.demo), 'Switch: aria-pressed é botão de alternância, outro papel.');

    // O trilho não muda de tamanho: o estado ligado só troca a cor e move o pino.
    for (const r of regras.filter((x) => /__input(:[\w-]+(\([^)]*\))?)*:checked\s*$/.test(x.sel))) {
        const muda = r.corpo.match(/(^|[\s;])((inline|block|min-inline|min-block)-size|width|height|padding[\w-]*|border[\w-]*|margin[\w-]*)\s*:/);
        check(!muda, `Switch: "${r.sel}" muda ${muda?.[2]} — o trilho não pode mudar de tamanho entre desligado e ligado.`);
    }
    check(regras.some((r) => r.sel.includes(':checked::before') && /transform:\s*translateX/.test(r.corpo)),
        'Switch: o pino ligado precisa andar por transform: translateX, sem mexer no trilho.');
    check(/@media \(prefers-reduced-motion: reduce\)/.test(sw.limpo),
        'Switch: falta @media (prefers-reduced-motion: reduce) para o deslize do pino.');

    for (const nome of sw.fonte.sizeOrder) {
        const z = sw.fonte.sizes[nome];
        check(z.thumb + z.pad * 2 === z.track.h,
            `Switch: geometria de ${nome} não fecha — pino ${z.thumb} + 2 × ${z.pad} != ${z.track.h}.`);
        const curso = z.track.w - z.thumb - z.pad * 2;
        check(z.thumbCheckedX - z.pad === curso,
            `Switch: o pino ligado de ${nome} não bate com o thumb-checked do Figma (x=${z.thumbCheckedX}).`);
        const bloco = blocoDe(sw.css, `.bmb-switch--${nome} {`);
        check(bloco.includes(`--_bmb-switch-w: ${z.track.w}px;`) && bloco.includes(`--_bmb-switch-h: ${z.track.h}px;`) &&
            bloco.includes(`--_bmb-switch-travel: ${curso}px;`),
            `Switch: tamanho ${nome} sem trilho ${z.track.w}×${z.track.h} ou deslize de ${curso}px.`);
    }
    check(sw.contrato.deprecatedLegacy?.rule?.includes('Não gerar código'),
        'Switch: o contrato precisa registrar que o Switch (descontinuado) não gera código.');
}

/* Devolve o texto visível do elemento que CONTÉM a posição `i`. Não é um parser de HTML: é uma
 * varredura de profundidade, suficiente para o HTML bem formado das demos deste repositório.
 * Existe porque a regra mais importante do Dot — nunca ser a única fonte da informação — é
 * justamente sobre o que está AO LADO dele, e não sobre ele. */
function textoDoPai(html, i) {
    const VAZIAS = /^<(br|img|input|meta|link|hr|source|area|use|path)\b/i;
    let profundidade = 0;
    let inicio = -1;
    for (let k = i - 1; k >= 0; k--) {
        if (html[k] !== '<') continue;
        const fimTag = html.indexOf('>', k);
        if (fimTag < 0) continue;
        const tag = html.slice(k, fimTag + 1);
        if (tag.startsWith('</')) { profundidade++; continue; }
        if (tag.endsWith('/>') || VAZIAS.test(tag)) continue;
        if (profundidade > 0) { profundidade--; continue; }
        inicio = k;
        break;
    }
    if (inicio < 0) return '';
    const nome = (html.slice(inicio + 1).match(/^[\w-]+/) ?? [''])[0];
    if (!nome) return '';
    const corpo = html.indexOf('>', inicio) + 1;
    const re = new RegExp(`</?${nome}\\b[^>]*>`, 'gi');
    re.lastIndex = corpo;
    let prof = 1;
    let fim = html.length;
    let m;
    while ((m = re.exec(html))) {
        if (m[0].startsWith('</')) {
            prof--;
            if (prof === 0) { fim = m.index; break; }
        } else if (!m[0].endsWith('/>')) prof++;
    }
    return html.slice(corpo, fim).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/* ---- snapshot da documentação ------------------------------------------------------
 * dist/docs-data.js embute contrato e regras para o site de documentação funcionar por
 * file://, onde fetch é bloqueado. É conteúdo DUPLICADO e gerado, então precisa de guarda:
 * sem isto ele envelhece em silêncio e a página passa a mostrar uma versão que já mudou no
 * disco — exatamente o problema que o site existe para evitar. */
const docsPath = 'dist/docs-data.js';
if (fs.existsSync(file(docsPath))) {
    const bruto = read(docsPath);
    const marca = 'window.BMB_DOCS = ';
    const iMarca = bruto.indexOf(marca);
    check(iMarca >= 0, 'Formato de dist/docs-data.js inesperado.');
    if (iMarca >= 0) {
        let docs = {};
        try {
            docs = JSON.parse(bruto.slice(iMarca + marca.length).replace(/;\s*$/, ''));
        } catch {
            check(false, 'dist/docs-data.js não contém JSON válido.');
        }
        for (const item of manifest.components ?? []) {
            const d = docs[item.id];
            check(Boolean(d), `dist/docs-data.js não tem o componente ${item.id} — rode npm run build.`);
            if (!d) continue;
            check(JSON.stringify(d.contrato) === JSON.stringify(json(item.contract)),
                `dist/docs-data.js desatualizado: contrato de ${item.id} difere de ${item.contract}.`);
            check(d.regras === read(item.rules),
                `dist/docs-data.js desatualizado: regras de ${item.id} diferem de ${item.rules}.`);
        }
        for (const id of Object.keys(docs)) {
            check((manifest.components ?? []).some((c) => c.id === id),
                `dist/docs-data.js tem "${id}", que não está em components.json.`);
        }
    }
} else {
    check(false, 'dist/docs-data.js ausente — rode npm run build.');
}

/* ---- storybook ---------------------------------------------------------------------
 * demo/playground.html documenta TODOS os componentes, não só o Button, que é quem o declara
 * como demo em components.json. Sem esta guarda, acrescentar um componente ao índice e
 * esquecer do storybook passa despercebido — e o site fica dizendo que o pacote tem menos
 * componentes do que tem. */
const storybook = 'demo/playground.html';
if (fs.existsSync(file(storybook))) {
    const sb = read(storybook);
    for (const item of manifest.components ?? []) {
        check(sb.includes(`../${item.browserCss}`),
            `${storybook}: não carrega ${item.browserCss} — o ${item.name} apareceria sem estilo.`);
        for (const chave of ['contract', 'rules']) {
            check(sb.includes(`'../${item[chave]}'`),
                `${storybook}: o registro não aponta ${item[chave]} — ${item.name} está fora do storybook.`);
        }
    }
}

if (failures.length) {
    console.error(`Validação falhou (${failures.length}):\n- ${failures.join('\n- ')}`);
    process.exit(1);
}
const partes = [`Button ${contract.variants.theme.values.length} temas/` +
    `${contract.variants.size.values.length} tamanhos`];
if (lContract) {
    partes.push(`Hyperlink ${lContract.variants.theme.values.length} temas/` +
        `${lContract.variants.size.values.length} tamanhos`);
}
if (dContract) {
    partes.push(`Dot ${dContract.variants.tone.values.length} tons/` +
        `${dContract.variants.size.values.length} tamanhos/0 estados`);
}
const controles = [cb, rd, sw].filter(Boolean);
for (const k of controles) {
    partes.push(`${k.contrato.component} ${k.contrato.variants.tone.values.length} tons/` +
        `${k.contrato.variants.size.values.length} tamanhos/${Object.keys(k.contrato.states).length} estados`);
}
const totalRefs = refs.size + linkRefs.size + dotRefs.size + controles.reduce((n, k) => n + k.refs.size, 0);
console.log(`Validação OK: ${partes.join(', ')}, ${totalRefs} tokens CSS e links das demos.`);
