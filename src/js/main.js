(function () {
  "use strict";

  /* ---------- Scroll progress bar (article pages feel; harmless elsewhere) ---------- */
  var bar = document.getElementById("progress-bar");
  function updateProgress() {
    if (!bar) return;
    var doc = document.documentElement;
    var scrollTop = window.scrollY || doc.scrollTop;
    var height = doc.scrollHeight - doc.clientHeight;
    var pct = height > 0 ? (scrollTop / height) * 100 : 0;
    bar.style.width = pct + "%";
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();

  /* ---------- Search overlay open/close ---------- */
  var trigger = document.getElementById("search-trigger");
  var overlay = document.getElementById("search-overlay");
  var closeBtn = document.getElementById("search-close");
  var input = document.getElementById("search-input");

  function openSearch() {
    if (!overlay) return;
    overlay.hidden = false;
    if (input) {
      input.value = "";
      input.focus();
    }
    document.body.style.overflow = "hidden";
  }
  function closeSearch() {
    if (!overlay) return;
    overlay.hidden = true;
    document.body.style.overflow = "";
  }
  if (trigger) trigger.addEventListener("click", openSearch);
  if (closeBtn) closeBtn.addEventListener("click", closeSearch);
  if (overlay) {
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeSearch();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeSearch();
    if ((e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) && overlay && overlay.hidden) {
      var active = document.activeElement;
      var typing = active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA");
      if (!typing) {
        e.preventDefault();
        openSearch();
      }
    }
  });

  /* ---------- Ad placeholders: popup + corner ---------- */
  // Session-scoped dismissal so a closed placeholder doesn't reappear on
  // every page view within the same visit, but does come back next session.
  var popup = document.getElementById("ad-popup");
  var popupClose = document.getElementById("ad-popup-close");
  var corner = document.getElementById("ad-corner");
  var cornerClose = document.getElementById("ad-corner-close");

  function dismissed(key) {
    try {
      return sessionStorage.getItem(key) === "1";
    } catch (e) {
      return false;
    }
  }
  function dismiss(key) {
    try {
      sessionStorage.setItem(key, "1");
    } catch (e) {
      /* ignore */
    }
  }

  if (popup && !dismissed("ad-popup-dismissed")) {
    var revealed = false;
    function maybeRevealPopup() {
      if (revealed) return;
      revealed = true;
      popup.hidden = false;
      requestAnimationFrame(function () {
        popup.classList.add("is-visible");
      });
    }
    setTimeout(maybeRevealPopup, 8000);
    window.addEventListener(
      "scroll",
      function () {
        if (window.scrollY > document.documentElement.scrollHeight * 0.3) {
          maybeRevealPopup();
        }
      },
      { passive: true }
    );
  } else if (popup) {
    popup.remove();
  }
  if (popupClose) {
    popupClose.addEventListener("click", function () {
      popup.classList.remove("is-visible");
      dismiss("ad-popup-dismissed");
      setTimeout(function () {
        popup.hidden = true;
      }, 400);
    });
  }

  if (corner && dismissed("ad-corner-dismissed")) {
    corner.remove();
  } else if (cornerClose) {
    cornerClose.addEventListener("click", function () {
      dismiss("ad-corner-dismissed");
      corner.style.display = "none";
    });
  }
})();
