(() => {
  const root = document.documentElement;
  root.dataset.theme = "light";
  const researchCards = [...document.querySelectorAll("[data-research-category]")];
  const filterButtons = [...document.querySelectorAll("[data-research-filter]")];
  const articleBody = document.querySelector(".article-body");
  const tocLinks = [...document.querySelectorAll(".article-toc a")];
  const sections = tocLinks.map((link) => document.getElementById(link.hash.slice(1)));
  let progress;
  let scrollPending = false;

  function updateResearchCount() {
    const count = researchCards.filter((card) => !card.hidden).length;
    const output = document.querySelector("[data-research-count]");
    if (output) output.textContent = root.dataset.lang === "zh" ? `${count} 个项目` : `${count} ${count === 1 ? "project" : "projects"}`;
  }

  function updateReadingTime() {
    const output = document.querySelector("[data-reading-time]");
    if (!output || !articleBody) return;
    const text = articleBody.innerText;
    const chinese = root.dataset.lang === "zh";
    const units = chinese ? text.replace(/\s/g, "").length : text.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(units / (chinese ? 450 : 220)));
    output.textContent = chinese ? `约 ${minutes} 分钟阅读` : `${minutes} min read`;
  }

  function updateReadingState() {
    scrollPending = false;
    if (!articleBody) return;
    const headerHeight = document.querySelector(".site-header").offsetHeight;
    let current = 0;
    sections.forEach((section, index) => {
      if (section && section.getBoundingClientRect().top <= headerHeight + 64) current = index;
    });
    tocLinks.forEach((link, index) => {
      if (index === current) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    if (progress) {
      const start = articleBody.getBoundingClientRect().top + scrollY - headerHeight;
      const end = articleBody.getBoundingClientRect().bottom + scrollY - innerHeight;
      const fraction = Math.min(1, Math.max(0, (scrollY - start) / Math.max(1, end - start)));
      progress.style.transform = `scaleX(${fraction})`;
    }
  }

  function scheduleReadingUpdate() {
    if (!scrollPending) {
      scrollPending = true;
      requestAnimationFrame(updateReadingState);
    }
  }

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
    document.querySelector(".research-filters")?.setAttribute("aria-label", lang === "zh" ? "研究分类" : "Research categories");
    document.querySelector(".site-nav")?.setAttribute("aria-label", lang === "zh" ? "主导航" : "Main navigation");
    document.querySelector(".language-control")?.setAttribute("aria-label", lang === "zh" ? "语言" : "Language");
    updateResearchCount();
    updateReadingTime();
    updateScrollRegions();
    scheduleReadingUpdate();
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.dataset.researchFilter;
      researchCards.forEach((card) => {
        card.hidden = category !== "all" && card.dataset.researchCategory !== category;
      });
      filterButtons.forEach((filter) => filter.setAttribute("aria-pressed", String(filter === button)));
      updateResearchCount();
    });
  });
  if (filterButtons.length) document.querySelector(".research-filters").hidden = false;

  if (articleBody) {
    const track = document.createElement("div");
    track.className = "reading-progress";
    track.setAttribute("aria-hidden", "true");
    progress = document.createElement("span");
    track.append(progress);
    document.querySelector(".site-header").append(track);
    window.addEventListener("scroll", scheduleReadingUpdate, { passive: true });
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
  window.addEventListener("resize", () => {
    updateScrollRegions();
    scheduleReadingUpdate();
  });
  window.addEventListener("load", async () => {
    if (window.MathJax?.startup) await window.MathJax.startup.promise;
    await document.fonts.ready;
    updateScrollRegions();
    updateReadingTime();
    scheduleReadingUpdate();
  });
})();
