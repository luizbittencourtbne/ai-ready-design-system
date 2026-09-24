#!/usr/bin/env node
/* Embute contrato + regras de cada componente em dist/docs-data.js.
 *
 * POR QUÊ: o site de documentação lê `src/<id>.contract.json` e `src/<id>.rules.md` em tempo de
 * execução, para não virar uma cópia que envelhece. Só que `fetch` é bloqueado por CORS quando
 * a página é aberta por `file://` — e abrir o arquivo direto é o caminho natural de quem só
 * quer olhar. Nesse cenário as abas Specs, Guidelines e Acessibilidade ficavam vazias.
 *
 * Um `<script src>` clássico NÃO sofre CORS em file://. Então geramos os mesmos dados como
 * script, e a página usa o que estiver disponível:
 *   - servida por HTTP  -> `fetch` dos arquivos reais, sempre frescos;
 *   - aberta por file:// -> cai neste snapshot, e a página avisa que é do build.
 *
 * O snapshot é GERADO, nunca escrito à mão: `npm run check` reprova se ele divergir da fonte.
 *
 * As fontes vêm de components.json, então um componente novo entra aqui sozinho.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
fs.mkdirSync(DIST, { recursive: true });

const indice = JSON.parse(fs.readFileSync(path.join(ROOT, 'components.json'), 'utf8'));

const dados = {};
for (const c of indice.components ?? []) {
    const faltando = ['contract', 'rules'].filter((k) => !c[k] || !fs.existsSync(path.join(ROOT, c[k])));
    if (faltando.length) {
        throw new Error(`${c.id}: components.json não aponta ${faltando.join(' e ')} para um arquivo existente`);
    }
    dados[c.id] = {
        contrato: JSON.parse(fs.readFileSync(path.join(ROOT, c.contract), 'utf8')),
        regras: fs.readFileSync(path.join(ROOT, c.rules), 'utf8'),
        origem: { contrato: c.contract, regras: c.rules },
    };
}

const saida =
    '/* GERADO por scripts/build-docs-data.mjs — não edite à mão.\n' +
    ' * Snapshot de contrato e regras para o site de documentação funcionar por file://,\n' +
    ' * onde fetch é bloqueado por CORS. Servido por HTTP, a página prefere os arquivos reais.\n' +
    ' */\n' +
    `window.BMB_DOCS = ${JSON.stringify(dados, null, 2)};\n`;

fs.writeFileSync(path.join(DIST, 'docs-data.js'), saida, 'utf8');

console.log(`docs-data.js escrito — ${Object.keys(dados).length} componentes`);
for (const [id, d] of Object.entries(dados)) {
    console.log(`  ${id}: contrato ${JSON.stringify(d.contrato).length} bytes · regras ${d.regras.length} bytes`);
}
