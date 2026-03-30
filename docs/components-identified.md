# Componentes Identificados del Diseño

> Análisis del HTML generado por Stitch del proyecto "Dashboard & Grabación/Carga"

---

## Screens Analizadas

| Screen | Título | Componentes |
|--------|--------|-------------|
| `b41de65e...` | Dashboard & Grabación/Carga | TopNav, SideNav, DropZone, ProjectCards, Footer |
| `664fb46c...` | Editor de Transcripción | Editor, Toolbar, Preview |
| `18333bc5...` | Biblioteca de Proyectos | Grid de ProjectCards, Filtros |
| `719093cc...` | Traducción y Voz (TTS) | Translator, VoiceControls |

---

## Componentes del Dashboard

### 1. TopNavBar (Header Fijo)

```
┌─────────────────────────────────────────────────────────────────┐
│ OpenVoice    Projects  Library  Automation    🔔 ⚙️  [Avatar] │
└─────────────────────────────────────────────────────────────────┘

Props:
- fixed top-0
- h-16 (64px)
- bg-surface/80 + backdrop-blur-xl
- shadow-[0_20px_40px_rgba(229,43,80,0.04)]
- z-50
```

**Elementos:**
- Logo "OpenVoice" (bold, tracking-tighter)
- Nav links (Projects activo con border-b)
- Notification icon button
- Settings icon button
- User avatar (w-8 h-8 rounded-full)

---

### 2. SideNavBar (Sidebar Lateral)

```
┌──────────────────┐
│ [Logo] Editorial │
│      Lab          │
│   Premium Tier    │
├──────────────────┤
│ 📊 Dashboard     │  ← activo (bg-surface-container)
│ 📝 Transcriptions│
│ 🌐 Translations  │
│ 🎤 Voice Studio  │
│ 📦 Archive       │
├──────────────────┤
│ [+ New Recording]│  ← CTA gradiente
├──────────────────┤
│ ❓ Help Center   │
│ 👤 Account       │
└──────────────────┘

Props:
- fixed left-0 top-16
- w-64
- h-[calc(100vh-64px)]
- bg-surface-container-lowest
- border-r border-outline-variant/20
```

**Elementos:**
- Logo card (w-10 h-10 rounded-lg)
- Tier badge "Premium Tier" (uppercase, tracking-widest)
- Nav items con iconos Material Symbols
- Nav activo: `bg-surface-container text-slate-100`
- Nav hover: `hover:translate-x-1` animation
- CTA "New Recording" (gradiente)
- Footer links (Help, Account)

---

### 3. DropZone (Upload Area)

```
┌─────────────────────────────────────────┐
│                                         │
│            [☁️ cloud_upload]            │
│                                         │
│      Drop audio or video files          │
│   Supports MP3, WAV, MP4 up to 2GB     │
│                                         │
│          [Browse Files]                 │
│                                         │
└─────────────────────────────────────────┘

Props:
- bg-surface-container-low/50 + backdrop-blur-sm
- rounded-[2rem] (24px)
- border-2 border-dashed border-outline-variant/20
- hover:border-primary/40
- glow-subtle (shadow)
- p-16 (64px padding)
```

**Estados:**
- Default: dashed border sutil
- Hover: border-primary/40 + icon scale-110
- Active: ?

---

### 4. Live Session Card

```
┌─────────────────────────────┐
│ [LIVE SESSION]              │
│                             │
│    Capture Voice            │
│    Professional studio...   │
│                             │
│    ▂▄▆█▆▄▂  (waveform)     │
│                             │
│    [🎤 Start Recording]     │
│                             │
└─────────────────────────────┘

Props:
- bg-surface-container-lowest/40 + backdrop-blur-md
- rounded-[2rem]
- border border-outline-variant/10

Elementos:
- Badge: bg-secondary/10 text-secondary
- Waveform bars con gradiente primary
- Glow effect: bg-primary/10 blur-3xl
- Button: hover:bg-primary/10 hover:text-primary
```

---

### 5. ProjectCard (Card de Proyecto)

```
┌─────────────────────────────┐
│ [📄]              [👤][👤] │
│                             │
│ Executive Board Meeting.mp3 │
│                             │
│ ⏱ 42:10    🌐 FR, EN       │
└─────────────────────────────┘

Props:
- bg-surface-container-high/40
- hover:bg-surface-container-high
- rounded-2xl
- p-6
- border-transparent → hover:border-outline-variant/10
- transition-all duration-300
```

