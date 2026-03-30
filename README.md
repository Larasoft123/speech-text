# 🎙️ Openvoice: Speech-to-Text Local y Privado

Este proyecto es una implementación de transcripción de audio a texto que corre íntegramente en el navegador, priorizando la privacidad del usuario y la eficiencia técnica.

[![Next.js 16](https://img.shields.io/badge/Next.js-16.2.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2.4-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Transformers.js](https://img.shields.io/badge/Transformers.js-v3-FFD21E?style=for-the-badge&logo=huggingface)](https://huggingface.co/docs/transformers.js/)

---

## 🎯 ¿Qué soluciona?

La mayoría de las herramientas de transcripción actuales dependen de APIs pagas o servicios en la nube que procesan tus datos en servidores externos. **Openvoice** elimina esa dependencia procesando todo de forma local:

- **Privacidad Total:** Tus audios nunca salen de tu computadora. El procesamiento se hace mediante Web Workers en el cliente.
- **Cero Costos de API:** Al usar modelos ONNX ejecutados por Transformers.js, no dependés de cuotas de OpenAI o Google.
- **Offline-Ready:** Una vez descargado el modelo, la herramienta puede funcionar sin conexión a internet.

---

## 🎨 Principios de la Interfaz

La UI se construyó bajo principios de diseño moderno que buscan claridad y profundidad sin recurrir a elementos pesados:

- **Tonal Layering:** Uso de capas tonales para separar contextos sin necesidad de bordes sólidos.
- **Glassmorphism:** Paneles sutiles con `backdrop-blur` para mantener la fluidez visual.
- **Ambient Lift:** Manejo de sombras ambientales para generar jerarquía visual de forma natural.
- **No-Line Rule:** La separación de elementos se logra mediante el espacio y el contraste tonal, evitando el ruido visual de los divisores tradicionales.

---

## 🛠️ Stack Tecnológico

- **Next.js 16 (App Router):** Estructura de rutas moderna y optimizada por el servidor.
- **React 19:** Implementación de componentes con el último motor de renderizado y hooks.
- **Tailwind CSS v4:** Configuración nativa basada en variables CSS para un sistema de diseño más liviano.
- **Transformers.js:** Ejecución de modelos de inteligencia artificial (Whisper) directamente en el navegador a través de ONNX.

---

## 📁 Estructura del Proyecto

```text
src/
├── app/            # Rutas y layouts principales
├── landing/        # Componentes de la interfaz de presentación
├── shared/         # Biblioteca de componentes UI y utilidades
├── lib/            # Lógica de Transformers.js, hooks y configuración de IA
└── docs/           # Documentación técnica del sistema de diseño
```

---

## ⚙️ Instalación y Desarrollo

1.  **Cloná el repositorio:**
    ```bash
    git clone e:/Proyectos/speech-text
    ```
2.  **Instalá las dependencias:**
    ```bash
    npm install
    ```
3.  **Iniciá el servidor local:**
    ```bash
    npm run dev
    ```
4.  Abrí `http://localhost:3000` para probar la transcripción local.

---

## 🧠 Guía para Desarrolladores

Si vas a meter mano en el código, revisá los documentos técnicos en `/docs`. Ahí detallamos cómo se manejan los tokens de color, la tipografía y los patrones de componentes para mantener la coherencia técnica del proyecto.

**¡Dale que es por acá!** 🚀
