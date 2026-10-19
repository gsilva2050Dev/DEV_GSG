# Changelog

## 2026-10-19 (4) — Movimiento de las ilustraciones más robusto y visible
- Parallax más amplio (capas hasta 70px) y giro de antenas hasta 40°.
- Las ilustraciones empiezan activas sin depender de `IntersectionObserver` (antes podían quedarse paradas si el navegador no lo notificaba).
- En pantallas de menos de 860px las ilustraciones ya no se ocultan: se muestran más pequeñas y tenues detrás del contenido.
- CSS, JS y foto con parámetro de versión (`?v=`) para evitar que el navegador sirva archivos antiguos en caché. Subir el valor en cada cambio.
- Verificación: ALL_PASS; en Chrome headless se confirma que el cursor actualiza el parallax, pero el tiempo virtual de headless no ejecuta la animación continua, así que el movimiento fluido hay que comprobarlo en un navegador real.

## 2026-10-19 (3) — Foto de cuerpo entero y secciones más compactas
- Foto de perfil a cuerpo entero (`assets/gustavo-profile.jpg`, 810×1440, proporción 9:16 original, sin recortar ni deformar) en un marco redondeado de 270×480px (162×288px en móvil).
- Espacio entre secciones reducido un 15%: altura mínima de cada sección de 100vh a 85vh y relleno vertical de 3rem a 2.55rem. El hero mantiene 100vh.
- Prueba de humo actualizada: foto 270×480 con proporción 9:16 y altura mínima de paneles. ALL_PASS.

## 2026-10-19 (2) — Marca personal, ilustraciones animadas, foto y tipografía

### Diseño
- Paleta de marca personal (extraída de los posts de LinkedIn de `Projects/Marca personal`): navy `#0b1f3a`, azul `#4c7dd0` y escala de grises azulados. Tokens `--brand-navy`, `--brand-blue`, `--white`; en oscuro el acento se aclara a `#6c97e0` y en claro se oscurece a `#3b66b5` para mantener contraste AA.
- Logo "GSG" como insignia blanca con la S azul, igual que en los posts.
- Tipografía: Arial en toda la web (títulos en negrita).
- Foto de perfil nueva (`assets/gustavo-profile.jpg`, recorte 1:1 de `IMG_3281.jpeg`, sin deformar) en cuadrado redondeado de 320px (200px en móvil), con inclinación 3D al mover el cursor. Se eliminan las fotos anteriores.
- Dos ilustraciones SVG animadas con paleta de marca: un satélite en el hero (órbitas con nodos en movimiento, ondas de señal) y una torre de telecomunicaciones en contacto (celosía, parábolas, baliza y ondas expansivas). Reaccionan al cursor con parallax por capas, las antenas/parábolas giran hacia el puntero y también se mueven con el scroll (útil en táctil). Se pausan fuera de pantalla y con `prefers-reduced-motion`; se ocultan por debajo de 860px.

### Seguridad
- Las ilustraciones son SVG inline sin scripts ni estilos inline: compatibles con la CSP (`script-src 'self'; style-src 'self'`). Sin recursos externos.

### Verificación
- `bash tests/run.sh`: ALL_PASS (nuevas comprobaciones: foto 1:1 de 320px, esquinas redondeadas, Arial en cuerpo y títulos, dos ilustraciones con capas de parallax, navy de marca en oscuro).
- Contraste calculado: texto, muted, acento y botones >= 4.5:1 en ambos temas; el color secundario `#4c7dd0` solo en elementos decorativos.
- Capturas revisadas: escritorio oscuro/claro, móvil (iframe 390px), torre y satélite.

## 2026-10-19 — Rediseño editorial dinámico + contenido desde CV Master 2026

### Diseño y experiencia
- Rediseño editorial minimalista inspirado en eudaimonias.me: 7 secciones numeradas, barra superior fija (logo, timecode, contador de sección "02 / 07", idioma y tema) y dock inferior fijo con la sección activa.
- Barra de progreso de scroll, aparición escalonada de elementos, contadores animados de estadísticas y fondo del hero con degradado animado.
- Trayectoria como carrusel horizontal (flechas, teclado ←/→, arrastre con ratón, contador).
- Cursor personalizado, brillo que sigue al puntero en tarjetas y botones magnéticos (solo punteros finos).
- Respeto de `prefers-reduced-motion`: sin animaciones, todo visible.
- Menú móvil a pantalla completa.

### Contenido (fuente: `CV_Master_Gustavo_Silva_EN_2030skills`)
- Titular: "Digital Transformation & AI Director / Manager".
- Perfil reescrito (Agile Coach, PMP, base técnica Java/Microsoft/AWS, competencias 2030) y situación actual: profesor asociado en Nebrija y asesor independiente de IA para pymes desde feb. 2026.
- Trayectoria ampliada a 8 roles con resultados medibles; nuevo rol Nebrija; Colt separado en Presales y Product Marketing.
- Nueva sección de certificaciones (Agile Coach, PMP, ITIL Foundation).
- Proyectos reescritos; textos ES/EN completos vía `js/i18n.js`.

### Seguridad
- Content-Security-Policy por `<meta>`: `default-src 'none'`; scripts, estilos, imágenes y fuentes solo `'self'` (imágenes también `data:`); `base-uri 'none'`; `form-action 'none'`.
- `referrer` = `strict-origin-when-cross-origin`.
- Sin `eval`, `innerHTML`, `document.write` ni handlers inline; todos los `target="_blank"` con `rel="noopener noreferrer"`.
- Sin dependencias de terceros (sin CDN, sin tracking, sin formularios).

### Calidad
- Colores sueltos movidos a tokens CSS (`--ok`, `--ok-rgb`, `--on-accent`).
- `tests/smoke-test.html`: la comprobación de trayectoria ahora valida 8 entradas del carrusel.
- README actualizado con la nueva estructura.

### Verificación realizada
- `bash tests/run.sh`: ALL_PASS.
- Consola de Chrome sin errores de página ni violaciones de CSP.
- Capturas revisadas: ES/claro, EN/oscuro (escritorio) y móvil (390px vía iframe).
- Checklist `portfolio-review`: i18n completo en ES y EN, alt/aria-label, enlaces externos, tokens de color.
