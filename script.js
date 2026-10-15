
(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  // Browser storage: handle restricted storage safely
  function readStorage(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // The feature still works for the current page session.
    }
  }

  function toast(message) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(window.__socialNewsToast);
    window.__socialNewsToast = setTimeout(
      () => el.classList.remove("show"), 2500
    );
  }

  // Current year
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  // Dark and light theme
  let theme = "light";
  try {
    theme = localStorage.getItem("social-news-theme") || "light";
  } catch {}
  document.body.classList.toggle("dark", theme === "dark");

  const themeButton = $("#themeToggle");
  if (themeButton) {
    themeButton.addEventListener("click", () => {
      const dark = document.body.classList.toggle("dark");
      try {
        localStorage.setItem(
          "social-news-theme", dark ? "dark" : "light"
        );
      } catch {}
      themeButton.setAttribute("aria-pressed", String(dark));
      toast(dark ? "डार्क मोड चालू हुआ।" : "लाइट मोड चालू हुआ।");
    });
  }

  // News search
  const searchForm = $("#searchForm");
  const searchInput = $("#searchInput");

  function searchNews() {
    const query = (searchInput?.value || "")
      .trim().toLocaleLowerCase("hi");
    let count = 0;

    $$(".news-card").forEach((card) => {
      const text = (
        (card.dataset.search || "") + " " + card.innerText
      ).toLocaleLowerCase("hi");

      const match = !query || text.includes(query);
      card.hidden = !match;
      if (match) count++;
    });

    const resultCount = $("#resultCount");
    if (resultCount) resultCount.textContent = `${count} लेख`;

    const empty = $("#emptyState");
    if (empty) empty.hidden = count !== 0;
  }

  if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      searchNews();
      $("#top-news")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", searchNews);
  }

  // Save and unsave news
  const stored = readStorage("social-news-saved", []);
  const saved = new Set(Array.isArray(stored) ? stored : []);

  function updateSaveButtons() {
    $$("[data-save]").forEach((button) => {
      const isSaved = saved.has(button.dataset.save);
      button.textContent = isSaved ? "♥ सेव हो गया" : "♡ सेव करें";
      button.setAttribute("aria-pressed", String(isSaved));
    });
  }

  $$("[data-save]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.save;
      if (!id) return;

      if (saved.has(id)) {
        saved.delete(id);
        toast("सेव की गई खबर हटाई गई।");
      } else {
        saved.add(id);
        toast("खबर सेव कर ली गई।");
      }

      writeStorage("social-news-saved", [...saved]);
      updateSaveButtons();
    });
  });

  updateSaveButtons();

  // Calculator
  const calculateButton = $("#calculateBtn");

  if (calculateButton) {
    calculateButton.addEventListener("click", () => {
      const first = $("#calcA");
      const second = $("#calcB");
      const operator = $("#calcOp");
      const output = $("#calcResult");

      if (!first || !second || !operator || !output) return;

      if (first.value.trim() === "" || second.value.trim() === "") {
        output.textContent = "दोनों संख्याएँ भरें।";
        return;
      }

      const a = Number(first.value);
      const b = Number(second.value);
      let result;

      switch (operator.value) {
        case "+":
          result = a + b;
          break;
        case "-":
          result = a - b;
          break;
        case "*":
          result = a * b;
          break;
        case "/":
          if (b === 0) {
            output.textContent = "शून्य से भाग नहीं कर सकते।";
            return;
          }
          result = a / b;
          break;
        default:
          output.textContent = "गणना का विकल्प सही नहीं है।";
          return;
      }

      output.textContent = Number.isFinite(result)
        ? `परिणाम: ${Number(result.toFixed(8))}`
        : "कृपया छोटी और सही संख्याएँ डालें।";
    });
  }

  // Live video demo: no real stream is connected yet.
  const videoPlaceholder = $(".video-placeholder");

  if (videoPlaceholder) {
    videoPlaceholder.setAttribute("role", "button");
    videoPlaceholder.setAttribute("tabindex", "0");
    videoPlaceholder.setAttribute(
      "aria-label", "Live Video डेमो की जानकारी"
    );

    const showDemo = () => {
      toast("यह अभी डेमो है। असली वीडियो के लिए अधिकृत स्ट्रीम जोड़नी होगी।");
    };

    videoPlaceholder.addEventListener("click", showDemo);
    videoPlaceholder.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        showDemo();
      }
    });
  }

  // Keep all category and section links working as normal anchors.
  console.log("Social News: JavaScript initialized successfully.");
})();
