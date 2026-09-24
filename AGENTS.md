# AGENTS.md

## Sobre este repositório

Este repositório contém componentes do BambooDS estruturados para consumo por humanos, código e agentes de IA.

Antes de trabalhar em qualquer componente:
1. leia este arquivo;
2. leia `components.json`;
3. localize o componente pelo `id`;
4. leia os arquivos declarados no índice;
5. preserve as decisões existentes;
6. não invente estados, tokens ou APIs.

---

## Regras globais do Design System

- Reutilize tokens existentes antes de criar novos.
- Não use valores hardcoded quando existir token equivalente.
- Contracts descrevem a API suportada.
- Rules documentam decisões, restrições e exceções.
- Tokens estruturam decisões visuais.
- `dist/` contém artefatos gerados e não deve ser tratado como fonte primária.
- Não altere componentes não relacionados sem necessidade.
- Diferencie:
  - erro comprovado;
  - risco;
  - decisão ainda não definida.

---

## Descoberta de componentes

A fonte de descoberta é:

`components.json`

Nunca assuma caminhos de arquivo a partir do nome do componente.

Para trabalhar com um componente:

1. localize seu `id` em `components.json`;
2. leia os caminhos declarados;
3. carregue contract;
4. carregue rules;
5. carregue tokens;
6. carregue implementation/demo quando necessário.

Exemplo:

Button
→ `components.json`
→ contract
→ rules
→ tokens
→ implementation
→ demo

---

## Fluxo de build

A fonte de verdade é `src/` e os arquivos de auditoria declarados.

Fluxo geral:

source/audit
→ tokens
→ scripts de build
→ `dist/`

Não edite arquivos em `dist/` manualmente.

Depois de qualquer alteração relevante:

`npm run check`

deve continuar passando.

---

## Fluxo de auditoria

Arquivos em `audit/` representam dados extraídos ou verificados a partir das fontes de design.

Quando houver diferença entre:
- Figma;
- audit;
- tokens;
- implementação;

não escolha silenciosamente uma das versões.

Registre a divergência e indique qual fonte sustenta cada valor.

---

## Como trabalhar com componentes

Ao adicionar ou alterar um componente:

1. localizar ou criar entrada em `components.json`;
2. criar/atualizar contract;
3. criar/atualizar rules;
4. criar/atualizar tokens;
5. implementar;
6. atualizar demo;
7. atualizar build apenas se necessário;
8. atualizar validação;
9. rodar `npm run check`;
10. confirmar que `detect-changed-components.mjs` identifica o componente.

Nunca:
- invente variantes;
- invente estados;
- copie regras específicas de outro componente sem verificar;
- altere `dist/` como fonte;
- esconda uma divergência conhecida.