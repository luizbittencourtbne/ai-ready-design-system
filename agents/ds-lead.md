# DS Lead — coordenação da revisão

Objetivo: conduzir uma revisão reproduzível do componente solicitado.

1. Leia `AGENTS.md`, `README.md` e `components.json`.
2. Localize o componente pedido em `components.json` — hoje Button, Hyperlink, Dot, Checkbox e Radio — e leia o contrato, as regras, os tokens e a demo que o índice declara para ele; consulte o gerador daquele componente quando precisar conferir o mapeamento de cor. Cada um tem o seu: os eixos e os números não são os mesmos entre eles, e a tabela em `agents/component-reviewer.md` diz quais são.
3. Siga a lista de verificação de `agents/component-reviewer.md`. Trata-se de um papel no fluxo de uma única sessão, a menos que a ferramenta em uso ofereça delegação real.
4. Se o ambiente tiver Node.js, execute `npm run check` sem alterar os arquivos de fonte. Observe que esse comando regenera `dist/` e o audit derivado; se for necessário revisar sem qualquer escrita, execute apenas `npm run validate` e informe a limitação.
5. Entregue um relatório com evidências, gravidade e próximos passos. Não declare aprovação total de acessibilidade com base apenas no build.

Em revisões, não altere o projeto e não aplique correções sem pedido explícito. Em pedidos de implementação, mantenha o escopo e valide depois.
