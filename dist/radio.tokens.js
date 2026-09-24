window.BMB_RADIO_TOKENS = {
  "_source": "Figma 04. CORE-Basics (Audit) BWdzK06j2tX1Dt62ZSxNR1, página ✅ 08. Controls 827:887: Radio — component set 1575:189 (tone × state × checked, 24 variantes) e .Master Radio 1575:175 (size, 3 variantes). Lido ao vivo via MCP.",
  "_generated": "2026-09-24",
  "_leiaAntes": "Só entram aqui valores que scripts/build-radio-css.mjs realmente consome. Campo que não vira CSS não mora neste arquivo. Os nomes dos eixos e dos valores são os do Figma, que já estão em minúsculas.",
  "_eixos": "tone, state e checked estão no set Radio; size está na instância aninhada .Master Radio. Em CSS, tone e size viram classes irmãs; state e checked vêm do <input type=\"radio\"> nativo. No Figma existe só o item: o grupo é regra de código.",
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
  "border": {
    "rest": 1,
    "hover": 2
  },
  "focus": {
    "width": 2,
    "offset": 2,
    "ringRadius": "md"
  },
  "sizes": {
    "sm": {
      "box": 14,
      "dot": 4.375,
      "dotAt": 4.8125,
      "font": "paragraph-small"
    },
    "md": {
      "box": 16,
      "dot": 5,
      "dotAt": 5.5,
      "font": "paragraph-medium"
    },
    "lg": {
      "box": 18,
      "dot": 5.625,
      "dotAt": 6.1875,
      "font": "paragraph-large"
    }
  },
  "toneTokens": {
    "neutral": {
      "border": "base-on-on-surface-base",
      "fill": "base-backgrounds-base-default-alt",
      "dot": "base-on-on-surface-base-alt",
      "label": "base-on-on-surface-base",
      "ring": "base-borders-border-base-focus-alt"
    },
    "brand": {
      "border": "primary-on-on-surface-primary",
      "fill": "primary-backgrounds-primary-default",
      "dot": "primary-on-on-primary",
      "label": "primary-on-on-surface-primary",
      "ring": "base-borders-border-base-focus-alt"
    },
    "invert": {
      "border": "surface-brand-on-on-surface-subtle-brand",
      "fill": "surface-brand-on-on-surface-subtle-brand",
      "dot": "surface-brand-backgrounds-background-brand",
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
