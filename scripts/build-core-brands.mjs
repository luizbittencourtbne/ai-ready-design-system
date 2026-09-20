#!/usr/bin/env node
/**
 * build-core-brands.mjs — monta core-brands.json a partir das tabelas do Figma já extraídas
 * via MCP nesta sessão. NÃO precisa de FIGMA_TOKEN.
 *
 * Entradas:
 *   audit-brands-raw.json  ← 01. CORE-Brands (Audit) 341:88  "Brand Colors"  (primitivos)
 *   audit-semantic.json    ← 01. CORE-Brands (Audit) 341:162 "Mode Swatches" (semânticos)
 *   tipografia inline      ← 02. CORE-Tokens (Audit) 341:354 "08. Font Family"
 *
 * A página Brand Colors foi REGENERADA a partir das variáveis em 2026-09-19. Com isso:
 *   - `11-Destructive` virou `11-Error`; o typo `Trasnparency` sumiu;
 *   - apareceu o leaf `OnColor` (Primary/Secondary/Tertiary/Error), que é ALIAS para outra
 *     variável, não hex — daí a resolução abaixo;
 *   - Itaú saiu: a tabela agora tem 3 marcas;
 *   - as paletas cruas 12-Red…16-Purple foram removidas (60 primitivos), nenhuma delas
 *     referenciada por semântico.
 * Os aliases de compatibilidade que existiam aqui foram APAGADOS — não são mais necessários.
 *
 * Saída: ../TESTES/figma-export/core-brands-audit.json (não sobrescreve o atual)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const AUDIT = path.join(ROOT, 'audit');

const raw = JSON.parse(fs.readFileSync(path.join(AUDIT, 'audit-brands-raw.json'), 'utf8'));
// audit-semantic-raw.json vem com as colunas como o Header as nomeia: "Light" / "Dark".
const semRaw = JSON.parse(fs.readFileSync(path.join(AUDIT, 'audit-semantic-raw.json'), 'utf8'));
const sem = Object.fromEntries(
    Object.entries(semRaw).map(([k, c]) => [k, { light: c.Light ?? null, dark: c.Dark ?? null }]),
);
const OUT = path.join(AUDIT, 'core-brands-audit.json');
const ATUAL = path.join(AUDIT, 'core-brands.json');
const anterior = fs.existsSync(ATUAL) ? JSON.parse(fs.readFileSync(ATUAL, 'utf8')) : null;

const slug = (s) =>
    s
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

/* ---- resolve células que são ALIAS para outra variável ----
 * `OnColor` aponta para outro primitivo (ex.: 02-Neutral/Pure-white). Seguimos a cadeia
 * dentro da MESMA marca, com guarda contra ciclo. */
const isHex = (v) => /^#[0-9a-fA-F]{6}$/.test(v);
function resolveCell(row, brandCol, vistos = new Set()) {
    const v = raw[row]?.[brandCol];
    if (!v) return null;
    if (isHex(v)) return v.toLowerCase();
    if (vistos.has(row)) return null; // ciclo
    vistos.add(row);
    return resolveCell(v, brandCol, vistos);
}

const colunas = [...new Set(Object.values(raw).flatMap((c) => Object.keys(c)))];
const naoResolvidos = [];
const primitives = {};
for (const row of Object.keys(raw)) {
    primitives[row] = {};
    for (const col of colunas) {
        const hex = resolveCell(row, col);
        if (hex) primitives[row][slug(col)] = hex;
        else if (raw[row][col]) naoResolvidos.push(`${row} [${col}] → ${raw[row][col]}`);
    }
}
const brands = [...new Set(Object.values(primitives).flatMap((v) => Object.keys(v)))];

/* ---- estados derivados: direção do feedback de interação -------------------------
 * ESCURECER é o padrão da casa para hover/selected/active, e é o que a página Brand Colors
 * já traz: conferimos as 72 células light e 66 batem exatamente com `Deep` escurecido nos
 * mesmos percentuais (as outras 6 divergem em 1 unidade de canal, arredondamento). Por isso
 * o caminho normal aqui é NÃO tocar na célula: o valor da página já é o desejado.
 *
 * A exceção são as cores quase pretas. Não há para onde escurecer, e o estado fica invisível:
 * Primary/Employer rende 1,05:1 contra a base e Secondary/Employer, 1,01:1 — o usuário não vê
 * diferença nenhuma ao passar o mouse. Nesses casos CLAREAMOS, mantendo os percentuais.
 *
 * O teste usa o menor overlay (hover, 12%), que é o mais exigente: se nem ele alcança 1,10:1
 * contra a base, a cor entra na exceção. A direção é decidida UMA vez por cor e vale para os
 * três estados, para não misturar direções dentro do mesmo tema.
 *
 * Hoje isso separa 5 células (Primary nas 3 marcas + Secondary em Employer e Epays) das 19
 * restantes. O critério é por cor, não por nome de tema: se uma marca trocar de paleta, a
 * classificação acompanha sozinha.
 *
 * DARK fica de fora: conferimos célula a célula e lá escurecer já rende de 1,17:1 a 1,31:1 em
 * todas as combinações, então a página é mantida como está. Os valores dark nunca foram
 * conferidos contra amostras ao vivo — ver README, seção "Origem e pendências". */
const OVERLAY = { 'Deep-Hover': 0.12, 'Deep-Selected': 0.16, 'Deep-Active': 0.2 };
const canais = (hx) => [1, 3, 5].map((i) => parseInt(hx.substr(i, 2), 16));
const toHex = (cs) => '#' + cs.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('');
const clarear = (hx, pc) => toHex(canais(hx).map((c) => c + pc * (255 - c)));
const escurecer = (hx, pc) => toHex(canais(hx).map((c) => c * (1 - pc)));

