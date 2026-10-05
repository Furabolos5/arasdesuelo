class SearchIndex {
  data() {
    return {
      permalink: "/search-index.json",
      eleventyExcludeFromCollections: true,
    };
  }

  render(data) {
    // Note: url is the raw, unprefixed Eleventy URL; the client joins it with
    // window.SITE_BASE (set in base.njk from the `url` filter) before linking.
    const posts = data.collections.ensayos.map((p) => ({
      title: p.data.title,
      url: p.url,
      excerpt: p.data.excerpt,
      heroImage: p.data.heroImage,
      temaColor: data.temasMeta[p.data.tema] ? data.temasMeta[p.data.tema].color : "#8a3b2e",
      tema: data.temasMeta[p.data.tema] ? data.temasMeta[p.data.tema].etiqueta : p.data.tema,
      escuela: data.escuelasMeta[p.data.escuela] ? data.escuelasMeta[p.data.escuela].etiqueta : p.data.escuela,
    }));
    return JSON.stringify(posts);
  }
}

module.exports = SearchIndex;
