/* Mapeia `git diff` -> components.json -> componentes afetados.
 *
 * Existe porque `components.json` declara 6 caminhos por componente, e o repositório tem 33
 * arquivos. Um PR que mexe só em `scripts/build-css.mjs` muda a cor dos 13 temas do Button, e o
 * índice sozinho não perceberia: esse arquivo não está declarado em lugar nenhum. O AGENTS.md é
 * que diz, em texto, que "o mapeamento de temas continua em scripts/build-css.mjs".
 *
 * Por isso a atribuição tem três camadas, da mais forte para a mais fraca:
 *
 *   1. DECLARADO  — o caminho está em components.json. Sinal inequívoco.
 *   2. NOME       — o caminho contém o id do componente (`dist/button.tokens.js`). Pega os
 *                   arquivos que seguem a convenção de nome mas ninguém declarou.
 *   3. COMPARTILHADO — fontes que alimentam todos os componentes. A lista abaixo NÃO é invenção:
 *                   cada entrada cita onde o repositório documenta aquela dependência.
 *
 * O que não casar em nenhuma camada é REPORTADO como não atribuído, nunca descartado em
 * silêncio — é assim que a lista de compartilhados fica honesta quando o repositório crescer.
 *
 * Este script não altera nada. Só lê o git e escreve o contexto no diretório que você pedir.
 *
 * Uso:
 *   node scripts/detect-changed-components.mjs [opções]
 *     --base <ref>          base da comparação (padrão: origin/main)
 *     --head <ref>          topo da comparação (padrão: HEAD)
 *     --files <a,b,c>       lista explícita de arquivos; ignora o git (para teste)
 *     --files-from <arq>    lê a lista de um arquivo, um caminho por linha
 *     --json                imprime JSON em vez de texto
 *     --context <dir>       escreve o contexto de revisão por componente nesse diretório
 *     --max-bytes <n>       corte por arquivo dentro do contexto (padrão 60000)
 *     --github-output       acrescenta as saídas em $GITHUB_OUTPUT
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');

/* ---- fontes compartilhadas -------------------------------------------------------------
 * Mudança em qualquer uma afeta TODOS os componentes. O campo `porque` vai para o relatório,
 * para o revisor humano entender por que o componente foi puxado para a revisão. */
const COMPARTILHADOS = [
    ['scripts/build-core-brands.mjs', 'resolve os primitivos e deriva os estados de cor (AGENTS.md, "Fontes e fluxo")'],
    ['scripts/build-brands.mjs', 'gera dist/brands.css a partir do audit (AGENTS.md, "Fontes e fluxo")'],
    ['scripts/validate.mjs', 'define o que a validação considera válido; mudar aqui muda o critério de aprovação'],
    ['audit/audit-brands-raw.json', 'tabela bruta de cores primitivas (AGENTS.md, "Fontes e fluxo")'],
    ['audit/audit-semantic-raw.json', 'tabela bruta de cores semânticas (AGENTS.md, "Fontes e fluxo")'],
    ['audit/core-brands-audit.json', 'cores resolvidas que alimentam dist/brands.css (AGENTS.md)'],
    ['dist/brands.css', 'tokens de marca e modo que todo componente consome (README, "Uso")'],
    ['src/structural.css', 'snapshot de raio e tipografia que completa brands.css (README, "Estrutura")'],
    ['components.json', 'o próprio índice: muda quais arquivos pertencem a quem'],
    ['AGENTS.md', 'as regras contra as quais a revisão julga'],
    /* Estes dois entram no contexto enviado ao revisor (ver `instrucoes`, mais abaixo). Mudar
       a lista de verificação muda o parecer de TODO componente, exatamente como o AGENTS.md. */
    ['agents/component-reviewer.md', 'a lista de verificação que a revisão segue'],
    ['.claude/agents/component-reviewer.md', 'a definição do subagente revisor'],
];
const MAPA_COMPARTILHADO = new Map(COMPARTILHADOS);

