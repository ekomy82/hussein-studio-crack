/* ============================================================
   Traductions du site (FR / EN / AR)
   Ajouter une langue = ajouter une clé ici + un bouton dans la
   page (data-lang="xx").
   ============================================================ */

window.I18N = {
  fr: {
    "meta.title": "Hussein Studio — Télécharger nos logiciels",
    "meta.description":
      "Découvrez les logiciels, outils et ressources officielles de Hussein Studio. Catalogue public, licences claires et téléchargements vérifiés.",

    "a11y.skip": "Aller au catalogue",
    "a11y.theme": "Changer de thème",
    "a11y.lang": "Changer de langue",
    "a11y.search": "Rechercher un logiciel",
    "a11y.close": "Fermer",

    "brand.tagline": "Logiciels",

    "nav.apps": "Logiciels",
    "nav.why": "Pourquoi ici",
    "nav.faq": "FAQ",

    "hero.pill": "À venir",
    "hero.eyebrow": "Winhuss, l’archiveur universel, arrive bientôt",
    "hero.title": "Des logiciels utiles, prêts à <em>télécharger</em>.",
    "hero.lead":
      "Téléchargez les applications de Hussein Studio directement, sans compte ni détour. Chaque fichier est publié avec son empreinte SHA-256.",
    "hero.search": "Rechercher un logiciel…",
    "hero.hint": "Astuce : appuyez sur / pour rechercher",

    "stats.apps": "logiciels disponibles",
    "stats.platforms": "plateformes",
    "stats.direct": "téléchargements directs",

    "catalogue.title": "Le catalogue",
    "catalogue.sub": "Choisissez un logiciel, téléchargez la version de votre système.",
    "catalogue.count": "{n} logiciel(s)",
    "catalogue.countFiltered": "{n} résultat(s) sur {total}",

    "filter.all": "Tous",
    "filter.platform": "Plateforme",
    "filter.category": "Catégorie",
    "sort.label": "Trier",
    "sort.recent": "Plus récents",
    "sort.name": "Nom (A–Z)",

    "cat.download": "Téléchargement",
    "cat.video": "Vidéo",
    "cat.utility": "Utilitaires",

    "card.version": "v{v}",
    "card.download": "Télécharger",
    "card.soon": "Bientôt disponible",
    "card.details": "Détails de {name}",
    "card.size": "{size}",

    "empty.title": "Aucun logiciel trouvé",
    "empty.text": "Essayez un autre mot-clé ou retirez les filtres.",
    "empty.reset": "Réinitialiser les filtres",

    "error.title": "Impossible de charger le catalogue",
    "error.text":
      "Le fichier data/apps.json n'a pas pu être lu. Ouvrez le site via un serveur local :",
    "error.cmd": "node server.js",

    "values.verified.title": "Fichiers vérifiés",
    "values.verified.text":
      "Chaque téléchargement affiche sa taille et son empreinte SHA-256 pour contrôler l'intégrité.",
    "values.noaccount.title": "Sans compte",
    "values.noaccount.text":
      "Pas d'inscription, pas de publicité, pas de file d'attente. Vous cliquez, ça télécharge.",
    "values.multi.title": "Multiplateforme",
    "values.multi.text":
      "Builds natifs macOS, Windows et Linux, publiés dès qu'ils sont prêts.",

    "faq.title": "Questions fréquentes",
    "faq.intro": "Tout ce qu'il faut savoir avant de télécharger.",
    "faq.q1": "Le téléchargement est-il gratuit ?",
    "faq.a1":
      "Oui. Tous les logiciels de ce site sont téléchargeables gratuitement. Certains sont open source, d'autres sont proposés en usage personnel — la licence exacte est indiquée sur la fiche de chaque logiciel.",
    "faq.q2": "Comment vérifier qu'un fichier est intact ?",
    "faq.a2":
      "Chaque fiche publie l'empreinte SHA-256 du fichier. Sur macOS ou Linux, lancez « shasum -a 256 nom-du-fichier.zip » et comparez le résultat. Sous Windows, utilisez « certutil -hashfile fichier.zip SHA256 ».",
    "faq.q3": "macOS affiche un avertissement à l'ouverture, que faire ?",
    "faq.a3":
      "Les applications distribuées hors App Store ne sont pas toujours notariées. Ouvrez Réglages Système → Confidentialité et sécurité, puis cliquez sur « Ouvrir quand même ». Ne contournez cet avertissement que si le SHA-256 correspond à celui publié ici.",
    "faq.q4": "Comment être prévenu des mises à jour ?",
    "faq.a4":
      "Chaque fiche indique la version et la date de publication. Revenez sur cette page ou activez les notifications de l'application lorsqu'elles existent.",

    "footer.rights": "© {year} Hussein Studio. Tous droits réservés.",
    "footer.catalogue": "Catalogue",
    "footer.contact": "Contact",
    "footer.admin": "Espace admin",
    "footer.updated": "Catalogue mis à jour le {date}",

    "modal.about": "À propos",
    "modal.features": "Points clés",
    "modal.downloads": "Téléchargements",
    "modal.requirements": "Configuration requise",
    "modal.changelog": "Nouveautés",
    "modal.license": "Licence",
    "modal.integrity": "Empreinte SHA-256",
    "modal.integrityNote":
      "Comparez cette empreinte après le téléchargement pour vérifier que le fichier n'a pas été modifié.",
    "modal.published": "Publié le {date}",
    "modal.publisher": "par {name}",
    "modal.soonNote":
      "Ce logiciel n'est pas encore téléchargeable. Cette fiche sera mise à jour dès la publication des installeurs, avec leur empreinte SHA-256.",

    "toast.download": "Téléchargement de {name} lancé…",
    "toast.lang": "Langue : {lang}",

    "platform.all": "Toutes les plateformes",

    "date.locale": "fr-FR"
  },

  en: {
    "meta.title": "Hussein Studio — Download our software",
    "meta.description":
      "Download Hussein Studio apps: download manager, video tools and utilities. Verified files, no account required.",

    "a11y.skip": "Skip to catalogue",
    "a11y.theme": "Toggle theme",
    "a11y.lang": "Change language",
    "a11y.search": "Search software",
    "a11y.close": "Close",

    "brand.tagline": "Software",

    "nav.apps": "Software",
    "nav.why": "Why here",
    "nav.faq": "FAQ",

    "hero.pill": "Coming soon",
    "hero.eyebrow": "Winhuss, the universal archiver, is on its way",
    "hero.title": "Useful software, ready to <em>download</em>.",
    "hero.lead":
      "Get Hussein Studio apps straight from us — no account, no detour. Every file ships with its SHA-256 checksum.",
    "hero.search": "Search software…",
    "hero.hint": "Tip: press / to search",

    "stats.apps": "apps available",
    "stats.platforms": "platforms",
    "stats.direct": "direct downloads",

    "catalogue.title": "The catalogue",
    "catalogue.sub": "Pick an app, download the build for your system.",
    "catalogue.count": "{n} app(s)",
    "catalogue.countFiltered": "{n} of {total} results",

    "filter.all": "All",
    "filter.platform": "Platform",
    "filter.category": "Category",
    "sort.label": "Sort",
    "sort.recent": "Newest first",
    "sort.name": "Name (A–Z)",

    "cat.download": "Downloads",
    "cat.video": "Video",
    "cat.utility": "Utilities",

    "card.version": "v{v}",
    "card.download": "Download",
    "card.soon": "Coming soon",
    "card.details": "Details for {name}",
    "card.size": "{size}",

    "empty.title": "No software found",
    "empty.text": "Try another keyword or clear the filters.",
    "empty.reset": "Reset filters",

    "error.title": "Could not load the catalogue",
    "error.text":
      "data/apps.json could not be read. Open the site through a local server:",
    "error.cmd": "node server.js",

    "values.verified.title": "Verified files",
    "values.verified.text":
      "Every download shows its size and SHA-256 checksum so you can confirm integrity.",
    "values.noaccount.title": "No account",
    "values.noaccount.text":
      "No sign-up, no ads, no waiting queue. Click, download, done.",
    "values.multi.title": "Multi-platform",
    "values.multi.text":
      "Native macOS, Windows and Linux builds, published as soon as they are ready.",

    "faq.title": "Frequently asked",
    "faq.intro": "What you should know before downloading.",
    "faq.q1": "Is downloading free?",
    "faq.a1":
      "Yes. Every app on this site is free to download. Some are open source, others are offered for personal use — the exact licence is shown on each app page.",
    "faq.q2": "How do I check a file is intact?",
    "faq.a2":
      "Each app page publishes the file's SHA-256 checksum. On macOS or Linux run “shasum -a 256 file.zip”; on Windows run “certutil -hashfile file.zip SHA256” and compare the output.",
    "faq.q3": "macOS warns me when I open the app. What should I do?",
    "faq.a3":
      "Apps distributed outside the App Store are not always notarised. Open System Settings → Privacy & Security and click “Open Anyway”. Only do this when the SHA-256 matches the one published here.",
    "faq.q4": "How do I hear about updates?",
    "faq.a4":
      "Each app page shows its version and release date. Check back here, or enable in-app update notifications when the app offers them.",

    "footer.rights": "© {year} Hussein Studio. All rights reserved.",
    "footer.catalogue": "Catalogue",
    "footer.contact": "Contact",
    "footer.admin": "Admin",
    "footer.updated": "Catalogue updated on {date}",

    "modal.about": "About",
    "modal.features": "Highlights",
    "modal.downloads": "Downloads",
    "modal.requirements": "Requirements",
    "modal.changelog": "What's new",
    "modal.license": "Licence",
    "modal.integrity": "SHA-256 checksum",
    "modal.integrityNote":
      "Compare this checksum after downloading to confirm the file was not modified.",
    "modal.published": "Published {date}",
    "modal.publisher": "by {name}",
    "modal.soonNote":
      "This app is not downloadable yet. This page will be updated as soon as the installers are published, along with their SHA-256 checksums.",

    "toast.download": "Downloading {name}…",
    "toast.lang": "Language: {lang}",

    "platform.all": "All platforms",

    "date.locale": "en-US"
  },

  ar: {
    "meta.title": "Hussein Studio — حمّل برامجنا",
    "meta.description":
      "حمّل تطبيقات Hussein Studio: مدير تنزيلات وأدوات فيديو وأدوات مساعدة. ملفات موثّقة دون الحاجة إلى حساب.",

    "a11y.skip": "انتقل إلى قائمة البرامج",
    "a11y.theme": "تغيير السمة",
    "a11y.lang": "تغيير اللغة",
    "a11y.search": "ابحث عن برنامج",
    "a11y.close": "إغلاق",

    "brand.tagline": "برامج",

    "nav.apps": "البرامج",
    "nav.why": "لماذا هنا",
    "nav.faq": "الأسئلة",

    "hero.pill": "قريبًا",
    "hero.eyebrow": "Winhuss، أداة الأرشيف الشاملة، في الطريق إليك",
    "hero.title": "برامج مفيدة، جاهزة <em>للتنزيل</em>.",
    "hero.lead":
      "حمّل تطبيقات Hussein Studio مباشرة، دون حساب أو خطوات إضافية. كل ملف يُنشر مع بصمة SHA-256 الخاصة به.",
    "hero.search": "ابحث عن برنامج…",
    "hero.hint": "تلميح: اضغط / للبحث",

    "stats.apps": "برنامج متاح",
    "stats.platforms": "منصات",
    "stats.direct": "تنزيل مباشر",

    "catalogue.title": "قائمة البرامج",
    "catalogue.sub": "اختر برنامجًا وحمّل الإصدار المناسب لنظامك.",
    "catalogue.count": "{n} برنامج",
    "catalogue.countFiltered": "{n} من {total} نتيجة",

    "filter.all": "الكل",
    "filter.platform": "المنصة",
    "filter.category": "الفئة",
    "sort.label": "ترتيب",
    "sort.recent": "الأحدث",
    "sort.name": "الاسم (أ–ي)",

    "cat.download": "التنزيل",
    "cat.video": "الفيديو",
    "cat.utility": "أدوات",

    "card.version": "v{v}",
    "card.download": "تنزيل",
    "card.soon": "قريبًا",
    "card.details": "تفاصيل {name}",
    "card.size": "{size}",

    "empty.title": "لا توجد نتائج",
    "empty.text": "جرّب كلمة أخرى أو أزل عوامل التصفية.",
    "empty.reset": "إزالة التصفية",

    "error.title": "تعذّر تحميل قائمة البرامج",
    "error.text":
      "لم يتمكّن الموقع من قراءة الملف data/apps.json. افتح الموقع عبر خادم محلي:",
    "error.cmd": "node server.js",

    "values.verified.title": "ملفات موثّقة",
    "values.verified.text":
      "كل تنزيل يعرض حجم الملف وبصمة SHA-256 للتحقق من سلامته.",
    "values.noaccount.title": "دون حساب",
    "values.noaccount.text":
      "لا تسجيل، لا إعلانات، لا انتظار. اضغط وحمّل مباشرة.",
    "values.multi.title": "متعدد المنصات",
    "values.multi.text":
      "إصدارات أصلية لـ macOS وWindows وLinux تُنشر فور جهوزيتها.",

    "faq.title": "أسئلة شائعة",
    "faq.intro": "كل ما تحتاج معرفته قبل التنزيل.",
    "faq.q1": "هل التنزيل مجاني؟",
    "faq.a1":
      "نعم. جميع البرامج على هذا الموقع مجانية للتنزيل. بعضها مفتوح المصدر وبعضها للاستخدام الشخصي — الرخصة الدقيقة مذكورة في صفحة كل برنامج.",
    "faq.q2": "كيف أتحقق من سلامة الملف؟",
    "faq.a2":
      "تنشر كل صفحة بصمة SHA-256 للملف. على macOS أو Linux نفّذ «shasum -a 256 file.zip»، وعلى Windows نفّذ «certutil -hashfile file.zip SHA256» ثم قارن النتيجة.",
    "faq.q3": "يظهر تحذير عند فتح البرنامج على macOS، ماذا أفعل؟",
    "faq.a3":
      "التطبيقات الموزّعة خارج App Store ليست دائمًا موقّعة. افتح إعدادات النظام ← الخصوصية والأمان ثم اضغط «افتح على أي حال». لا تتجاوز التحذير إلا إذا طابقت بصمة SHA-256 المنشورة هنا.",
    "faq.q4": "كيف أعرف بالتحديثات؟",
    "faq.a4":
      "تعرض كل صفحة رقم الإصدار وتاريخ النشر. عُد إلى هذه الصفحة، أو فعّل إشعارات التحديث داخل البرنامج إن كانت متاحة.",

    "footer.rights": "© {year} Hussein Studio. جميع الحقوق محفوظة.",
    "footer.catalogue": "القائمة",
    "footer.contact": "اتصال",
    "footer.admin": "لوحة التحكم",
    "footer.updated": "آخر تحديث للقائمة: {date}",

    "modal.about": "حول البرنامج",
    "modal.features": "أبرز المزايا",
    "modal.downloads": "التنزيلات",
    "modal.requirements": "متطلبات التشغيل",
    "modal.changelog": "آخر التحديثات",
    "modal.license": "الرخصة",
    "modal.integrity": "بصمة SHA-256",
    "modal.integrityNote":
      "قارن هذه البصمة بعد التنزيل للتأكد من عدم تعديل الملف.",
    "modal.published": "نُشر في {date}",
    "modal.publisher": "بواسطة {name}",
    "modal.soonNote":
      "هذا البرنامج غير متاح للتنزيل بعد. ستُحدَّث هذه الصفحة فور نشر المثبّتات مع بصمات SHA-256 الخاصة بها.",

    "toast.download": "بدأ تنزيل {name}…",
    "toast.lang": "اللغة: {lang}",

    "platform.all": "كل المنصات",

    "date.locale": "ar"
  }
};

window.LANGUAGES = [
  { code: "fr", label: "Français", short: "FR" },
  { code: "en", label: "English", short: "EN" },
  { code: "ar", label: "العربية", short: "AR" }
];
