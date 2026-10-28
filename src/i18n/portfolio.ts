import type { Chapter, ImageAsset, Subject, TechPack, SimulationSession } from '../data/portfolio';
import { defineDict, fill } from './dict';
import { garmentAlt, garmentCaption } from './garments';
import type { Locale } from './locales';
import { terms } from './portfolio-terms';
import {translateTechPack} from './techpacks';

/* PORTFOLIO COPY — build-time only.
 *
 * The Portfolio's data modules (src/data/portfolio.ts and friends) are the
 * single source of garment identity, ordering, geometry and provenance, and
 * they are shared with the photography work in progress. Nothing here edits
 * them. Instead this module overlays words onto them at render time, keyed by
 * immutable ids: a chapter by its id, a category by its id, a photograph by
 * the English description it already carries. Ids, fragments, hashes, data
 * attributes and image files are never translated.
 *
 * The masthead — BETWEEN INSTINCT & CONSTRUCTION — is the brand signature
 * and stays in English in every language, tagged lang="en".
 */

export const pf = defineDict(
  {
    title: 'Portfolio — Soufiane Aberbach',
    description:
      'Womenswear and menswear product development, garment-development tech packs and CLO3D garment simulation — shown as development evidence, not decoration.',
    thesis: 'Fashion design, pattern development and technical product work — connected from concept to production.',
    scroll: 'Scroll to open the practice',
    styleFile: 'Style file',
    outro: 'One practice.<br />From design to <em>production</em>.',
    chaptersLabel: 'Portfolio chapters',
    close: 'Close',
    index: 'Index',
    indexLabel: 'Return to Portfolio index',
    worldsLabel: 'Portfolio worlds',
    portfolioIndex: 'Portfolio index',
    chapters: {
      womenswear: {
        title: 'Womenswear',
        statement: 'A strong silhouette starts with proportion, movement and a clear point of view.',
        highlight: 'silhouette',
        action: 'Enter Womenswear',
        alt: 'Woman in a red evening dress with the skirt in full movement, in a bone studio.',
        stateNote: 'Interface preview — temporary visual references, not authored project evidence.',
      },
      menswear: {
        title: 'Menswear',
        statement: 'Strong proportion gives tailoring its structure, balance and presence.',
        highlight: 'proportion',
        action: 'Enter Menswear',
        alt: 'Man in a cobalt double-breasted suit standing in a bone studio.',
        stateNote: 'Selected menswear work will be published here.',
      },
      '3d-simulation': {
        title: 'Development',
        statement: 'Pattern development resolves fit, balance and construction before sampling.',
        highlight: 'fit',
        action: 'Enter Development',
        alt: 'Chrome mannequin wearing a draped turquoise gown in a bone studio.',
        stateNote: '',
      },
      'tech-packs': {
        title: 'Tech Packs',
        statement: 'Clear specifications turn approved design decisions into instructions a factory can follow.',
        highlight: 'specifications',
        action: 'Enter Tech Packs',
        alt: 'Tech pack cover sheet: brand, season and style fields beside fabric swatches, with front and back flats of a tailored double-breasted coat.',
        stateNote: 'Demo documents for interface review. Selected real technical packs will replace them.',
      },
    },
    women: {
      territories: 'Womenswear territories',
      selected: '{name} selected looks',
      enter: 'Enter reference: {alt}',
      archive: 'Complete {name} reference archive',
      allReferences: '{name} / ALL {n} REFERENCES',
      allLooks: '{name} / ALL {n} LOOKS',
      exploreEdit: 'Explore the complete edit.',
      swipe: 'SWIPE TO EXPLORE',
      bothLooks: 'BOTH LOOKS',
      cueArrow: '→',
      railMany: '{name} archive. Swipe or scroll horizontally for every reference.',
      railPair: '{name} archive. Both references.',
      continue: 'CONTINUE',
      handoffArrow: '↗',
      fullCollection: 'Full reference collection / {n} preserved references',
      fullNote: 'Temporary reference photography. Original identities and source credits are preserved.',
      previewLabel: 'Reference preview',
      disclaimer: 'Temporary visual references for interface demonstration. No authorship of photographed garments is claimed.',
    },
    reader: {
      back: '←',
      final: 'FINAL PHOTOGRAPHY',
      reference: 'REFERENCE PHOTOGRAPHY',
      garment: 'The complete garment',
      photo: 'Photograph',
      referencePhoto: 'Reference photograph',
      external: '↗︎',
      controls: 'Garment photography',
      lookCloser: 'LOOK CLOSER',
      zoomOut: 'Zoom out',
      zoomIn: 'Zoom in',
      fit: 'FIT',
      original: 'ORIGINAL SOURCE ↗',
    },
    men: {
      back: '← Portfolio',
      worlds: 'Worlds',
      present: 'Present',
      looks: '10 looks',
      worldsLabel: 'Menswear worlds',
      scrollLabel: 'Menswear continuous exhibition. Scroll through four worlds; scene controls and Presentation Mode are optional.',
      inspect: 'Inspect {alt}',
      edit: 'The {name} edit.',
      tenLooks: 'Ten looks /',
      rail: '{name}: ten references. Swipe or use arrow keys to explore.',
      provenance:
        'Temporary reference photography. Independent photographers and garments; no ABERBACH authorship or endorsement is claimed. Credits accompany each photograph.',
      nextChapter: 'Next chapter',
      nextWorld: 'Next world',
      patternDevelopment: 'Pattern Development',
      fullCollection: 'Full reference collection / {n} preserved references',
      fullNote:
        'Temporary reference photography. Original identities and source credits are preserved; historical entries may share an original photograph.',
      flowExit: 'Continue scrolling / Pattern Development ↓',
      prev: 'Previous composed scene',
      scenes: 'Composed scenes',
      scene: 'Scene {n}',
      next: 'Next composed scene',
      mode: 'Scroll to explore',
      fullscreen: 'Toggle fullscreen',
      fullscreenButton: 'Fullscreen ↗',
      readerFinal: 'Final photography',
      readerReference: 'Reference photograph',
      referenceSource: 'Reference source',
      views: 'Photographic views',
      lookCloser: 'Look closer',
      fitReset: 'Fit / reset',
      original: 'Original source ↗',
      available: 'Available source photographs:',
    },
    development: {
      title: 'Pattern Development',
      descriptor:
        'Recorded development sessions from first pattern lines through 2D construction, CLO3D validation and fit decisions — the part of the work a photograph cannot hold still.',
      recording: 'Development recording {n}',
      description: 'A supplied recording from the pattern and 3D development archive.',
      posterAlt: 'Poster frame for development recording {n}.',
      playLabel: 'Play {title} — recorded development session',
      play: 'Play',
      privacy: 'Playing this video loads a player from YouTube.',
      soonLabel: 'Recorded development sessions',
      soonLead: 'Publishing soon.',
      soonNote:
        'The library is built for {n} sessions in the standard 16:9 format. Each one runs from the first pattern lines through 2D construction, CLO3D validation and the fit decisions that follow.',
    },
    packs: {
      descriptor:
        'Production-ready technical documentation — the document a factory can build from without calling to ask what was meant.',
      prototype: 'Interface prototype',
      notice:
        'These are demo packs, marked DEMO on every page and carrying no client name, measurement, grading or bill-of-materials value. Selected real technical packs will replace them.',
      pages: '{n} pages',
      open: 'Open {title} PDF reader',
      stamp: 'Demo — interface prototype',
      instruction: 'Select the document to read',
      empty: 'Selected technical pack examples will appear here.',
      ask: 'Ask about technical documentation',
      readerLabel: 'Technical document reader',
      newTab: 'Open in a new tab',
    },
  },
  {
    fr: {
      title: 'Portfolio — Soufiane Aberbach',
      description:
        'Développement produit femme et homme, dossiers techniques de développement de vêtements et simulation de vêtements sous CLO3D — présentés comme des preuves de développement, non comme un décor.',
      thesis: 'Design de mode, développement de patrons et travail technique du produit — reliés de l’idée à la production.',
      scroll: 'Faites défiler pour entrer dans l’atelier',
      styleFile: 'Dossier modèle',
      outro: 'Une seule pratique.<br />Du design à la <em>production</em>.',
      chaptersLabel: 'Chapitres du portfolio',
      close: 'Fermer',
      index: 'Index',
      indexLabel: 'Revenir à l’index du portfolio',
      worldsLabel: 'Univers du portfolio',
      portfolioIndex: 'Index du portfolio',
      chapters: {
        womenswear: {
          title: 'Femme',
          statement: 'Une silhouette forte naît des proportions, du mouvement et d’un parti pris affirmé.',
          highlight: 'silhouette',
          action: 'Entrer dans l’univers Femme',
          alt: 'Femme en robe du soir rouge, la jupe en plein mouvement, dans un studio couleur os.',
          stateNote: 'Aperçu de l’interface — références visuelles temporaires, et non preuves de projets réalisés.',
        },
        menswear: {
          title: 'Homme',
          statement: 'Ce sont les proportions qui donnent au vêtement tailleur sa structure, son équilibre et sa présence.',
          highlight: 'proportions',
          action: 'Entrer dans l’univers Homme',
          alt: 'Homme en costume croisé bleu cobalt, debout dans un studio couleur os.',
          stateNote: 'Une sélection de travaux homme sera publiée ici.',
        },
        '3d-simulation': {
          title: 'Développement',
          statement: 'Le développement du patron règle le bien-aller, l’équilibre et le montage avant le prototype.',
          highlight: 'bien-aller',
          action: 'Entrer dans le développement',
          alt: 'Mannequin de vitrine chromé vêtu d’une robe longue turquoise drapée, dans un studio couleur os.',
          stateNote: '',
        },
        'tech-packs': {
          title: 'Dossiers techniques',
          statement: 'Des spécifications claires transforment les décisions validées en instructions qu’une usine peut suivre.',
          highlight: 'spécifications',
          action: 'Ouvrir les dossiers techniques',
          alt: 'Page de garde d’un dossier technique : champs marque, saison et référence à côté d’échantillons de tissu, avec les dessins à plat devant et dos d’un manteau croisé tailleur.',
          stateNote: 'Documents de démonstration pour la revue de l’interface. Une sélection de vrais dossiers techniques les remplacera.',
        },
      },
      women: {
        territories: 'Univers Femme',
        selected: '{name} — silhouettes choisies',
        enter: 'Ouvrir la référence : {alt}',
        archive: 'Archive de référence complète — {name}',
        allReferences: '{name} / LES {n} RÉFÉRENCES',
        allLooks: '{name} / LES {n} SILHOUETTES',
        exploreEdit: 'Explorez la sélection complète.',
        swipe: 'BALAYEZ POUR EXPLORER',
        bothLooks: 'LES DEUX SILHOUETTES',
        cueArrow: '→',
        railMany: 'Archive {name}. Balayez ou faites défiler horizontalement pour voir chaque référence.',
        railPair: 'Archive {name}. Les deux références.',
        continue: 'CONTINUER',
        handoffArrow: '↗',
        fullCollection: 'Collection de référence complète / {n} références conservées',
        fullNote: 'Photographies de référence temporaires. Les identifiants d’origine et les crédits des sources sont conservés.',
        previewLabel: 'Aperçu de référence',
        disclaimer:
          'Références visuelles temporaires destinées à la démonstration de l’interface. Aucune paternité des vêtements photographiés n’est revendiquée.',
      },
      reader: {
        back: '←',
        final: 'PHOTOGRAPHIE FINALE',
        reference: 'PHOTOGRAPHIE DE RÉFÉRENCE',
        garment: 'Le vêtement complet',
        photo: 'Photographie',
        referencePhoto: 'Photographie de référence',
        external: '↗︎',
        controls: 'Photographies du vêtement',
        lookCloser: 'REGARDER DE PLUS PRÈS',
        zoomOut: 'Dézoomer',
        zoomIn: 'Zoomer',
        fit: 'AJUSTER',
        original: 'SOURCE ORIGINALE ↗',
      },
      men: {
        back: '← Portfolio',
        worlds: 'Univers',
        present: 'Présenter',
        looks: '10 silhouettes',
        worldsLabel: 'Univers Homme',
        scrollLabel:
          'Exposition continue Homme. Faites défiler les quatre univers ; les commandes de scène et le mode Présentation sont facultatifs.',
        inspect: 'Examiner : {alt}',
        edit: 'La sélection {name}.',
        tenLooks: 'Dix silhouettes /',
        rail: '{name} : dix références. Balayez ou utilisez les flèches du clavier pour explorer.',
        provenance:
          'Photographies de référence temporaires. Photographes et vêtements indépendants ; aucune paternité ni caution d’ABERBACH n’est revendiquée. Chaque photographie est accompagnée de son crédit.',
        nextChapter: 'Chapitre suivant',
        nextWorld: 'Univers suivant',
        patternDevelopment: 'Développement des patrons',
        fullCollection: 'Collection de référence complète / {n} références conservées',
        fullNote:
          'Photographies de référence temporaires. Les identifiants d’origine et les crédits des sources sont conservés ; des entrées historiques peuvent partager une même photographie d’origine.',
        flowExit: 'Continuez à faire défiler / Développement des patrons ↓',
        prev: 'Scène composée précédente',
        scenes: 'Scènes composées',
        scene: 'Scène {n}',
        next: 'Scène composée suivante',
        mode: 'Faites défiler pour explorer',
        fullscreen: 'Activer ou quitter le plein écran',
        fullscreenButton: 'Plein écran ↗',
        readerFinal: 'Photographie finale',
        readerReference: 'Photographie de référence',
        referenceSource: 'Source de référence',
        views: 'Vues photographiques',
        lookCloser: 'Regarder de plus près',
        fitReset: 'Ajuster / réinitialiser',
        original: 'Source originale ↗',
        available: 'Photographies sources disponibles :',
      },
      development: {
        title: 'Développement des patrons',
        descriptor:
          'Des sessions de développement enregistrées, des premiers tracés du patron à la construction 2D, à la validation sous CLO3D et aux décisions de bien-aller — la part du travail qu’une photographie ne peut pas figer.',
        recording: 'Enregistrement de développement {n}',
        description: 'Un enregistrement issu des archives de développement des patrons et de la 3D.',
        posterAlt: 'Image d’aperçu de l’enregistrement de développement {n}.',
        playLabel: 'Lire {title} — session de développement enregistrée',
        play: 'Lire',
        privacy: 'La lecture de cette vidéo charge un lecteur YouTube.',
        soonLabel: 'Sessions de développement enregistrées',
        soonLead: 'Publication prochaine.',
        soonNote:
          'La bibliothèque est conçue pour {n} sessions au format standard 16:9. Chacune va des premiers tracés du patron à la construction 2D, à la validation sous CLO3D et aux décisions de bien-aller qui suivent.',
      },
      packs: {
        descriptor:
          'Une documentation technique prête pour la production — le document à partir duquel une usine fabrique sans avoir à appeler pour comprendre l’intention.',
        prototype: 'Prototype d’interface',
        notice:
          'Il s’agit de dossiers de démonstration, marqués DEMO sur chaque page, sans nom de client, mesure, gradation ni valeur de nomenclature. Une sélection de vrais dossiers techniques les remplacera.',
        pages: '{n} pages',
        open: 'Ouvrir « {title} » dans le lecteur PDF',
        stamp: 'Démo — prototype d’interface',
        instruction: 'Sélectionnez le document pour le lire',
        empty: 'Une sélection d’exemples de dossiers techniques apparaîtra ici.',
        ask: 'Se renseigner sur la documentation technique',
        readerLabel: 'Lecteur de document technique',
        newTab: 'Ouvrir dans un nouvel onglet',
      },
    },
    es: {
      title: 'Portfolio — Soufiane Aberbach',
      description:
        'Desarrollo de producto de mujer y hombre, fichas técnicas de desarrollo de prendas y simulación de prendas en CLO3D, mostrados como evidencia de desarrollo, no como decoración.',
      thesis: 'Diseño de moda, desarrollo de patrones y trabajo técnico de producto, conectados del concepto a la producción.',
      scroll: 'Desplázate para entrar en el estudio',
      styleFile: 'Expediente del modelo',
      outro: 'Una sola práctica.<br />Del diseño a la <em>producción</em>.',
      chaptersLabel: 'Capítulos del portfolio',
      close: 'Cerrar',
      index: 'Índice',
      indexLabel: 'Volver al índice del portfolio',
      worldsLabel: 'Mundos del portfolio',
      portfolioIndex: 'Índice del portfolio',
      chapters: {
        womenswear: {
          title: 'Mujer',
          statement: 'Una silueta potente nace de la proporción, el movimiento y un punto de vista claro.',
          highlight: 'silueta',
          action: 'Entrar en Mujer',
          alt: 'Mujer con vestido de noche rojo y la falda en pleno movimiento, en un estudio color hueso.',
          stateNote: 'Vista previa de la interfaz: referencias visuales temporales, no evidencia de proyectos propios.',
        },
        menswear: {
          title: 'Hombre',
          statement: 'Una proporción precisa da a la sastrería su estructura, su equilibrio y su presencia.',
          highlight: 'proporción',
          action: 'Entrar en Hombre',
          alt: 'Hombre con traje cruzado azul cobalto, de pie en un estudio color hueso.',
          stateNote: 'Aquí se publicará una selección de trabajos de hombre.',
        },
        '3d-simulation': {
          title: 'Desarrollo',
          statement: 'El desarrollo del patrón resuelve el ajuste, el equilibrio y la confección antes de la muestra.',
          highlight: 'ajuste',
          action: 'Entrar en Desarrollo',
          alt: 'Maniquí cromado con un vestido largo turquesa drapeado, en un estudio color hueso.',
          stateNote: '',
        },
        'tech-packs': {
          title: 'Fichas técnicas',
          statement: 'Unas especificaciones claras convierten las decisiones de diseño aprobadas en instrucciones que una fábrica puede seguir.',
          highlight: 'especificaciones',
          action: 'Ver las fichas técnicas',
          alt: 'Portada de una ficha técnica: campos de marca, temporada y referencia junto a muestras de tejido, con los planos delantero y de espalda de un abrigo cruzado de sastrería.',
          stateNote: 'Documentos de demostración para revisar la interfaz. Una selección de fichas técnicas reales los sustituirá.',
        },
      },
      women: {
        territories: 'Mundos de Mujer',
        selected: '{name}: looks seleccionados',
        enter: 'Abrir la referencia: {alt}',
        archive: 'Archivo de referencia completo: {name}',
        allReferences: '{name} / LAS {n} REFERENCIAS',
        allLooks: '{name} / LOS {n} LOOKS',
        exploreEdit: 'Explora la selección completa.',
        swipe: 'DESLIZA PARA EXPLORAR',
        bothLooks: 'LOS DOS LOOKS',
        cueArrow: '→',
        railMany: 'Archivo de {name}. Desliza o desplázate en horizontal para ver todas las referencias.',
        railPair: 'Archivo de {name}. Las dos referencias.',
        continue: 'CONTINUAR',
        handoffArrow: '↗',
        fullCollection: 'Colección de referencia completa / {n} referencias conservadas',
        fullNote: 'Fotografía de referencia temporal. Se conservan las identidades originales y los créditos de las fuentes.',
        previewLabel: 'Vista previa de referencia',
        disclaimer:
          'Referencias visuales temporales para demostrar la interfaz. No se reivindica la autoría de las prendas fotografiadas.',
      },
      reader: {
        back: '←',
        final: 'FOTOGRAFÍA FINAL',
        reference: 'FOTOGRAFÍA DE REFERENCIA',
        garment: 'La prenda completa',
        photo: 'Fotografía',
        referencePhoto: 'Fotografía de referencia',
        external: '↗︎',
        controls: 'Fotografías de la prenda',
        lookCloser: 'VER DE CERCA',
        zoomOut: 'Alejar',
        zoomIn: 'Acercar',
        fit: 'AJUSTAR',
        original: 'FUENTE ORIGINAL ↗',
      },
      men: {
        back: '← Portfolio',
        worlds: 'Mundos',
        present: 'Presentar',
        looks: '10 looks',
        worldsLabel: 'Mundos de Hombre',
        scrollLabel:
          'Exposición continua de Hombre. Desplázate por los cuatro mundos; los controles de escena y el modo Presentación son opcionales.',
        inspect: 'Examinar: {alt}',
        edit: 'La selección {name}.',
        tenLooks: 'Diez looks /',
        rail: '{name}: diez referencias. Desliza o usa las flechas del teclado para explorar.',
        provenance:
          'Fotografía de referencia temporal. Fotógrafos y prendas independientes; no se reivindica autoría ni respaldo de ABERBACH. Cada fotografía lleva su crédito.',
        nextChapter: 'Capítulo siguiente',
        nextWorld: 'Mundo siguiente',
        patternDevelopment: 'Desarrollo de patrones',
        fullCollection: 'Colección de referencia completa / {n} referencias conservadas',
        fullNote:
          'Fotografía de referencia temporal. Se conservan las identidades originales y los créditos de las fuentes; algunas entradas históricas pueden compartir la misma fotografía original.',
        flowExit: 'Sigue desplazándote / Desarrollo de patrones ↓',
        prev: 'Escena compuesta anterior',
        scenes: 'Escenas compuestas',
        scene: 'Escena {n}',
        next: 'Escena compuesta siguiente',
        mode: 'Desplázate para explorar',
        fullscreen: 'Activar o salir de pantalla completa',
        fullscreenButton: 'Pantalla completa ↗',
        readerFinal: 'Fotografía final',
        readerReference: 'Fotografía de referencia',
        referenceSource: 'Fuente de referencia',
        views: 'Vistas fotográficas',
        lookCloser: 'Ver de cerca',
        fitReset: 'Ajustar / restablecer',
        original: 'Fuente original ↗',
        available: 'Fotografías originales disponibles:',
      },
      development: {
        title: 'Desarrollo de patrones',
        descriptor:
          'Sesiones de desarrollo grabadas, desde las primeras líneas del patrón hasta la construcción 2D, la validación en CLO3D y las decisiones de ajuste: la parte del trabajo que una fotografía no puede retener.',
        recording: 'Grabación de desarrollo {n}',
        description: 'Una grabación del archivo de desarrollo de patrones y 3D.',
        posterAlt: 'Fotograma de portada de la grabación de desarrollo {n}.',
        playLabel: 'Reproducir {title}: sesión de desarrollo grabada',
        play: 'Reproducir',
        privacy: 'Al reproducir este vídeo se carga un reproductor de YouTube.',
        soonLabel: 'Sesiones de desarrollo grabadas',
        soonLead: 'Próximamente.',
        soonNote:
          'La biblioteca está pensada para {n} sesiones en el formato estándar 16:9. Cada una recorre desde las primeras líneas del patrón hasta la construcción 2D, la validación en CLO3D y las decisiones de ajuste posteriores.',
      },
      packs: {
        descriptor:
          'Documentación técnica lista para producción: el documento con el que una fábrica puede trabajar sin tener que llamar para preguntar qué se quería decir.',
        prototype: 'Prototipo de interfaz',
        notice:
          'Son fichas de demostración, marcadas como DEMO en cada página y sin nombre de cliente, medidas, escalado ni valores de lista de materiales. Una selección de fichas técnicas reales las sustituirá.',
        pages: '{n} páginas',
        open: 'Abrir «{title}» en el lector de PDF',
        stamp: 'Demo — prototipo de interfaz',
        instruction: 'Selecciona el documento para leerlo',
        empty: 'Aquí aparecerá una selección de fichas técnicas de ejemplo.',
        ask: 'Preguntar por la documentación técnica',
        readerLabel: 'Lector de documentos técnicos',
        newTab: 'Abrir en una pestaña nueva',
      },
    },
  },
);