/* ---- caminhos de um componente só, que o índice não declara -----------------------------
 * `scripts/build-css.mjs` é o gerador do BUTTON — o AGENTS.md diz que "o mapeamento de temas
 * continua" ali, mas isso vale para o Button, não para todo componente. O Hyperlink tem
 * gerador próprio. Tratar os dois como compartilhados faria um PR que mexe só no gerador do
 * Button acusar o Hyperlink, e vice-versa.
 *
 * Ao acrescentar um componente com gerador próprio, registre-o aqui. Sem isso o arquivo cai
 * em "não atribuídos" — visível, não silencioso. */
const POR_COMPONENTE = {
    button: [
        ['scripts/build-css.mjs', 'gerador do Button: mapeamento tema -> token e geometria (AGENTS.md)'],
    ],
    hyperlink: [
        ['scripts/build-hyperlink-css.mjs', 'gerador do Hyperlink: mapeamento tema -> token e geometria'],
    ],
    dot: [
        ['scripts/build-dot-css.mjs', 'gerador do Dot: mapeamento tom -> token e geometria'],
    ],
    checkbox: [
        ['scripts/build-checkbox-css.mjs', 'gerador do Checkbox: mapeamento tom -> token e geometria'],
    ],
    radio: [
        ['scripts/build-radio-css.mjs', 'gerador do Radio: mapeamento tom -> token e geometria'],
    ],
};

/* Demo preferida no contexto, quando a declarada no índice não é a melhor para revisão. */
const DEMO_PREFERIDA = {
    button: ['demo/index.html', 'demo estática do Button: o markup real que as pessoas copiam'],
};

/* Diretórios compartilhados: qualquer arquivo abaixo conta. */
const DIRS_COMPARTILHADOS = [
    ['demo/', 'as demos consomem os componentes e são o exemplo que as pessoas copiam'],
];

function parseArgs(argv) {
    const o = {
        base: 'origin/main',
        head: 'HEAD',
        files: null,
        json: false,
        context: null,
        maxBytes: 60000,
        githubOutput: false,
    };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--base') o.base = argv[++i];
        else if (a === '--head') o.head = argv[++i];
        else if (a === '--files') o.files = argv[++i].split(',').map((s) => s.trim()).filter(Boolean);
        else if (a === '--files-from') {
            o.files = fs.readFileSync(argv[++i], 'utf8').split('\n').map((s) => s.trim()).filter(Boolean);
        } else if (a === '--json') o.json = true;
        else if (a === '--context') o.context = argv[++i];
        else if (a === '--max-bytes') o.maxBytes = Number(argv[++i]);
        else if (a === '--github-output') o.githubOutput = true;
        else {
            console.error(`opção desconhecida: ${a}`);
            process.exit(2);
        }
    }
    return o;
}

/* Lê o diff como pares status+caminho. `base...head` compara a partir do merge-base, que é o
 * que interessa num PR: só o que a branch introduziu, não o que a main andou por baixo. */
function lerDiff(base, head) {
    let saida;
    try {
        saida = execFileSync('git', ['diff', '--name-status', '--find-renames', `${base}...${head}`], {
            cwd: ROOT,
            encoding: 'utf8',
        });
    } catch (e) {
        console.error(`Não consegui rodar o git diff entre "${base}" e "${head}".`);
        console.error('No GitHub Actions isso costuma ser fetch-depth raso: use actions/checkout com fetch-depth: 0.');
        console.error(String(e.stderr || e.message).trim());
        process.exit(1);
    }
    const arquivos = [];
    for (const linha of saida.split('\n')) {
        if (!linha.trim()) continue;
        const partes = linha.split('\t');
        const status = partes[0][0]; // R100 -> R
        // Em rename, o caminho novo é o último campo.
        const caminho = partes[partes.length - 1];
        arquivos.push({ status, caminho });
    }
    return arquivos;
}