/* Luminância relativa e razão de contraste (WCAG 2.x). Aqui servem só para decidir a direção
 * do overlay — não são um teste de acessibilidade do par texto/fundo. */
const luminancia = (hx) =>
    canais(hx)
        .map((c) => c / 255)
        .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
        .reduce((acc, c, i) => acc + [0.2126, 0.7152, 0.0722][i] * c, 0);
const contraste = (a, b) => {
    const [alto, baixo] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
    return (alto + 0.05) / (baixo + 0.05);
};
const LIMIAR_VISIVEL = 1.1;
const escuraDemais = (base) =>
    contraste(base, escurecer(base, OVERLAY['Deep-Hover'])) < LIMIAR_VISIVEL;

let derivados = 0;
let mantidos = 0;
const clareadas = new Set();
for (const [caminho, cells] of Object.entries(primitives)) {
    const m = caminho.match(/^(.+)\/Light\/(Deep-(?:Hover|Selected|Active))$/);
    if (!m) continue;
    const base = primitives[`${m[1]}/Light/Deep`];
    if (!base) continue;
    for (const marca of Object.keys(cells)) {
        if (!base[marca]) continue;
        if (!escuraDemais(base[marca])) {
            mantidos++; // escurecer funciona: o valor da página permanece
            continue;
        }
        clareadas.add(`${m[1]} [${marca}]`);
        const novo = clarear(base[marca], OVERLAY[m[2]]);
        if (novo !== cells[marca]) {
            cells[marca] = novo;
            derivados++;
        }
    }
}

/* ---- semânticos ----
 * Um alvo pode ser um PRIMITIVO ou outro SEMÂNTICO: o Audit passou a ter tokens como
 * `on-selected-primary` que apontam para `on-primary`. Resolvemos seguindo a cadeia nos dois
 * mapas, com guarda contra ciclo. O caminho gravado continua o que o Figma escreveu. */
const ref = brands.includes('employer') ? 'employer' : brands[0];
function hexOf(alvo, modo, vistos = new Set()) {
    if (!alvo || vistos.has(alvo)) return null;
    vistos.add(alvo);
    if (primitives[alvo]) return primitives[alvo][ref] ?? null;
    const s = sem[alvo];
    if (!s) return null;
    return hexOf(modo === 'dark' ? s.dark : s.light, modo, vistos);
}
const semantic = {};
const semSemHex = [];
for (const [k, v] of Object.entries(sem)) {
    const e = {
        light: v.light ?? null,
        dark: v.dark ?? null,
        _lightHex: hexOf(v.light, 'light'),
        _darkHex: hexOf(v.dark, 'dark'),
    };
    semantic[k] = e;
    if (!e._lightHex || !e._darkHex) semSemHex.push(`${k} → ${v.light} / ${v.dark}`);
}

/* ---- tipografia (02. CORE-Tokens Audit 341:354) ---- */
const fontFamily = {
    title: { employer: 'Montserrat', epays: 'Montserrat', 'bne-cia': 'Frederik' },
    body: { employer: 'Roboto', epays: 'Nunito', 'bne-cia': 'Montserrat' },
    code: 'Fira Code',
};

const out = {
    _source:
        'Figma 01. CORE-Brands (Audit) tuSR5bCHVct4Zl2Iv7ooVn: Brand Colors 341:88 (primitivos×' +
        brands.length +
        ' marcas, regenerada das variáveis) + Mode Swatches 341:162 (semântico light/dark). ' +
        'Tipografia: 02. CORE-Tokens (Audit) IyBcJX8bKXJBEmMfA7fMNk 341:354. ' +
        'Extraído via MCP; OnColor resolvido seguindo o alias.',
    _generated: new Date().toISOString().slice(0, 10),
    brands,
    fontFamily,
    primitives,
    semantic,
};
fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');

/* ---- relatório ---- */
console.log(`escrito ${path.relative(process.cwd(), OUT)}`);
console.log(`  marcas:     ${brands.join(', ')}`);
console.log(`  primitivos: ${Object.keys(primitives).length}`);
console.log(`  semânticos: ${Object.keys(semantic).length}`);
console.log(`  estados light — escurecidos pela página (mantidos): ${mantidos}`);
console.log(`  estados light — clareados por base escura demais: ${derivados}`);
for (const c of [...clareadas].sort()) console.log(`      clareia: ${c}`);

if (naoResolvidos.length) {
    console.log(`\nAVISO: ${naoResolvidos.length} células não resolvidas:`);
    naoResolvidos.slice(0, 10).forEach((x) => console.log(`  ${x}`));
} else {
    console.log('  todas as células resolveram (aliases inclusive)');
}

if (semSemHex.length) {
    console.log(`\nAVISO: ${semSemHex.length} semânticos sem hex:`);
    semSemHex.slice(0, 10).forEach((x) => console.log(`  ${x}`));
} else {
    console.log('  todos os semânticos resolveram para hex');
}

if (anterior) {
    let ok = 0;
    const dif = [];
    for (const [p, cells] of Object.entries(primitives))
        for (const [b, hex] of Object.entries(cells)) {
            const r = anterior.primitives?.[p]?.[b];
            if (!r) continue;
            hex === r.toLowerCase() ? ok++ : dif.push(`${p}/${b}: ${r} → ${hex}`);
        }
    console.log(`\nvs core-brands.json atual: ${ok} valores iguais, ${dif.length} mudaram`);
    dif.slice(0, 12).forEach((d) => console.log(`  ${d}`));
    if (dif.length > 12) console.log(`  … e mais ${dif.length - 12}`);
}
