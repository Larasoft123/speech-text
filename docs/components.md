# Guía de Componentes - Dashboard de Transcripción

> ⚠️ **Tailwind CSS v4** - Usar clases de Tailwind nativas + CSS custom cuando sea necesario.

---

## Buttons

### Primary Button (CTA)

```html
<!-- Gradiente primary con shadow glow -->
<button class="
  px-8 py-3 
  bg-gradient-to-r from-primary to-primary-container 
  text-on-primary 
  font-bold 
  rounded-xl 
  text-sm 
  shadow-lg 
  shadow-primary/10
  hover:opacity-90 
  active:scale-[0.98] 
  transition-all
">
  New Recording
</button>
```

### Secondary Button

```html
<button class="
  px-8 py-3 
  bg-surface-container-highest 
  text-slate-200 
  rounded-full 
  text-sm 
  font-medium 
  hover:bg-surface-bright 
  transition-colors
  border border-outline-variant/10
">
  Browse Files
</button>
```

### Tertiary Button (Ghost)

```html
<button class="
  text-primary 
  hover:opacity-80 
  transition-opacity
  text-xs 
  font-bold 
  uppercase 
  tracking-widest
">
  View All Library
</button>
```

### Icon Button

```html
<button class="
  p-2 
  text-slate-400 
  hover:bg-surface-container-high 
  rounded-full 
  transition-all 
  duration-300 
  active:scale-95
">
  <span class="material-symbols-outlined">notifications</span>
</button>
```

---

## Navigation

### TopNavBar

```html
<header class="
  fixed top-0 w-full z-50 
  bg-surface/80 
  backdrop-blur-xl 
  flex justify-between items-center 
  px-8 h-16 
  shadow-[0_20px_40px_rgba(229,43,80,0.04)]
">
  <div class="flex items-center gap-8">
    <span class="text-xl font-bold tracking-tighter text-slate-100">
      OpenVoice
    </span>
    <nav class="hidden md:flex items-center gap-6 text-sm font-medium">
      <a class="text-[#E52B50] border-b-2 border-[#E52B50] pb-1" href="#">
        Projects
      </a>
      <a class="text-slate-400 hover:text-slate-100 transition-colors" href="#">
        Library
      </a>
    </nav>
  </div>
  <div class="flex items-center gap-4">
    <!-- Icon buttons -->
    <button class="p-2 text-slate-400 hover:bg-surface-container-high rounded-full">
      <span class="material-symbols-outlined">notifications</span>
    </button>
    <!-- Avatar -->
    <div class="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden 
                border border-outline-variant/20">
      <img src="..." alt="User profile" />
    </div>
  </div>
</header>
```

### SideNavBar

```html
<aside class="
  fixed left-0 top-16 
  h-[calc(100vh-64px)] w-64 
  bg-surface-container-lowest 
  flex flex-col 
  border-r border-outline-variant/20 
  z-40
">
  <!-- Logo/Tier section -->
  <div class="px-6 py-8">
    <div class="flex items-center gap-3 mb-8">
      <div class="w-10 h-10 rounded-lg bg-surface-container 
                  flex items-center justify-center 
                  border border-outline-variant/10">
        <span class="material-symbols-outlined text-primary">temp_preferences_custom</span>
      </div>
      <div>
        <h2 class="text-sm font-bold text-slate-100">Editorial Lab</h2>
        <p class="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Premium Tier</p>
      </div>
    </div>
    
    <!-- Navigation -->
    <nav class="space-y-1">
      <!-- Active item -->
      <a class="flex items-center gap-3 px-4 py-2.5 
                 bg-surface-container text-slate-100 rounded-lg 
                 text-sm font-medium transition-colors" href="#">
        <span class="material-symbols-outlined text-primary">dashboard</span>
        Dashboard
      </a>
      <!-- Inactive item -->
      <a class="flex items-center gap-3 px-4 py-2.5 
                 text-slate-500 hover:text-slate-300 
                 hover:bg-surface-container/50 rounded-lg 
                 text-sm font-medium transition-colors 
                 hover:translate-x-1 duration-300" href="#">
        <span class="material-symbols-outlined">description</span>
        Transcriptions
      </a>
    </nav>
  </div>
  
  <!-- CTA Button -->
  <div class="mt-8 px-6">
    <button class="w-full py-3 
                   bg-gradient-to-r from-primary to-primary-container 
                   text-on-primary font-bold rounded-xl text-sm 
                   shadow-lg shadow-primary/10 
                   active:scale-[0.98] transition-all">
      New Recording
    </button>
  </div>
  
  <!-- Footer nav -->
  <div class="mt-auto px-6 py-8 border-t border-outline-variant/10">
    <nav class="space-y-1">
      <a class="flex items-center gap-3 px-4 py-2 
                 text-slate-600 hover:text-[#E52B50] 
                 text-sm font-medium transition-colors" href="#">
        <span class="material-symbols-outlined">help</span>
        Help Center
      </a>
    </nav>
  </div>
</aside>
```