function atribuir(arquivos, componentes) {
    const porComponente = new Map(componentes.map((c) => [c.id, { componente: c, motivos: [] }]));
    const naoAtribuidos = [];
    const CHAVES = ['contract', 'rules', 'tokens', 'css', 'browserCss', 'demo'];

    for (const { status, caminho } of arquivos) {
        let casou = false;

        // camada 1: declarado em components.json
        for (const c of componentes) {
            for (const chave of CHAVES) {
                if (c[chave] === caminho) {
                    porComponente.get(c.id).motivos.push({
                        caminho, status, camada: 'declarado',
                        porque: `components.json declara este caminho como "${chave}" de ${c.name}`,
                    });
                    casou = true;
                }
            }
        }
        if (casou) continue;

        // camada 2a: caminho que pertence a um componente específico
        for (const c of componentes) {
            const dono = (POR_COMPONENTE[c.id] ?? []).find(([caminhoDono]) => caminhoDono === caminho);
            if (dono) {
                porComponente.get(c.id).motivos.push({
                    caminho, status, camada: 'do componente', porque: dono[1],
                });
                casou = true;
            }
        }
        if (casou) continue;

        // camada 2b: o caminho carrega o id do componente
        for (const c of componentes) {
            if (new RegExp(`(^|[/._-])${c.id}([/._-]|$)`, 'i').test(caminho)) {
                porComponente.get(c.id).motivos.push({
                    caminho, status, camada: 'nome',
                    porque: `o caminho contém "${c.id}", mas components.json não declara este arquivo`,
                });
                casou = true;
            }
        }
        if (casou) continue;

        // camada 3: fonte compartilhada
        let porque = MAPA_COMPARTILHADO.get(caminho);
        if (!porque) {
            const dir = DIRS_COMPARTILHADOS.find(([d]) => caminho.startsWith(d));
            if (dir) porque = dir[1];
        }
        if (porque) {
            for (const c of componentes) {
                porComponente.get(c.id).motivos.push({ caminho, status, camada: 'compartilhado', porque });
            }
            continue;
        }

        naoAtribuidos.push({ caminho, status });
    }

    const afetados = [...porComponente.values()].filter((v) => v.motivos.length > 0);
    return { afetados, naoAtribuidos };
}

/* Arquivos que o revisor precisa ler para julgar o componente. Os declarados vêm do índice;
 * `scripts/build-css.mjs` entra sempre porque é onde mora o mapeamento de temas. */
function arquivosDeContexto(c) {
    const lista = [];
    const add = (p, papel) => {
        if (p && fs.existsSync(path.join(ROOT, p)) && !lista.some((x) => x.caminho === p)) {
            lista.push({ caminho: p, papel });
        }
    };
    add(c.contract, 'contrato: API pública do componente');
    add(c.rules, 'regras: decisões, desvios autorizados e pendências');
    add(c.tokens, 'dados de origem (geometria)');
    add(c.css, 'CSS gerado');

    /* `browserCss` costuma ser o mesmo arquivo que `css` menos o `@import 'tailwindcss'`
     * (README, "Reconstruir e validar"). Mandar os dois gasta ~16% do contexto sem informação
     * nova. Só incluímos o segundo se ele tiver divergido de verdade — assim, no dia em que
     * alguém fizer os dois andarem separados, a revisão volta a ver os dois. */
    if (c.browserCss && c.css && existe(c.browserCss) && existe(c.css)) {
        if (difereMaterialmente(c.css, c.browserCss)) {
            add(c.browserCss, 'CSS de navegador: DIVERGIU do CSS principal, revise os dois');
        }
    } else {
        add(c.browserCss, 'CSS gerado para navegador');
    }

    /* Demo: por padrão vai a declarada no índice. O Button é exceção: o índice aponta para
     * `demo/playground.html` (28 KB), que monta o markup em JavaScript — os `aria-label` que
     * ele carrega são do painel de controle dele, não do componente. A demo estática do Button
     * tem o markup real que as pessoas copiam (9 `aria-hidden`, 4 `aria-label`, `disabled`,
     * `type="button"`) em 6,8 KB: melhor para revisar acessibilidade E mais barata.
     *
     * A exceção é POR COMPONENTE. Antes disso a troca era fixa em `demo/index.html`, e o
     * Hyperlink recebia a demo do Button no próprio contexto — arquivo irrelevante ocupando
     * espaço e convidando o revisor a comentar o componente errado. */
    const [demoPreferida, papelDemo] = DEMO_PREFERIDA[c.id] ?? [];
    if (demoPreferida && existe(demoPreferida)) {
        add(demoPreferida, papelDemo);
    } else {
        add(c.demo, 'demo');
    }

    for (const [caminho, papel] of POR_COMPONENTE[c.id] ?? []) add(caminho, papel);
    return lista;
}

