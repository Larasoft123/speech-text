# Sistema de Tipografía - Dashboard de Transcripción

> ⚠️ **Tailwind CSS v4:** La tipografía se configura con `@theme` en CSS.

---

## Familia Tipográfica

**Font Principal:** Inter

Inter fue elegida por su precisión matemática y carácter neutral, permitiendo que la salida de la IA (transcripciones y traducciones) sea la protagonista.

---

## Implementación CSS (Tailwind v4)

```css
@import "tailwindcss";

@theme {
  --font-family-sans: "Inter", system-ui, -apple-system, sans-serif;
  --font-family-display: "Inter", system-ui, sans-serif;
}
```

---

## Escala Tipográfica

### Display (Para momentos hero/marketing)

| Token | Size | Weight | Letter-spacing | Line-height | Uso |
|-------|------|--------|---------------|-------------|-----|
| `text-display-lg` | 57px | 400 | -0.02em | 1.12 | Headlines principales |
| `text-display-md` | 45px | 400 | -0.02em | 1.16 | Dashboard summaries |
| `text-display-sm` | 36px | 400 | -0.02em | 1.22 | - |

### Headlines

| Token | Size | Weight | Line-height | Uso |
|-------|------|--------|-------------|-----|
| `text-headline-lg` | 32px | 400 | 1.25 | - |
| `text-headline-md` | 28px | 400 | 1.29 | - |
| `text-headline-sm` | 24px | 400 | 1.33 | - |

### Titles

| Token | Size | Weight | Line-height | Uso |
|-------|------|--------|-------------|-----|
| `text-title-lg` | 22px | 500 | 1.27 | Headers de transcripción (estilo libro) |
| `text-title-md` | 16px | 500 | 1.5 | - |
| `text-title-sm` | 14px | 500 | 1.43 | - |

### Body

| Token | Size | Weight | Line-height | Uso |
|-------|------|--------|-------------|-----|
| `text-body-lg` | 16px | 400 | 1.5 | Vista principal de transcripción |
| `text-body-md` | 14px | 400 | 1.43 | Texto secundario |
| `text-body-sm` | 12px | 400 | 1.33 | - |

### Labels (Metadata)

| Token | Size | Weight | Letter-spacing | Uso |
|-------|------|--------|---------------|-----|
| `text-label-lg` | 14px | 500 | 0.1em | - |
| `text-label-md` | 12px | 500 | 0.5em | Timestamps, speaker IDs, language tags |
| `text-label-sm` | 11px | 500 | 0.5em | - |

---

## Clases de Tailwind

```html
<!-- Display -->
<h1 class="text-[45px] font-normal tracking-tight leading-[1.16]">...</h1>
<h1 class="text-[36px] font-bold tracking-tight">...</h1>

<!-- Titles -->
<h2 class="text-[22px] font-semibold leading-[1.27]">Headers de transcripción</h2>

<!-- Body -->
<p class="text-[16px] leading-[1.5]">Vista principal de transcripción</p>

<!-- Labels -->
<span class="text-[10px] font-bold uppercase tracking-[0.1em]">Timestamps</span>
<span class="text-[12px] font-medium uppercase tracking-[0.5em]">Language tags</span>
```

---

## Configuración Custom en @theme

```css
@theme {
  /* Custom text sizes */
  --text-display-md: 45px;
  --text-display-sm: 36px;
  --text-title-lg: 22px;
  --text-body-lg: 16px;
  --text-label-md: 12px;

  /* Letter spacing */
  --tracking-tight: -0.02em;
  --tracking-wide: 0.1em;
  --tracking-widest: 0.5em;
}
```

---

## Reglas de Uso

### Jerarquía Visual

1. **Display:** Solo para resúmenes de dashboard o momentos hero
2. **Headlines:** Para secciones principales
3. **Titles:** Para headers de transcripciones
4. **Body:** El trabajohorse para texto de transcripción
5. **Labels:** Solo para metadata

### Accesibilidad

- Contraste mínimo texto-on-surface: 4.5:1
- Line-height para body: mínimo 1.4

### Directrices

> **El output de la IA es el héroe.** La tipografía debe ser clara, legible y no competir con el contenido.

---

## Material Symbols (Iconos)

El diseño usa Material Symbols Outlined:

```html
<!-- Import en head -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>

<!-- Uso -->
<span class="material-symbols-outlined">cloud_upload</span>

<!-- Variaciones -->
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 0, 'wght' 400">
  mic
</span>
<span class="material-symbols-outlined" data-weight="fill">push_pin</span>
```

### Iconos comunes en el diseño

| Icono | Uso |
|-------|-----|
| `dashboard` | Navegación activa |
| `description` | Transcriptions |
| `translate` | Translations |
| `mic` | Voice Studio |
| `inventory_2` | Archive |
| `cloud_upload` | Upload zone |
| `audio_file` | Audio files |
| `video_file` | Video files |
| `text_snippet` | Text files |
| `notifications` | Notifications |
| `settings` | Settings |
| `schedule` | Duration |
| `calendar_today` | Date |
| `group` | Speakers |
| `push_pin` | Pinned |
