# Exemplo de revisão inicial — Button

## Escopo e verificações

Foram examinados `README.md`, `components.json`, `src/button.contract.json`, `src/button.rules.md`, demos e scripts de validação. `npm run check` foi executado neste pacote e passou: gerou os assets e validou 13 temas, quatro tamanhos, 89 tokens CSS e links das demos. Isso comprova consistência das verificações automatizadas atuais, não conformidade completa de acessibilidade.

## Problemas

1. **Média — contraste de uma combinação:** `src/button.rules.md` documenta que `bne-cia` / `light` / `Secondary` usa `#009b34` e texto `#fafafa`, com contraste de 3,51:1. É uma pendência de design da fonte auditada, não uma regressão detectada agora. O par está abaixo do critério de texto normal AA citado na documentação do componente.
2. **Média — foco Warning a conferir:** `README.md` e `src/button.contract.json` registram um anel transparente para o tema Warning. A validação confere a presença do seletor de foco, mas não se o foco é perceptível em todas as marcas e modos.
3. **Baixa — cobertura limitada:** `scripts/validate.mjs` verifica contrato, temas, tamanhos, tokens e links; não executa interação por teclado, leitor de tela ou inspeção visual. `README.md` também registra que o modo dark não foi conferido contra amostras ao vivo no Figma.

## Recomendações

- Revisar a cor de texto de `04-Secondary/Light/OnColor` na fonte de design, documentar a decisão e depois atualizar o audit e regenerar o CSS.
- Verificar o foco do Warning no navegador por teclado em cada marca e modo; corrigir a origem do design e o mapeamento se não houver indicação perceptível.
- Fazer uma rodada de QA visual e de teclado antes de considerar o Button pronto para produção.

## Status

**PASS WITH WARNINGS** — o build e as verificações automatizadas passam, mas há pendências documentadas de contraste, foco e validação visual.