**Variantes:**
1. **Audio** - icon `audio_file` color secondary
2. **Video** - icon `video_file` color tertiary + badge "Processing"
3. **Text** - icon `text_snippet` color primary + pin icon

**Estados:**
- Default: bg-opacity 40%
- Hover: bg-opacity 100% + border + title text-primary

---

### 6. Progress Card

```
┌─────────────────────────────┐
│ [📹]  [PROCESSING]         │
│                             │
│ Podcast S02E04_Draft.mp4    │
│                             │
│ ████████████░░░░░░░  67%   │
└─────────────────────────────┘

Props:
- Progress bar: bg-surface-container-lowest h-1
- Fill: bg-primary rounded-full
```

---

### 7. Footer

```
┌─────────────────────────────────────────────────────────────────┐
│  © 2024 OpenVoice AI • Ethereal Tool v2.0    Status Privacy… │
└─────────────────────────────────────────────────────────────────┘

Props:
- fixed bottom-0
- right-0
- w-[calc(100%-256px)]
- h-10
- bg-surface-container-lowest
- border-t border-outline-variant/10
```

---

## Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ TopNav (fixed, h-16)                                            │
├──────────┬──────────────────────────────────────────────────────┤
│          │                                                      │
│ SideNav  │  Main Content                                        │
│ (w-64)   │  max-w-6xl mx-auto px-12 py-12                      │
│          │                                                      │
│          │  ┌─ Hero/Upload Section ─────────────────────────┐    │
│          │  │  DropZone (col-span-8)  │ LiveSession(col-4)│    │
│          │  └───────────────────────────────────────────────┘    │
│          │                                                      │
│          │  ┌─ Recent Workspace ──────────────────────────┐    │
│          │  │  ProjectCard │ ProjectCard │ ProjectCard     │    │
│          │  └───────────────────────────────────────────────┘    │
│          │                                                      │
├──────────┴──────────────────────────────────────────────────────┤
│ Footer (fixed, h-10, w-[calc(100%-256px)])                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Colors Usage Map

| Componente | Background | Text | Border |
|------------|------------|------|--------|
| TopNav | `surface/80` + blur | `slate-100` | shadow |
| SideNav | `surface-container-lowest` | `slate-500` / `slate-100` | `outline-variant/20` |
| DropZone | `surface-container-low/50` + blur | `slate-100` | `outline-variant/20` dashed |
| LiveSession | `surface-container-lowest/40` + blur | `slate-100` / `secondary` | `outline-variant/10` |
| ProjectCard | `surface-container-high/40` | `slate-100` → `primary` | transparent → `outline-variant/10` |
| Nav item active | `surface-container` | `slate-100` + `primary` icon | - |
| Nav item hover | `surface-container/50` | `slate-300` | - |

---

## Iconos Material Symbols

```html
<!-- Nav icons -->
<span class="material-symbols-outlined">dashboard</span>
<span class="material-symbols-outlined">description</span>
<span class="material-symbols-outlined">translate</span>
<span class="material-symbols-outlined">mic</span>
<span class="material-symbols-outlined">inventory_2</span>

<!-- File icons -->
<span class="material-symbols-outlined">audio_file</span>
<span class="material-symbols-outlined">video_file</span>
<span class="material-symbols-outlined">text_snippet</span>

<!-- UI icons -->
<span class="material-symbols-outlined">cloud_upload</span>
<span class="material-symbols-outlined">notifications</span>
<span class="material-symbols-outlined">settings</span>
<span class="material-symbols-outlined">push_pin</span>
<span class="material-symbols-outlined">schedule</span>
<span class="material-symbols-outlined">calendar_today</span>
<span class="material-symbols-outlined">group</span>

<!-- Icon weights -->
<span class="material-symbols-outlined" data-weight="fill">mic</span>
```

---

## Border Radius Usage

| Componente | Radius | Clase Tailwind |
|------------|--------|---------------|
| TopNav | - | - |
| SideNav | rounded-lg | 8px |
| DropZone | rounded-[2rem] | 24px |
| LiveSession | rounded-[2rem] | 24px |
| ProjectCard | rounded-2xl | 16px |
| Nav item | rounded-lg | 8px |
| Buttons | rounded-full / rounded-xl | 9999px / 12px |
| Icons container | rounded-xl | 12px |
| Badges | rounded-full | 9999px |
