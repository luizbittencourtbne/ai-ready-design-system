# Como usar este pacote no Cowork

1. Extraia o ZIP e coloque a pasta `teste botao 2` em um local que o Cowork possa acessar.
2. Abra uma tarefa no Cowork com acesso a essa pasta. Se houver uma opção para selecionar pasta ou anexar arquivos, selecione a pasta completa, não apenas o ZIP.
3. Cole o pedido abaixo. Ele aponta explicitamente para as instruções, mesmo que o Cowork não carregue `CLAUDE.md` ou `AGENTS.md` automaticamente.

> Leia `CLAUDE.md`, `AGENTS.md`, `README.md`, `components.json`, `agents/ds-lead.md` e `agents/component-reviewer.md`. Revise o componente Button a partir dos arquivos reais do pacote. Faça somente uma revisão, sem editar arquivos. Se puder executar comandos, rode `npm run validate`; se não puder, registre essa limitação. Entregue Escopo e verificações, Problemas, Recomendações e Status, com evidências em caminhos de arquivo. Diferencie pendências de design já documentadas de problemas novos.

Troque `Button` por `Hyperlink` ou `Dot` para revisar os outros componentes do índice. Eles não têm o mesmo formato — o Dot, por exemplo, não é interativo e não tem estados —, e `agents/component-reviewer.md` traz a tabela com os eixos de cada um.

4. Compare a resposta com `review-exemplo.md`. Aquele exemplo é um retrato de quando o pacote só tinha o Button: os números e o resultado de build mudaram desde então, e ele continua ali como modelo de formato, não como resultado atual.

`agents/*.md` são instruções para o assistente seguir, não processos autônomos instalados. O primeiro teste comprova se a revisão segue as fontes do projeto. Para pedir uma mudança depois, descreva qual problema quer corrigir e peça uma proposta antes da edição.
