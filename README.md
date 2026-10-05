# A ras de suelo

Filosofía aplicada a problemas modernos. Sitio estático construido con [Eleventy](https://www.11ty.dev/) (JavaScript), pensado para desplegarse gratis en GitHub Pages.

## Desarrollo local

```bash
npm install
npm run serve   # servidor local con recarga en caliente
npm run build   # genera el sitio en _site/
```

## Estructura

- `src/posts/*.md` — los 36 ensayos, uno por archivo, con front matter (`title`, `date`, `tema`, `escuela`, `excerpt`, `heroImage`).
- `src/_data/` — datos globales: `site.js` (metadatos del sitio), `temasMeta.js` y `escuelasMeta.js` (etiquetas legibles y el color de acento de cada categoría).
- `src/_includes/layouts/` — plantillas base (`base.njk`) y de ensayo (`post.njk`).
- `src/_includes/partials/post-card.njk` — la tarjeta con imagen que se reutiliza en portada, archivo, temas y escuelas.
- `src/_includes/partials/ad-*.njk` — los cuatro huecos publicitarios (ver abajo).
- `src/images/hero/*.svg` — una imagen de cabecera distinta por ensayo (ver abajo).
- `src/css/style.css`, `src/js/main.js`, `src/js/search.js` — estilo y comportamiento, sin dependencias externas.
- `scripts/build-posts.js` — script que generó los 36 archivos de `src/posts/` a partir de los datos migrados desde WordPress. No hace falta volver a ejecutarlo salvo que se reimporte contenido.
- `scripts/generate-hero-images.js` — script que generó las imágenes de `src/images/hero/`. Vuelve a ejecutarlo (`node scripts/generate-hero-images.js`) si añades ensayos nuevos a mano y necesitas su imagen.
- `src/ads.txt.njk` — genera `/ads.txt` a partir de `site.adsense.publisherId`. No hace falta tocarlo nunca a mano (ver "Activar Google AdSense" abajo).

## Imágenes de cabecera

Cada ensayo tiene una ilustración abstracta propia (`src/images/hero/<slug>.svg`), generada por `scripts/generate-hero-images.js`: nada de bancos de fotos ni API keys. El color sale del `tema` del ensayo (`temasMeta.js`) y la composición (círculos, arcos, líneas, ondas o triángulos) se elige de forma determinista a partir del slug, así que cada ensayo tiene siempre la misma imagen aunque se regenere el sitio. Aparecen como cabecera a ancho completo en cada ensayo, como miniatura en las tarjetas de los listados, y como miniatura pequeña en los resultados de búsqueda.

Para un ensayo nuevo escrito a mano (ver "Añadir el ensayo diario" más abajo), genera su imagen con:

```bash
node scripts/generate-hero-images.js
```

(el script procesa `articles.json`, así que para un ensayo que no viene de ese archivo basta con copiar el patrón de cualquier `.svg` existente y cambiar el `slug` en el nombre del archivo, o llamar a la función `generateSvg(slug, color)` del script a mano).

## Huecos publicitarios

Cuatro huecos, pensados para no romper el diseño editorial:

1. **Banner horizontal** (728×90) — debajo del título, en cada ensayo.
2. **Rectángulo** (336×280) — insertado a mitad del listado de ensayos y en algunos puntos del archivo.
3. **Tarjeta deslizante** (300×250) — aparece en la esquina inferior derecha a los 8 segundos o al pasar el 30% de scroll, con botón de cierre. Es la versión del antiguo "pop-up" pero sin bloquear la pantalla, acorde al diseño editorial.
4. **Notificación de esquina** (250×80) — fija en la esquina inferior izquierda, con botón de cierre.

Cerrar un hueco lo oculta solo durante esa sesión de navegador (`sessionStorage`); vuelve a aparecer en la siguiente visita.

Mientras no haya una cuenta de AdSense aprobada y configurada (ver abajo), los cuatro son placeholders con el texto "ANUNCIO" — no hay ningún código de anuncio real cargándose en el sitio. En cuanto se configura AdSense, el banner y el rectángulo pasan a mostrar anuncios reales automáticamente; la tarjeta deslizante y la notificación de esquina se quedan como placeholder a propósito (ver por qué en la sección de AdSense).

## Activar Google AdSense

El sitio está preparado para AdSense, pero **no hay ninguna cuenta conectada todavía** — hace falta que Darío complete el proceso de alta, porque requiere verificar la propiedad del dominio y pasar la revisión de Google, algo que solo puede hacer el dueño de la cuenta.

### 1. Requisitos antes de solicitar

- El sitio tiene que estar ya publicado y accesible (ver "Despliegue en GitHub Pages" abajo) — Google revisa el sitio en vivo, no el código.
- Contenido original suficiente: los 36 ensayos ya cumplen esto de sobra.
- Páginas legales: AdSense pide normalmente una página de política de privacidad. Este repositorio no incluye una todavía — hay que añadirla antes de solicitar (puede ser una página Eleventy más, en `src/privacidad.njk`).

### 2. Solicitar la cuenta

1. Entra en [adsense.google.com](https://adsense.google.com) con la cuenta de Google que vaya a gestionar el sitio.
2. Añade el sitio (`https://furabolos5.github.io/arasdesuelo` si se usa el subdominio gratuito, o el dominio propio si se conecta uno).
3. Google da un snippet con el `publisherId` (formato `ca-pub-XXXXXXXXXXXXXXXX`) para verificar el sitio. Pégalo en `src/_data/site.js`, en `adsense.publisherId` — en cuanto esté ahí, el sitio inserta automáticamente la etiqueta de verificación y el script de AdSense en el `<head>` de cada página.
4. Haz commit y push; el despliegue automático (GitHub Actions) publica el cambio y Google puede verificar el sitio.
5. La revisión de Google suele tardar entre unos días y unas semanas. Hasta que apruebe, el sitio sigue funcionando exactamente igual (los huecos se quedan en modo "ANUNCIO").

### 3. Una vez aprobada la cuenta

1. En el panel de AdSense, crea **dos unidades de anuncio manuales** ("Anuncios en el contenido" / "display"): una para el banner, otra para el rectángulo. Cada una te da un `data-ad-slot` (una tira de números).
2. Pega esos dos IDs en `src/_data/site.js`, en `adsense.slots.banner` y `adsense.slots.rect`.
3. Commit y push. El próximo build sustituye esos dos placeholders por los anuncios reales — no hay que tocar ninguna plantilla.
4. `ads.txt` (en `https://tu-sitio/ads.txt`) se genera solo a partir del mismo `publisherId`, así que tampoco hace falta editarlo a mano.

### 4. Por qué la tarjeta deslizante y la notificación de esquina no se conectan

Un anuncio que aparece flotando sobre el contenido con un temporizador o al hacer scroll — que es justo lo que hacen esos dos huecos — choca con las políticas de ubicación de anuncios de Google (nada de anuncios estilo pop-up o revelados de forma artificial). Montar esos dos a mano con AdSense es arriesgarse a una suspensión de la cuenta.

La alternativa correcta, si se quiere un anuncio flotante de verdad, es activar **Auto ads → Anchor ads** desde el propio panel de AdSense: es el formato que Google diseñó y aprueba para esto exactamente, se activa con un interruptor (sin tocar código) y Google decide cuándo y cómo mostrarlo dentro de sus propias reglas. Esos dos huecos del sitio se quedan como decoración ("ANUNCIO") independientemente de si se activa Auto ads o no — son dos cosas separadas y no hace falta hacer nada en el código para usar Auto ads.

## Activar los comentarios (Giscus)

Los comentarios usan [Giscus](https://giscus.app/), que guarda los hilos como GitHub Discussions del propio repositorio — gratis, sin backend.

1. Activa "Discussions" en la configuración del repositorio de GitHub (Settings → General → Features).
2. Ve a [giscus.app](https://giscus.app/es), introduce `Furabolos5/arasdesuelo` como repositorio y sigue los pasos.
3. Copia los valores `data-repo-id` y `data-category-id` que te da la página.
4. Pégalos en `src/_data/site.js`, en los campos `giscus.repoId` y `giscus.categoryId`.
5. Vuelve a desplegar (push a `main`; el flujo de GitHub Actions reconstruye el sitio solo).

## Despliegue en GitHub Pages

El repositorio ya incluye el flujo `.github/workflows/deploy.yml`: cada push a `main` construye el sitio y lo publica automáticamente.

Para activarlo la primera vez:

1. En GitHub, ve a **Settings → Pages** y, en "Build and deployment", selecciona **GitHub Actions** como fuente (en vez de "Deploy from a branch").
2. Haz el primer push (ver abajo). El workflow se ejecuta solo y, al terminar, el sitio queda publicado en `https://furabolos5.github.io/arasdesuelo/`.

```bash
git init
git add .
git commit -m "Sitio inicial: A ras de suelo en Eleventy"
git remote add origin https://github.com/Furabolos5/arasdesuelo.git
git branch -M main
git push -u origin main
```

## Añadir el ensayo diario

Cada ensayo nuevo es un archivo Markdown en `src/posts/` con este front matter:

```yaml
---
title: "Título del ensayo"
date: 2026-10-06
tema: "ansiedad digital"
escuela: "estoicismo"
excerpt: "Primera frase o dos, para la vista previa."
heroImage: "/images/hero/slug-del-ensayo.svg"
permalink: "/ensayos/slug-del-ensayo/"
layout: layouts/post.njk
---
```

El valor de `tema` debe coincidir exactamente con una de las claves de `src/_data/temasMeta.js`, y `escuela` con una clave de `src/_data/escuelasMeta.js` (en minúsculas, tal como están ahí). Antes del primer push para ese ensayo, genera su imagen de cabecera (ver "Imágenes de cabecera" arriba) para que `heroImage` apunte a un archivo que existe de verdad. Un push a `main` con el archivo nuevo despliega el ensayo automáticamente.
