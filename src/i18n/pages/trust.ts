import { defineDict } from '../dict';

/* PRIVACY & CONFIDENTIALITY, BEFORE WE START, WORKING TERMS.
 *
 * These are factual and contractual pages. Every translation states the same
 * facts as the English: the same retention periods, limits, providers,
 * activation caveats and ownership terms, with nothing added, promised or
 * softened. They are careful professional translations for readability, not
 * certified legal translations; the English remains the reference text.
 *
 * Section bodies are trusted HTML. Internal links are written as {privacy},
 * {terms}, {before} and {contact} and resolved into the page's language at
 * render time; {emailLink} becomes the public contact address.
 */

interface Section {
  id: string;
  toc: string;
  title: string;
  html: string;
}

const en = {
  privacy: {
    title: 'Privacy & Confidentiality — Soufiane Aberbach',
    description:
      'How personal information and private client project material are handled, including service providers, retention and deletion requests.',
    heading: 'Privacy & confidentiality.',
    intro:
      'Your enquiry is a private conversation. This page explains what is received, why it is needed and how your project material is handled.',
    sections: [
      {
        id: 'information',
        toc: 'Personal information',
        title: 'Personal information',
        html: '<p>The brief form asks for your name, email, product stage and message. A company or brand, reference link and reference file are optional.</p><p>This information is used to receive, assess and respond to your enquiry. It is not sold or used for marketing.</p>',
      },
      {
        id: 'material',
        toc: 'Your project material',
        title: 'Your project material stays private',
        html: '<p>Sketches, garment references, patterns, technical flats, tech packs, fitting photographs and other sample or development material are private by default. They are not published or used in the Portfolio without your written permission.</p><p>Client-supplied material remains yours or its respective owner’s. Any ownership or licensing arrangement for commissioned work is defined in the project agreement; see <a href="{terms}">Working Terms</a>.</p>',
      },
      {
        id: 'providers',
        toc: 'Service providers',
        title: 'Service providers',
        html: '<dl><dt>Cloudflare — hosting, security and form storage</dt><dd>Cloudflare serves and protects the site and processes normal network request information. When form storage is active, the brief is saved before email is attempted. Uploaded references are designed to be held in private Cloudflare R2 storage, with no public download route. If the required storage is unavailable, the form declines the submission rather than discarding it.</dd><dt>Resend — email transport, when active</dt><dd>Resend passes accepted briefs to Soufiane’s receiving mailbox when email delivery is configured. An uploaded reference stays in private storage; the email contains its retrieval reference, not a public file link.</dd><dt>Gmail / Google — receiving mailbox</dt><dd>Soufiane receives and replies to enquiries through Gmail. Information sent by the form or by direct email may therefore be processed and held by Google as the mailbox provider.</dd><dt>Cloudflare Turnstile — spam check, when active</dt><dd>When enabled, Turnstile loads a Cloudflare script to check the submission. The form also uses validation and other spam screens. Visitors who cannot use the form can email directly.</dd><dt>Google Fonts — site typography</dt><dd>The site loads fonts from Google. Google receives normal network request information when those fonts are requested.</dd><dt>Embedded video — when you choose to play</dt><dd>The current Portfolio sessions are served from this domain. If a session uses YouTube, its player loads from youtube-nocookie.com only after you choose to play it. Loading that player contacts YouTube; the privacy-enhanced address does not mean no data is processed.</dd></dl>',
      },
      {
        id: 'analytics',
        toc: 'Site measurement',
        title: 'Site measurement',
        html: '<p>The application code does not include advertising trackers or an analytics integration. The hosting layer can add its own measurement: a Cloudflare analytics beacon was observed in production on 3 October 2026.</p><p>Cloudflare documents its Web Analytics / real-user measurement beacon as collecting page-view and browser performance information without accessing cookies or browser storage. This is separate from the information you type into a brief. The hosting settings determine whether and where it runs.</p><p>Details are available in <a href="https://developers.cloudflare.com/web-analytics/about/">Cloudflare’s analytics documentation</a> and its <a href="https://developers.cloudflare.com/speed/observatory/rum-beacon/">beacon privacy explanation</a>.</p>',
      },
      {
        id: 'retention',
        toc: 'Retention',
        title: 'Retention',
        html: '<p>The site’s brief-storage code sets a <strong>90-day expiry</strong> for a saved brief and any record noting failed email delivery. It does not store your raw IP address in the brief. A truncated hash derived from the IP is kept for rate limiting for up to one hour.</p><p>Uploaded references have the same 90-day retention target. Automatic file expiry depends on a separate storage setting whose production enforcement is still being verified. Please do not rely on a confirmed automatic deletion date for uploads; you can request deletion below.</p><p>A copy delivered to the receiving mailbox is not automatically deleted when the site’s brief record expires. The site’s 90-day expiry does not apply to Gmail copies or files shared by email.</p>',
      },
      {
        id: 'links',
        toc: 'Shared links',
        title: 'Shared links',
        html: '<p>A Drive, Dropbox, Figma or other reference link is only as private as its sharing settings. Check who can open it before sending, and share only the access needed for the enquiry.</p>',
      },
      {
        id: 'deletion',
        toc: 'Deletion & questions',
        title: 'Deletion & questions',
        html: '<p>To request deletion of a submitted brief, uploaded reference or mailbox copy, or to ask how material is handled, email {emailLink}. Include the brief reference if you have it, so the relevant material can be located.</p><p>For a link hosted in your own account, you can also change its sharing settings or revoke access there.</p>',
      },
    ] as Section[],
  },
  before: {
    title: 'Before We Start — Soufiane Aberbach',
    description:
      'What to send for a fashion development enquiry, how scope and quotations work, and what to expect from remote collaboration.',
    heading: 'Before we start.',
    intro:
      'You do not need a finished design to make the first enquiry. Bring what you have, explain what needs to move forward, and the next step can be defined together.',
    sections: [
      {
        id: 'send',
        toc: 'What you can send',
        title: 'What can I send?',
        html: '<p>A rough sketch, garment reference, technical flat, existing pattern, sample or fitting photographs, a tech pack, a production problem or a written idea can all be useful starting points.</p><p>Send the material that best explains the question. It does not have to be polished or complete.</p>',
      },
      {
        id: 'explain',
        toc: 'What to explain',
        title: 'What should I explain?',
        html: '<ul><li>The garment or product category.</li><li>Its current development stage and the material already available.</li><li>The problem to solve or objective to reach.</li><li>The deliverable you expect, if you know it.</li><li>Target timing and any relevant constraints.</li></ul><p>If part of this is still unclear, say so. Defining the missing information can be part of the first conversation.</p>',
      },
      {
        id: 'next',
        toc: 'What happens next',
        title: 'What happens next?',
        html: '<ol><li><strong>Send.</strong> Share a brief and the most useful reference.</li><li><strong>Review.</strong> The material is reviewed and open questions are clarified.</li><li><strong>Scope.</strong> Agree what needs doing and what you will receive.</li><li><strong>Quote.</strong> Confirm fees, timing, revisions and start conditions.</li><li><strong>Develop.</strong> Work proceeds through the stages the project needs.</li><li><strong>Approve / handoff.</strong> Confirm the relevant checkpoints and receive the agreed deliverables.</li></ol><p>This is a guide, not a fixed sequence for every enquiry. A fit correction, a new pattern and a full product-development project may need different stages.</p>',
      },
      {
        id: 'files',
        toc: 'Files & references',
        title: 'Files & references',
        html: '<p>The brief form supports one PDF, JPEG, PNG or WebP reference up to 10 MB when uploads are active. A reference link is also useful; check its sharing permissions before sending.</p><p>Larger files, editable patterns and other technical formats can be shared after first contact, using an agreed method. If the form is unavailable, email directly from the <a href="{contact}">Contact page</a>.</p>',
      },
      {
        id: 'collaboration',
        toc: 'Remote collaboration',
        title: 'Remote collaboration',
        html: '<p>Work is coordinated remotely from Tangier, Morocco. Clear references, annotated photographs and written feedback help keep development aligned across locations and time zones.</p><p>The communication method and checkpoints can be agreed for your team. Important approvals and scope changes are confirmed in writing.</p>',
      },
      {
        id: 'timing',
        toc: 'Timing, fees & revisions',
        title: 'Timing, fees & revisions',
        html: '<p>Timing is confirmed after the scope and material are reviewed. If you have a deadline, include it in the enquiry so feasibility can be discussed.</p><p>Fees are scope-based and confirmed before work begins. Included revisions and any payment or start conditions are defined in the quotation. Additional work or a changed direction may require a revised scope, fee or schedule.</p>',
      },
      {
        id: 'private',
        toc: 'Confidentiality & terms',
        title: 'Confidentiality & working terms',
        html: '<p>Client material is private by default. Portfolio publication requires written permission. Read <a href="{privacy}">Privacy & Confidentiality</a> for providers, retention and deletion requests.</p><p><a href="{terms}">Working Terms</a> explains scope, approvals, ownership, source files and production responsibilities.</p>',
      },
    ] as Section[],
  },
  terms: {
    title: 'Working Terms — Soufiane Aberbach',
    description:
      'General working principles for scope, quotations, revisions, approvals, confidentiality, source files and production responsibilities.',
    heading: 'Working terms.',
    intro:
      'Clear expectations protect the work and the people doing it. These are general working principles; your accepted quotation or project agreement defines the terms for your project.',
    sections: [
      {
        id: 'scope',
        toc: 'Written scope',
        title: 'An agreed written scope',
        html: '<p>Each project begins with a written scope. The proposal can define the garments and services involved, deliverables, file formats, milestones, expected timing, revision allowance, source-file inclusion and fees or payment schedule.</p><p>What is included should be clear before work begins. An open question can be resolved in the proposal rather than left to assumption.</p>',
      },
      {
        id: 'quotation',
        toc: 'Quotation',
        title: 'Pricing follows the scope',
        html: '<p>A quotation reflects complexity, the quality and completeness of existing inputs, the development required, the deliverables and urgency where relevant. There is no universal price for every garment or development problem.</p><p>Fees and the payment schedule are confirmed in the quotation or agreement before work starts.</p>',
      },
      {
        id: 'start',
        toc: 'Starting work',
        title: 'When work starts',
        html: '<p>Work begins once the scope is agreed, the required source and reference material is available, and any payment or other start condition stated in the accepted quotation has been satisfied.</p>',
      },
      {
        id: 'revisions',
        toc: 'Revisions & changes',
        title: 'Revisions & changes',
        html: '<p>Included revisions are those stated in the quotation or scope. A new direction, additional garment, changed deliverable or other work outside that scope may need revised timing, a revised fee or a new quotation.</p><p>The change and its implications are agreed in writing before the additional work proceeds.</p>',
      },
      {
        id: 'approvals',
        toc: 'Client approvals',
        title: 'Approvals are working checkpoints',
        html: '<p>Approved stages become the reference for what follows. If an approved decision changes later, patterns, specifications or other downstream work may need to be revisited. The resulting effect on scope and timing is discussed before proceeding.</p>',
      },
      {
        id: 'timing',
        toc: 'Delays & pauses',
        title: 'Delays, pauses & project closure',
        html: '<p>Timing depends on the agreed inputs and on timely information, feedback and approvals. If these are delayed, dates may move accordingly.</p><p>If a project pauses, the remaining work and availability are reviewed before restarting. If communication stops, a follow-up can establish whether the project should remain paused or be closed under the accepted agreement.</p>',
      },
      {
        id: 'cancellation',
        toc: 'Cancellation',
        title: 'Cancellation',
        html: '<p>Cancellation is handled according to the accepted quotation or agreement, taking account of work already completed and commitments already made. Any project-specific cancellation conditions should be settled before work starts.</p>',
      },
      {
        id: 'ownership',
        toc: 'Ownership & files',
        title: 'Ownership, licensing & source files',
        html: '<p>Ownership and licensing conditions for commissioned work are defined in the project quotation or agreement.</p><p>Editable or source files are supplied only when included in the agreed deliverables. File formats and the intended handoff should be confirmed as part of the scope.</p><p>Client-supplied material remains the property of the client or its respective owner. The client is responsible for having the rights and permissions needed to use the material supplied.</p>',
      },
      {
        id: 'confidentiality',
        toc: 'Confidentiality',
        title: 'Private by default',
        html: '<p>Client project material remains private. Publishing it or using it in the Portfolio requires written permission. See <a href="{privacy}">Privacy & Confidentiality</a> for how enquiry information and files are handled.</p>',
      },
      {
        id: 'production',
        toc: 'Production responsibility',
        title: 'Development & production responsibility',
        html: '<p>Soufiane can provide technical development, patterns, specifications and production guidance based on the agreed inputs and services. Clear references and approvals help the factory work from the intended product.</p><p>A third-party factory remains responsible for its workmanship, machinery and execution. Fabric variation and production decisions outside Soufiane’s control cannot be guaranteed by development documentation alone. Any production support or verification to be provided is defined in the scope.</p>',
      },
      {
        id: 'communication',
        toc: 'Communication',
        title: 'Professional communication & project agreements',
        html: '<p>Important approvals, scope changes and commitments should be confirmed in writing so both sides share the same reference.</p><p>An agreed quotation, purchase order, client contract or project agreement may define project-specific terms. These general principles are a starting point for that agreement, rather than a substitute for it.</p><p>For practical guidance on making the first enquiry, read <a href="{before}">Before We Start</a>.</p>',
      },
    ] as Section[],
  },
};