const existe = (p) => fs.existsSync(path.join(ROOT, p));

/* Duas variantes do mesmo CSS gerado diferem em poucas linhas de cabeçalho e no @import.
 * Acima de 10 linhas de diferença, tratamos como divergência real. */
function difereMaterialmente(a, b, limiteLinhas = 10) {
    const la = fs.readFileSync(path.join(ROOT, a), 'utf8').split('\n');
    const lb = fs.readFileSync(path.join(ROOT, b), 'utf8').split('\n');
    const sa = new Set(la);
    const sb = new Set(lb);
    let dif = 0;
    for (const l of la) if (!sb.has(l)) dif++;
    for (const l of lb) if (!sa.has(l)) dif++;
    return dif > limiteLinhas;
}

function lerCortado(p, maxBytes) {
    const bruto = fs.readFileSync(path.join(ROOT, p), 'utf8');
    if (Buffer.byteLength(bruto, 'utf8') <= maxBytes) return { texto: bruto, cortado: false };
    return {
        texto: bruto.slice(0, maxBytes) + `\n\n[... CORTADO: arquivo maior que ${maxBytes} bytes ...]\n`,
        cortado: true,
    };
}

function escreverContexto(dir, afetados, opts, diffPorComponente) {
    fs.mkdirSync(dir, { recursive: true });
    const instrucoes = ['AGENTS.md', 'agents/component-reviewer.md', '.claude/agents/component-reviewer.md']
        .filter((p) => fs.existsSync(path.join(ROOT, p)));

    const escritos = [];
    for (const { componente: c, motivos } of afetados) {
        const destino = path.join(dir, c.id);
        fs.mkdirSync(destino, { recursive: true });

        const contexto = arquivosDeContexto(c);
        const partes = [];
        partes.push(`# Contexto de revisão — ${c.name} (${c.id})`);
        partes.push(`\nStatus do componente: ${c.status}\n`);

        partes.push('\n## Por que este componente entrou na revisão\n');
        for (const m of motivos) {
            partes.push(`- \`${m.caminho}\` (${m.status}, camada: ${m.camada}) — ${m.porque}`);
        }

        partes.push('\n\n## Instruções da revisão\n');
        partes.push('Estas são as regras do próprio repositório. Elas mandam, não o hábito do modelo.\n');
        for (const p of instrucoes) {
            partes.push(`\n### ${p}\n\n\`\`\`markdown\n${lerCortado(p, opts.maxBytes).texto}\n\`\`\`\n`);
        }

        const diff = diffPorComponente.get(c.id);
        if (diff) {
            partes.push('\n\n## Diff deste PR (só os arquivos atribuídos a este componente)\n');
            partes.push(`\n\`\`\`diff\n${diff}\n\`\`\`\n`);
        }

        partes.push('\n\n## Arquivos do componente\n');
        let cortados = 0;
        for (const f of contexto) {
            const { texto, cortado } = lerCortado(f.caminho, opts.maxBytes);
            if (cortado) cortados++;
            const ext = path.extname(f.caminho).replace('.', '') || 'text';
            partes.push(`\n### \`${f.caminho}\` — ${f.papel}\n\n\`\`\`${ext}\n${texto}\n\`\`\`\n`);
        }

        const conteudo = partes.join('\n');
        const arqContexto = path.join(destino, 'contexto.md');
        fs.writeFileSync(arqContexto, conteudo, 'utf8');
        fs.writeFileSync(
            path.join(destino, 'manifest.json'),
            JSON.stringify({
                id: c.id, name: c.name, status: c.status,
                motivos, instrucoes, arquivos: contexto,
                bytes: Buffer.byteLength(conteudo, 'utf8'),
                arquivosCortados: cortados,
            }, null, 2) + '\n',
            'utf8',
        );
        escritos.push({ id: c.id, arquivo: rel(arqContexto), bytes: Buffer.byteLength(conteudo, 'utf8'), cortados });
    }
    return escritos;
}

