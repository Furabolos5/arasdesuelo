(function () {
  "use strict";

  var input = document.getElementById("search-input");
  var results = document.getElementById("search-results");
  if (!input || !results) return;

  var indexData = null;
  var indexPromise = null;

  function loadIndex() {
    if (indexPromise) return indexPromise;
    indexPromise = fetch(window.SEARCH_INDEX_URL)
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        indexData = data;
        return data;
      })
      .catch(function () {
        indexData = [];
        return [];
      });
    return indexPromise;
  }

  function normalize(str) {
    return (str || "")
      .toString()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase();
  }

  function render(matches, query) {
    if (!query) {
      results.innerHTML = "";
      return;
    }
    if (!matches.length) {
      results.innerHTML = '<p class="search-empty">Sin resultados para "' + query + '".</p>';
      return;
    }
    var base = (window.SITE_BASE || "/").replace(/\/$/, "");
    results.innerHTML = matches
      .slice(0, 12)
      .map(function (m) {
        return (
          '<a class="search-result" href="' +
          base +
          m.url +
          '">' +
          '<span class="search-result__title">' +
          escapeHtml(m.title) +
          "</span>" +
          '<span class="search-result__meta">' +
          escapeHtml(m.tema) +
          " · " +
          escapeHtml(m.escuela) +
          "</span>" +
          "</a>"
        );
      })
      .join("");
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }

  var debounceTimer = null;
  input.addEventListener("input", function () {
    var query = input.value.trim();
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      if (!query) {
        results.innerHTML = "";
        return;
      }
      loadIndex().then(function (data) {
        var q = normalize(query);
        var matches = data.filter(function (item) {
          return (
            normalize(item.title).indexOf(q) !== -1 ||
            normalize(item.excerpt).indexOf(q) !== -1 ||
            normalize(item.tema).indexOf(q) !== -1 ||
            normalize(item.escuela).indexOf(q) !== -1
          );
        });
        render(matches, query);
      });
    }, 120);
  });
})();
