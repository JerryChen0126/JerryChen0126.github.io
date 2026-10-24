(() => {
  const root = document.documentElement;
  root.dataset.theme = "light";

  function updateScrollRegions() {
    document.querySelectorAll(".formula, .code-line, .article-table").forEach((element) => {
      if (element.scrollWidth > element.clientWidth + 1) {
        element.setAttribute("tabindex", "0");
        const table = element.matches("table");
        element.setAttribute("aria-label", root.dataset.lang === "zh"
          ? (table ? "可横向滚动的数据表" : "可横向滚动的公式")
          : (table ? "Scrollable data table" : "Scrollable formula"));
      } else {
        element.removeAttribute("tabindex");
        element.removeAttribute("aria-label");
      }
    });
  }

  function setLanguage(value) {
    const lang = value === "zh" ? "zh" : "en";
    root.dataset.lang = lang;
    root.lang = lang === "zh" ? "zh-Hans" : "en";
    try {
      localStorage.setItem("site-lang", lang);
    } catch {
      // Language switching still works when browser storage is unavailable.
    }
    document.querySelectorAll("[data-lang-button]").forEach((button) => {
      const active = button.dataset.langButton === lang;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    updateScrollRegions();
  }

  let language = root.dataset.lang;
  try {
    language = localStorage.getItem("site-lang") || language;
  } catch {
    // Fall back to the language declared in the document.
  }
  setLanguage(language);
  document.querySelectorAll("[data-lang-button]").forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.langButton));
  });
  window.addEventListener("resize", updateScrollRegions);
  window.addEventListener("load", async () => {
    if (window.MathJax?.startup) await window.MathJax.startup.promise;
    updateScrollRegions();
  });
})();
