# Hussein Studio Crack — site de téléchargement

Site statique en HTML / CSS / JavaScript pour présenter tes logiciels et les faire
télécharger, sans compte ni base de données. Le catalogue est un simple fichier JSON,
et une petite page admin permet de le modifier sans écrire de code.

- Interface en **français, anglais et arabe** (RTL inclus)
- Thème **sombre / clair** mémorisé dans le navigateur
- Recherche instantanée, filtres par catégorie et par plateforme, tri
- Fiche détaillée par logiciel : description, points clés, prérequis, licence,
  nouveautés, taille et **empreinte SHA-256** de chaque fichier
- Téléchargements directs, compatibles avec les gestionnaires de téléchargement
  (le serveur local gère les requêtes `Range`)
- Page admin pour ajouter / modifier / supprimer un logiciel, calculer le SHA-256
  d'un fichier depuis le navigateur, puis exporter `apps.json`
- Aucune dépendance, aucun build : trois fichiers à héberger

## Démarrage rapide

```bash
cd ezoo-site
node server.js
```

- Site : http://127.0.0.1:3000/
- Admin : http://127.0.0.1:3000/admin

> Un serveur local est nécessaire : le navigateur bloque la lecture de
> `data/apps.json` quand la page est ouverte en `file://`.

Pour changer le port : `PORT=8080 node server.js`.

## Structure

```
ezoo-site/
├── index.html              # page publique
├── admin.html              # éditeur local du catalogue
├── server.js               # serveur de prévisualisation (Node, sans dépendance)
├── package.json
├── manifest.json           # manifeste PWA (icône, nom)
├── robots.txt
├── data/
│   └── apps.json           # ← le catalogue, modifiable à la main ou via /admin
├── downloads/              # ← les fichiers à télécharger (.zip, .dmg, .exe…)
│   ├── EzooDownload-1.0.9-macOS.zip
│   └── CadreIA-1.0.0-macOS.zip
└── assets/
    ├── css/style.css       # styles du site
    ├── css/admin.css       # styles de l'admin
    ├── js/i18n.js          # traductions FR / EN / AR
    ├── js/main.js          # catalogue, filtres, modale, téléchargements
    ├── js/admin.js         # éditeur
    └── img/                # logos et favicon
```

## Ajouter un logiciel

### Avec la page admin (recommandé)

1. Ouvre http://127.0.0.1:3000/admin.
2. Clique sur **+** pour créer une fiche, remplis le nom, l'identifiant
   (minuscules et tirets), la version, la catégorie, les textes FR/EN/AR.
3. Dans **Téléchargements**, clique sur **Choisir un fichier…** : le navigateur
   calcule le SHA-256 et la taille, et propose automatiquement
   `downloads/nom-du-fichier.zip`. Vérifie que le fichier est bien dans le dossier
   `downloads/`.
4. Clique sur **Exporter apps.json**, puis remplace `data/apps.json` par le fichier
   téléchargé (dans `Téléchargements`).
5. Recharge le site.

Les modifications sont aussi conservées dans le navigateur (brouillon local) :
si tu fermes l'onglet par erreur, la page admin propose de restaurer le brouillon
au prochain chargement.

### À la main

Édite `data/apps.json`. Chaque entrée accepte :

| Champ | Rôle |
|---|---|
| `id` | identifiant unique (slug) |
| `name`, `publisher` | nom affiché, éditeur |
| `icon` | chemin ou URL d'une icône carrée |
| `accent` | couleur d'accent (`#7c5cff`) |
| `category` | `download`, `video` ou `utility` (ajoutables dans `CATEGORY_ORDER` de `main.js`) |
| `version`, `released`, `license` | métadonnées affichées |
| `platforms` | `["macos"]`, `["windows"]`, `["linux"]`… |
| `tagline`, `description`, `features`, `changelog`, `requirements` | objets `{ "fr": …, "en": …, "ar": … }` |
| `downloads` | liste de `{ platform, label, url, size, sha256 }` |
| `comingSoon` | `true` affiche « Bientôt disponible » et désactive le bouton de téléchargement |

La fiche **PixelSort** est prête (textes, plateformes, icône) mais attend ses
installeurs : elle reste en `"comingSoon": true` tant que les fichiers ne sont pas
ajoutés.

La fiche **LibreOffice** montre comment référencer un logiciel hébergé ailleurs :
les `url` pointent vers les fichiers officiels de The Document Foundation et les
`sha256` proviennent des fichiers `.sha256` publiés par l'éditeur. Dans ce cas, le
téléchargement quitte le site pour le serveur officiel — pense à revérifier les
liens à chaque nouvelle version.

