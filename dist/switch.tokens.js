window.BMB_SWITCH_TOKENS = {
  "_source": "Figma 04. CORE-Basics (Audit) BWdzK06j2tX1Dt62ZSxNR1, página ✅ 08. Controls 827:887: Switch — component set 16715:1144 (tone × state × checked, 18 variantes) e .Master Switch 1468:1255 (size, 3 variantes). Lido ao vivo via MCP. O Switch (descontinuado) 1697:1842 NÃO é fonte de nada aqui.",
  "_generated": "2026-09-24",
  "_leiaAntes": "Só entram aqui valores que scripts/build-switch-css.mjs realmente consome. Campo que não vira CSS não mora neste arquivo. Os nomes dos eixos e dos valores são os do Figma, que já estão em minúsculas.",
  "_eixos": "tone, state e checked estão no set Switch; size está na instância aninhada .Master Switch. Em CSS, tone e size viram classes irmãs; state e checked vêm do <input type=\"checkbox\" role=\"switch\"> nativo. Não há hover (D7): o set tem só default, focus e disabled.",
  "toneOrder": [
    "neutral",
    "brand",
    "invert"
  ],
  "stateOrder": [
    "default",
    "focus",
    "disabled"
  ],
  "checkedOrder": [
    "false",
    "true"
  ],
  "sizeOrder": [
    "sm",
    "md",
    "lg"
  ],
  "defaults": {
    "tone": "neutral",
    "size": "md"
  },
  "disabledOpacity": 0.4,
  "gap": 8,
  "focus": {
    "width": 2,
    "offset": 2,
    "ringRadius": "md"
  },
  "sizes": {
    "sm": {
      "track": {
        "w": 30,
        "h": 16
      },
      "thumb": 12,
      "pad": 2,
      "thumbCheckedX": 16,
      "font": "paragraph-small"
    },
    "md": {
      "track": {
        "w": 34,
        "h": 20
      },
      "thumb": 16,
      "pad": 2,
      "thumbCheckedX": 16,
      "font": "paragraph-medium"
    },
    "lg": {
      "track": {
        "w": 46,
        "h": 24
      },
      "thumb": 20,
      "pad": 2,
      "thumbCheckedX": 24,
      "font": "paragraph-large"
    }
  },
  "toneTokens": {
    "neutral": {
      "track": "base-borders-border-base-subtle-alt",
      "track-on": "base-on-on-surface-base",
      "thumb": "base-backgrounds-base-default",
      "label": "base-on-on-surface-base",
      "ring": "base-borders-border-base-focus-alt"
    },
    "brand": {
      "track": "base-borders-border-base-subtle-alt",
      "track-on": "primary-on-on-surface-primary",
      "thumb": "base-backgrounds-base-default",
      "label": "primary-on-on-surface-primary",
      "ring": "base-borders-border-base-focus-alt"
    },
    "invert": {
      "track": "surface-brand-on-on-surface-subtle-brand",
      "track-on": "surface-brand-on-on-surface-neutral-brand",
      "thumb": "surface-brand-backgrounds-surface-brand",
      "label": "surface-brand-on-on-surface-neutral-brand",
      "ring": "surface-brand-on-on-surface-neutral-brand"
    }
  },
  "brands": [
    {
      "id": "employer",
      "label": "Employer"
    },
    {
      "id": "epays",
      "label": "ePays"
    },
    {
      "id": "bne-cia",
      "label": "BNE CIA"
    }
  ]
};
