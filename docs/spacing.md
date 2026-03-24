# Sistema de Espaciado y Elevación - Dashboard de Transcripción

> ⚠️ **Tailwind CSS v4:** El espaciado se define con `@theme` en CSS.

---

## Escala de Espaciado

### Base Scale (Tailwind v4)

| Token Tailwind | px | rem | Uso |
|----------------|-----|-----|-----|
| `p-1` / `gap-1` | 4px | 0.25rem | Separación inline mínima |
| `p-2` / `gap-2` | 8px | 0.5rem | Separación estándar |
| `p-3` / `gap-3` | 12px | 0.75rem | Padding interno de chips |
| `p-4` / `gap-4` | 16px | 1rem | Separación entre elementos |
| `p-5` / `gap-5` | 20px | 1.25rem | - |
| `p-6` / `gap-6` | 24px | 1.5rem | Separación entre secciones menores |
| `p-8` / `gap-8` | 32px | 2rem | Separación entre secciones mayores |
| `p-12` / `gap-12` | 48px | 3rem | Separación hero/sección |
| `p-16` / `gap-16` | 64px | 4rem | - |

### Custom Spacing en @theme

```css
@theme {
  /* Custom spacing si es necesario */
  --spacing-18: 72px;
  --spacing-24: 96px;
}
```

---

## Border Radius

### Escala de Redondez

| Token Tailwind | Valor | rem | Uso |
|----------------|-------|-----|-----|
| `rounded` | 0.125rem | 2px | ❌ NO USAR en containers |
| `rounded-md` | 0.375rem | 6px | Buttons |
| `rounded-lg` | 0.5rem | 8px | Cards, inputs |
| `rounded-xl` | 0.75rem | 12px | Containers principales |
| `rounded-2xl` | 1rem | 16px | Modals |
| `rounded-3xl` | 1.5rem | 24px | Panels grandes |
| `rounded-full` | 9999px | - | Pills, avatars, chips |

### Configuración en @theme

```css
@theme {
  --radius-lg: 0.5rem;    /* 8px - cards */
  --radius-xl: 0.75rem;   /* 12px - containers */
  --radius-2xl: 1rem;      /* 16px - modals */
  --radius-3xl: 1.5rem;   /* 24px - panels */
  --radius-full: 9999px;   /* pills */
}
```

---

## Elevación (Sombras)

### NO usar sombras tradicionales de Tailwind

> ⚠️ Este design system NO usa `shadow-md`, `shadow-lg` de Tailwind. Usa **"Light-Leaking Shadows"**.

### Light-Leaking Shadows

```css
/* Glow sutil para drop zones */
.glow-subtle {
  box-shadow: 0 0 80px -20px rgba(229, 43, 80, 0.15);
}

/* Ambient lift para modals */
.shadow-ambient {
  box-shadow: 0 20px 40px rgba(229, 43, 80, 0.04);
}

/* Elevation para glass panels */
@layer utilities {
  .shadow-glow-primary {
    box-shadow: 0 0 60px -15px rgba(229, 43, 80, 0.2);
  }
  
  .shadow-glow-secondary {
    box-shadow: 0 0 60px -15px rgba(130, 211, 222, 0.15);
  }
}
```

### Guía de Sombras

| Elemento | Efecto | Color | Blur |
|----------|--------|-------|------|
| Drop Zone hover | `glow-subtle` | primary | 80px |
| Modal | `shadow-ambient` | primary 4% | 40px |
| Glass Panel | backdrop-blur | - | 20px |

---

## Layout Grid

### Grid Layout del Dashboard

```html
<!-- Layout asimétrico: sidebar + contenido -->
<main class="ml-64">...</main>

<!-- Grid de 12 columnas -->
<div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
  <div class="lg:col-span-8">...</div>  <!-- Drop Zone -->
  <div class="lg:col-span-4">...</div>  <!-- Record Action -->
</div>

<!-- Grid de proyectos -->
<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
```

### Configuración de Sidebar

```css
/* Sidebar fijo */
aside {
  @apply fixed left-0 top-16;
  @apply h-[calc(100vh-64px)] w-64;
}

/* Main content con offset del sidebar */
main {
  @apply ml-64 pt-16 min-h-screen;
}
```

---

## Padding Containers

```html
<!-- Container de página -->
<div class="max-w-6xl mx-auto px-12 py-12">
  ...
</div>

<!-- Container de sección -->
<section class="mb-20">
  ...
</section>
```

---

## Separación Visual (NO Lines)

### PROHIBIDO

```html
<!-- ❌ MAL -->
<hr class="border-1 border-outline" />
<div class="border-b border-outline-variant" />
```

### CORRECTO

```html
<!-- ✅ BIEN - Usar spacing o shift de color -->
<div class="bg-surface-container-low p-4 mb-6">
  Speaker block
</div>

<!-- Separación entre elementos del mismo grupo -->
<div class="space-y-4">
  <div>Element 1</div>
  <div>Element 2</div>
</div>
```

---

## Resumen Visual

```
┌────────────────────────────────────────────────────────────┐
│  Header: h-16 (64px), fixed, backdrop-blur-xl             │
├──────────┬─────────────────────────────────────────────────┤
│          │                                                 │
│ Sidebar  │  Main Content                                   │
│ w-64     │  max-w-6xl mx-auto px-12 py-12                  │
│          │                                                 │
│          │  Section spacing: mb-20 (80px)                  │
│          │  Card gaps: gap-6 (24px)                        │
│          │                                                 │
│          │  ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│          │  │  Card   │ │  Card   │ │  Card   │           │
│          │  │rounded-2xl│rounded-2xl│rounded-2xl│           │
│          │  └─────────┘ └─────────┘ └─────────┘           │
│          │                                                 │
├──────────┴─────────────────────────────────────────────────┤
│  Footer: h-10 (40px), fixed bottom                        │
└────────────────────────────────────────────────────────────┘
```
