#!/usr/bin/env node
"use strict";

const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 10000;
const HOST = process.env.HOST || "0.0.0.0";
const DATA_FILE = path.join(ROOT, "data", "apps.json");
const UPLOAD_DIR = path.join(ROOT, "uploads");
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "hussein@1982";
const ADMIN_COOKIE = "hussein_studio_admin";

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const app = express();
const upload = multer({
  storage: multer.diskStorage({
    destination: function (_, __, cb) {
      cb(null, UPLOAD_DIR);
    },
    filename: function (_, file, cb) {
      const safeName = (file.originalname || "upload.bin")
        .replace(/[^a-zA-Z0-9._-]+/g, "-")
        .toLowerCase();
      const uniqueSuffix = Date.now() + "-" + Math.random().toString(36).slice(2, 8);
      cb(null, uniqueSuffix + "-" + safeName);
    }
  }),
  limits: {
    fileSize: 600 * 1024 * 1024
  }
});

function readCatalog() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.apps)) {
      throw new Error("data/apps.json is missing the apps[] array.");
    }
    return parsed;
  } catch (err) {
    throw new Error("Unable to read catalog: " + err.message);
  }
}

function writeCatalog(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2) + "\n");
}

function parseCookies(req) {
  const cookies = {};
  const raw = req.headers.cookie || "";
  raw.split(";").forEach(function (pair) {
    const index = pair.indexOf("=");
    if (index === -1) return;
    const name = pair.slice(0, index).trim();
    const value = pair.slice(index + 1).trim();
    cookies[name] = decodeURIComponent(value);
  });
  return cookies;
}

function isAdminAuthenticated(req) {
  return parseCookies(req)[ADMIN_COOKIE] === "true";
}

function requireAdmin(req, res, next) {
  if (isAdminAuthenticated(req)) return next();
  return res.status(401).json({ error: "Accès admin requis." });
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "25mb" }));
app.use((req, res, next) => {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Frame-Options": "SAMEORIGIN"
  });
  next();
});

app.get("/health", function (_, res) {
  res.json({ ok: true, status: "online" });
});

app.get("/api/apps", function (_, res) {
  try {
    res.json(readCatalog());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/apps", requireAdmin, function (req, res) {
  try {
    const payload = req.body;
    if (!payload || !Array.isArray(payload.apps)) {
      return res.status(400).json({ error: "Payload JSON invalide. Un tableau 'apps' est requis." });
    }

    const updated = {
      updated: payload.updated || new Date().toISOString().slice(0, 10),
      apps: payload.apps
    };

    writeCatalog(updated);
    res.json({ ok: true, updated: updated.updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/apps/upload", requireAdmin, upload.single("file"), function (req, res) {
  if (!req.file) {
    return res.status(400).json({ error: "Aucun fichier reçu." });
  }

  const publicUrl = "uploads/" + req.file.filename;
  res.json({
    ok: true,
    url: publicUrl,
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype
  });
});

app.get("/admin-login", function (req, res) {
  if (isAdminAuthenticated(req)) return res.redirect("/admin");
  res.sendFile(path.join(ROOT, "admin-login.html"));
});

app.post("/admin-login", function (req, res) {
  const password = (req.body && req.body.password) || "";
  if (password === ADMIN_PASSWORD) {
    res.setHeader(
      "Set-Cookie",
      `${ADMIN_COOKIE}=true; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
    );
    return res.redirect("/admin");
  }

  return res.status(401).send("Mot de passe incorrect.");
});

app.get("/admin", function (req, res) {
  if (!isAdminAuthenticated(req)) return res.redirect("/admin-login");
  res.sendFile(path.join(ROOT, "admin.html"));
});

app.get("/admin.html", function (req, res) {
  if (!isAdminAuthenticated(req)) return res.redirect("/admin-login");
  res.sendFile(path.join(ROOT, "admin.html"));
});

app.use("/uploads", express.static(UPLOAD_DIR));
app.use("/downloads", express.static(path.join(ROOT, "downloads")));
app.use("/data", express.static(path.join(ROOT, "data")));
app.use("/assets", express.static(path.join(ROOT, "assets")));
app.use(express.static(ROOT, { index: "index.html", extensions: ["html"] }));

app.use(function (req, res) {
  if (req.path && req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Endpoint introuvable." });
  }
  res.sendFile(path.join(ROOT, "index.html"));
});

app.listen(PORT, HOST, function () {
  console.log("");
  console.log("  Hussein Studio — backend actif");
  console.log("  ----------------------------------------");
  console.log("  Site   : http://" + HOST + ":" + PORT + "/");
  console.log("  Admin  : http://" + HOST + ":" + PORT + "/admin");
  console.log("  API    : http://" + HOST + ":" + PORT + "/api/apps");
  console.log("  Arrêt  : Ctrl+C");
  console.log("");
});
