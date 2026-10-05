# A ras de suelo

Filosofía aplicada a problemas modernos. Sitio estático construido con [Eleventy](https://www.11ty.dev/) (JavaScript), pensado para desplegarse gratis en GitHub Pages.

## Desarrollo local

```bash
npm install
npm run serve   # servidor local con recarga en caliente
npm run build   # genera el sitio en _site/
```

## Estructura

- `src/posts/*.md` — los 36 ensayos, uno por archivo, con front matter (`title`, `date`, `tema`, `escuela`, `excerpt`).
- `src/_data/` — datos globales: `site.js` (metadatos del sitio), `temasMeta.js` y `escuelasMeta.js` (etiquetas legibles para las categorías).
- `src/_includes/layouts/` — plantillas base (`base.njk`) y de ensayo (`post.njk`).
- `src/_includes/partials/ad-*.njk` — los cuatro huecos publicitarios (ver abajo).
- `src/css/style.css`, `src/js/main.js`, `src/js/search.js` — estilo y comportamiento, sin dependencias externas.
- `scripts/build-posts.js` — script que generó los 36 archivos de `src/posts/` a partir de los datos migrados desde WordPress. No hace falta volver a ejecutarlo salvo que se reimporte contenido.

## Huecos publicitarios (solo placeholders — "ANUNCIO")

Ningún anuncio real está integrado; todo son huecos marcados, listos para pegar el código de un proveedor de anuncios (AdSense u otro) el día que se active:

1. **Banner horizontal** (728×90) — debajo del título, en cada ensayo.
2. **Rectángulo** (336×280) — insertado a mitad del listado de ensayos y en algunos puntos del archivo.
3. **Tarjeta deslizante** (300×250) — aparece en la esquina inferior derecha a los 8 segundos o al pasar el 30% de scroll, con botón de cierre. Es la versión del antiguo "pop-up" pero sin bloquear la pantalla, acorde al diseño editorial.
4. **Notificación de esquina** (250×80) — fija en la esquina inferior izquierda, con botón de cierre.

Cerrar un hueco lo oculta solo durante esa sesión de navegador (`sessionStorage`); vuelve a aparecer en la siguiente visita.

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
permalink: "/ensayos/slug-del-ensayo/"
layout: layouts/post.njk
---
```

El valor de `tema` debe coincidir exactamente con una de las claves de `src/_data/temasMeta.js`, y `escuela` con una clave de `src/_data/escuelasMeta.js` (en minúsculas, tal como están ahí). Un push a `main` con el archivo nuevo despliega el ensayo automáticamente.