---

## Cards

### Project Card

```html
<div class="
  bg-surface-container-high/40 
  hover:bg-surface-container-high 
  transition-all duration-300 
  rounded-2xl p-6 
  group cursor-pointer 
  border border-transparent 
  hover:border-outline-variant/10
">
  <div class="flex justify-between items-start mb-6">
    <!-- Icon -->
    <div class="p-3 bg-surface-container rounded-xl">
      <span class="material-symbols-outlined text-secondary">audio_file</span>
    </div>
    <!-- Team avatars -->
    <div class="flex -space-x-2">
      <div class="w-6 h-6 rounded-full border-2 border-surface-container 
                  bg-surface-container overflow-hidden">
        <img src="..." alt="Team member" />
      </div>
    </div>
  </div>
  
  <!-- Title -->
  <h4 class="font-bold text-slate-100 group-hover:text-primary transition-colors">
    Executive Board Meeting.mp3
  </h4>
  
  <!-- Metadata -->
  <div class="flex items-center gap-4 mt-4">
    <span class="text-[10px] text-slate-500 flex items-center gap-1 uppercase tracking-wider">
      <span class="material-symbols-outlined text-[14px]">schedule</span>
      42:10
    </span>
    <span class="text-[10px] text-slate-500 flex items-center gap-1 uppercase tracking-wider">
      <span class="material-symbols-outlined text-[14px]">translate</span>
      FR, EN
    </span>
  </div>
</div>
```

### Processing Card (con progress)

```html
<div class="bg-surface-container-high/40 hover:bg-surface-container-high 
             transition-all rounded-2xl p-6 group cursor-pointer">
  <!-- Status badge -->
  <span class="px-2 py-1 rounded bg-primary/10 text-primary 
                text-[10px] font-bold uppercase tracking-wider">
    Processing
  </span>
  
  <!-- Progress bar -->
  <div class="mt-4 w-full bg-surface-container-lowest h-1 rounded-full overflow-hidden">
    <div class="w-2/3 h-full bg-primary rounded-full"></div>
  </div>
  
  <span class="text-[10px] text-slate-500 mt-4">67% Analyzing</span>
</div>
```

---

## Upload / Drop Zone

```html
<div class="
  group relative overflow-hidden 
  bg-surface-container-low/50 
  backdrop-blur-sm 
  rounded-[2rem] 
  border-2 border-dashed border-outline-variant/20 
  hover:border-primary/40 
  transition-all duration-500 
  cursor-pointer 
  flex flex-col items-center justify-center 
  p-16
  glow-subtle
">
  <!-- Icon -->
  <div class="w-20 h-20 rounded-3xl bg-surface-container-high 
              flex items-center justify-center mb-6 
              group-hover:scale-110 transition-transform duration-500">
    <span class="material-symbols-outlined text-4xl text-primary">cloud_upload</span>
  </div>
  
  <h3 class="text-xl font-semibold text-slate-100 mb-2">
    Drop audio or video files
  </h3>
  <p class="text-slate-500 text-sm mb-8">
    Supports MP3, WAV, MP4 up to 2GB
  </p>
  
  <button class="px-8 py-3 bg-surface-container-highest text-slate-200 
                 rounded-full text-sm font-medium 
                 hover:bg-surface-bright transition-colors 
                 border border-outline-variant/10">
    Browse Files
  </button>
</div>
```

### Live Session Card

