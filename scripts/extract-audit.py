#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
extract-audit.py — extrai uma tabela do CORE-Brands (Audit) de um dump de metadata do MCP.

As páginas "Brand Colors" e "Mode Swatches" são tabelas de documentação onde cada célula é um
frame NOMEADO com o valor (um hex, ou o caminho de outra variável quando é alias). Este script
lê essa estrutura sem precisar de FIGMA_TOKEN.

As posições das colunas vêm do frame "Header" — nunca hardcoded, porque mudam quando uma marca
entra ou sai.

Uso:
    python extract-audit.py <dump.txt> <saida.json> prims|sem
"""
import json
import io
import re
import sys
import xml.etree.ElementTree as ET

ROW_RE = {
    # primitivos: 03-Primary/Light/Deep, 02-Neutral/Pure-white, 08-Transparency/White/20
    'prims': re.compile(r'^\d\d-[^/]+/(?:(?:Light|Dark)/.+|Pure-?\w+|(?:White|Black|Brand)/\d+)$'),
    # semânticos: 06-Color Primary/On/on-primary
    'sem': re.compile(r'^\d\d-Color .+/.+/.+$'),
}
HEX = re.compile(r'^#[0-9a-fA-F]{6}$')
REF = re.compile(r'^\d\d-[A-Za-z]')  # célula que é alias p/ outra variável


def main(dump, saida, modo):
    if modo not in ROW_RE:
        sys.exit(f'modo deve ser prims|sem, veio {modo!r}')
    xml = json.load(io.open(dump, encoding='utf-8'))[0]['text']
    root = ET.fromstring(xml)

    hdr = next((n for n in root.iter() if n.get('name') == 'Header'), None)
    if hdr is None:
        sys.exit('frame "Header" não encontrado — a tabela mudou de estrutura?')
    cols = {round(float(c.get('x'))): c.get('name') for c in hdr if float(c.get('x') or 0) > 0}
    if not cols:
        sys.exit('nenhuma coluna encontrada no Header')

    rows_re = ROW_RE[modo]
    data = {}

    def walk(n):
        nm = n.get('name', '') or ''
        if rows_re.match(nm) and n.get('x') == '0':
            cells = {}
            for d in n.iter():
                dn = d.get('name', '') or ''
                if not (HEX.match(dn) or REF.match(dn)):
                    continue
                try:
                    dx = float(d.get('x', '-1'))
                except ValueError:
                    continue
                col = next((v for k, v in cols.items() if abs(k - dx) <= 2), None)
                if col and col not in cells:
                    cells[col] = dn
            if cells:
                data.setdefault(nm, cells)
            return  # não desce: evita capturar células de linhas aninhadas
        for c in n:
            walk(c)

    walk(root)
    io.open(saida, 'w', encoding='utf-8').write(json.dumps(data, indent=1, ensure_ascii=False))

    print(f'{saida}: {len(data)} linhas')
    print(f'  colunas: {", ".join(cols.values())}')
    alias = sum(1 for c in data.values() for v in c.values() if not HEX.match(v))
    print(f'  células alias (não-hex): {alias}')
    colecoes = sorted({k.split('/')[0] for k in data})
    print(f'  coleções ({len(colecoes)}): {", ".join(colecoes)}')


if __name__ == '__main__':
    if len(sys.argv) != 4:
        sys.exit(__doc__)
    main(*sys.argv[1:])
