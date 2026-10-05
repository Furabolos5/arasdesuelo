const { DateTime } = (() => {
  // Minimal date helper without extra dependency
  return {
    DateTime: {
      fromISO(iso) {
        const d = new Date(iso);
        return {
          toFormat() {
            const months = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
            return `${d.getUTCDate()} de ${months[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
          }
        };
      }
    }
  };
})();

module.exports = function (eleventyConfig) {
  // Static passthrough
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/images": "images" });

  // Watch CSS/JS for local dev
  eleventyConfig.addWatchTarget("src/css/");
  eleventyConfig.addWatchTarget("src/js/");

  // Friendly date filter (Spanish, no locale deps). Accepts a Date object
  // (e.g. page.date) or an ISO string.
  eleventyConfig.addFilter("fechaEs", (date) => {
    const iso = date instanceof Date ? date.toISOString() : date;
    return DateTime.fromISO(iso).toFormat();
  });

  // ISO date string (YYYY-MM-DD) for <time datetime="">, replacing the
  // universal filter of the same name that older Eleventy versions shipped.
  eleventyConfig.addFilter("htmlDateString", (date) => {
    const d = date instanceof Date ? date : new Date(date);
    return d.toISOString().slice(0, 10);
  });

  // Reading time filter (~200 wpm, Spanish prose)
  eleventyConfig.addFilter("tiempoLectura", (text) => {
    if (!text) return 1;
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.round(words / 200));
  });

  // Slugify filter for tag/tema/escuela URLs
  eleventyConfig.addFilter("slugify", (str) => {
    if (!str) return "";
    return str
      .toString()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  });

  // Excerpt helper (plain text, trimmed)
  eleventyConfig.addFilter("truncate", (str, n) => {
    if (!str) return "";
    return str.length > n ? str.slice(0, n).trim() + "…" : str;
  });

  // Related posts: same tema first, then same escuela, excluding self
  eleventyConfig.addFilter("relacionados", (posts, tema, escuela, inputPath, limit) => {
    limit = limit || 3;
    const others = posts.filter((p) => p.inputPath !== inputPath);
    const sameTema = others.filter((p) => p.data.tema === tema);
    const sameEscuela = others.filter((p) => p.data.escuela === escuela && p.data.tema !== tema);
    const rest = others.filter((p) => p.data.tema !== tema && p.data.escuela !== escuela);
    return [...sameTema, ...sameEscuela, ...rest].slice(0, limit);
  });

  // Collection: all posts sorted by date desc
  eleventyConfig.addCollection("ensayos", (collectionApi) => {
    return collectionApi.getFilteredByGlob("src/posts/*.md").sort((a, b) => b.date - a.date);
  });

  // Collection: unique temas with counts (array of [tema, posts] pairs —
  // Eleventy's pagination plugin needs an Array or plain Object, not a Map)
  eleventyConfig.addCollection("temas", (collectionApi) => {
    const posts = collectionApi.getFilteredByGlob("src/posts/*.md");
    const map = new Map();
    posts.forEach((p) => {
      const t = p.data.tema;
      if (!map.has(t)) map.set(t, []);
      map.get(t).push(p);
    });
    return Array.from(map.entries());
  });

  // Collection: unique escuelas with counts
  eleventyConfig.addCollection("escuelas", (collectionApi) => {
    const posts = collectionApi.getFilteredByGlob("src/posts/*.md");
    const map = new Map();
    posts.forEach((p) => {
      const e = p.data.escuela;
      if (!map.has(e)) map.set(e, []);
      map.get(e).push(p);
    });
    return Array.from(map.entries());
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    pathPrefix: "/arasdesuelo/",
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "11ty.js"],
  };
};
