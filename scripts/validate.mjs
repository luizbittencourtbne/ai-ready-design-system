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
console.log(`Validação OK: ${partes.join(', ')}, ` +
    `${refs.size + linkRefs.size + dotRefs.size} tokens CSS e links das demos.`);
