/* ============================================================
   Espace admin — édition locale du catalogue
   Le site est statique : l'admin modifie le JSON en mémoire,
   puis on exporte apps.json vers data/apps.json.
   ============================================================ */

(function () {
  "use strict";

  const DATA_URL = "/api/apps";
  const DRAFT_KEY = "ezoo-catalogue-draft";
  const CATS = { download: "Téléchargement", video: "Vidéo", utility: "Utilitaires" };
  const PLATFORMS = { macos: "macOS", windows: "Windows", linux: "Linux" };
  const LANGS = [
    ["fr", "FR"],
    ["en", "EN"],
    ["ar", "AR"]
  ];

  const state = {
    data: { updated: null, apps: [] },
    selected: null,
    dirty: false,
    exported: false,
    draft: null,
    draftAvailable: false,
    errors: []
  };

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /* ---------------------------------------------- helpers ----- */

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function getPath(obj, path) {
    return path.split(".").reduce(function (acc, key) {
      return acc == null ? undefined : acc[key];
    }, obj);
  }

  function setPath(obj, path, value) {
    const parts = path.split(".");
    let cur = obj;
    parts.forEach(function (key, i) {
      if (i === parts.length - 1) {
        cur[key] = value;
        return;
      }
      if (typeof cur[key] !== "object" || cur[key] === null) {
        cur[key] = {};
      }
      cur = cur[key];
    });
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

  function fmtSize(bytes) {
    const units = ["o", "Ko", "Mo", "Go", "To"];
    let n = bytes;
    let i = 0;
    while (n >= 1024 && i < units.length - 1) {
      n /= 1024;
      i += 1;
    }
    return n.toLocaleString("fr-FR", { maximumFractionDigits: n < 10 ? 1 : 0 }) + " " + units[i];
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
    }, 4000);
  }

  function currentApp() {
    return state.data.apps.find(function (a) {
      return a.id === state.selected;
    });
  }

  /* ------------------------------------------ persistance ----- */

  let draftTimer = null;
  function scheduleDraft() {
    clearTimeout(draftTimer);
    draftTimer = setTimeout(function () {
      try {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({ savedAt: new Date().toISOString(), data: state.data })
        );
      } catch (e) {
        console.warn("Brouillon non enregistré (quota ?)", e);
      }
    }, 500);
  }

  function readDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && parsed.data && Array.isArray(parsed.data.apps) ? parsed : null;
    } catch (e) {
      return null;
    }
  }

  function draftDiffers() {
    const draft = readDraft();
    if (!draft) return false;
    try {
      return JSON.stringify(draft.data.apps) !== JSON.stringify(state.data.apps);
    } catch (e) {
      return true;
    }
  }

  /* ------------------------------------------------ rendu ----- */

  let sidebarTimer = null;
  function refreshSidebar() {
    clearTimeout(sidebarTimer);
    sidebarTimer = setTimeout(renderList, 180);
  }

  function renderList() {
    const list = $("#appList");
    if (!list) return;
    $("#appCount").textContent = state.data.apps.length;

    list.innerHTML = state.data.apps
      .map(function (app) {
        const active = app.id === state.selected;
        const icon = app.icon
          ? '<img src="' + esc(app.icon) + '" alt="" width="26" height="26">'
          : '<span class="dot">' + esc(initials(app.name)) + "</span>";
        const files = (app.downloads || []).length;
        return (
          '<li><button class="app-item" type="button" data-id="' +
          esc(app.id) +
          '"' +
          (active ? ' aria-current="true"' : "") +
          ">" +
          icon +
          '<span class="txt"><strong>' +
          esc(app.name || "Sans nom") +
          "</strong><small>v" +
          esc(app.version || "—") +
          " · " +
          files +
          " fichier" +
          (files > 1 ? "s" : "") +
          "</small></span></button></li>"
        );
      })
      .join("");

    $$("#appList img").forEach(function (img) {
      img.addEventListener("error", function () {
        const btn = img.closest(".app-item");
        const app = state.data.apps.find(function (a) {
          return a.id === btn.dataset.id;
        });
        const dot = document.createElement("span");
        dot.className = "dot";
        dot.textContent = initials(app ? app.name : "?");
        img.replaceWith(dot);
      });
    });
  }

  function textField(label, path, value, opts) {
    const o = opts || {};
    return (
      '<label class="field"><span>' +
      esc(label) +
      (o.hint ? ' <span class="hint">' + esc(o.hint) + "</span>" : "") +
      '</span><input type="' +
      (o.type || "text") +
      '" data-path="' +
      esc(path) +
      '" value="' +
      esc(value == null ? "" : value) +
      '" placeholder="' +
      esc(o.placeholder || "") +
      '"' +
      (o.mono ? ' class="mono"' : "") +
      "></label>"
    );
  }

  function i18nField(label, key, app, kind) {
    const rows = LANGS.map(function (pair) {
      const code = pair[0];
      const tag = pair[1];
      const value = getPath(app, key + "." + code);
      let input;
      if (kind === "lines") {
        const joined = Array.isArray(value) ? value.join("\n") : value || "";
        input =
          '<textarea data-path="' +
          key +
          "." +
          code +
          '" data-lines="1" rows="5">' +
          esc(joined) +
          "</textarea>";
      } else if (kind === "textarea") {
        input =
          '<textarea data-path="' +
          key +
          "." +
          code +
          '" rows="4">' +
          esc(value || "") +
          "</textarea>";
      } else {
        input =
          '<input type="text" data-path="' +
          key +
          "." +
          code +
          '" value="' +
          esc(value || "") +
          '">';
      }
      return '<div class="i18n-row"><span class="flag">' + tag + "</span>" + input + "</div>";
    }).join("");
    const hint =
      kind === "lines" ? '<span class="hint">Une ligne = un point clé</span>' : "";
    return (
      '<div class="field i18n-block"><span>' + esc(label) + " " + hint + '</span><div class="i18n-field">' + rows + "</div></div>"
    );
  }

  function downloadRow(dl, index) {
    const platforms = Object.keys(PLATFORMS)
      .map(function (p) {
        return (
          '<option value="' +
          p +
          '"' +
          (dl.platform === p ? " selected" : "") +
          ">" +
          PLATFORMS[p] +
          "</option>"
        );
      })
      .join("");

    return (
      '<div class="dl-card" data-dl-i="' +
      index +
      '">' +
      '<div class="dl-card-head"><strong>Fichier ' +
      (index + 1) +
      '</strong><button class="mini-btn danger" type="button" data-remove-dl="' +
      index +
      '" aria-label="Supprimer ce fichier" title="Supprimer ce fichier">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M9 7V5h6v2M7 7l1 13h8l1-13"/></svg>' +
      "</button></div>" +
      '<div class="grid-4">' +
      '<label class="field"><span>Plateforme</span><select data-dl="platform">' +
      platforms +
      "</select></label>" +
      '<label class="field"><span>Libellé affiché</span><input type="text" data-dl="label" value="' +
      esc(dl.label || "") +
      '"></label>' +
      '<label class="field"><span>Taille</span><input type="text" data-dl="size" value="' +
      esc(dl.size || "") +
      '" placeholder="74 Mo"></label>' +
      "</div>" +
      '<label class="field"><span>URL du fichier <span class="hint">ex. downloads/mon-app-1.0.zip</span></span><input type="text" data-dl="url" value="' +
      esc(dl.url || "") +
      '"></label>' +
      '<div class="sha-row"><label class="field"><span>SHA-256</span><input type="text" class="mono" data-dl="sha256" value="' +
      esc(dl.sha256 || "") +
      '"></label><label class="file-btn">Choisir un fichier…<input type="file" data-dl-file="' +
      index +
      '"></label></div>' +
      '<div class="file-status" data-file-status="' +
      index +
      '"></div>' +
      "</div>"
    );
  }

  function renderEditor() {
    const box = $("#editor");
    if (!box) return;

    if (!state.data.apps.length) {
      box.innerHTML =
        '<div class="empty-editor"><h2>Aucun logiciel</h2><p>Ajoutez votre premier logiciel pour construire le catalogue.</p><button class="btn btn-primary" type="button" id="emptyAdd">Ajouter un logiciel</button></div>';
      return;
    }

    const app = currentApp();
    if (!app) {
      state.selected = state.data.apps[0].id;
      renderEditor();
      return;
    }

    const catOptions = Object.keys(CATS)
      .map(function (c) {
        return (
          '<option value="' +
          c +
          '"' +
          (app.category === c ? " selected" : "") +
          ">" +
          CATS[c] +
          "</option>"
        );
      })
      .join("");

    const platformChecks = Object.keys(PLATFORMS)
      .map(function (p) {
        const checked = (app.platforms || []).indexOf(p) !== -1;
        return (
          '<label class="check"><input type="checkbox" data-platform="' +
          p +
          '"' +
          (checked ? " checked" : "") +
          ">" +
          PLATFORMS[p] +
          "</label>"
        );
      })
      .join("");

    const draftBanner = state.draftAvailable
      ? '<div class="banner"><strong>Brouillon local</strong> Des modifications non exportées ont été retrouvées dans ce navigateur.<span class="spacer"></span><button class="btn btn-ghost btn-sm" type="button" id="discardDraft">Ignorer</button><button class="btn btn-primary btn-sm" type="button" id="restoreDraft">Restaurer</button></div>'
      : "";

    const downloads = (app.downloads || []).map(downloadRow).join("");

    box.innerHTML =
      draftBanner +
      '<div class="panel"><h2>Identité</h2><div class="field-grid">' +
      textField("Nom du logiciel", "name", app.name, { placeholder: "Ezoo Download" }) +
      textField("Identifiant", "id", app.id, { hint: "minuscules et tirets" }) +
      textField("Éditeur", "publisher", app.publisher) +
      textField("Version", "version", app.version, { placeholder: "1.0.0" }) +
      textField("Date de publication", "released", app.released, { type: "date" }) +
      textField("Licence", "license", app.license, { placeholder: "GPL-3.0" }) +
      '<label class="field"><span>Catégorie</span><select data-path="category">' +
      catOptions +
      "</select></label>" +
      '<label class="field"><span>Couleur d’accent</span><input type="color" data-path="accent" value="' +
      esc(app.accent || "#8b5cf6") +
      '"></label>' +
      textField("Icône", "icon", app.icon, { hint: "chemin ou URL" }) +
      "</div>" +
      '<div class="platform-checks" style="margin-block-start:14px">' +
      '<label class="check"><input type="checkbox" data-bool="featured"' +
      (app.featured ? " checked" : "") +
      ">Mis en avant</label>" +
      '<label class="check"><input type="checkbox" data-bool="comingSoon"' +
      (app.comingSoon ? " checked" : "") +
      ">Bientôt disponible</label>" +
      "</div></div>" +

      '<div class="panel"><h2>Textes (FR / EN / AR)</h2>' +
      i18nField("Accroche", "tagline", app, "text") +
      i18nField("Description", "description", app, "textarea") +
      i18nField("Points clés", "features", app, "lines") +
      i18nField("Configuration requise", "requirements", app, "text") +
      i18nField("Nouveautés", "changelog", app, "textarea") +
      "</div>" +

      '<div class="panel"><h2>Plateformes</h2><div class="platform-checks">' +
      platformChecks +
      "</div></div>" +

      '<div class="panel"><h2>Téléchargements</h2><div class="dl-editor">' +
      (downloads || '<p style="margin:0;font-size:.85rem;color:var(--muted)">Aucun fichier pour ce logiciel.</p>') +
      '</div><button class="btn btn-ghost btn-sm" type="button" id="addDownload" style="margin-block-start:12px">+ Ajouter un fichier</button></div>' +

      '<div class="panel"><h2>Suppression</h2><button class="btn btn-ghost btn-sm" type="button" id="deleteApp" style="border-color:color-mix(in srgb, var(--danger) 40%, transparent);color:var(--danger)">Supprimer ce logiciel</button></div>';

    updateStatus();
  }

  function renderAll() {
    renderList();
    renderEditor();
  }

  /* --------------------------------------------- validation ----- */

  function validate() {
    const errs = [];
    const ids = {};
    state.data.apps.forEach(function (app, i) {
      const label = app.name ? "« " + app.name + " »" : "Logiciel " + (i + 1);
      if (!app.name) errs.push(label + " : le nom est obligatoire.");
      if (!app.id) {
        errs.push(label + " : l’identifiant est obligatoire.");
      } else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(app.id)) {
        errs.push(label + " : identifiant invalide (minuscules, chiffres et tirets).");
      } else if (ids[app.id]) {
        errs.push("Identifiant en double : " + app.id + ".");
      }
      ids[app.id] = true;
      if (!CATS[app.category]) errs.push(label + " : catégorie inconnue.");
      if (!app.released) errs.push(label + " : date de publication manquante.");
      (app.downloads || []).forEach(function (dl, j) {
        if (!dl.url) errs.push(label + " : le fichier " + (j + 1) + " n’a pas d’URL.");
      });
    });
    state.errors = errs;
    return errs;
  }

  function updateStatus() {
    const el = $("#saveStatus");
    if (!el) return;
    validate();
    el.className = "status";
    if (state.errors.length) {
      el.classList.add("err");
      el.textContent = state.errors.length + " erreur(s) : " + state.errors[0];
    } else if (state.dirty) {
      el.classList.add("dirty");
      el.textContent = "Modifications non exportées · brouillon local";
    } else if (state.exported) {
      el.classList.add("ok");
      el.textContent = "Exporté — remplacez maintenant data/apps.json";
    } else {
      el.classList.add("ok");
      el.textContent = "À jour";
    }
  }

  function markDirty() {
    state.dirty = true;
    state.exported = false;
    scheduleDraft();
    refreshSidebar();
    updateStatus();
  }

  /* ---------------------------------------------- actions ----- */

  function selectApp(id) {
    state.selected = id;
    renderAll();
    const active = $("#appList [aria-current='true']");
    if (active && active.scrollIntoView) active.scrollIntoView({ block: "nearest" });
  }

  function addApp() {
    let n = 1;
    let id = "nouveau-logiciel";
    while (state.data.apps.some(function (a) { return a.id === id; })) {
      n += 1;
      id = "nouveau-logiciel-" + n;
    }
    const app = {
      id: id,
      name: "Nouveau logiciel",
      publisher: "",
      icon: "assets/img/favicon.svg",
      accent: "#8b5cf6",
      category: "utility",
      version: "1.0.0",
      released: today(),
      license: "",
      platforms: ["macos"],
      comingSoon: false,
      tagline: { fr: "", en: "", ar: "" },
      description: { fr: "", en: "", ar: "" },
      features: { fr: [], en: [], ar: [] },
      changelog: { fr: "", en: "", ar: "" },
      requirements: { fr: "", en: "", ar: "" },
      downloads: []
    };
    state.data.apps.push(app);
    state.selected = app.id;
    markDirty();
    renderAll();
    const nameInput = $('[data-path="name"]');
    if (nameInput) {
      nameInput.focus();
      nameInput.select();
    }
  }

  function deleteApp() {
    const app = currentApp();
    if (!app) return;
    if (!window.confirm("Supprimer « " + (app.name || app.id) + " » du catalogue ?")) return;
    state.data.apps = state.data.apps.filter(function (a) {
      return a.id !== app.id;
    });
    state.selected = state.data.apps.length ? state.data.apps[0].id : null;
    markDirty();
    renderAll();
    toast("Logiciel supprimé.");
  }

  async function hashFile(file) {
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error("Le calcul SHA-256 nécessite https:// ou http://localhost.");
    }
    const buffer = await file.arrayBuffer();
    const digest = await window.crypto.subtle.digest("SHA-256", buffer);
    return Array.from(new Uint8Array(digest))
      .map(function (b) {
        return b.toString(16).padStart(2, "0");
      })
      .join("");
  }

  async function onFileChosen(index, input) {
    const file = input.files && input.files[0];
    if (!file) return;
    const scope = input.closest("[data-dl-i]");
    const status = scope ? scope.querySelector("[data-file-status]") : null;
    if (status) status.textContent = "Envoi du fichier…";
    try {
      const form = new FormData();
      form.append("file", file);

      const uploadResponse = await fetch("/api/apps/upload", {
        method: "POST",
        body: form
      });

      const uploadPayload = await uploadResponse.json().catch(function () {
        return {};
      });

      if (!uploadResponse.ok) {
        throw new Error(uploadPayload.error || "L’envoi du fichier a échoué.");
      }

      const sha = await hashFile(file);
      const app = currentApp();
      const dl = app && app.downloads ? app.downloads[index] : null;
      if (!dl) return;

      dl.sha256 = sha;
      dl.size = fmtSize(file.size);
      dl.url = uploadPayload.url || dl.url || "uploads/" + file.name;

      markDirty();
      await exportJSON();
      renderEditor();
      if (status) status.textContent = "Fichier enregistré sur le serveur.";
      toast("Fichier analysé : " + dl.size + " · SHA-256 calculé");
    } catch (err) {
      if (status) status.textContent = err.message;
      toast(err.message);
    }
  }

  function buildJSON() {
    return {
      updated: today(),
      apps: state.data.apps
    };
  }

  function prettyJSON() {
    return JSON.stringify(buildJSON(), null, 2) + "\n";
  }

  async function exportJSON() {
    const errs = validate();
    updateStatus();
    if (errs.length) {
      toast("Corrigez les " + errs.length + " erreur(s) avant d’exporter.");
      return;
    }

    try {
      const response = await fetch("/api/apps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: prettyJSON()
      });

      const payload = await response.json().catch(function () {
        return {};
      });

      if (!response.ok) {
        throw new Error(payload.error || "L’enregistrement du catalogue a échoué.");
      }

      state.dirty = false;
      state.exported = true;
      scheduleDraft();
      updateStatus();
      toast("Catalogue enregistré dans le backend.");
    } catch (err) {
      toast(err.message || "Échec de l’enregistrement.");
    }
  }

  async function copyJSON() {
    const text = prettyJSON();
    try {
      await navigator.clipboard.writeText(text);
      toast("JSON copié dans le presse-papiers.");
    } catch (e) {
      const area = document.createElement("textarea");
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      toast("JSON copié.");
    }
  }

  function importJSON(file) {
    const reader = new FileReader();
    reader.onload = function () {
      try {
        const parsed = JSON.parse(String(reader.result));
        const apps = Array.isArray(parsed) ? parsed : parsed.apps;
        if (!Array.isArray(apps)) throw new Error("Le fichier ne contient pas de tableau « apps ».");
        state.data = {
          updated: parsed.updated || today(),
          apps: apps
        };
        state.selected = apps.length ? apps[0].id : null;
        state.draftAvailable = false;
        markDirty();
        renderAll();
        toast(apps.length + " logiciel(s) importé(s).");
      } catch (err) {
        toast("Import impossible : " + err.message);
      }
    };
    reader.onerror = function () {
      toast("Lecture du fichier impossible.");
    };
    reader.readAsText(file);
  }

  function loadCatalogue(silent) {
    fetch(DATA_URL, { cache: "no-cache" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        state.data = {
          updated: data.updated || null,
          apps: Array.isArray(data.apps) ? data.apps : []
        };
        state.selected = state.data.apps.length ? state.data.apps[0].id : null;
        state.dirty = false;
        state.exported = false;
        state.draftAvailable = draftDiffers();
        renderAll();
        if (!silent) toast("Catalogue rechargé depuis data/apps.json.");
      })
      .catch(function (err) {
        const box = $("#editor");
        if (box) {
          box.innerHTML =
            '<div class="banner"><strong>Lecture impossible</strong> data/apps.json n’a pas pu être chargé. Lancez le site avec <code>node server.js</code> puis rechargez la page.</div>';
        }
        console.error(err);
      });
  }

  /* ----------------------------------------------- events ----- */

  function wireEvents() {
    $("#themeBtn").addEventListener("click", function () {
      const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem("ezoo-theme", next);
      } catch (e) {}
    });

    $("#appList").addEventListener("click", function (e) {
      const btn = e.target.closest(".app-item");
      if (!btn) return;
      selectApp(btn.dataset.id);
    });

    $("#addApp").addEventListener("click", addApp);

    $("#reloadBtn").addEventListener("click", function () {
      if (state.dirty && !window.confirm("Recharger le fichier et perdre les modifications non exportées ?")) {
        return;
      }
      loadCatalogue(false);
    });

    $("#exportBtn").addEventListener("click", exportJSON);
    $("#copyBtn").addEventListener("click", copyJSON);

    $("#previewBtn").addEventListener("click", function () {
      $("#jsonPreview").textContent = prettyJSON();
      const dialog = $("#jsonDialog");
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    });
    $("#jsonClose").addEventListener("click", function () {
      const dialog = $("#jsonDialog");
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
    });
    $("#jsonDialog").addEventListener("click", function (e) {
      if (e.target === this) this.close();
    });

    $("#importBtn").addEventListener("click", function () {
      $("#importFile").click();
    });
    $("#importFile").addEventListener("change", function (e) {
      const file = e.target.files && e.target.files[0];
      if (file) importJSON(file);
      e.target.value = "";
    });

    // édition des champs
    const editor = $("#editor");
    const onEdit = function (e) {
      const target = e.target;

      if (target.matches("[data-path]")) {
        const app = currentApp();
        if (!app) return;
        let value = target.value;
        if (target.dataset.lines) {
          value = value
            .split("\n")
            .map(function (l) { return l.trim(); })
            .filter(Boolean);
        }
        setPath(app, target.dataset.path, value);
        markDirty();
        return;
      }

      if (target.matches("[data-bool]")) {
        const app = currentApp();
        if (!app) return;
        setPath(app, target.dataset.bool, target.checked);
        markDirty();
        return;
      }

      if (target.matches("[data-platform]")) {
        const app = currentApp();
        if (!app) return;
        const p = target.dataset.platform;
        const list = Array.isArray(app.platforms) ? app.platforms.slice() : [];
        const i = list.indexOf(p);
        if (target.checked && i === -1) list.push(p);
        if (!target.checked && i !== -1) list.splice(i, 1);
        app.platforms = list;
        markDirty();
        return;
      }

      if (target.matches("[data-dl]")) {
        const app = currentApp();
        const card = target.closest("[data-dl-i]");
        if (!app || !card) return;
        const i = Number(card.dataset.dlI);
        if (!app.downloads || !app.downloads[i]) return;
        app.downloads[i][target.dataset.dl] = target.value;
        markDirty();
        return;
      }
    };

    editor.addEventListener("input", onEdit);
    editor.addEventListener("change", function (e) {
      if (e.target.matches("[data-dl-file]")) {
        onFileChosen(Number(e.target.dataset.dlFile), e.target);
        return;
      }
      if (
        e.target.matches("[data-platform], [data-bool], [data-path='category'], [data-path='released'], [data-path='accent']")
      ) {
        onEdit(e);
      }
    });

    editor.addEventListener("click", function (e) {
      if (e.target.closest("#emptyAdd") || e.target.closest("#addDownload")) {
        if (e.target.closest("#emptyAdd")) {
          addApp();
          return;
        }
        const app = currentApp();
        if (!app) return;
        if (!Array.isArray(app.downloads)) app.downloads = [];
        app.downloads.push({ platform: "macos", label: "macOS", url: "", size: "", sha256: "" });
        markDirty();
        renderEditor();
        return;
      }

      const remove = e.target.closest("[data-remove-dl]");
      if (remove) {
        const app = currentApp();
        if (!app) return;
        app.downloads.splice(Number(remove.dataset.removeDl), 1);
        markDirty();
        renderEditor();
        return;
      }

      if (e.target.closest("#deleteApp")) {
        deleteApp();
        return;
      }

      if (e.target.closest("#restoreDraft")) {
        const draft = readDraft();
        if (!draft) return;
        state.data = draft.data;
        state.selected = state.data.apps.length ? state.data.apps[0].id : null;
        state.draftAvailable = false;
        state.dirty = true;
        renderAll();
        toast("Brouillon restauré.");
        return;
      }

      if (e.target.closest("#discardDraft")) {
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch (err) {}
        state.draftAvailable = false;
        renderEditor();
        toast("Brouillon ignoré.");
      }
    });

    window.addEventListener("beforeunload", function (e) {
      if (!state.dirty) return;
      e.preventDefault();
      e.returnValue = "";
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    wireEvents();
    loadCatalogue(true);
  });
})();