```html
<div class="
  bg-surface-container-lowest/40 
  backdrop-blur-md 
  rounded-[2rem] p-8 
  border border-outline-variant/10 
  flex flex-col justify-between
">
  <div>
    <span class="inline-block px-3 py-1 rounded-full 
                 bg-secondary/10 text-secondary 
                 text-[10px] font-bold uppercase tracking-widest mb-4">
      Live Session
    </span>
    <h3 class="text-2xl font-bold text-slate-100 mb-2">
      Capture Voice
    </h3>
    <p class="text-slate-500 text-sm">
      Professional studio-grade transcription in real-time.
    </p>
  </div>
  
  <!-- Waveform visualization -->
  <div class="relative py-12 flex items-center justify-center">
    <div class="flex items-center gap-1.5 h-16">
      <div class="w-1.5 h-4 bg-primary/20 rounded-full"></div>
      <div class="w-1.5 h-8 bg-primary/40 rounded-full"></div>
      <div class="w-1.5 h-12 bg-primary/60 rounded-full"></div>
      <div class="w-1.5 h-6 bg-primary/40 rounded-full"></div>
      <div class="w-1.5 h-10 bg-primary/80 rounded-full"></div>
    </div>
    <div class="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-50"></div>
  </div>
  
  <button class="w-full py-4 bg-surface-container-highest 
                 hover:bg-primary/10 hover:text-primary 
                 rounded-2xl flex items-center justify-center gap-3 
                 transition-all font-bold group">
    <span class="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">
      mic
    </span>
    Start Recording
  </button>
</div>
```

---

## Glass Panels

```css
/* Glassmorphism utility */
.glass {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
```

```html
<div class="glass bg-surface-variant/60 rounded-xl border border-outline-variant/10">
  <!-- content -->
</div>
```

---

## Inputs

```html
<input class="
  w-full px-4 py-3 
  bg-surface-container-lowest 
  border border-outline-variant/20 
  rounded-lg 
  text-slate-100 
  placeholder:text-slate-500
  focus:outline-none 
  focus:border-primary/40 
  focus:ring-2 focus:ring-primary/20
  transition-all
" placeholder="Search..." />
```

---

## Progress Bar

```html
<div class="w-full bg-surface-container-lowest h-1 rounded-full overflow-hidden">
  <div class="h-full bg-gradient-to-r from-secondary to-primary-container rounded-full 
              transition-all duration-300" 
       style="width: 67%">
  </div>
</div>
```

---

## Waveform

```html
<div class="flex items-center gap-1.5 h-16">
  <div class="w-1.5 h-4 bg-primary/20 rounded-full animate-pulse"></div>
  <div class="w-1.5 h-8 bg-primary/40 rounded-full animate-pulse"></div>
  <div class="w-1.5 h-12 bg-primary/60 rounded-full animate-pulse"></div>
  <div class="w-1.5 h-6 bg-primary/40 rounded-full animate-pulse"></div>
  <div class="w-1.5 h-10 bg-primary/80 rounded-full animate-pulse"></div>
  <div class="w-1.5 h-4 bg-primary/30 rounded-full animate-pulse"></div>
</div>
```

---

## Chips / Tags

```html
<!-- Status chip -->
<span class="inline-block px-3 py-1 rounded-full 
             bg-secondary/10 text-secondary 
             text-[10px] font-bold uppercase tracking-widest">
  Live Session
</span>

<!-- Language tag -->
<span class="px-2 py-1 rounded bg-primary/10 text-primary 
            text-[10px] font-bold uppercase tracking-wider">
  Processing
</span>

<!-- Avatar stack -->
<div class="flex -space-x-2">
  <div class="w-6 h-6 rounded-full border-2 border-surface-container 
              bg-surface-container overflow-hidden">
    <img src="..." />
  </div>
</div>
```

---

## Footer

```html
<footer class="
  fixed bottom-0 right-0 
  w-[calc(100%-256px)] h-10 
  bg-surface-container-lowest 
  flex justify-between items-center 
  px-12 pt-4 
  border-t border-outline-variant/10 
  z-40
">
  <div class="text-[10px] uppercase tracking-widest text-slate-500">
    © 2024 OpenVoice AI • Ethereal Tool v2.0
  </div>
  <div class="flex gap-6">
    <a class="text-[10px] uppercase tracking-widest text-slate-600 
               hover:text-primary transition-colors" href="#">
      Status
    </a>
  </div>
</footer>
```

---

## Utility Classes Resumen

| Efecto | Clase/CSS |
|--------|-----------|
| Glass blur | `backdrop-blur-xl` (24px) |
| Glow sutil | `glow-subtle` (custom CSS) |
| Tonal shift hover | `hover:bg-surface-container-high` |
| Border fantasma | `border-outline-variant/20` |
| Icono | `material-symbols-outlined` |
| Animación hover | `group-hover:scale-110` |
| Transition | `transition-all duration-300` |
