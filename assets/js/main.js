const root = document.documentElement;

const preferredLang = localStorage.getItem("site-lang") || "en";
const preferredTheme =
  localStorage.getItem("site-theme") ||
  (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

function setLanguage(lang) {
  root.dataset.lang = lang;
  root.lang = lang === "zh" ? "zh-Hans" : "en";
  localStorage.setItem("site-lang", lang);

  document.querySelectorAll("[data-lang-button]").forEach((button) => {
    const isActive = button.dataset.langButton === lang;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function setTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem("site-theme", theme);
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.setAttribute("aria-pressed", String(theme === "dark"));
    button.querySelector("[data-theme-label]").textContent =
      theme === "dark" ? "Light" : "Dark";
  });
}

function initFilters() {
  const buttons = document.querySelectorAll("[data-filter]");
  const cards = document.querySelectorAll("[data-project-card]");

  if (!buttons.length || !cards.length) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      buttons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });

      cards.forEach((card) => {
        const categories = (card.dataset.categories || "").split(" ");
        const shouldShow = filter === "all" || categories.includes(filter);
        card.hidden = !shouldShow;
      });
    });
  });
}

document.querySelectorAll("[data-lang-button]").forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.langButton));
});

document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    setTheme(root.dataset.theme === "dark" ? "light" : "dark");
  });
});

setLanguage(preferredLang);
setTheme(preferredTheme);
initFilters();
