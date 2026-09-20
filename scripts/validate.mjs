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

if (failures.length) {
    console.error(`Validação falhou (${failures.length}):\n- ${failures.join('\n- ')}`);
    process.exit(1);
}
console.log(`Validação OK: ${contract.variants.theme.values.length} temas, ` +
    `${contract.variants.size.values.length} tamanhos, ${refs.size} tokens CSS e links das demos.`);