### Publier Winhuss quand les installeurs seront prêts

La fiche Winhuss existe déjà avec `"comingSoon": true` et trois plateformes
(`macos`, `windows`, `linux`). Pour la rendre téléchargeable :

1. Dépose les installeurs dans `downloads/` (ex. `Winhuss-1.0.0-win-x64.zip`,
   `Winhuss-1.0.0-macOS.zip`, `Winhuss-1.0.0-x86_64.AppImage`).
2. Ouvre `/admin`, sélectionne **Winhuss**, décoche **Bientôt disponible**.
3. Ajoute une ligne **Téléchargements** par système avec **Choisir un fichier…**
   (taille et SHA-256 remplies automatiquement).
4. **Exporter apps.json**, puis remplacer `data/apps.json`.
5. Rafraîchis le site : les boutons **Télécharger** apparaissent.

## Personnaliser

- **Nom du site** : `index.html` (bloc `.brand`) + `assets/js/i18n.js`
  (`brand.tagline`, textes du hero, du pied de page).
- **Couleurs** : variables `--brand`, `--brand-2` dans `assets/css/style.css`.
- **Textes** : tout est dans `assets/js/i18n.js` (`fr`, `en`, `ar`).
  Les textes des logiciels sont dans `data/apps.json`.
- **Icônes** : remplace `assets/img/favicon.svg` et les fichiers de `assets/img/`.
- **Contact** : lien `mailto:` dans le pied de page de `index.html`.

## Mettre en ligne

Le site n'a besoin que de fichiers statiques.

### Netlify (le plus simple)

1. Va sur https://app.netlify.com/drop
2. Glisse le dossier `ezoo-site` complet.
3. Le site est en ligne ; tu peux ensuite brancher un domaine.

Les fichiers de `downloads/` sont servis tels quels. Pour de gros fichiers ou
beaucoup de trafic, place-les plutôt sur un stockage objet (S3, R2, Backblaze)
et mets l'URL complète dans `downloads[].url`.

### Vercel / GitHub Pages

- Vercel : `vercel` dans le dossier, ou import du dépôt.
- GitHub Pages : pousse le dossier, active Pages sur la branche.
  Attention : GitHub refuse les fichiers de plus de 100 Mo et prévient au-delà
  de 50 Mo (l'archive Ezoo fait ~74 Mo).

### Après le déploiement

- Vérifie que `downloads/` est bien accessible (un `HEAD` sur l'URL du zip).
- Remplace `contact@example.com` par ta vraie adresse.
- Ajoute le domaine dans `robots.txt` (sitemap) si tu en crées un.

## Passer à un vrai backend (plus tard)

Le site est déjà prêt pour la suite. L'admin exporte un JSON propre : un backend
peut exposer les mêmes données et remplacer `fetch("data/apps.json")` dans
`main.js` par `fetch("/api/apps")`.

Pistes d'évolution :

1. **API** : `GET /api/apps`, `POST /api/apps` (admin), `DELETE /api/apps/:id`.
2. **Upload** : route multipart qui enregistre le fichier dans `downloads/` et
   renvoie `{ url, size, sha256 }`.
3. **Authentification** : session ou jeton pour protéger `/admin`.
4. **Statistiques** : compteur de téléchargements incrémenté par une route
   `GET /download/:id` qui redirige vers le fichier.
5. **Base de données** : SQLite suffit pour un catalogue ; les fichiers restent
   sur le disque ou un stockage objet.

`server.js` est volontairement minimal (statique + `Range`). Il peut servir de
point de départ : ajoute les routes API avant le bloc `fs.stat`.

## Notes de sécurité

- L'empreinte SHA-256 affichée provient du fichier au moment de l'export : si tu
  remplaces un binaire, recalcule-la depuis l'admin.
- macOS et Windows affichent un avertissement pour les applications non notariées.
  La FAQ du site explique la marche à suivre ; ne demande jamais de désactiver
  Gatekeeper de façon permanente.
- La page `admin.html` est publique une fois déployée. En mode statique elle ne
  peut rien casser (elle n'écrit que dans le navigateur), mais elle révèle la
  structure du catalogue. Pour la masquer : supprime `admin.html` du déploiement,
  ou protège-la avec l'authentification de ton hébergeur.

## Licence

Le code du site t'appartient. Les logiciels distribués via `downloads/` gardent
leur licence propre (voir la fiche de chaque logiciel).
