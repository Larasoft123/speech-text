# Sistema de Colores - Dashboard de Transcripción

> ⚠️ **Tailwind CSS v4:** Los colores se definen con `@theme` en CSS, no en JS config.

---

## Implementación CSS (Tailwind v4)

```css
@import "tailwindcss";

@theme {
  /* Surface Colors */
  --color-surface: #111316;
  --color-surface-dim: #111316;
  --color-surface-bright: #37393d;
  --color-surface-container-lowest: #0c0e11;
  --color-surface-container-low: #1a1c1f;
  --color-surface-container: #1e2023;
  --color-surface-container-high: #282a2d;
  --color-surface-container-highest: #333538;
  --color-surface-variant: #333538;
  --color-surface-tint: #ffb2b7;

  /* Primary (Rosa) */
  --color-primary: #ffb2b7;
  --color-primary-container: #ff516a;
  --color-on-primary: #67001b;
  --color-on-primary-container: #5b0016;
  --color-primary-fixed: #ffdadb;
  --color-primary-fixed-dim: #ffb2b7;

  /* Secondary (Teal) */
  --color-secondary: #82d3de;
  --color-secondary-container: #006b75;
  --color-on-secondary: #00363c;
  --color-on-secondary-container: #98e9f4;
  --color-secondary-fixed: #9ff0fb;
  --color-secondary-fixed-dim: #82d3de;

  /* Tertiary (Amber) */
  --color-tertiary: #fbbc00;
  --color-tertiary-container: #b88900;
  --color-on-tertiary: #402d00;
  --color-on-tertiary-container: #372700;
  --color-tertiary-fixed: #ffdfa0;
  --color-tertiary-fixed-dim: #fbbc00;

  /* On Surface (Textos) */
  --color-on-surface: #e2e2e6;
  --color-on-surface-variant: #e4bdbe;

  /* Error */
  --color-error: #ffb4ab;
  --color-error-container: #93000a;
  --color-on-error: #690005;
  --color-on-error-container: #ffdad6;

  /* Utility */
  --color-outline: #ab8889;
  --color-outline-variant: #5b4041;
  --color-inverse-surface: #e2e2e6;
  --color-inverse-on-surface: #2f3034;
  --color-inverse-primary: #be0039;
}
```

---

## Paleta Visual

### Surface Hierarchy (Tonal Layering)

```
┌─────────────────────────────────────────────────┐
│  surface-dim (111316) - Fondo global            │
│  ┌───────────────────────────────────────────┐   │
│  │  surface (111316) - Fondo base            │   │
│  │  ┌─────────────────────────────────────┐  │   │
│  │  │  surface-container-lowest (0c0e11) │  │   │
│  │  │  surface-container-low (1a1c1f)    │  │   │
│  │  │  surface-container (1e2023)         │  │   │
│  │  │  surface-container-high (282a2d)    │  │   │
│  │  │  surface-container-highest (333538) │  │   │
│  │  │  surface-bright (37393d)            │  │   │
│  │  └─────────────────────────────────────┘  │   │
│  └───────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### Accent Colors

| Token | Hex | Muestra | Uso |
|-------|-----|---------|-----|
| `primary` | #ffb2b7 | ██████ | Accent principal (CTA, highlights) |
| `primary-container` | #ff516a | ██████ | Contenedor de primary |
| `secondary` | #82d3de | ██████ | Accent secundario (teal) |
| `secondary-container` | #006b75 | ██████ | Contenedor de secondary |
| `tertiary` | #fbbc00 | ██████ | Accent terciario (amber) |
| `tertiary-container` | #b88900 | ██████ | Contenedor de tertiary |

### Custom Project Colors

```css
/* En el HTML del diseño */
--custom-primary: #E52B50;   /* Rojo vibrante - brand color */
--custom-secondary: #006D77; /* Teal */
--custom-tertiary: #FFBF00;  /* Amber */
```

---

## Guía de Uso

### Clases de Tailwind v4

```html
<!-- Surface backgrounds -->
<div class="bg-surface">...</div>
<div class="bg-surface-container">...</div>
<div class="bg-surface-container-high">...</div>
<div class="bg-surface-container-lowest">...</div>

<!-- Text colors -->
<p class="text-on-surface">Texto principal</p>
<p class="text-on-surface-variant">Texto secundario</p>

<!-- Accent colors -->
<button class="bg-primary text-on-primary">Primary</button>
<span class="text-secondary">Secondary text</span>
```

### Gradientes

```css
/* CTA Button gradient */
.bg-gradient-primary {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-container) 100%);
}

/* Glow effects */
.glow-subtle {
  box-shadow: 0 0 80px -20px rgba(229, 43, 80, 0.15);
}

.bg-glow-secondary {
  background: radial-gradient(circle, rgba(130, 211, 222, 0.15) 0%, transparent 70%);
}
```

### Ghost Border (si es necesario)

```css
/* Solo para accesibilidad extrema - 20% opacity */
.border-ghost {
  border: 1px solid rgba(91, 64, 65, 0.2);
}
```

---

## NO USAR

- ❌ `#000000` (negro puro)
- ❌ `#ff0000` (rojo puro para errores)
- ❌ Colores hardcoded fuera de los tokens
