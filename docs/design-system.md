# Design System - Dashboard de Transcripción

> ⚠️ **Stack:** Next.js + Tailwind CSS v4 (CSS-first configuration)

## Creative North Star: "The Ethereal Tool"

Este design system está construido para alejarse de la naturaleza rígida y encasillada de los dashboards SaaS tradicionales. La estrella guía creativa es **"The Ethereal Tool"** — un concepto donde la interfaz se siente como un espacio de trabajo físico de alta gama iluminado por luz ambiental suave.

La meta es hacer que el usuario sienta que está interactuando con un instrumento profesional en lugar de una aplicación web genérica.

---

## Tailwind CSS v4 Setup

En Tailwind 4 se usa `@theme` en CSS en lugar de `tailwind.config.js`:

```css
@import "tailwindcss";

@theme {
  /* Colors */
  --color-surface: #111316;
  --color-surface-container: #1e2023;
  --color-surface-container-high: #282a2d;
  --color-surface-container-highest: #333538;
  --color-surface-container-low: #1a1c1f;
  --color-surface-container-lowest: #0c0e11;
  --color-surface-dim: #111316;
  --color-surface-bright: #37393d;
  --color-surface-variant: #333538;
  --color-surface-tint: #ffb2b7;

  --color-primary: #ffb2b7;
  --color-primary-container: #ff516a;
  --color-on-primary: #67001b;
  
  --color-secondary: #82d3de;
  --color-secondary-container: #006b75;
  --color-on-secondary: #00363c;

  --color-tertiary: #fbbc00;
  --color-tertiary-container: #b88900;

  --color-on-surface: #e2e2e6;
  --color-on-surface-variant: #e4bdbe;

  --color-error: #ffb4ab;
  --color-error-container: #93000a;

  --color-outline: #ab8889;
  --color-outline-variant: #5b4041;

  /* Fonts */
  --font-family-sans: "Inter", system-ui, sans-serif;

  /* Border Radius */
  --radius-lg: 0.5rem;   /* 8px - cards */
  --radius-xl: 0.75rem;  /* 12px - modals */
  --radius-2xl: 1rem;   /* 16px */
  --radius-3xl: 1.5rem; /* 24px */
  --radius-full: 9999px; /* pills */
}
```

---

## Principios Fundamentales

### 1. La Regla "No-Line"
**Prohibido:** Usar borders de 1px para separar secciones.

**Alternativas obligatorias:**
- **Shift de color de fondo:** Colocar una sección `surface-container-low` contra un fondo `surface`
- **Whitespace vertical:** Usar la escala de espaciado (8px - 16px) para crear separación natural
- **Transiciones tonales:** Gradientes sutiles que sugieren cambio de función sin corte duro

### 2. Filosofía de Superficies (Tonal Layering)

La UI es una serie de capas apiladas semi-translúcidas:

| Capa | Token | Hex | Uso |
|------|-------|-----|-----|
| Base | `surface` / `surface-dim` | #111316 | Fondo principal |
| Contenido | `surface-container` | #1e2023 | Áreas de contenido primario |
| Flotante | `surface-container-high` | #282a2d | Elementos activos/hover |
| Elevado | `surface-bright` | #37393d | Modals, dropdowns |
| Background | `surface-container-lowest` | #0c0e11 | Áreas que sostienen cards activas |

### 3. Glassmorphism para Panels Flotantes

Para navegación o paneles utilitarios flotantes:
- **Background:** `surface-variant` al 60% opacidad
- **Effect:** `backdrop-filter: blur(20px)`
- **Accents:** Gradiente sutil de `primary` a `primary-container` para CTAs

### 4. Sombras "Light-Leaking" (No Traditional Shadows)

Las sombras tradicionales son demasiado pesadas. Usar **"Ambient Lift"**:

```
blur: 40px - 60px
opacity: 4% - 8%
color: surface-tint (#ffb2b7) o on-surface
```

---

## Paleta de Colores

Ver archivo dedicado: [colors.md](./colors.md)

## Sistema de Tipografía

Ver archivo dedicado: [typography.md](./typography.md)

## Sistema de Espaciado

Ver archivo dedicado: [spacing.md](./spacing.md)

## Componentes

Ver archivo dedicado: [components.md](./components.md)

---

## Do's and Don'ts

### ✅ Do:
- **Usar Asimetría:** Colocar el sidebar de acciones descentrado para crear layout editorial
- **Abrazar la Profundidad:** Usar `surface-bright` para hover states
- **Respetar la Escala:** Usar `spacing-8` a `spacing-16` para gaps de sección

### ❌ Don't:
- **No usar Negro Puro (#000000):** Mata la profundidad sofisticada del slate
- **No usar 1px Solid Dividers:** Fallo de diseño espacial
- **No usar Sombras Estándar:** Sensación "cheap" y de la era 2010s
- **No usar Esquinas Duras:** Evitar `none` o `sm` para containers grandes

---

## Recursos

- Proyecto Stitch: `projects/6772191448043150491`
- Screens: 6 en total (Dashboard, Editor, Biblioteca, TTS, etc.)
- Componentes identificados: [components-identified.md](./components-identified.md)

---

## Componentes Identificados (del diseño)

| Componente | Descripción | Archivo参考 |
|------------|-------------|------------|
| TopNavBar | Header fijo con logo, nav, notificaciones | `components-identified.md` |
| SideNavBar | Sidebar lateral con navegación | `components-identified.md` |
| DropZone | Zona de upload con drag & drop | `components-identified.md` |
| ProjectCard | Cards de proyectos recientes | `components-identified.md` |
| ButtonPrimary | CTA con gradiente | `components.md` |
| ButtonSecondary | Botón secundario | `components.md` |
| GlassPanel | Panels con glassmorphism | `components.md` |
