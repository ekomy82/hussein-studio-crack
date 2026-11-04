# Hussein Studio Crack

Site de téléchargement de logiciels en ligne, orienté catalogue public, téléchargement direct et administration protégée.

## Aperçu

Hussein Studio Crack est un site de type software portal avec :

- catalogue public moderne et sombre
- téléchargement direct des fichiers
- gestion des logiciels via un panneau admin
- protection du panneau admin par mot de passe
- backend Node.js + Express pour servir le site et les API
- support d’upload de fichiers
- mise en production prête pour Render / Netlify / hébergement standard

## Démo locale

```bash
npm install
npm start
```

Accès local :
- Site public : http://127.0.0.1:10000/
- Admin : http://127.0.0.1:10000/admin-login
- Mot de passe admin : hussein@1982

## Structure du projet

```text
hussein-studio-crack/
├── server.js
├── package.json
├── render.yaml
├── index.html
├── admin-login.html
├── admin.html
├── manifest.json
├── robots.txt
├── data/
│   └── apps.json
├── downloads/
│   ├── EzooDownload-1.0.9-macOS.zip
│   └── CadreIA-1.0.0-macOS.zip
├── uploads/
├── assets/
│   ├── css/
│   ├── js/
│   └── img/
└── README.md
```

## Fonctionnalités

- Catalogue public alimenté par JSON
- API backend : `/api/apps`
- Upload de fichiers pour les logiciels
- Authentification simple du panneau admin via cookie
- Système de thème clair/sombre
- Traductions FR / EN / AR
- Fiches détaillées avec version, licence, plateforme, SHA-256, documentation

## Déploiement

### Render (recommandé)

1. Créer un service web sur Render
2. Connecter le dépôt GitHub
3. Configurer :
   - Build command : `npm install`
   - Start command : `npm start`
4. Ajouter les variables d’environnement :
   - `NODE_ENV=production`
   - `PORT=10000`
   - `ADMIN_PASSWORD=hussein@1982`
5. Déployer

Le fichier `render.yaml` est déjà présent dans le dépôt pour faciliter l’import.

### Netlify / autre hébergement statique

Ce projet est compatible avec un hébergement Node.js standard. Pour un hébergement purement statique, il faut adapter le backend et garder les fichiers dans un service compatible avec les téléchargements publics.

## Variables importantes

- `ADMIN_PASSWORD` : mot de passe du panneau d’administration
- `PORT` : port d’écoute du serveur
- `HOST` : optionnel, par défaut `0.0.0.0`

## Sécurité

Le panneau admin est protégé par un mot de passe simple, conçu pour une version locale / de publication standard. Pour un usage production sérieux, il est conseillé de passer à :

- mot de passe via variable d’environnement
- chiffrement / hash du mot de passe
- session plus robuste
- gestion d’accès plus stricte

## Notes

- Les fichiers lourds dans `downloads/` peuvent être stockés dans un service de stockage objet pour réduire le poids du dépôt Git.
- Le catalogue public est géré via le fichier `data/apps.json` et l’API backend.
- Le site est prêt pour publication, validation et extensions futures.

## Licence

Le projet est fourni tel quel pour usage de publication et développement interne. Les logiciels listés dans le catalogue restent soumis à leur licence respective.
