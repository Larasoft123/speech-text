<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## Design System

Este proyecto usa un design system custom basado en Stitch (proyecto: `Dashboard & Grabación/Carga`).

> ⚠️ **Tailwind CSS v4** - Los colores se definen con `@theme` en CSS, no en `tailwind.config.js`.

### Archivos de Referencia

| Archivo | Descripción | Cuándo cargarlo |
|---------|-------------|-----------------|
| `docs/design-system.md` | Overview + setup Tailwind v4 | **SIEMPRE** antes de UI |
| `docs/colors.md` | Tokens CSS para `@theme` | Al trabajar con colores |
| `docs/typography.md` | Tipografía Inter + Material Symbols | Al trabajar con texto |
| `docs/spacing.md` | Espaciado, border-radius, sombras | Al trabajar con layout |
| `docs/components.md` | Implementaciones con clases Tailwind | Al crear componentes UI |
| `docs/components-identified.md` | Componentes del diseño (análisis) | Para referencia visual |

### Carga Automática

**REGLA:** Antes de escribir cualquier código de UI:
1. Leé `docs/design-system.md`
2. Cargá los tokens de `docs/colors.md`
3. Aplicá las reglas de `docs/components.md`

---

## Reglas de UI (Design System: "The Ethereal Tool")

### PROHIBIDO ❌
- Bordes de 1px para separar secciones
- Sombras drop-down tradicionales
- Esquinas cuadradas (border-radius: 0)
- Negro puro (#000000)
- Divisores horizontales (hr, border-bottom)
- Rojo puro para errores
- Nunca usar colores hardcodeados en clases de tailwind

### OBLIGATORIO ✅
- Tonal Layering: Usar `surface-container-low/medium/high`
- Glassmorphism: `backdrop-filter: blur(20px)` + bg al 60%
- Light-Leaking Shadows: `blur 32-48px`, `opacity 4-8%`, color `surface-tint`
- Espaciado: Tokens (spacing-4=8px, spacing-8=16px)
- Asimetría: Sidebar offset del contenido
- Roundness: `lg` (8px) o `xl` (12px) para containers
- siempre usar variables css con los colores predefinidos en `docs/colors.md`


---

Use the skill `transformers-js` when you going to use the transformers-js library.
type all the code in typescript.
no repeat yourself code.
Always separate the logic from the UI.





