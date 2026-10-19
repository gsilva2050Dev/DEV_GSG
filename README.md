# DEV_GSG Portfolio

Portafolio estático de Gustavo Silva Gutiérrez, diseñado para mostrar su perfil profesional y su enfoque en transformación digital, IA generativa/agéntica, gobernanza y modernización.

## Estructura del proyecto

- `index.html`: sitio principal con 7 secciones numeradas (inicio, perfil, enfoque, trayectoria, formación, proyectos y contacto), barra superior y dock inferior fijos.
- `css/styles.css`: estilo editorial minimalista, tema claro/oscuro y diseño responsivo.
- `js/script.js`: tema, menú móvil, contador de sección y timecode, barra de progreso, animaciones al hacer scroll, contadores de estadísticas, carrusel de trayectoria, cursor personalizado, brillo en tarjetas y botones magnéticos (los efectos de cursor solo con puntero fino y respetan `prefers-reduced-motion`).
- `js/i18n.js`: traducciones en español e inglés y cambio de idioma.
- `tests/run.sh`: prueba de humo básica para validar el sitio.

## Cómo ejecutar

1. Abre una terminal en la carpeta del proyecto.
2. Ejecuta `python3 -m http.server 8000`.
3. Abre `http://localhost:8000` en tu navegador.

## Cómo probar

```bash
bash tests/run.sh
```

## Qué mejorar a continuación

- actualizar la sección de proyectos con casos de estudio reales.
- reforzar la narración de valor en los textos de presentación y experiencia.
- añadir una descarga de CV y enlaces directos a trabajos concretos.
- preparar el sitio para que sea fácil de mantener y escalar con nuevo contenido.

## Seguridad

- Sitio 100% estático, sin backend, formularios, cookies ni dependencias de terceros.
- `Content-Security-Policy` por `<meta>` en `index.html`: solo recursos propios (`'self'`).
- Sin `eval`, `innerHTML` ni handlers inline; enlaces externos con `rel="noopener noreferrer"`.
- `localStorage` solo guarda `theme` y `lang`.
- Límite conocido: GitHub Pages no permite cabeceras HTTP propias, así que `frame-ancestors`, HSTS y `X-Content-Type-Options` no se pueden fijar desde el sitio (HTTPS lo aplica GitHub Pages). Para cabeceras completas habría que servirlo detrás de Cloudflare/Netlify.
- No subir `.env` ni secretos (ya en `.gitignore`).

Cambios por versión: ver [CHANGELOG.md](CHANGELOG.md).
