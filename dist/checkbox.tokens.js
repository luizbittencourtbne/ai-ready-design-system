window.BMB_CHECKBOX_TOKENS = {
  "_source": "Figma 04. CORE-Basics (Audit) BWdzK06j2tX1Dt62ZSxNR1, página ✅ 08. Controls 827:887: Checkbox — component set 1451:1360 (tone × state × checked, 36 variantes) e .Master Checkbox 1451:1285 (size, 3 variantes). Lido ao vivo via MCP.",
  "_generated": "2026-09-24",
  "_leiaAntes": "Só entram aqui valores que scripts/build-checkbox-css.mjs realmente consome. Campo que não vira CSS não mora neste arquivo. Os nomes dos eixos e dos valores são os do Figma, que já estão em minúsculas.",
  "_eixos": "tone, state e checked estão no set Checkbox; size está na instância aninhada .Master Checkbox. Em CSS, tone e size viram classes irmãs; state e checked vêm do <input> nativo (:hover, :focus-visible, :disabled, :checked, :indeterminate).",
  "toneOrder": [
    "neutral",
    "brand",
    "invert"
  ],
  "stateOrder": [
    "default",
    "hover",
    "focus",
    "disabled"
  ],
  "checkedOrder": [
    "false",
    "true",
    "indeterminate"
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
  "border": {
    "rest": 1,
    "hover": 2
  },
  "glyph": {
    "stroke": 1.6666
  },
  "focus": {
    "width": 2,
    "offset": 2,
    "ringRadius": "md"
  },
  "sizes": {
    "sm": {
      "box": 14,
      "font": "paragraph-small",
      "check": {
        "x": 4,
        "y": 5,
        "w": 5.0909,
        "h": 3.5,
        "path": "M 5.0909 0 L 1.5909 3.5 L 0 1.9091"
      },
      "dash": {
        "x": 4,
        "y": 7,
        "w": 6
      }
    },
    "md": {
      "box": 16,
      "font": "paragraph-medium",
      "check": {
        "x": 4,
        "y": 5,
        "w": 8,
        "h": 5.5,
        "path": "M 8 0 L 2.5 5.5 L 0 3"
      },
      "dash": {
        "x": 4,
        "y": 8,
        "w": 8
      }
    },
    "lg": {
      "box": 18,
      "font": "paragraph-large",
      "check": {
        "x": 4.5,
        "y": 5.625,
        "w": 9,
        "h": 6.1875,
        "path": "M 9 0 L 2.8125 6.1875 L 0 3.375"
      },
      "dash": {
        "x": 4,
        "y": 9,
        "w": 10
      }
    }
  },
  "toneTokens": {
    "neutral": {
      "bg": "base-backgrounds-base-default",
      "bgChecked": "base-backgrounds-base-default-alt",
      "glyph": "base-on-on-surface-base-alt",
      "border": "base-on-on-surface-base",
      "label": "base-on-on-surface-base",
      "ring": "base-borders-border-base-focus-alt"
    },
    "brand": {
      "bg": "primary-on-on-primary",
      "bgChecked": "primary-backgrounds-primary-default",
      "glyph": "primary-on-on-primary",
      "border": "primary-on-on-surface-primary",
      "label": "primary-on-on-surface-primary",
      "ring": "base-borders-border-base-focus-alt"
    },
    "invert": {
      "bg": "surface-brand-backgrounds-surface-brand",
      "bgChecked": "surface-brand-backgrounds-surface-brand",
      "glyph": "surface-brand-on-on-surface-neutral-brand",
      "border": "surface-brand-on-on-surface-neutral-brand",
      "label": "surface-brand-on-on-surface-neutral-brand",
      "ring": "surface-brand-on-on-surface-subtle-brand"
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
