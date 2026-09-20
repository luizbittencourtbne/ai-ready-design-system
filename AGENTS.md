# Instruções para assistentes — BambooDS

Este pacote contém um experimento do componente Button. Leia `README.md` e `components.json` antes de trabalhar. O contrato real está em `src/button.contract.json`, as decisões e pendências em `src/button.rules.md` e os dados de geometria em `src/button.tokens.json`. Não substitua essa estrutura por um `component.json` genérico.

## Fontes e fluxo

- Cores: `audit/audit-brands-raw.json` e `audit/audit-semantic-raw.json` alimentam `audit/core-brands-audit.json` e `dist/brands.css`.
- Geometria: `src/button.tokens.json` alimenta o CSS do botão via `scripts/build-css.mjs`.
- O contrato descreve a API, mas o mapeamento de temas continua em `scripts/build-css.mjs`.
- `dist/` é gerado. Não edite esses arquivos manualmente.
- Não declare que houve uma conferência ao vivo no Figma: os dados aqui são snapshots de audits.

## Convenções

- Confira padrões existentes antes de sugerir componente, variante ou token novo.
- Preserve as marcas `employer`, `epays`, `bne-cia` e os modos `light` e `dark`.
- Prefira HTML semântico, `disabled` nativo e nome acessível para botão só com ícone.
- Diferencie erro comprovado, risco e divergência já documentada. Não corrija escolhas de design em aberto por conta própria.
- Ao alterar código em uma tarefa autorizada, rode `npm run check` e registre o resultado.

Para revisão somente leitura, siga `agents/ds-lead.md` e `agents/component-reviewer.md`; não modifique arquivos.
