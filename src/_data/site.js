module.exports = {
  title: "A ras de suelo",
  tagline: "Filosofía aplicada a problemas de hoy",
  description:
    "Estoicismo, existencialismo, taoísmo y absurdismo traducidos en respuestas concretas para el agotamiento, la ansiedad digital, las citas y la parálisis de decidir.",
  url: "https://arasdesuelo.com",
  author: "A ras de suelo",
  lang: "es",
  // Etiqueta de verificación de Google Search Console (solo el valor de content).
  googleVerification: "L4N4bO6f_xwRmvl-kaEK-ywIFMRiLDSeSVeMJnKBMik",
  // Giscus (GitHub Discussions comments) — fill these in after enabling
  // Discussions on the repo and registering the repo at giscus.app.
  giscus: {
    repo: "Furabolos5/arasdesuelo",
    repoId: "PON_AQUI_EL_REPO_ID",
    category: "Comentarios",
    categoryId: "PON_AQUI_EL_CATEGORY_ID",
  },

  // Google AdSense. Deja publisherId vacío hasta tener la cuenta aprobada:
  // con el campo vacío, el sitio sigue construyéndose igual y sigue
  // mostrando los huecos "ANUNCIO" de siempre (no hace falta ningún otro
  // cambio durante la revisión de Google). En cuanto apruebe la cuenta,
  // rellena publisherId (algo como "ca-pub-1234567890123456") y crea dos
  // unidades de anuncio manuales en adsense.com — banner y rectángulo — y
  // pega aquí sus IDs de bloque ("data-ad-slot"). A partir de ese momento
  // el build sustituye esos dos placeholders por anuncios reales.
  //
  // Los huecos "tarjeta deslizante" y "notificación de esquina" se quedan
  // siempre como placeholder: un anuncio flotante que aparece con un
  // temporizador o al hacer scroll choca con las políticas de ubicación de
  // Google. Para un anuncio flotante real, activa "Anchor ads" desde Auto
  // ads en el panel de AdSense — es el formato que Google aprueba para
  // esto, sin tocar código. Ver README → "Activar Google AdSense".
  adsense: {
    publisherId: "",
    slots: {
      banner: "", // 728×90, debajo del título de cada ensayo
      rect: "", // 336×280, insertado en los listados
    },
  },
};