type ChapterId = keyof (typeof pf)['en']['chapters'];

/** A chapter with its words in the page language. Id, number, accent,
 *  geometry and image files are untouched. */
export function localizeChapter(chapter: Chapter, locale: Locale): Chapter {
  if (locale === 'en') return chapter;
  const words = pf[locale].chapters[chapter.id as ChapterId];
  if (!words) return chapter;
  return {
    ...chapter,
    title: words.title,
    statement: words.statement,
    highlight: words.highlight,
    action: words.action,
    stateNote: words.stateNote || chapter.stateNote,
    cover: { ...chapter.cover, image: { ...chapter.cover.image, alt: words.alt } },
  };
}

export const localizeTechPack = translateTechPack;

export function localizeSession(session: SimulationSession, index: number, locale: Locale): SimulationSession {
  if (locale === 'en') return session;
  const t = pf[locale].development;
  const n = String(index + 1).padStart(2, '0');
  return { ...session, title: fill(t.recording, { n }), description: t.description, posterAlt: fill(t.posterAlt, { n }) };
}

/** A garment subject in the page language: alt text, caption and view
 *  labels. Images are cloned, never mutated — the same data objects render
 *  every language within one build. Identity, crops and geometry stay. */
export function localizeSubject(subject: Subject, locale: Locale): Subject {
  if (locale === 'en') return subject;
  const clones = new Map<ImageAsset, ImageAsset>();
  const image = (asset: ImageAsset): ImageAsset => {
    if (!clones.has(asset)) clones.set(asset, { ...asset, alt: garmentAlt(asset.alt, locale) });
    return clones.get(asset)!;
  };
  const views = terms[locale].views as Record<string, string>;
  return {
    ...subject,
    cover: image(subject.cover),
    views: subject.views.map((v) => ({ ...v, image: image(v.image), label: views[v.label] ?? v.label })),
    caption: subject.caption && garmentCaption(subject.caption, locale),
  };
}

/** A photograph's view label (the readers add "Complete original" after
 *  localization, so labels are mapped again where they are printed). */
export const viewLabel = (label: string, locale: Locale): string =>
  (terms[locale].views as Record<string, string>)[label] ?? label;

/** Locale-aware capitals for editorial labels. */
export const caps = (text: string, locale: Locale): string => text.toLocaleUpperCase(locale);
