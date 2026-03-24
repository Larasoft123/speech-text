# Documentación del Design System

> ⚠️ **Stack:** Next.js + Tailwind CSS v4 (CSS-first configuration)

## Archivos

1. **[design-system.md](./design-system.md)** - Overview + setup Tailwind v4
2. **[colors.md](./colors.md)** - Tokens CSS para `@theme`
3. **[typography.md](./typography.md)** - Tipografía Inter + Material Symbols
4. **[spacing.md](./spacing.md)** - Espaciado, border-radius, light-leaking shadows
5. **[components.md](./components.md)** - Implementaciones con clases Tailwind
6. **[components-identified.md](./components-identified.md)** - Componentes del diseño (análisis)

## Quick Reference (Tailwind v4)

```css
/* En tu CSS principal */
@import "tailwindcss";

@theme {
  --color-surface: #111316;
  --color-surface-container: #1e2023;
  --color-primary: #ffb2b7;
  --color-secondary: #82d3de;
  --font-family-sans: "Inter", system-ui, sans-serif;
  --radius-lg: 0.5rem;
  --radius-2xl: 1rem;
}
```

```html
<!-- Clases Tailwind equivalentes -->
<div class="bg-surface-container">...</div>
<button class="bg-gradient-to-r from-primary to-primary-container">CTA</button>
<span class="material-symbols-outlined">mic</span>
```

## Proyecto Stitch

- **ID:** `projects/6772191448043150491`
- **Nombre:** Dashboard & Grabación/Carga
- **Tema:** Dark mode, Inter, ROUND_FOUR
- **Screens:** 6 (Dashboard, Editor, Biblioteca, TTS, etc.)