// ---------------------------------------------------------------------------------------

const opts = parseArgs(process.argv.slice(2));
const indice = JSON.parse(fs.readFileSync(path.join(ROOT, 'components.json'), 'utf8'));
const componentes = indice.components ?? [];

const arquivos = opts.files
    ? opts.files.map((caminho) => ({ status: 'M', caminho }))
    : lerDiff(opts.base, opts.head);

const { afetados, naoAtribuidos } = atribuir(arquivos, componentes);

// Diff textual por componente, só dos arquivos atribuídos a ele.
const diffPorComponente = new Map();
if (!opts.files) {
    for (const { componente: c, motivos } of afetados) {
        const caminhos = [...new Set(motivos.map((m) => m.caminho))];
        try {
            const d = execFileSync('git', ['diff', `${opts.base}...${opts.head}`, '--', ...caminhos], {
                cwd: ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
            });
            if (d.trim()) diffPorComponente.set(c.id, d.length > opts.maxBytes ? d.slice(0, opts.maxBytes) + '\n[... diff cortado ...]' : d);
        } catch { /* diff opcional: a revisão funciona sem ele */ }
    }
}

let escritos = [];
if (opts.context) escritos = escreverContexto(opts.context, afetados, opts, diffPorComponente);

const resultado = {
    base: opts.base,
    head: opts.head,
    arquivosAlterados: arquivos,
    afetados: afetados.map(({ componente: c, motivos }) => ({
        id: c.id, name: c.name, status: c.status, motivos,
        contexto: arquivosDeContexto(c).map((f) => f.caminho),
    })),
    naoAtribuidos,
    contextosEscritos: escritos,
};

if (opts.json) {
    console.log(JSON.stringify(resultado, null, 2));
} else {
    console.log(`Comparando ${opts.base}...${opts.head}`);
    console.log(`Arquivos alterados: ${arquivos.length}`);
    if (afetados.length === 0) {
        console.log('\nNenhum componente afetado.');
    } else {
        console.log(`\nComponentes afetados: ${afetados.length}`);
        for (const { componente: c, motivos } of afetados) {
            console.log(`\n  ${c.name} (${c.id}) — ${c.status}`);
            for (const m of motivos) console.log(`    [${m.camada}] ${m.caminho} — ${m.porque}`);
        }
    }
    if (naoAtribuidos.length) {
        console.log(`\nAlterados mas NAO atribuidos a nenhum componente (${naoAtribuidos.length}):`);
        for (const f of naoAtribuidos) console.log(`    ${f.caminho}`);
        console.log('  Se algum destes deveria disparar revisão, declare em components.json ou');
        console.log('  acrescente em COMPARTILHADOS neste script, com a fonte que justifica.');
    }
    for (const e of escritos) {
        console.log(`\nContexto escrito: ${e.arquivo} (${e.bytes} bytes${e.cortados ? `, ${e.cortados} arquivo(s) cortado(s)` : ''})`);
    }
}

if (opts.githubOutput && process.env.GITHUB_OUTPUT) {
    const ids = afetados.map(({ componente: c }) => c.id);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, [
        `has-changes=${ids.length > 0}`,
        `count=${ids.length}`,
        `components=${JSON.stringify(ids)}`,
    ].join('\n') + '\n');
}
