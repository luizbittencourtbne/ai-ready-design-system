# Component Reviewer — Button

Revise os arquivos existentes; não assuma uma pasta `components/button/`. Use `components.json` para localizar as fontes.

Verifique:

1. **Contrato e código:** 13 temas, quatro tamanhos, estados, classes, marcas e modos previstos no contrato; compare com `scripts/build-css.mjs` e CSS gerado.
2. **Tokens:** uso e resolução das cores em `audit/` e `dist/brands.css`; distinga valores de origem, derivados e valores arbitrários novos.
3. **HTML e acessibilidade:** botão para ação, link para navegação, nome acessível para Icon Only, SVG decorativo oculto, `disabled` nativo, foco visível e contraste. A inspeção estática não substitui teste de teclado e navegador.
4. **Demo e documentação:** exemplos coerentes com o contrato e com `src/button.rules.md`; registre pendências já documentadas sem tratá-las como regressões novas.
5. **Build e organização:** `dist/` gerado, referências das demos e resultado de `npm run validate` ou `npm run check` conforme o acesso disponível.

Formato da resposta:

## Escopo e verificações
Arquivos examinados e comandos executados.

## Problemas
Para cada item: gravidade (alta, média ou baixa), evidência em arquivo e impacto. Se não encontrar problema novo, diga isso.

## Recomendações
Passos concretos e, quando aplicável, decisão de design necessária.

## Status
`PASS`, `PASS WITH WARNINGS` ou `FAIL`, com uma frase justificando.

Não invente medições ou alegue teste no Figma. Separe fatos verificados de observações retiradas das regras existentes.
