# Testar os agentes reais no Claude Code

Esta pasta inclui dois subagentes de projeto em `.claude/agents/`: `ds-lead` e `component-reviewer`. Eles são reconhecidos pelo **Claude Code**, quando ele é aberto nesta pasta. Os arquivos em `agents/` continuam disponíveis como instruções de leitura para outras ferramentas, incluindo o Cowork; não há garantia de que o Cowork carregue a configuração de subagentes do Claude Code.

## Primeiro teste, quando os créditos voltarem

1. Abra a pasta `teste botao 2` no Claude Code. Confira que ela contém `.claude/agents/`, `AGENTS.md` e `components.json`.
2. Peça: **Use o agente `ds-lead` para revisar o Button; ele deve delegar a inspeção ao `component-reviewer`. Não edite arquivos. Ao terminar, execute `npm run validate` na pasta raiz e apresente o status.** Troque `Button` por `Hyperlink`, `Dot` ou `Checkbox` para revisar os outros componentes do índice — os eixos de cada um estão em `agents/component-reviewer.md`.
3. Confira no histórico da execução se o `ds-lead` e o `component-reviewer` foram chamados de fato. Se a delegação automática não ocorrer, mencione o agente explicitamente usando a seleção de agentes do Claude Code.

As descrições ajudam o Claude Code a escolher um agente durante uma tarefa. Os agentes **não iniciam trabalho sozinhos** quando um arquivo muda e não executam em horário agendado. Para isso será necessário adicionar um gatilho (por exemplo, um workflow num repositório GitHub); este ZIP ainda não tem esse gatilho nem está ligado ao seu repositório.

Gerencie a definição dos agentes editando `.claude/agents/*.md`. O fluxo e as fontes do DS estão em `AGENTS.md` e `components.json`.
