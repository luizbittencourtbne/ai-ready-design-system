#!/usr/bin/env node
/**
 * build-brands.mjs — gera brands.css para o playground, a partir do
 * audit/core-brands-audit.json (3 marcas, dados do CORE-Brands Audit).
 *
 * Por que não usa o build-brands.mjs do repo: aquele tem `BRANDS = [employer, itau, epays]`
 * hardcoded e escreve direto em `src/brands/`, o que sobrescreveria os SCSS bons e quebraria
 * o botão (os temas Invert/Plain Invert apontam para tokens que o Audit renomeou). Aqui a
 * saída é só do playground.
 *
 * Tokens estruturais (raio, tipografia) vêm do snapshot src/structural.css.
 * Uso: node build-brands.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
fs.mkdirSync(DIST, { recursive: true });
const d = JSON.parse(fs.readFileSync(path.join(ROOT, 'audit/core-brands-audit.json'), 'utf8'));

const slug = (s) =>
    s
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
const primVar = (p) => `--bmb-c-${slug(p)}`;
const semVar = (n) => `--bmb-color-${slug(n.replace(/\b\d+-/g, '').replace(/color /gi, ''))}`;

/* Semânticos podem apontar para outros semânticos; resolver até o primitivo. */
function primitiveFor(name, mode, seen = new Set()) {
    if (d.primitives[name]) return name;
    if (seen.has(name)) throw new Error(`Ciclo de token semântico: ${name}`);
    seen.add(name);
    const target = d.semantic[name]?.[mode];
    if (!target) throw new Error(`Token sem destino: ${name} (${mode})`);
    return primitiveFor(target, mode, seen);
}

const L = [];
L.push('/* ---------------------------------------------------------------------------');
L.push(' * brands.css — GERADO por build-brands.mjs. Não edite à mão.');
L.push(` * Cor: ${d._source}`);
L.push(' * Raio/tipografia: snapshot src/structural.css (do pacote original).');
L.push(` * Marcas: ${d.brands.join(', ')} · Temas: light, dark`);
L.push(' * Troca: atributos data-brand / data-theme no <html>.');
L.push(' * ------------------------------------------------------------------------ */');
L.push('');
L.push(fs.readFileSync(path.join(ROOT, 'src/structural.css'), 'utf8').trim());
L.push('');

const DEFAULT = d.brands.includes('employer') ? 'employer' : d.brands[0];

for (const b of d.brands) {
    const sel = b === DEFAULT ? `:root,\n[data-brand='${b}']` : `[data-brand='${b}']`;
    L.push(`/* ===== marca: ${b} ===== */`);
    L.push(`${sel} {`);
    L.push(`    /* primitivos (${Object.keys(d.primitives).length}) */`);
    for (const [p, cells] of Object.entries(d.primitives)) {
        if (cells[b]) L.push(`    ${primVar(p)}: ${cells[b]};`);
    }
    L.push('');
    L.push(`    /* semânticos — light (${Object.keys(d.semantic).length}) */`);
    for (const [n, v] of Object.entries(d.semantic)) {
        if (v.light) L.push(`    ${semVar(n)}: var(${primVar(primitiveFor(v.light, 'light'))});`);
    }
    L.push('');
    L.push('    /* tipografia */');
    for (const papel of ['title', 'body']) {
        const f = d.fontFamily?.[papel];
        const fonte = typeof f === 'string' ? f : f?.[b];
        if (fonte) L.push(`    --bmb-font-family-${papel}: "${fonte}", sans-serif;`);
    }
    if (typeof d.fontFamily?.code === 'string') {
        L.push(`    --bmb-font-family-code: "${d.fontFamily.code}", monospace;`);
    }
    L.push('}');
    L.push('');

    const selDark =
        b === DEFAULT
            ? `:root[data-theme='dark'],\n[data-brand='${b}'][data-theme='dark']`
            : `[data-brand='${b}'][data-theme='dark']`;
    L.push(`${selDark} {`);
    for (const [n, v] of Object.entries(d.semantic)) {
        if (v.dark) L.push(`    ${semVar(n)}: var(${primVar(primitiveFor(v.dark, 'dark'))});`);
    }
    L.push('}');
    L.push('');
}

const css = L.join('\n');
fs.writeFileSync(path.join(DIST, 'brands.css'), css);

console.log(`brands.css escrito — ${css.split('\n').length} linhas`);
console.log(`  marcas: ${d.brands.join(', ')} (default = ${DEFAULT})`);
console.log(`  primitivos: ${Object.keys(d.primitives).length} · semânticos: ${Object.keys(d.semantic).length}`);
const nProps = (css.match(/--bmb-[\w-]+:/g) || []).length;
console.log(`  custom properties: ${nProps}`);
