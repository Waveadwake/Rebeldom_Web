/* Rebeldom · site behaviour
   Small, dependency-free enhancements. Everything essential works without JS. */

(function () {
  "use strict";

  const root = document.documentElement;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const storage = {
    get(key) {
      try {
        return window.localStorage.getItem(key);
      } catch (error) {
        return null;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch (error) {
        /* Storage may be disabled; the theme still works for this page. */
      }
    }
  };

  /* ---------- Giscus comments ----------
     GitHub Discussions and the giscus app are configured for this repository.
     Comments load only when the reader approaches the article's comment area. */
  const GISCUS = {
    repo: "Waveadwake/Rebeldom_Web",
    repoId: "R_kgDOVQ00yw",
    category: "Announcements",
    categoryId: "DIC_kwDOVQ00y84DJKsE",
    mapping: "pathname",
    inputPosition: "bottom",
    language: "zh-CN"
  };

  /* ---------- Theme ---------- */
  function syncGiscusTheme(theme) {
    const iframe = document.querySelector("iframe.giscus-frame");
    if (!iframe || !iframe.contentWindow) return;
    iframe.contentWindow.postMessage(
      { giscus: { setConfig: { theme: theme === "dark" ? "dark" : "light" } } },
      "https://giscus.app"
    );
  }

  function updateThemeColour() {
    const themeColour = getComputedStyle(root).getPropertyValue("--bg").trim();
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta && themeColour) {
      meta.setAttribute("content", themeColour);
    }
  }

  function setTheme(theme, persist) {
    root.dataset.theme = theme;
    if (persist) {
      storage.set("theme", theme);
    }
    updateThemeColour();

    document.querySelectorAll("[data-theme-toggle]").forEach(function (button) {
      const nextTheme = theme === "dark" ? "浅色" : "深色";
      button.setAttribute("aria-label", "切换到" + nextTheme + "模式");
      button.setAttribute("title", "切换到" + nextTheme + "模式");
      button.setAttribute("aria-pressed", String(theme === "dark"));
    });

    syncGiscusTheme(theme);
  }

  document.querySelectorAll("[data-theme-toggle]").forEach(function (button) {
    button.addEventListener("click", function () {
      const currentTheme =
        root.dataset.theme ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light");
      setTheme(currentTheme === "dark" ? "light" : "dark", true);
    });
  });

  // If the visitor has no explicit preference, follow live OS changes.
  const colourScheme = window.matchMedia("(prefers-color-scheme: dark)");
  const onColourSchemeChange = function (event) {
    if (!storage.get("theme")) {
      setTheme(event.matches ? "dark" : "light", false);
    }
  };

  if (typeof colourScheme.addEventListener === "function") {
    colourScheme.addEventListener("change", onColourSchemeChange);
  } else if (typeof colourScheme.addListener === "function") {
    colourScheme.addListener(onColourSchemeChange);
  }

  setTheme(
    root.dataset.theme ||
      (colourScheme.matches ? "dark" : "light"),
    false
  );

  /* ---------- Giscus comments (lazy-loaded) ---------- */
  const giscusHost = document.querySelector("[data-giscus]");
  const giscusCategoryId = (GISCUS.categoryId || "").trim();

  if (giscusHost && giscusCategoryId.startsWith("DIC_")) {
    const commentsSection = giscusHost.closest(".comments-section");
    if (commentsSection) commentsSection.hidden = false;

    let giscusLoaded = false;

    function loadGiscus() {
      if (giscusLoaded) return;
      giscusLoaded = true;

      const loading = document.createElement("p");
      loading.className = "giscus-loading";
      loading.textContent = "正在载入评论…";
      giscusHost.appendChild(loading);

      const script = document.createElement("script");
      script.src = "https://giscus.app/client.js";
      script.async = true;
      script.crossOrigin = "anonymous";

      const attributes = {
        "data-repo": GISCUS.repo,
        "data-repo-id": GISCUS.repoId,
        "data-category": GISCUS.category,
        "data-category-id": giscusCategoryId,
        "data-mapping": GISCUS.mapping,
        "data-strict": "0",
        "data-reactions-enabled": "1",
        "data-emit-metadata": "0",
        "data-input-position": GISCUS.inputPosition,
        "data-theme": root.dataset.theme === "dark" ? "dark" : "light",
        "data-lang": GISCUS.language,
        "data-loading": "lazy"
      };

      Object.keys(attributes).forEach(function (name) {
        script.setAttribute(name, attributes[name]);
      });

      giscusHost.appendChild(script);

      const iframeObserver = new MutationObserver(function () {
        const iframe = giscusHost.querySelector("iframe.giscus-frame");
        if (!iframe) return;
        loading.remove();
        syncGiscusTheme(root.dataset.theme);
        iframeObserver.disconnect();
      });
      iframeObserver.observe(giscusHost, { childList: true, subtree: true });

      // If the widget cannot load, avoid leaving a permanent loading message.
      window.setTimeout(function () {
        loading.remove();
      }, 12000);
    }

    if ("IntersectionObserver" in window) {
      const giscusObserver = new IntersectionObserver(
        function (entries) {
          if (entries.some(function (entry) { return entry.isIntersecting; })) {
            loadGiscus();
            giscusObserver.disconnect();
          }
        },
        { rootMargin: "400px 0px" }
      );
      giscusObserver.observe(commentsSection || giscusHost);
    } else {
      loadGiscus();
    }
  }

  /* ---------- Header ---------- */
  const header = document.querySelector("[data-header]");
  let lastScrollY = -1;

  function updateHeader() {
    if (!header) return;
    const currentScrollY = window.scrollY;
    if (currentScrollY === lastScrollY) return;
    lastScrollY = currentScrollY;
    header.classList.toggle("is-scrolled", currentScrollY > 12);
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* ---------- Mobile navigation ---------- */
  const navToggle = document.querySelector("[data-nav-toggle]");
  const siteNav = document.getElementById("site-nav");
  const pageMain = document.getElementById("main");
  const pageFooter = document.querySelector(".site-footer");

  function setBackgroundInert(isInert) {
    if (pageMain) pageMain.inert = isInert;
    if (pageFooter) pageFooter.inert = isInert;
  }

  function closeNavigation() {
    if (!navToggle || !siteNav) return;
    document.body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.querySelector(".nav-toggle-text").textContent = "菜单";
    setBackgroundInert(false);
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      const isOpen = document.body.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.querySelector(".nav-toggle-text").textContent = isOpen
        ? "关闭"
        : "菜单";
      setBackgroundInert(isOpen);

      if (isOpen) {
        const firstLink = siteNav.querySelector("a");
        if (firstLink) {
          window.requestAnimationFrame(function () {
            firstLink.focus();
          });
        }
      }
    });

    siteNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNavigation);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && document.body.classList.contains("nav-open")) {
        closeNavigation();
        navToggle.focus();
      }
    });

    window
      .matchMedia("(min-width: 901px)")
      .addEventListener("change", function (event) {
        if (event.matches) closeNavigation();
      });
  }

  /* ---------- Archive search & filters ---------- */
  const archive = document.querySelector("[data-archive]");

  if (archive) {
    const items = Array.from(archive.querySelectorAll("[data-archive-item]"));
    const filterButtons = Array.from(
      archive.querySelectorAll("[data-filter]")
    );
    const searchInput = archive.querySelector("[data-search]");
    const emptyState = archive.querySelector("[data-empty]");
    const countNode = archive.querySelector("[data-count]");
    const clearButton = archive.querySelector("[data-clear]");
    let activeFilter = "";

    function normalise(value) {
      return (value || "").toLocaleLowerCase("zh-CN").trim();
    }

    function readQuery() {
      try {
        const params = new URLSearchParams(window.location.search);
        return {
          tag: params.get("tag") || "",
          q: params.get("q") || ""
        };
      } catch (error) {
        return { tag: "", q: "" };
      }
    }

    function writeQuery(query) {
      if (!window.history || !window.history.replaceState) return;
      try {
        const params = new URLSearchParams();
        if (query.tag) params.set("tag", query.tag);
        if (query.q) params.set("q", query.q);
        const suffix = params.toString();
        window.history.replaceState(
          null,
          "",
          window.location.pathname + (suffix ? "?" + suffix : "") + window.location.hash
        );
      } catch (error) {
        /* file:// and restricted contexts may disallow history updates. */
      }
    }

    function applyFilters(updateURL) {
      const query = normalise(searchInput ? searchInput.value : "");
      let visibleCount = 0;

      filterButtons.forEach(function (button) {
        const isActive = button.dataset.filter === activeFilter;
        button.setAttribute("aria-pressed", String(isActive));
      });

      items.forEach(function (item) {
        const matchesCategory =
          !activeFilter || item.dataset.category === activeFilter;
        const matchesSearch =
          !query || normalise(item.dataset.search).indexOf(query) !== -1;
        const isVisible = matchesCategory && matchesSearch;
        item.hidden = !isVisible;
        if (isVisible) visibleCount += 1;
      });

      if (countNode) countNode.textContent = String(visibleCount);
      if (emptyState) emptyState.hidden = visibleCount !== 0;

      if (updateURL) {
        writeQuery({ tag: activeFilter, q: searchInput ? searchInput.value.trim() : "" });
      }
    }

    const initialQuery = readQuery();
    activeFilter = initialQuery.tag;
    if (searchInput && initialQuery.q) searchInput.value = initialQuery.q;
    if (
      activeFilter &&
      !filterButtons.some(function (button) {
        return button.dataset.filter === activeFilter;
      })
    ) {
      activeFilter = "";
    }
    applyFilters(false);

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeFilter = button.dataset.filter;
        applyFilters(true);
      });
    });

    if (searchInput) {
      searchInput.addEventListener("input", function () {
        applyFilters(true);
      });

      document.addEventListener("keydown", function (event) {
        const target = event.target;
        const isTyping =
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target.isContentEditable;

        if (event.key === "/" && !isTyping) {
          event.preventDefault();
          searchInput.focus();
        }

        if (event.key === "Escape" && document.activeElement === searchInput) {
          searchInput.value = "";
          applyFilters(true);
          searchInput.blur();
        }
      });
    }

    if (clearButton) {
      clearButton.addEventListener("click", function () {
        activeFilter = "";
        if (searchInput) searchInput.value = "";
        applyFilters(true);
        if (searchInput) searchInput.focus();
      });
    }
  }

  /* ---------- Article reading progress ---------- */
  const articleBody = document.querySelector("[data-article-body]");
  const progressBar = document.querySelector("[data-reading-progress]");

  if (articleBody && progressBar) {
    let ticking = false;

    function updateProgress() {
      const rect = articleBody.getBoundingClientRect();
      const articleTop = rect.top + window.scrollY;
      const start = articleTop - window.innerHeight * 0.35;
      const end = articleTop + articleBody.offsetHeight - window.innerHeight * 0.65;
      const distance = Math.max(1, end - start);
      const progress = Math.min(1, Math.max(0, (window.scrollY - start) / distance));
      progressBar.style.transform = "scaleX(" + progress.toFixed(4) + ")";
      ticking = false;
    }

    function requestProgressUpdate() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateProgress);
      }
    }

    updateProgress();
    window.addEventListener("scroll", requestProgressUpdate, { passive: true });
    window.addEventListener("resize", requestProgressUpdate);
  }

  /* ---------- Article table of contents ---------- */
  const toc = document.querySelector("[data-toc]");

  if (toc && articleBody) {
    const tocList = toc.querySelector("ol");
    const headings = Array.from(articleBody.querySelectorAll("h2[id]"));

    if (headings.length > 0 && tocList) {
      headings.forEach(function (heading) {
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href = "#" + heading.id;
        link.textContent = heading.textContent;
        item.appendChild(link);
        tocList.appendChild(item);
      });

      toc.hidden = false;
      const tocLinks = Array.from(toc.querySelectorAll("a"));
      let tocTicking = false;

      function updateToc() {
        let currentId = "";
        headings.forEach(function (heading) {
          if (heading.getBoundingClientRect().top <= 150) {
            currentId = heading.id;
          }
        });

        tocLinks.forEach(function (link) {
          const isActive = link.getAttribute("href") === "#" + currentId;
          link.classList.toggle("is-active", isActive);
          if (isActive) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        });
        tocTicking = false;
      }

      function requestTocUpdate() {
        if (!tocTicking) {
          tocTicking = true;
          window.requestAnimationFrame(updateToc);
        }
      }

      updateToc();
      window.addEventListener("scroll", requestTocUpdate, { passive: true });
      window.addEventListener("resize", requestTocUpdate);
    }
  }

  /* ---------- Copy helpers ---------- */
  function legacyCopy(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.select();
    let succeeded = false;
    try {
      succeeded = document.execCommand("copy");
    } catch (error) {
      succeeded = false;
    }
    document.body.removeChild(textArea);
    return succeeded;
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () {
        return legacyCopy(text) ? Promise.resolve() : Promise.reject();
      });
    }
    return legacyCopy(text) ? Promise.resolve() : Promise.reject();
  }

  articleBody &&
    articleBody.querySelectorAll("pre > code").forEach(function (codeBlock) {
      const pre = codeBlock.parentElement;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "copy-code";
      button.textContent = "复制";
      button.setAttribute("aria-label", "复制代码");
      pre.appendChild(button);

      button.addEventListener("click", function () {
        copyText(codeBlock.textContent)
          .then(function () {
            button.textContent = "已复制";
            window.setTimeout(function () {
              button.textContent = "复制";
            }, 1800);
          })
          .catch(function () {
            button.textContent = "复制失败";
            window.setTimeout(function () {
              button.textContent = "复制";
            }, 1800);
          });
      });
    });

  const shareButton = document.querySelector("[data-copy-link]");
  if (shareButton) {
    const defaultLabel = shareButton.querySelector("span").textContent;
    shareButton.addEventListener("click", function () {
      copyText(window.location.href)
        .then(function () {
          shareButton.querySelector("span").textContent = "链接已复制";
          window.setTimeout(function () {
            shareButton.querySelector("span").textContent = defaultLabel;
          }, 2000);
        })
        .catch(function () {
          shareButton.querySelector("span").textContent = "请复制地址栏链接";
          window.setTimeout(function () {
            shareButton.querySelector("span").textContent = defaultLabel;
          }, 2200);
        });
    });
  }

  /* ---------- Back to top ---------- */
  document.querySelectorAll("[data-to-top]").forEach(function (button) {
    button.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth"
      });
    });
  });

  /* ---------- Current year ---------- */
  document.querySelectorAll("[data-current-year]").forEach(function (node) {
    node.textContent = String(new Date().getFullYear());
  });
})();