export const trust = defineDict(en, {
  fr: {
    privacy: {
      title: 'Confidentialité & données — Soufiane Aberbach',
      description:
        'Comment sont traités les données personnelles et les éléments de projet confidentiels des clients : prestataires, durées de conservation et demandes de suppression.',
      heading: 'Confidentialité & données.',
      intro:
        'Votre demande est un échange privé. Cette page explique ce qui est reçu, pourquoi c’est nécessaire et comment vos éléments de projet sont traités.',
      sections: [
        {
          id: 'information',
          toc: 'Données personnelles',
          title: 'Données personnelles',
          html: '<p>Le formulaire de brief demande votre nom, votre adresse e-mail, l’étape du produit et votre message. L’entreprise ou la marque, un lien de référence et un fichier de référence sont facultatifs.</p><p>Ces informations servent à recevoir, évaluer et traiter votre demande. Elles ne sont ni vendues ni utilisées à des fins marketing.</p>',
        },
        {
          id: 'material',
          toc: 'Vos éléments de projet',
          title: 'Vos éléments de projet restent confidentiels',
          html: '<p>Croquis, références de vêtements, patrons, dessins techniques à plat, dossiers techniques, photos d’essayage et autres éléments de prototypage ou de développement sont confidentiels par défaut. Ils ne sont ni publiés ni utilisés dans le Portfolio sans votre autorisation écrite.</p><p>Les éléments fournis par le client restent votre propriété ou celle de leur titulaire respectif. Toute disposition relative à la propriété ou aux licences des travaux commandés est définie dans l’accord de projet ; voir les <a href="{terms}">Conditions de collaboration</a>.</p>',
        },
        {
          id: 'providers',
          toc: 'Prestataires',
          title: 'Prestataires de services',
          html: '<dl><dt>Cloudflare — hébergement, sécurité et stockage du formulaire</dt><dd>Cloudflare diffuse et protège le site et traite les informations ordinaires liées aux requêtes réseau. Lorsque le stockage du formulaire est actif, le brief est enregistré avant toute tentative d’envoi d’e-mail. Les références téléversées sont conçues pour être conservées dans un stockage privé Cloudflare R2, sans lien de téléchargement public. Si le stockage requis n’est pas disponible, le formulaire refuse l’envoi plutôt que de le perdre.</dd><dt>Resend — acheminement des e-mails, lorsqu’il est actif</dt><dd>Resend transmet les briefs acceptés à la boîte de réception de Soufiane lorsque l’envoi d’e-mails est configuré. Une référence téléversée reste dans le stockage privé ; l’e-mail contient sa référence de récupération, et non un lien public vers le fichier.</dd><dt>Gmail / Google — boîte de réception</dt><dd>Soufiane reçoit les demandes et y répond via Gmail. Les informations envoyées par le formulaire ou par e-mail direct peuvent donc être traitées et conservées par Google en tant que fournisseur de messagerie.</dd><dt>Cloudflare Turnstile — contrôle anti-spam, lorsqu’il est actif</dt><dd>Lorsqu’il est activé, Turnstile charge un script Cloudflare pour vérifier l’envoi. Le formulaire applique également une validation et d’autres filtres anti-spam. Les visiteurs qui ne peuvent pas utiliser le formulaire peuvent écrire directement par e-mail.</dd><dt>Google Fonts — typographie du site</dt><dd>Le site charge ses polices depuis Google. Google reçoit les informations ordinaires liées aux requêtes réseau lorsque ces polices sont demandées.</dd><dt>Vidéo intégrée — lorsque vous choisissez de la lire</dt><dd>Les sessions actuelles du Portfolio sont diffusées depuis ce domaine. Si une session utilise YouTube, son lecteur se charge depuis youtube-nocookie.com uniquement après que vous avez choisi de la lire. Le chargement de ce lecteur contacte YouTube ; l’adresse à confidentialité renforcée ne signifie pas qu’aucune donnée n’est traitée.</dd></dl>',
        },
        {
          id: 'analytics',
          toc: 'Mesure d’audience',
          title: 'Mesure d’audience',
          html: '<p>Le code de l’application n’inclut ni traceur publicitaire ni outil d’analyse d’audience. La couche d’hébergement peut ajouter sa propre mesure : une balise d’analyse Cloudflare a été observée en production le 3 octobre 2026.</p><p>Selon sa documentation, la balise Web Analytics / de mesure des utilisateurs réels de Cloudflare collecte des informations sur les pages vues et les performances du navigateur, sans accéder aux cookies ni au stockage du navigateur. Cela est distinct des informations que vous saisissez dans un brief. Ce sont les réglages d’hébergement qui déterminent si et où elle s’exécute.</p><p>Plus de détails dans la <a href="https://developers.cloudflare.com/web-analytics/about/">documentation d’analyse de Cloudflare</a> et dans son <a href="https://developers.cloudflare.com/speed/observatory/rum-beacon/">explication sur la confidentialité de la balise</a> (en anglais).</p>',
        },
        {
          id: 'retention',
          toc: 'Conservation',
          title: 'Conservation',
          html: '<p>Le code de stockage des briefs du site fixe une <strong>expiration à 90 jours</strong> pour un brief enregistré et pour tout enregistrement signalant un échec d’envoi d’e-mail. Il ne stocke pas votre adresse IP brute dans le brief. Une empreinte tronquée dérivée de l’adresse IP est conservée jusqu’à une heure afin de limiter le nombre d’envois.</p><p>Les références téléversées ont le même objectif de conservation de 90 jours. Leur expiration automatique dépend d’un réglage de stockage distinct, dont l’application en production est encore en cours de vérification. Ne vous fiez donc pas à une date de suppression automatique confirmée pour les fichiers téléversés ; vous pouvez demander leur suppression ci-dessous.</p><p>Une copie remise dans la boîte de réception n’est pas supprimée automatiquement lorsque l’enregistrement du brief expire sur le site. L’expiration à 90 jours du site ne s’applique ni aux copies Gmail ni aux fichiers partagés par e-mail.</p>',
        },
        {
          id: 'links',
          toc: 'Liens partagés',
          title: 'Liens partagés',
          html: '<p>Un lien Drive, Dropbox, Figma ou tout autre lien de référence n’est confidentiel que dans la mesure où ses réglages de partage le sont. Vérifiez qui peut l’ouvrir avant de l’envoyer, et n’accordez que l’accès nécessaire à la demande.</p>',
        },
        {
          id: 'deletion',
          toc: 'Suppression & questions',
          title: 'Suppression & questions',
          html: '<p>Pour demander la suppression d’un brief envoyé, d’une référence téléversée ou d’une copie dans la boîte de réception, ou pour savoir comment vos éléments sont traités, écrivez à {emailLink}. Indiquez la référence du brief si vous l’avez, afin que les éléments concernés puissent être retrouvés.</p><p>Pour un lien hébergé sur votre propre compte, vous pouvez aussi y modifier ses réglages de partage ou en révoquer l’accès.</p>',
        },
      ],
    },
    before: {
      title: 'Avant de commencer — Soufiane Aberbach',
      description:
        'Que transmettre pour une demande de développement mode, comment fonctionnent le périmètre et les devis, et à quoi s’attendre d’une collaboration à distance.',
      heading: 'Avant de commencer.',
      intro:
        'Nul besoin d’un design abouti pour une première demande. Apportez ce que vous avez, expliquez ce qui doit avancer, et la prochaine étape se définira ensemble.',
      sections: [
        {
          id: 'send',
          toc: 'Ce que vous pouvez envoyer',
          title: 'Que puis-je envoyer ?',
          html: '<p>Un croquis rapide, une référence de vêtement, un dessin technique à plat, un patron existant, des photos de prototype ou d’essayage, un dossier technique, un problème de production ou une idée écrite peuvent tous être de bons points de départ.</p><p>Envoyez les éléments qui expliquent le mieux la question. Ils n’ont pas besoin d’être soignés ni complets.</p>',
        },
        {
          id: 'explain',
          toc: 'Ce qu’il faut expliquer',
          title: 'Que dois-je expliquer ?',
          html: '<ul><li>Le vêtement ou la catégorie de produit.</li><li>Son stade de développement actuel et les éléments déjà disponibles.</li><li>Le problème à résoudre ou l’objectif à atteindre.</li><li>Le livrable attendu, si vous le connaissez.</li><li>Le calendrier visé et les contraintes éventuelles.</li></ul><p>Si une partie reste floue, dites-le. Définir les informations manquantes peut faire partie du premier échange.</p>',
        },
        {
          id: 'next',
          toc: 'La suite',
          title: 'Que se passe-t-il ensuite ?',
          html: '<ol><li><strong>Envoi.</strong> Partagez un brief et la référence la plus utile.</li><li><strong>Analyse.</strong> Les éléments sont étudiés et les questions en suspens clarifiées.</li><li><strong>Périmètre.</strong> Nous convenons de ce qui doit être fait et de ce que vous recevrez.</li><li><strong>Devis.</strong> Honoraires, délais, révisions et conditions de démarrage sont confirmés.</li><li><strong>Développement.</strong> Le travail avance selon les étapes dont le projet a besoin.</li><li><strong>Validation / transmission.</strong> Les points de contrôle concernés sont confirmés et vous recevez les livrables convenus.</li></ol><p>Il s’agit d’un repère, pas d’une séquence figée pour chaque demande. Une correction de bien-aller, un nouveau patron et un projet complet de développement produit peuvent nécessiter des étapes différentes.</p>',
        },
        {
          id: 'files',
          toc: 'Fichiers & références',
          title: 'Fichiers & références',
          html: '<p>Le formulaire de brief accepte une référence PDF, JPEG, PNG ou WebP jusqu’à 10 Mo lorsque l’envoi de fichiers est activé. Un lien de référence est aussi utile ; vérifiez ses autorisations de partage avant de l’envoyer.</p><p>Les fichiers plus volumineux, les patrons modifiables et les autres formats techniques peuvent être partagés après un premier contact, selon une méthode convenue. Si le formulaire est indisponible, écrivez directement depuis la <a href="{contact}">page Contact</a>.</p>',
        },
        {
          id: 'collaboration',
          toc: 'Collaboration à distance',
          title: 'Collaboration à distance',
          html: '<p>Le travail est coordonné à distance depuis Tanger, au Maroc. Des références claires, des photos annotées et des retours écrits aident à garder le développement aligné entre les sites et les fuseaux horaires.</p><p>Le mode de communication et les points de contrôle peuvent être définis avec votre équipe. Les validations importantes et les changements de périmètre sont confirmés par écrit.</p>',
        },
        {
          id: 'timing',
          toc: 'Délais, honoraires & révisions',
          title: 'Délais, honoraires & révisions',
          html: '<p>Les délais sont confirmés après examen du périmètre et des éléments. Si vous avez une échéance, indiquez-la dans votre demande afin d’en discuter la faisabilité.</p><p>Les honoraires dépendent du périmètre et sont confirmés avant le début du travail. Les révisions incluses et les éventuelles conditions de paiement ou de démarrage sont définies dans le devis. Un travail supplémentaire ou un changement d’orientation peut nécessiter une révision du périmètre, des honoraires ou du calendrier.</p>',
        },
        {
          id: 'private',
          toc: 'Confidentialité & conditions',
          title: 'Confidentialité & conditions de collaboration',
          html: '<p>Les éléments des clients sont confidentiels par défaut. Toute publication dans le Portfolio requiert une autorisation écrite. Consultez <a href="{privacy}">Confidentialité & données</a> pour les prestataires, la conservation et les demandes de suppression.</p><p>Les <a href="{terms}">Conditions de collaboration</a> précisent le périmètre, les validations, la propriété, les fichiers sources et les responsabilités en production.</p>',
        },
      ],
    },
    terms: {
      title: 'Conditions de collaboration — Soufiane Aberbach',
      description:
        'Principes généraux de collaboration : périmètre, devis, révisions, validations, confidentialité, fichiers sources et responsabilités en production.',
      heading: 'Conditions de collaboration.',
      intro:
        'Des attentes claires protègent le travail et les personnes qui le réalisent. Il s’agit de principes généraux ; votre devis accepté ou votre accord de projet définit les conditions applicables à votre projet.',
      sections: [
        {
          id: 'scope',
          toc: 'Périmètre écrit',
          title: 'Un périmètre convenu par écrit',
          html: '<p>Chaque projet commence par un périmètre écrit. La proposition peut préciser les vêtements et prestations concernés, les livrables, les formats de fichiers, les jalons, les délais prévus, le nombre de révisions, l’inclusion des fichiers sources et les honoraires ou l’échéancier de paiement.</p><p>Ce qui est inclus doit être clair avant le début du travail. Une question ouverte peut être tranchée dans la proposition plutôt que laissée à l’interprétation.</p>',
        },
        {
          id: 'quotation',
          toc: 'Devis',
          title: 'Le prix découle du périmètre',
          html: '<p>Un devis reflète la complexité, la qualité et l’exhaustivité des éléments existants, le développement nécessaire, les livrables et, le cas échéant, l’urgence. Il n’existe pas de prix universel pour chaque vêtement ou chaque problème de développement.</p><p>Les honoraires et l’échéancier de paiement sont confirmés dans le devis ou l’accord avant le début du travail.</p>',
        },
        {
          id: 'start',
          toc: 'Démarrage',
          title: 'Quand le travail commence',
          html: '<p>Le travail commence une fois le périmètre convenu, les éléments sources et de référence nécessaires disponibles, et toute condition de paiement ou de démarrage prévue au devis accepté remplie.</p>',
        },
        {
          id: 'revisions',
          toc: 'Révisions & modifications',
          title: 'Révisions & modifications',
          html: '<p>Les révisions incluses sont celles indiquées dans le devis ou le périmètre. Une nouvelle orientation, un vêtement supplémentaire, un livrable modifié ou tout autre travail hors de ce périmètre peut nécessiter un délai révisé, des honoraires révisés ou un nouveau devis.</p><p>La modification et ses conséquences sont convenues par écrit avant que le travail supplémentaire ne commence.</p>',
        },
        {
          id: 'approvals',
          toc: 'Validations du client',
          title: 'Les validations sont des points de contrôle',
          html: '<p>Les étapes validées deviennent la référence pour la suite. Si une décision validée change ensuite, les patrons, les spécifications ou d’autres travaux en aval peuvent devoir être repris. L’effet sur le périmètre et les délais est discuté avant de poursuivre.</p>',
        },
        {
          id: 'timing',
          toc: 'Retards & pauses',
          title: 'Retards, pauses & clôture du projet',
          html: '<p>Les délais dépendent des éléments convenus ainsi que de la transmission en temps utile des informations, retours et validations. Si ceux-ci tardent, les dates peuvent être décalées en conséquence.</p><p>Si un projet est mis en pause, le travail restant et la disponibilité sont réexaminés avant la reprise. Si la communication s’interrompt, une relance permet de déterminer si le projet doit rester en pause ou être clôturé conformément à l’accord accepté.</p>',
        },
        {
          id: 'cancellation',
          toc: 'Annulation',
          title: 'Annulation',
          html: '<p>L’annulation est traitée conformément au devis ou à l’accord accepté, en tenant compte du travail déjà réalisé et des engagements déjà pris. Les éventuelles conditions d’annulation propres au projet doivent être fixées avant le début du travail.</p>',
        },
        {
          id: 'ownership',
          toc: 'Propriété & fichiers',
          title: 'Propriété, licences & fichiers sources',
          html: '<p>Les conditions de propriété et de licence des travaux commandés sont définies dans le devis ou l’accord de projet.</p><p>Les fichiers modifiables ou sources ne sont fournis que s’ils font partie des livrables convenus. Les formats de fichiers et les modalités de transmission prévues doivent être confirmés dans le cadre du périmètre.</p><p>Les éléments fournis par le client restent la propriété du client ou de leur titulaire respectif. Il incombe au client de disposer des droits et autorisations nécessaires à l’utilisation des éléments fournis.</p>',
        },
        {
          id: 'confidentiality',
          toc: 'Confidentialité',
          title: 'Confidentiel par défaut',
          html: '<p>Les éléments de projet des clients restent confidentiels. Leur publication ou leur utilisation dans le Portfolio nécessite une autorisation écrite. Consultez <a href="{privacy}">Confidentialité & données</a> pour savoir comment sont traités les informations et fichiers liés à une demande.</p>',
        },
        {
          id: 'production',
          toc: 'Responsabilité en production',
          title: 'Responsabilité du développement & de la production',
          html: '<p>Soufiane peut fournir développement technique, patrons, spécifications et accompagnement de production sur la base des éléments et prestations convenus. Des références et des validations claires aident l’usine à travailler d’après le produit voulu.</p><p>Une usine tierce reste responsable de sa main-d’œuvre, de ses machines et de son exécution. Les variations du tissu et les décisions de production échappant au contrôle de Soufiane ne peuvent être garanties par la seule documentation de développement. Tout accompagnement ou contrôle de production à fournir est défini dans le périmètre.</p>',
        },
        {
          id: 'communication',
          toc: 'Communication',
          title: 'Communication professionnelle & accords de projet',
          html: '<p>Les validations importantes, les changements de périmètre et les engagements doivent être confirmés par écrit, afin que chacun partage la même référence.</p><p>Un devis accepté, un bon de commande, un contrat client ou un accord de projet peut définir des conditions propres au projet. Ces principes généraux constituent un point de départ pour cet accord, et non un substitut.</p><p>Pour des conseils pratiques sur la première demande, consultez <a href="{before}">Avant de commencer</a>.</p>',
        },
      ],
    },
  },
  es: {
    privacy: {
      title: 'Privacidad y confidencialidad — Soufiane Aberbach',
      description:
        'Cómo se tratan los datos personales y el material privado de los proyectos de clientes: proveedores de servicios, conservación y solicitudes de eliminación.',
      heading: 'Privacidad y confidencialidad.',
      intro:
        'Tu consulta es una conversación privada. Esta página explica qué se recibe, por qué es necesario y cómo se trata el material de tu proyecto.',
      sections: [
        {
          id: 'information',
          toc: 'Datos personales',
          title: 'Datos personales',
          html: '<p>El formulario de brief solicita tu nombre, tu correo electrónico, la etapa del producto y tu mensaje. La empresa o marca, el enlace de referencia y el archivo de referencia son opcionales.</p><p>Esta información se utiliza para recibir, valorar y responder a tu consulta. No se vende ni se utiliza con fines de marketing.</p>',
        },
        {
          id: 'material',
          toc: 'El material de tu proyecto',
          title: 'El material de tu proyecto es privado',
          html: '<p>Bocetos, referencias de prendas, patrones, dibujos técnicos planos, fichas técnicas, fotos de pruebas de ajuste y cualquier otro material de muestra o de desarrollo son privados por defecto. No se publican ni se utilizan en el Portfolio sin tu permiso por escrito.</p><p>El material aportado por el cliente sigue siendo tuyo o de su respectivo titular. Cualquier acuerdo sobre la propiedad o las licencias del trabajo encargado se define en el acuerdo del proyecto; consulta las <a href="{terms}">Condiciones de trabajo</a>.</p>',
        },
        {
          id: 'providers',
          toc: 'Proveedores de servicios',
          title: 'Proveedores de servicios',
          html: '<dl><dt>Cloudflare — alojamiento, seguridad y almacenamiento del formulario</dt><dd>Cloudflare sirve y protege el sitio y procesa la información habitual de las solicitudes de red. Cuando el almacenamiento del formulario está activo, el brief se guarda antes de intentar enviar el correo. Las referencias subidas están pensadas para conservarse en un almacenamiento privado de Cloudflare R2, sin ruta de descarga pública. Si el almacenamiento necesario no está disponible, el formulario rechaza el envío en lugar de descartarlo.</dd><dt>Resend — envío de correo, cuando está activo</dt><dd>Resend entrega los briefs aceptados en el buzón de Soufiane cuando el envío de correo está configurado. Una referencia subida permanece en el almacenamiento privado; el correo contiene su referencia de recuperación, no un enlace público al archivo.</dd><dt>Gmail / Google — buzón de recepción</dt><dd>Soufiane recibe y responde a las consultas a través de Gmail. Por tanto, la información enviada mediante el formulario o por correo directo puede ser procesada y conservada por Google como proveedor del buzón.</dd><dt>Cloudflare Turnstile — control antispam, cuando está activo</dt><dd>Cuando está activado, Turnstile carga un script de Cloudflare para verificar el envío. El formulario aplica además validaciones y otros filtros antispam. Quien no pueda usar el formulario puede escribir directamente por correo.</dd><dt>Google Fonts — tipografía del sitio</dt><dd>El sitio carga sus fuentes desde Google. Google recibe la información habitual de las solicitudes de red cuando se solicitan esas fuentes.</dd><dt>Vídeo integrado — cuando decides reproducirlo</dt><dd>Las sesiones actuales del Portfolio se sirven desde este dominio. Si una sesión usa YouTube, su reproductor se carga desde youtube-nocookie.com solo después de que decidas reproducirla. Cargar ese reproductor conecta con YouTube; la dirección con privacidad mejorada no significa que no se procese ningún dato.</dd></dl>',
        },
        {
          id: 'analytics',
          toc: 'Medición del sitio',
          title: 'Medición del sitio',
          html: '<p>El código de la aplicación no incluye rastreadores publicitarios ni ninguna integración de analítica. La capa de alojamiento puede añadir su propia medición: el 3 de octubre de 2026 se observó en producción una baliza de analítica de Cloudflare.</p><p>Cloudflare documenta que su baliza de Web Analytics / medición de usuarios reales recopila información sobre páginas vistas y rendimiento del navegador sin acceder a cookies ni al almacenamiento del navegador. Esto es independiente de la información que escribes en un brief. La configuración del alojamiento determina si se ejecuta y dónde.</p><p>Hay más detalles en la <a href="https://developers.cloudflare.com/web-analytics/about/">documentación de analítica de Cloudflare</a> y en su <a href="https://developers.cloudflare.com/speed/observatory/rum-beacon/">explicación sobre la privacidad de la baliza</a> (ambas en inglés).</p>',
        },
        {
          id: 'retention',
          toc: 'Conservación',
          title: 'Conservación',
          html: '<p>El código de almacenamiento de briefs del sitio fija una <strong>caducidad de 90 días</strong> para un brief guardado y para cualquier registro que indique un fallo en el envío del correo. No guarda tu dirección IP sin procesar en el brief. Para limitar la frecuencia de envíos se conserva, durante un máximo de una hora, un hash truncado derivado de la IP.</p><p>Las referencias subidas tienen el mismo objetivo de conservación de 90 días. Su caducidad automática depende de una configuración de almacenamiento independiente cuya aplicación en producción aún se está verificando. No cuentes con una fecha de eliminación automática confirmada para los archivos subidos; puedes solicitar su eliminación más abajo.</p><p>Una copia entregada en el buzón de recepción no se elimina automáticamente cuando caduca el registro del brief en el sitio. La caducidad de 90 días del sitio no se aplica a las copias de Gmail ni a los archivos compartidos por correo.</p>',
        },
        {
          id: 'links',
          toc: 'Enlaces compartidos',
          title: 'Enlaces compartidos',
          html: '<p>Un enlace de Drive, Dropbox, Figma o de cualquier otra referencia es tan privado como su configuración para compartir. Comprueba quién puede abrirlo antes de enviarlo y comparte solo el acceso necesario para la consulta.</p>',
        },
        {
          id: 'deletion',
          toc: 'Eliminación y preguntas',
          title: 'Eliminación y preguntas',
          html: '<p>Para solicitar la eliminación de un brief enviado, de una referencia subida o de una copia en el buzón, o para preguntar cómo se trata el material, escribe a {emailLink}. Incluye la referencia del brief si la tienes, para poder localizar el material correspondiente.</p><p>Si el enlace está alojado en tu propia cuenta, también puedes cambiar allí su configuración para compartir o revocar el acceso.</p>',
        },
      ],
    },
    before: {
      title: 'Antes de empezar — Soufiane Aberbach',
      description:
        'Qué enviar en una consulta de desarrollo de moda, cómo funcionan el alcance y los presupuestos, y qué esperar de la colaboración a distancia.',
      heading: 'Antes de empezar.',
      intro:
        'No necesitas un diseño terminado para hacer la primera consulta. Trae lo que tengas, explica qué necesita avanzar y el siguiente paso se definirá conjuntamente.',
      sections: [
        {
          id: 'send',
          toc: 'Qué puedes enviar',
          title: '¿Qué puedo enviar?',
          html: '<p>Un boceto rápido, una referencia de prenda, un dibujo técnico plano, un patrón existente, fotos de muestras o de pruebas de ajuste, una ficha técnica, un problema de producción o una idea por escrito pueden ser buenos puntos de partida.</p><p>Envía el material que mejor explique la cuestión. No tiene que estar pulido ni completo.</p>',
        },
        {
          id: 'explain',
          toc: 'Qué explicar',
          title: '¿Qué debo explicar?',
          html: '<ul><li>La prenda o la categoría de producto.</li><li>Su etapa de desarrollo actual y el material ya disponible.</li><li>El problema que resolver o el objetivo que alcanzar.</li><li>El entregable que esperas, si lo sabes.</li><li>El plazo previsto y cualquier restricción relevante.</li></ul><p>Si parte de esto aún no está claro, dilo. Definir la información que falta puede formar parte de la primera conversación.</p>',
        },
        {
          id: 'next',
          toc: 'Qué pasa después',
          title: '¿Qué pasa después?',
          html: '<ol><li><strong>Envío.</strong> Comparte un brief y la referencia más útil.</li><li><strong>Revisión.</strong> Se revisa el material y se aclaran las dudas abiertas.</li><li><strong>Alcance.</strong> Se acuerda qué hay que hacer y qué vas a recibir.</li><li><strong>Presupuesto.</strong> Se confirman honorarios, plazos, revisiones y condiciones de inicio.</li><li><strong>Desarrollo.</strong> El trabajo avanza por las etapas que necesita el proyecto.</li><li><strong>Aprobación / traspaso.</strong> Se confirman los puntos de control correspondientes y recibes los entregables acordados.</li></ol><p>Es una guía, no una secuencia fija para todas las consultas. Una corrección de ajuste, un patrón nuevo y un proyecto completo de desarrollo de producto pueden requerir etapas distintas.</p>',
        },
        {
          id: 'files',
          toc: 'Archivos y referencias',
          title: 'Archivos y referencias',
          html: '<p>El formulario de brief admite una referencia en PDF, JPEG, PNG o WebP de hasta 10 MB cuando la subida de archivos está activa. Un enlace de referencia también es útil; comprueba sus permisos para compartir antes de enviarlo.</p><p>Los archivos más grandes, los patrones editables y otros formatos técnicos pueden compartirse tras el primer contacto, por un método acordado. Si el formulario no está disponible, escribe directamente desde la <a href="{contact}">página de Contacto</a>.</p>',
        },
        {
          id: 'collaboration',
          toc: 'Colaboración a distancia',
          title: 'Colaboración a distancia',
          html: '<p>El trabajo se coordina a distancia desde Tánger, Marruecos. Las referencias claras, las fotos anotadas y los comentarios por escrito ayudan a mantener el desarrollo alineado entre ubicaciones y zonas horarias.</p><p>El canal de comunicación y los puntos de control pueden acordarse con tu equipo. Las aprobaciones importantes y los cambios de alcance se confirman por escrito.</p>',
        },
        {
          id: 'timing',
          toc: 'Plazos, honorarios y revisiones',
          title: 'Plazos, honorarios y revisiones',
          html: '<p>Los plazos se confirman tras revisar el alcance y el material. Si tienes una fecha límite, inclúyela en la consulta para poder valorar su viabilidad.</p><p>Los honorarios dependen del alcance y se confirman antes de empezar. Las revisiones incluidas y cualquier condición de pago o de inicio se definen en el presupuesto. El trabajo adicional o un cambio de dirección pueden requerir revisar el alcance, los honorarios o el calendario.</p>',
        },
        {
          id: 'private',
          toc: 'Confidencialidad y condiciones',
          title: 'Confidencialidad y condiciones de trabajo',
          html: '<p>El material del cliente es privado por defecto. Publicarlo en el Portfolio requiere permiso por escrito. Consulta <a href="{privacy}">Privacidad y confidencialidad</a> para proveedores, conservación y solicitudes de eliminación.</p><p>Las <a href="{terms}">Condiciones de trabajo</a> explican el alcance, las aprobaciones, la propiedad, los archivos fuente y las responsabilidades de producción.</p>',
        },
      ],
    },
    terms: {
      title: 'Condiciones de trabajo — Soufiane Aberbach',
      description:
        'Principios generales de trabajo sobre alcance, presupuestos, revisiones, aprobaciones, confidencialidad, archivos fuente y responsabilidades de producción.',
      heading: 'Condiciones de trabajo.',
      intro:
        'Unas expectativas claras protegen el trabajo y a las personas que lo hacen. Estos son principios generales de trabajo; tu presupuesto aceptado o el acuerdo del proyecto definen las condiciones de tu proyecto.',
      sections: [
        {
          id: 'scope',
          toc: 'Alcance por escrito',
          title: 'Un alcance acordado por escrito',
          html: '<p>Cada proyecto empieza con un alcance por escrito. La propuesta puede definir las prendas y los servicios incluidos, los entregables, los formatos de archivo, los hitos, el plazo previsto, el número de revisiones, la inclusión de archivos fuente y los honorarios o el calendario de pagos.</p><p>Lo que está incluido debe quedar claro antes de empezar. Una duda abierta puede resolverse en la propuesta en lugar de dejarse a la suposición.</p>',
        },
        {
          id: 'quotation',
          toc: 'Presupuesto',
          title: 'El precio depende del alcance',
          html: '<p>Un presupuesto refleja la complejidad, la calidad y lo completo que esté el material existente, el desarrollo necesario, los entregables y, cuando corresponde, la urgencia. No existe un precio universal para cada prenda o problema de desarrollo.</p><p>Los honorarios y el calendario de pagos se confirman en el presupuesto o el acuerdo antes de empezar.</p>',
        },
        {
          id: 'start',
          toc: 'Inicio del trabajo',
          title: 'Cuándo empieza el trabajo',
          html: '<p>El trabajo empieza cuando el alcance está acordado, el material fuente y de referencia necesario está disponible y se ha cumplido cualquier condición de pago o de inicio indicada en el presupuesto aceptado.</p>',
        },
        {
          id: 'revisions',
          toc: 'Revisiones y cambios',
          title: 'Revisiones y cambios',
          html: '<p>Las revisiones incluidas son las indicadas en el presupuesto o el alcance. Una nueva dirección, una prenda adicional, un cambio de entregable u otro trabajo fuera de ese alcance pueden requerir un plazo revisado, unos honorarios revisados o un nuevo presupuesto.</p><p>El cambio y sus implicaciones se acuerdan por escrito antes de que avance el trabajo adicional.</p>',
        },
        {
          id: 'approvals',
          toc: 'Aprobaciones del cliente',
          title: 'Las aprobaciones son puntos de control',
          html: '<p>Las etapas aprobadas se convierten en la referencia de lo que sigue. Si una decisión aprobada cambia más adelante, puede que haya que revisar patrones, especificaciones u otros trabajos posteriores. El efecto resultante en el alcance y los plazos se comenta antes de continuar.</p>',
        },
        {
          id: 'timing',
          toc: 'Retrasos y pausas',
          title: 'Retrasos, pausas y cierre del proyecto',
          html: '<p>Los plazos dependen del material acordado y de que la información, los comentarios y las aprobaciones lleguen a tiempo. Si se retrasan, las fechas pueden moverse en consecuencia.</p><p>Si un proyecto se pausa, el trabajo pendiente y la disponibilidad se revisan antes de retomarlo. Si la comunicación se interrumpe, un seguimiento permite establecer si el proyecto debe seguir en pausa o cerrarse conforme al acuerdo aceptado.</p>',
        },
        {
          id: 'cancellation',
          toc: 'Cancelación',
          title: 'Cancelación',
          html: '<p>La cancelación se gestiona según el presupuesto o el acuerdo aceptado, teniendo en cuenta el trabajo ya realizado y los compromisos ya adquiridos. Cualquier condición de cancelación específica del proyecto debe fijarse antes de empezar.</p>',
        },
        {
          id: 'ownership',
          toc: 'Propiedad y archivos',
          title: 'Propiedad, licencias y archivos fuente',
          html: '<p>Las condiciones de propiedad y licencia del trabajo encargado se definen en el presupuesto o el acuerdo del proyecto.</p><p>Los archivos editables o fuente solo se entregan cuando forman parte de los entregables acordados. Los formatos de archivo y la forma de entrega prevista deben confirmarse como parte del alcance.</p><p>El material aportado por el cliente sigue siendo propiedad del cliente o de su respectivo titular. El cliente es responsable de contar con los derechos y permisos necesarios para utilizar el material aportado.</p>',
        },
        {
          id: 'confidentiality',
          toc: 'Confidencialidad',
          title: 'Privado por defecto',
          html: '<p>El material de los proyectos de clientes es privado. Publicarlo o utilizarlo en el Portfolio requiere permiso por escrito. Consulta <a href="{privacy}">Privacidad y confidencialidad</a> para saber cómo se tratan la información y los archivos de las consultas.</p>',
        },
        {
          id: 'production',
          toc: 'Responsabilidad de producción',
          title: 'Responsabilidad de desarrollo y producción',
          html: '<p>Soufiane puede aportar desarrollo técnico, patrones, especificaciones y orientación de producción a partir del material y los servicios acordados. Las referencias y aprobaciones claras ayudan a que la fábrica trabaje desde el producto previsto.</p><p>Una fábrica externa sigue siendo responsable de su mano de obra, su maquinaria y su ejecución. Las variaciones del tejido y las decisiones de producción fuera del control de Soufiane no pueden garantizarse solo con la documentación de desarrollo. Cualquier apoyo o verificación de producción que vaya a prestarse se define en el alcance.</p>',
        },
        {
          id: 'communication',
          toc: 'Comunicación',
          title: 'Comunicación profesional y acuerdos de proyecto',
          html: '<p>Las aprobaciones importantes, los cambios de alcance y los compromisos deben confirmarse por escrito para que ambas partes compartan la misma referencia.</p><p>Un presupuesto aceptado, una orden de compra, un contrato con el cliente o un acuerdo de proyecto pueden definir condiciones específicas del proyecto. Estos principios generales son un punto de partida para ese acuerdo, no un sustituto.</p><p>Para orientaciones prácticas sobre la primera consulta, lee <a href="{before}">Antes de empezar</a>.</p>',
        },
      ],
    },
  },
  ar: {
    privacy: {
      title: 'الخصوصية والسرّية — Soufiane Aberbach',
      description: 'كيف تُعالَج المعلومات الشخصية ومواد مشاريع العملاء الخاصة، بما في ذلك مزوّدو الخدمات ومدد الاحتفاظ وطلبات الحذف.',
      heading: 'الخصوصية والسرّية.',
      intro: 'طلبك محادثة خاصة. توضّح هذه الصفحة ما الذي يُستلَم، ولماذا يلزم، وكيف تُعامَل مواد مشروعك.',
      sections: [
        {
          id: 'information',
          toc: 'المعلومات الشخصية',
          title: 'المعلومات الشخصية',
          html: '<p>يطلب نموذج الموجز اسمك وبريدك الإلكتروني ومرحلة المنتج ورسالتك. أمّا الشركة أو العلامة التجارية، والرابط المرجعي، والملف المرجعي فاختيارية.</p><p>تُستخدم هذه المعلومات لاستلام طلبك وتقييمه والردّ عليه. ولا تُباع ولا تُستخدم لأغراض تسويقية.</p>',
        },
        {
          id: 'material',
          toc: 'مواد مشروعك',
          title: 'مواد مشروعك تبقى خاصة',
          html: '<p>الرسومات المبدئية، ومراجع القطع، والباترونات، والرسومات التقنية المسطّحة، والملفات التقنية، وصور جلسات القياس، وغيرها من مواد العيّنات أو التطوير، خاصةٌ افتراضياً. ولا تُنشر ولا تُستخدم في معرض الأعمال دون إذنك الكتابي.</p><p>تبقى المواد التي يقدّمها العميل ملكاً لك أو لصاحبها. ويُحدَّد أيّ ترتيب يخصّ ملكية الأعمال المُكلَّف بها أو ترخيصها في اتّفاق المشروع؛ راجع <a href="{terms}">شروط العمل</a>.</p>',
        },
        {
          id: 'providers',
          toc: 'مزوّدو الخدمات',
          title: 'مزوّدو الخدمات',
          html: '<dl><dt>Cloudflare — الاستضافة والأمان وتخزين النموذج</dt><dd>تقدّم Cloudflare الموقع وتحميه، وتعالج معلومات طلبات الشبكة الاعتيادية. وحين يكون تخزين النموذج مفعّلاً، يُحفَظ الموجز قبل محاولة إرسال البريد الإلكتروني. وقد صُمّم حفظ المراجع المرفوعة في مساحة تخزين خاصة على Cloudflare R2، دون أيّ مسار تنزيل عام. وإذا لم تكن مساحة التخزين المطلوبة متاحة، يرفض النموذج الإرسال بدلاً من إهماله.</dd><dt>Resend — نقل البريد الإلكتروني، عند تفعيله</dt><dd>ينقل Resend الموجزات المقبولة إلى صندوق بريد Soufiane حين يكون إرسال البريد مُعَدّاً. ويبقى المرجع المرفوع في التخزين الخاص؛ إذ يتضمّن البريد الإلكتروني رقم استرجاعه، لا رابطاً عاماً إلى الملف.</dd><dt>Gmail / Google — صندوق البريد المستقبِل</dt><dd>يستقبل Soufiane الطلبات ويردّ عليها عبر Gmail. لذلك قد تعالج Google، بصفتها مزوّد خدمة البريد، المعلوماتِ المرسلة عبر النموذج أو بالبريد المباشر وتحتفظ بها.</dd><dt>Cloudflare Turnstile — التحقّق من الرسائل المزعجة، عند تفعيله</dt><dd>عند تفعيله، يحمّل Turnstile سكربتاً من Cloudflare للتحقّق من الإرسال. ويستخدم النموذج أيضاً عمليات تحقّق ومرشّحات أخرى للرسائل المزعجة. ويمكن لمن لا يستطيع استخدام النموذج المراسلة عبر البريد الإلكتروني مباشرة.</dd><dt>Google Fonts — خطوط الموقع</dt><dd>يحمّل الموقع خطوطه من Google. وتتلقّى Google معلومات طلبات الشبكة الاعتيادية عند طلب هذه الخطوط.</dd><dt>الفيديو المُضمَّن — حين تختار تشغيله</dt><dd>تُقدَّم جلسات معرض الأعمال الحالية من هذا النطاق. وإذا استخدمت جلسةٌ ما YouTube، فلا يُحمَّل مشغّلها من youtube-nocookie.com إلا بعد أن تختار تشغيلها. وتحميل هذا المشغّل يتّصل بـ YouTube؛ والعنوان المعزَّز للخصوصية لا يعني عدم معالجة أيّ بيانات.</dd></dl>',
        },
        {
          id: 'analytics',
          toc: 'قياس استخدام الموقع',
          title: 'قياس استخدام الموقع',
          html: '<p>لا تتضمّن شيفرة التطبيق أدوات تتبّع إعلانية ولا أيّ تكامل للتحليلات. وقد تضيف طبقة الاستضافة قياسها الخاص: فقد رُصدت إشارة تحليلات من Cloudflare في بيئة الإنتاج بتاريخ 3 أكتوبر 2026.</p><p>توضّح Cloudflare في وثائقها أنّ إشارة Web Analytics / قياس المستخدمين الفعليين تجمع معلومات عن مشاهدات الصفحات وأداء المتصفّح دون الوصول إلى ملفات تعريف الارتباط أو تخزين المتصفّح. وهذا منفصل عن المعلومات التي تكتبها في الموجز. وإعدادات الاستضافة هي التي تحدّد ما إذا كانت تعمل وأين.</p><p>التفاصيل متاحة في <a href="https://developers.cloudflare.com/web-analytics/about/">وثائق Cloudflare الخاصة بالتحليلات</a> وفي <a href="https://developers.cloudflare.com/speed/observatory/rum-beacon/">شرحها لخصوصية الإشارة</a> (بالإنجليزية).</p>',
        },
        {
          id: 'retention',
          toc: 'مدّة الاحتفاظ',
          title: 'مدّة الاحتفاظ',
          html: '<p>تحدّد شيفرة تخزين الموجزات في الموقع <strong>انتهاء صلاحية بعد 90 يوماً</strong> للموجز المحفوظ ولأيّ سجلّ يشير إلى فشل إرسال البريد الإلكتروني. ولا تخزّن عنوان IP الخاص بك كما هو في الموجز. ويُحتفَظ بقيمة تجزئة مختصرة مشتقّة من عنوان IP لمدة تصل إلى ساعة واحدة للحدّ من تكرار الإرسال.</p><p>للمراجع المرفوعة هدفُ الاحتفاظ نفسه، وهو 90 يوماً. ويعتمد انتهاء صلاحية الملفات تلقائياً على إعداد تخزين منفصل لا يزال تطبيقه في بيئة الإنتاج قيد التحقّق. لذا يُرجى عدم الاعتماد على تاريخ حذف تلقائي مؤكَّد للملفات المرفوعة؛ ويمكنك طلب حذفها أدناه.</p><p>النسخة التي تصل إلى صندوق البريد المستقبِل لا تُحذَف تلقائياً عند انتهاء صلاحية سجلّ الموجز في الموقع. ولا تسري مدّة الـ90 يوماً الخاصة بالموقع على نسخ Gmail ولا على الملفات المُرسلة بالبريد الإلكتروني.</p>',
        },
        {
          id: 'links',
          toc: 'الروابط المشتركة',
          title: 'الروابط المشتركة',
          html: '<p>خصوصية رابط Drive أو Dropbox أو Figma أو أيّ رابط مرجعي آخر تساوي خصوصية إعدادات مشاركته. تحقّق ممّن يستطيع فتحه قبل الإرسال، ولا تمنح إلا صلاحية الوصول اللازمة للطلب.</p>',
        },
        {
          id: 'deletion',
          toc: 'الحذف والأسئلة',
          title: 'الحذف والأسئلة',
          html: '<p>لطلب حذف موجز مُرسَل أو مرجع مرفوع أو نسخة في صندوق البريد، أو للاستفسار عن كيفية معاملة المواد، راسِل {emailLink}. أرفق رقم مرجع الموجز إن توفّر لديك، حتى يمكن تحديد المواد المعنية.</p><p>وبالنسبة إلى رابط مستضاف في حسابك الخاص، يمكنك أيضاً تغيير إعدادات مشاركته أو إلغاء الوصول إليه من هناك.</p>',
        },
      ],
    },
    before: {
      title: 'قبل أن نبدأ — Soufiane Aberbach',
      description: 'ما الذي ترسله في طلب تطوير أزياء، وكيف يُحدَّد نطاق العمل وعروض الأسعار، وما الذي تتوقّعه من التعاون عن بُعد.',
      heading: 'قبل أن نبدأ.',
      intro: 'لا تحتاج إلى تصميم مكتمل لتقديم طلبك الأول. أحضِر ما لديك، واشرح ما يحتاج إلى التقدّم، ثم نحدّد الخطوة التالية معاً.',
      sections: [
        {
          id: 'send',
          toc: 'ما يمكنك إرساله',
          title: 'ما الذي يمكنني إرساله؟',
          html: '<p>رسم مبدئي، أو مرجع لقطعة، أو رسم تقني مسطّح، أو باترون موجود، أو صور عيّنة أو جلسة قياس، أو ملف تقني، أو مشكلة في الإنتاج، أو فكرة مكتوبة — كلّها نقاط انطلاق مفيدة.</p><p>أرسل المواد التي تشرح السؤال على أفضل وجه. لا يلزم أن تكون مصقولة أو مكتملة.</p>',
        },
        {
          id: 'explain',
          toc: 'ما يجب شرحه',
          title: 'ما الذي ينبغي أن أشرحه؟',
          html: '<ul><li>القطعة أو فئة المنتج.</li><li>مرحلة التطوير الحالية والمواد المتوفّرة.</li><li>المشكلة المطلوب حلّها أو الهدف المطلوب بلوغه.</li><li>المُخرَج الذي تتوقّعه، إن كنت تعرفه.</li><li>التوقيت المستهدف وأيّ قيود ذات صلة.</li></ul><p>إن كان جزء من ذلك لا يزال غير واضح، فاذكر ذلك. فتحديد المعلومات الناقصة يمكن أن يكون جزءاً من الحديث الأول.</p>',
        },
        {
          id: 'next',
          toc: 'ما الذي يحدث بعد ذلك',
          title: 'ما الذي يحدث بعد ذلك؟',
          html: '<ol><li><strong>الإرسال.</strong> شارك موجزاً وأكثر المراجع فائدة.</li><li><strong>المراجعة.</strong> تُراجَع المواد وتُوضَّح الأسئلة المفتوحة.</li><li><strong>النطاق.</strong> نتّفق على ما يجب إنجازه وما ستتسلّمه.</li><li><strong>عرض السعر.</strong> تُؤكَّد الأتعاب والمواعيد والتعديلات وشروط البدء.</li><li><strong>التطوير.</strong> يتقدّم العمل عبر المراحل التي يحتاجها المشروع.</li><li><strong>الاعتماد / التسليم.</strong> تُؤكَّد نقاط المراجعة المعنية وتتسلّم المُخرجات المتّفق عليها.</li></ol><p>هذا دليل استرشادي، لا تسلسل ثابت لكلّ طلب. فتصحيح المقاس، وإعداد باترون جديد، ومشروع تطوير منتج كامل قد يحتاج كلّ منها إلى مراحل مختلفة.</p>',
        },
        {
          id: 'files',
          toc: 'الملفات والمراجع',
          title: 'الملفات والمراجع',
          html: '<p>يقبل نموذج الموجز مرجعاً واحداً بصيغة PDF أو JPEG أو PNG أو WebP حتى 10 ميغابايت عند تفعيل رفع الملفات. والرابط المرجعي مفيد أيضاً؛ تحقّق من صلاحيات مشاركته قبل الإرسال.</p><p>يمكن مشاركة الملفات الأكبر والباترونات القابلة للتعديل والصيغ التقنية الأخرى بعد التواصل الأول، بطريقة متّفق عليها. وإذا كان النموذج غير متاح، راسِل مباشرة من <a href="{contact}">صفحة التواصل</a>.</p>',
        },
        {
          id: 'collaboration',
          toc: 'التعاون عن بُعد',
          title: 'التعاون عن بُعد',
          html: '<p>يُنسَّق العمل عن بُعد من طنجة، المغرب. فالمراجع الواضحة والصور المشروحة والملاحظات المكتوبة تساعد على إبقاء التطوير متّسقاً بين المواقع والمناطق الزمنية.</p><p>يمكن الاتّفاق مع فريقك على وسيلة التواصل ونقاط المراجعة. وتُؤكَّد الاعتمادات المهمّة وتغييرات النطاق كتابةً.</p>',
        },
        {
          id: 'timing',
          toc: 'المواعيد والأتعاب والتعديلات',
          title: 'المواعيد والأتعاب والتعديلات',
          html: '<p>تُؤكَّد المواعيد بعد مراجعة النطاق والمواد. وإذا كان لديك موعد نهائي، فاذكره في طلبك لمناقشة إمكانية الالتزام به.</p><p>تُحدَّد الأتعاب وفق النطاق وتُؤكَّد قبل بدء العمل. ويُحدِّد عرض السعر التعديلات المشمولة وأيّ شروط للدفع أو البدء. وقد يتطلّب العمل الإضافي أو تغيير الاتّجاه مراجعة النطاق أو الأتعاب أو الجدول الزمني.</p>',
        },
        {
          id: 'private',
          toc: 'السرّية والشروط',
          title: 'السرّية وشروط العمل',
          html: '<p>مواد العميل خاصة افتراضياً. ويتطلّب نشرها في معرض الأعمال إذناً كتابياً. اطّلع على <a href="{privacy}">الخصوصية والسرّية</a> لمعرفة مزوّدي الخدمات ومدد الاحتفاظ وطلبات الحذف.</p><p>توضّح <a href="{terms}">شروط العمل</a> النطاق والاعتمادات والملكية والملفات المصدرية ومسؤوليات الإنتاج.</p>',
        },
      ],
    },
    terms: {
      title: 'شروط العمل — Soufiane Aberbach',
      description: 'مبادئ عامة للعمل تخصّ النطاق وعروض الأسعار والتعديلات والاعتمادات والسرّية والملفات المصدرية ومسؤوليات الإنتاج.',
      heading: 'شروط العمل.',
      intro:
        'التوقّعات الواضحة تحمي العمل والقائمين عليه. هذه مبادئ عامة للعمل؛ أمّا الشروط الخاصة بمشروعك فيحدّدها عرض السعر المقبول أو اتّفاق المشروع.',
      sections: [
        {
          id: 'scope',
          toc: 'نطاق مكتوب',
          title: 'نطاق عمل متّفق عليه كتابةً',
          html: '<p>يبدأ كلّ مشروع بنطاق عمل مكتوب. ويمكن أن يحدّد العرض القطع والخدمات المعنية، والمُخرجات، وصيغ الملفات، والمحطّات، والتوقيت المتوقّع، وعدد التعديلات المتاحة، وما إذا كانت الملفات المصدرية مشمولة، والأتعاب أو جدول الدفع.</p><p>يجب أن يكون المشمول واضحاً قبل بدء العمل. ويمكن حسم أيّ سؤال مفتوح في العرض بدلاً من تركه للافتراض.</p>',
        },
        {
          id: 'quotation',
          toc: 'عرض السعر',
          title: 'السعر يتبع النطاق',
          html: '<p>يعكس عرض السعر درجة التعقيد، وجودة المُدخلات الموجودة ومدى اكتمالها، والتطوير المطلوب، والمُخرجات، ومدى الاستعجال عند الاقتضاء. فلا يوجد سعر موحّد لكلّ قطعة أو لكلّ مشكلة تطوير.</p><p>تُؤكَّد الأتعاب وجدول الدفع في عرض السعر أو الاتّفاق قبل بدء العمل.</p>',
        },
        {
          id: 'start',
          toc: 'بدء العمل',
          title: 'متى يبدأ العمل',
          html: '<p>يبدأ العمل بعد الاتّفاق على النطاق، وتوفّر المواد المصدرية والمرجعية اللازمة، واستيفاء أيّ شرط للدفع أو أيّ شرط آخر للبدء منصوص عليه في عرض السعر المقبول.</p>',
        },
        {
          id: 'revisions',
          toc: 'التعديلات والتغييرات',
          title: 'التعديلات والتغييرات',
          html: '<p>التعديلات المشمولة هي تلك المذكورة في عرض السعر أو النطاق. وقد يتطلّب الاتّجاه الجديد، أو القطعة الإضافية، أو تغيير المُخرَج، أو أيّ عمل آخر خارج ذلك النطاق، توقيتاً معدّلاً أو أتعاباً معدّلة أو عرض سعر جديداً.</p><p>يُتّفق على التغيير وتبعاته كتابةً قبل المضيّ في العمل الإضافي.</p>',
        },
        {
          id: 'approvals',
          toc: 'اعتمادات العميل',
          title: 'الاعتمادات نقاط مراجعة في العمل',
          html: '<p>تصبح المراحل المعتمدة مرجعاً لما يليها. وإذا تغيّر قرار معتمد لاحقاً، فقد يلزم إعادة النظر في الباترونات أو المواصفات أو غيرها من الأعمال اللاحقة. ويُناقَش الأثر الناتج على النطاق والتوقيت قبل المتابعة.</p>',
        },
        {
          id: 'timing',
          toc: 'التأخير والتوقّف',
          title: 'التأخير والتوقّف وإغلاق المشروع',
          html: '<p>يعتمد التوقيت على المُدخلات المتّفق عليها، وعلى وصول المعلومات والملاحظات والاعتمادات في وقتها. وإذا تأخّرت، فقد تتغيّر المواعيد تبعاً لذلك.</p><p>إذا توقّف المشروع مؤقتاً، يُراجَع العمل المتبقّي والتوفّر قبل الاستئناف. وإذا انقطع التواصل، يمكن عبر المتابعة تحديد ما إذا كان المشروع سيبقى متوقّفاً أو يُغلَق وفق الاتّفاق المقبول.</p>',
        },
        {
          id: 'cancellation',
          toc: 'الإلغاء',
          title: 'الإلغاء',
          html: '<p>يُعالَج الإلغاء وفق عرض السعر أو الاتّفاق المقبول، مع مراعاة العمل المُنجَز والالتزامات القائمة. وينبغي تحديد أيّ شروط إلغاء خاصة بالمشروع قبل بدء العمل.</p>',
        },
        {
          id: 'ownership',
          toc: 'الملكية والملفات',
          title: 'الملكية والترخيص والملفات المصدرية',
          html: '<p>تُحدَّد شروط الملكية والترخيص للأعمال المُكلَّف بها في عرض السعر أو اتّفاق المشروع.</p><p>لا تُسلَّم الملفات القابلة للتعديل أو المصدرية إلا إذا كانت ضمن المُخرجات المتّفق عليها. وينبغي تأكيد صيغ الملفات وطريقة التسليم المقصودة ضمن النطاق.</p><p>تبقى المواد التي يقدّمها العميل ملكاً له أو لصاحبها. والعميل مسؤول عن امتلاك الحقوق والأذونات اللازمة لاستخدام المواد التي يقدّمها.</p>',
        },
        {
          id: 'confidentiality',
          toc: 'السرّية',
          title: 'خاص افتراضياً',
          html: '<p>تبقى مواد مشاريع العملاء خاصة. ويتطلّب نشرها أو استخدامها في معرض الأعمال إذناً كتابياً. راجع <a href="{privacy}">الخصوصية والسرّية</a> لمعرفة كيفية معاملة معلومات الطلبات وملفاتها.</p>',
        },
        {
          id: 'production',
          toc: 'مسؤولية الإنتاج',
          title: 'مسؤولية التطوير والإنتاج',
          html: '<p>يمكن لـ Soufiane تقديم التطوير التقني والباترونات والمواصفات والتوجيه في الإنتاج بناءً على المُدخلات والخدمات المتّفق عليها. وتساعد المراجع والاعتمادات الواضحة المصنعَ على العمل وفق المنتج المقصود.</p><p>يبقى المصنع الخارجي مسؤولاً عن جودة صنعته وآلاته وتنفيذه. ولا يمكن لوثائق التطوير وحدها أن تضمن اختلافات القماش أو قرارات الإنتاج الخارجة عن سيطرة Soufiane. ويُحدَّد في النطاق أيّ دعم أو تحقّق في الإنتاج سيُقدَّم.</p>',
        },
        {
          id: 'communication',
          toc: 'التواصل',
          title: 'التواصل المهني واتّفاقات المشاريع',
          html: '<p>ينبغي تأكيد الاعتمادات المهمّة وتغييرات النطاق والالتزامات كتابةً، حتى يتشارك الطرفان المرجع نفسه.</p><p>قد يحدّد عرض سعر مقبول أو أمر شراء أو عقد مع العميل أو اتّفاق مشروع شروطاً خاصة بالمشروع. وهذه المبادئ العامة نقطة انطلاق لذلك الاتّفاق، لا بديل عنه.</p><p>للاطّلاع على إرشادات عملية حول تقديم الطلب الأول، اقرأ <a href="{before}">قبل أن نبدأ</a>.</p>',
        },
      ],
    },
  },
});
