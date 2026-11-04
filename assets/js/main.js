/* ============================================================
   Hussein Studio Crack — logique du site
   - catalogue piloté par data/apps.json
   - filtres (catégorie, plateforme, recherche), tri
   - modale de détails, téléchargements, vérification SHA-256
   - i18n FR / EN / AR avec support RTL
   ============================================================ */

(function () {
  "use strict";

  const DATA_URL = "/api/apps";
  const CATEGORY_ORDER = ["download", "video", "utility"];
  const PLATFORM_ORDER = ["macos", "windows", "linux"];

  const state = {
    lang: "fr",
    apps: [],
    updated: null,
    category: "all",
    platform: "all",
    query: "",
    sort: "recent",
    loaded: false
  };

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /* ------------------------------------------------ i18n ----- */

  function t(key, vars) {
    const lang = window.I18N[state.lang] || window.I18N.fr;
    let str = lang[key];
    if (str === undefined) str = window.I18N.fr[key];
    if (str === undefined) return key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        str = str.split("{" + k + "}").join(String(vars[k]));
      });
    }
    return str;
  }

  function loc(obj) {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return obj[state.lang] || obj.fr || obj.en || "";
  }

  function fmtDate(iso) {
    if (!iso) return "";
    const d = new Date(iso.length <= 10 ? iso + "T00:00:00" : iso);
    if (isNaN(d)) return iso;
    try {
      return new Intl.DateTimeFormat(t("date.locale"), {
        day: "numeric",
        month: "short",
        year: "numeric"
      }).format(d);
    } catch (e) {
      return d.toISOString().slice(0, 10);
    }
  }

  function applyTranslations() {
    document.documentElement.lang = state.lang;
    document.documentElement.dir = state.lang === "ar" ? "rtl" : "ltr";
    document.title = t("meta.title");
    const desc = $('meta[name="description"]');
    if (desc) desc.setAttribute("content", t("meta.description"));

    $$("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.dataset.i18n, { year: new Date().getFullYear() });
    });
    $$("[data-i18n-html]").forEach(function (el) {
      el.innerHTML = t(el.dataset.i18nHtml);
    });
    $$("[data-i18n-placeholder]").forEach(function (el) {
      el.setAttribute("placeholder", t(el.dataset.i18nPlaceholder));
    });
    $$("[data-i18n-title]").forEach(function (el) {
      el.setAttribute("title", t(el.dataset.i18nTitle));
    });
    $$("[data-i18n-aria-label]").forEach(function (el) {
      el.setAttribute("aria-label", t(el.dataset.i18nAriaLabel));
    });

    const label = $("#langLabel");
    const current = window.LANGUAGES.find(function (l) {
      return l.code === state.lang;
    });
    if (label && current) label.textContent = current.short;

    $$("#langMenu [data-lang]").forEach(function (btn) {
      btn.setAttribute("aria-checked", String(btn.dataset.lang === state.lang));
    });

    renderChips();
    renderPlatformFilter();
    render();
    renderFooterDate();
  }

  function renderFooterDate() {
    const el = $("#updatedAt");
    if (!el || !state.updated) return;
    el.textContent = "· " + t("footer.updated", { date: fmtDate(state.updated) });
  }

  /* ---------------------------------------------- helpers ----- */

  function esc(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function safeAccent(color) {
    return /^#[0-9a-f]{3,8}$/i.test(color || "") ? color : "#8b5cf6";
  }

  function initials(name) {
    return String(name || "?")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(function (w) {
        return w[0];
      })
      .join("")
      .toUpperCase();
  }

  const ICONS = {
    download:
      '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 19h14"/></svg>',
    info:
      '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/></svg>',
    clock:
      '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    check:
      '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 4.5 4.5L19 7"/></svg>',
    search:
      '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    macos:
      '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="12" rx="2"/><path d="M2 19h20"/></svg>',
    windows:
      '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/></svg>',
    linux:
      '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3"/><path d="M13 15h4"/></svg>'
  };

  function platformIcon(platform) {
    return ICONS[platform] || ICONS.linux;
  }

  function platformName(platform) {
    return { macos: "macOS", windows: "Windows", linux: "Linux" }[platform] || platform;
  }

  function detectPlatform() {
    const ua = navigator.userAgent;
    if (/Mac|iPhone|iPad|iPod/.test(ua)) return "macos";
    if (/Win/.test(ua)) return "windows";
    if (/Linux|X11|CrOS/.test(ua)) return "linux";
    return null;
  }

  /* -------------------------------------------- catalogue ----- */

  function matches(app) {
    if (state.category !== "all" && app.category !== state.category) return false;
    if (state.platform !== "all" && (app.platforms || []).indexOf(state.platform) === -1) {
      return false;
    }
    const q = state.query.trim().toLowerCase();
    if (!q) return true;
    const haystack = [
      app.name,
      app.publisher,
      loc(app.tagline),
      loc(app.description),
      t("cat." + app.category)
    ]
      .join(" ")
      .toLowerCase();
    return haystack.indexOf(q) !== -1;
  }

  function visibleApps() {
    const list = state.apps.filter(matches);
    if (state.sort === "name") {
      list.sort(function (a, b) {
        return String(a.name).localeCompare(String(b.name), state.lang);
      });
    } else {
      list.sort(function (a, b) {
        const pinned = (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        if (pinned) return pinned;
        return String(b.released || "").localeCompare(String(a.released || ""));
      });
    }
    return list;
  }

  function renderChips() {
    const box = $("#categoryChips");
    if (!box) return;
    const cats = ["all"].concat(
      CATEGORY_ORDER.filter(function (c) {
        return state.apps.some(function (a) {
          return a.category === c;
        });
      })
    );
    box.innerHTML = cats
      .map(function (c) {
        const label = c === "all" ? t("filter.all") : t("cat." + c);
        const pressed = state.category === c;
        return (
          '<button class="chip" type="button" role="button" data-category="' +
          esc(c) +
          '" aria-pressed="' +
          String(pressed) +
          '">' +
          esc(label) +
          "</button>"
        );
      })
      .join("");
  }

  function renderPlatformFilter() {
    const select = $("#platformFilter");
    if (!select) return;
    const present = PLATFORM_ORDER.filter(function (p) {
      return state.apps.some(function (a) {
        return (a.platforms || []).indexOf(p) !== -1;
      });
    });
    const options = [{ value: "all", label: t("platform.all") }].concat(
      present.map(function (p) {
        return { value: p, label: platformName(p) };
      })
    );
    select.innerHTML = options
      .map(function (o) {
        return (
          '<option value="' +
          esc(o.value) +
          '"' +
          (state.platform === o.value ? " selected" : "") +
          ">" +
          esc(o.label) +
          "</option>"
        );
      })
      .join("");
  }

  function renderStats() {
    if ($("#statApps")) $("#statApps").textContent = state.apps.length;
    const platforms = {};
    state.apps.forEach(function (a) {
      (a.platforms || []).forEach(function (p) {
        platforms[p] = true;
      });
    });
    if ($("#statPlatforms")) $("#statPlatforms").textContent = Object.keys(platforms).length;
  }

  function cardHTML(app) {
    const accent = safeAccent(app.accent);
    const platforms = (app.platforms || [])
      .map(function (p) {
        return (
          '<span class="plat">' +
          platformIcon(p) +
          esc(platformName(p)) +
          "</span>"
        );
      })
      .join("");
    const icon = app.icon
      ? '<img class="card-icon" src="' +
        esc(app.icon) +
        '" alt="" width="56" height="56" loading="lazy">'
      : '<div class="card-icon fallback">' + esc(initials(app.name)) + "</div>";
    const sub = [
      app.version ? t("card.version", { v: app.version }) : "",
      app.released ? fmtDate(app.released) : ""
    ]
      .filter(Boolean)
      .join(" · ");

    const comingSoon = app.comingSoon === true || !(app.downloads || []).length;
    const action = comingSoon
      ? '<button class="btn btn-primary" type="button" disabled aria-disabled="true">' +
        ICONS.clock +
        "<span>" +
        esc(t("card.soon")) +
        "</span></button>"
      : '<button class="btn btn-primary" type="button" data-download="' +
        esc(app.id) +
        '">' +
        ICONS.download +
        "<span>" +
        esc(t("card.download")) +
        "</span></button>";

    return (
      '<article class="card" style="--accent:' +
      esc(accent) +
      '" data-id="' +
      esc(app.id) +
      '">' +
      '<div class="card-top">' +
      icon +
      '<div class="card-heading">' +
      '<h3 class="card-title">' +
      esc(app.name) +
      "</h3>" +
      '<p class="card-sub">' +
      esc(sub) +
      "</p>" +
      "</div>" +
      "</div>" +
      '<p class="card-tagline">' +
      esc(loc(app.tagline)) +
      "</p>" +
      '<div class="platforms">' +
      platforms +
      "</div>" +
      '<div class="card-foot">' +
      action +
      '<button class="btn btn-ghost icon-only" type="button" data-details="' +
      esc(app.id) +
      '" aria-label="' +
      esc(t("card.details", { name: app.name })) +
      '" title="' +
      esc(t("card.details", { name: app.name })) +
      '">' +
      ICONS.info +
      "</button>" +
      "</div>" +
      "</article>"
    );
  }

  function render() {
    if (!state.loaded) return;
    renderStats();
    const grid = $("#appGrid");
    if (!grid) return;
    const list = visibleApps();

    const count = $("#resultCount");
    if (count) {
      count.textContent =
        state.query || state.category !== "all" || state.platform !== "all"
          ? t("catalogue.countFiltered", { n: list.length, total: state.apps.length })
          : t("catalogue.count", { n: list.length });
    }

    if (!list.length) {
      grid.innerHTML =
        '<div class="empty">' +
        ICONS.search +
        "<h3>" +
        esc(t("empty.title")) +
        "</h3><p>" +
        esc(t("empty.text")) +
        '</p><button class="btn btn-ghost" type="button" id="resetFilters">' +
        esc(t("empty.reset")) +
        "</button></div>";
      return;
    }

    grid.innerHTML = list.map(cardHTML).join("");
    $$("#appGrid .card-icon", grid).forEach(function (img) {
      if (img.tagName !== "IMG") return;
      img.addEventListener("error", function () {
        const card = img.closest(".card");
        const app = card ? appById(card.dataset.id) : null;
        const div = document.createElement("div");
        div.className = "card-icon fallback";
        div.textContent = initials(app ? app.name : "?");
        img.replaceWith(div);
      });
    });
  }

  /* -------------------------------------------- downloads ----- */

  function appById(id) {
    return state.apps.find(function (a) {
      return a.id === id;
    });
  }

  function isPlaceholder(url) {
    return !url || String(url).charAt(0) === "#";
  }

  function bestDownload(app) {
    const downloads = app.downloads || [];
    if (!downloads.length) return null;
    const os = detectPlatform();
    const match = downloads.find(function (d) {
      return d.platform === os && !isPlaceholder(d.url);
    });
    if (match) return match;
    return (
      downloads.find(function (d) {
        return !isPlaceholder(d.url);
      }) || downloads[0]
    );
  }

  function downloadApp(app) {
    const downloads = app.downloads || [];
    if (!downloads.length) {
      openModal(app);
      return;
    }
    // Plusieurs plateformes : la modale laisse choisir le bon fichier.
    const distinctPlatforms = {};
    downloads.forEach(function (d) {
      distinctPlatforms[d.platform] = true;
    });
    const dl = bestDownload(app);
    if (!dl || isPlaceholder(dl.url) || Object.keys(distinctPlatforms).length > 1) {
      openModal(app);
      return;
    }
    triggerDownload(app, dl);
  }

  function triggerDownload(app, dl) {
    if (isPlaceholder(dl.url)) {
      return;
    }
    const a = document.createElement("a");
    a.href = dl.url;
    a.setAttribute("download", "");
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast(t("toast.download", { name: app.name }));
  }

  let toastTimer = null;
  function toast(message) {
    const box = $("#toast");
    const text = $("#toastText");
    if (!box || !text) return;
    text.textContent = message;
    box.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      box.classList.remove("is-visible");
    }, 4200);
  }

  /* ----------------------------------------------- modale ----- */

  let lastFocused = null;

  function openModal(app) {
    const dialog = $("#appModal");
    if (!dialog) return;
    const accent = safeAccent(app.accent);
    dialog.dataset.appId = app.id;
    document.documentElement.style.setProperty("--modal-accent", accent);

    $("#modalTitle").textContent = app.name;
    const meta = [
      app.version ? t("card.version", { v: app.version }) : "",
      app.released ? t("modal.published", { date: fmtDate(app.released) }) : "",
      app.publisher ? t("modal.publisher", { name: app.publisher }) : ""
    ]
      .filter(Boolean)
      .join(" · ");
    $("#modalMeta").textContent = meta;

    const icon = $("#modalIcon");
    icon.src = app.icon || "assets/img/favicon.svg";
    icon.alt = "";
    icon.style.boxShadow = "0 14px 30px -16px " + accent;
    icon.onerror = function () {
      icon.onerror = null;
      icon.src = "assets/img/favicon.svg";
    };

    const features = (app.features ? loc(app.features) : []) || [];
    const downloads = app.downloads || [];

    const sections = [];

    if (app.comingSoon) {
      sections.push(
        '<div class="note soon">' +
          ICONS.clock +
          "<span>" +
          esc(t("modal.soonNote")) +
          "</span></div>"
      );
    }

    sections.push(
      "<div><h4>" +
        esc(t("modal.about")) +
        "</h4><p>" +
        esc(loc(app.description)) +
        "</p></div>"
    );

    if (features.length) {
      sections.push(
        "<div><h4>" +
          esc(t("modal.features")) +
          '</h4><ul class="feature-list">' +
          features
            .map(function (f) {
              return "<li>" + ICONS.check + "<span>" + esc(f) + "</span></li>";
            })
            .join("") +
          "</ul></div>"
      );
    }

    if (downloads.length) {
      sections.push(
        "<div><h4>" +
          esc(t("modal.downloads")) +
          '</h4><div class="dl-list">' +
          downloads
            .map(function (d, i) {
              const sha = d.sha256 ? String(d.sha256) : "";
              const shortSha = sha ? sha.slice(0, 16) + (sha.length > 16 ? "…" : "") : "";
              return (
                '<a class="dl-row" href="' +
                esc(d.url || "#") +
                '" data-dl-index="' +
                i +
                '"' +
                (isPlaceholder(d.url) ? ' aria-disabled="true"' : ' download rel="noopener"') +
                ">" +
                '<span class="plat">' +
                platformIcon(d.platform) +
                esc(platformName(d.platform)) +
                "</span>" +
                '<span class="info"><strong>' +
                esc(d.label || platformName(d.platform)) +
                "</strong><span>" +
                esc([d.size, shortSha].filter(Boolean).join(" · ")) +
                "</span></span>" +
                ICONS.download +
                "</a>"
              );
            })
            .join("") +
          "</div>" +
          '<div class="note">' +
          ICONS.check +
          "<span>" +
          esc(t("modal.integrityNote")) +
          "</span></div></div>"
      );
    }

    if (app.requirements && loc(app.requirements)) {
      sections.push(
        "<div><h4>" +
          esc(t("modal.requirements")) +
          "</h4><p>" +
          esc(loc(app.requirements)) +
          "</p></div>"
      );
    }

    if (app.license) {
      sections.push(
        "<div><h4>" + esc(t("modal.license")) + "</h4><p>" + esc(app.license) + "</p></div>"
      );
    }

    if (app.changelog && loc(app.changelog)) {
      sections.push(
        "<div><h4>" +
          esc(t("modal.changelog")) +
          "</h4><p>" +
          esc(loc(app.changelog)) +
          "</p></div>"
      );
    }

    $("#modalBody").innerHTML = sections.join("");
    const scroller = $(".modal-scroll", dialog);
    if (scroller) scroller.scrollTop = 0;
    lastFocused = document.activeElement;
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
  }

  function closeModal() {
    const dialog = $("#appModal");
    if (!dialog) return;
    if (typeof dialog.close === "function" && dialog.open) dialog.close();
    else dialog.removeAttribute("open");
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  /* ------------------------------------------------- init ----- */

  function setupLangMenu() {
    const menu = $("#langMenu");
    if (!menu) return;
    menu.innerHTML = window.LANGUAGES.map(function (lang) {
      return (
        '<button type="button" role="menuitemradio" data-lang="' +
        esc(lang.code) +
        '" aria-checked="' +
        String(lang.code === state.lang) +
        '"><span>' +
        esc(lang.label) +
        '</span><span class="code">' +
        esc(lang.short) +
        "</span></button>"
      );
    }).join("");
  }

  function setLang(code) {
    if (!window.I18N[code]) return;
    state.lang = code;
    try {
      localStorage.setItem("ezoo-lang", code);
    } catch (e) {}
    applyTranslations();
  }

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("ezoo-theme", theme);
    } catch (e) {}
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#f7f7fb" : "#08080d");
  }

  function loadCatalogue() {
    fetch(DATA_URL, { cache: "no-cache" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        state.apps = Array.isArray(data.apps) ? data.apps : [];
        state.updated = data.updated || null;
        state.loaded = true;
        renderFooterDate();
        renderChips();
        renderPlatformFilter();
        render();
      })
      .catch(function (err) {
        const grid = $("#appGrid");
        if (!grid) return;
        grid.innerHTML =
          '<div class="load-error"><strong>' +
          esc(t("error.title")) +
          "</strong><p>" +
          esc(t("error.text")) +
          "</p><code>" +
          esc(t("error.cmd")) +
          "</code></div>";
        console.error("[catalogue]", err);
      });
  }

  function wireEvents() {
    // langue
    const lang = $("#lang");
    const langBtn = $(".lang-btn", lang);
    langBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      const open = lang.classList.toggle("is-open");
      langBtn.setAttribute("aria-expanded", String(open));
    });
    $("#langMenu").addEventListener("click", function (e) {
      const btn = e.target.closest("[data-lang]");
      if (!btn) return;
      setLang(btn.dataset.lang);
      lang.classList.remove("is-open");
      langBtn.setAttribute("aria-expanded", "false");
    });
    document.addEventListener("click", function (e) {
      if (!lang.contains(e.target)) {
        lang.classList.remove("is-open");
        langBtn.setAttribute("aria-expanded", "false");
      }
    });

    // thème
    $("#themeBtn").addEventListener("click", function () {
      const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
      setTheme(next);
    });

    // en-tête au défilement
    const header = $("#siteHeader");
    const onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // recherche
    const search = $("#searchInput");
    search.addEventListener("input", function () {
      state.query = search.value;
      render();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "/" && document.activeElement !== search) {
        const tag = (document.activeElement && document.activeElement.tagName) || "";
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        e.preventDefault();
        search.focus();
        search.select();
      }
      if (e.key === "Escape") {
        lang.classList.remove("is-open");
        langBtn.setAttribute("aria-expanded", "false");
      }
    });

    // filtres
    $("#categoryChips").addEventListener("click", function (e) {
      const btn = e.target.closest("[data-category]");
      if (!btn) return;
      state.category = btn.dataset.category;
      renderChips();
      render();
    });
    $("#platformFilter").addEventListener("change", function (e) {
      state.platform = e.target.value;
      render();
    });
    $("#sortSelect").addEventListener("change", function (e) {
      state.sort = e.target.value;
      render();
    });

    // cartes : télécharger / détails
    $("#appGrid").addEventListener("click", function (e) {
      const dlBtn = e.target.closest("[data-download]");
      if (dlBtn) {
        const app = appById(dlBtn.dataset.download);
        if (app) downloadApp(app);
        return;
      }
      const detBtn = e.target.closest("[data-details]");
      if (detBtn) {
        const app = appById(detBtn.dataset.details);
        if (app) openModal(app);
        return;
      }
      if (e.target.closest("#resetFilters")) {
        state.category = "all";
        state.platform = "all";
        state.query = "";
        search.value = "";
        $("#platformFilter").value = "all";
        renderChips();
        renderPlatformFilter();
        render();
      }
    });

    // modale
    const dialog = $("#appModal");
    $("#modalClose").addEventListener("click", closeModal);
    // Fermeture au clic sur le fond : on exige un vrai appui sur le backdrop,
    // sinon un clic synthétique peut refermer la modale juste après son ouverture.
    let backdropDown = false;
    dialog.addEventListener("pointerdown", function (e) {
      backdropDown = e.target === dialog;
    });
    dialog.addEventListener("click", function (e) {
      if (backdropDown && e.target === dialog) closeModal();
      backdropDown = false;
    });
    dialog.addEventListener("close", function () {
      document.documentElement.style.removeProperty("--modal-accent");
    });

    // téléchargements depuis la modale
    $("#modalBody").addEventListener("click", function (e) {
      const row = e.target.closest("[data-dl-index]");
      if (!row) return;
      const app = appById(dialog.dataset.appId);
      const dl = app && (app.downloads || [])[Number(row.dataset.dlIndex)];
      if (dl && app) {
        e.preventDefault();
        triggerDownload(app, dl);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    // langue initiale
    let saved = null;
    try {
      saved = localStorage.getItem("ezoo-lang");
    } catch (e) {}
    if (saved && window.I18N[saved]) state.lang = saved;
    else if (document.documentElement.lang && window.I18N[document.documentElement.lang]) {
      state.lang = document.documentElement.lang;
    }

    setupLangMenu();
    wireEvents();
    applyTranslations();
    loadCatalogue();
  });
})();
