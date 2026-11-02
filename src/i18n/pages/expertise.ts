import { defineDict } from '../dict';

export const expertise = defineDict(
  {
    title: 'Expertise — Soufiane Aberbach',
    description:
      'One garment, read four ways: design intent, fit system, technical translation and production control — the four systems that have to agree before a visual idea survives production.',
    eyebrow: 'Expertise / 01',
    heroTitle: 'One garment.<br />Four systems<br />have to <em>agree</em>.',
    thought:
      'Design intent, fit, technical information and production reality must describe the same product. When one drifts, the product drifts with it.',
    indexLabel: 'The four systems',
    systems: ['Design intent', 'Fit system', 'Technical translation', 'Production control'],
    intent: {
      question: 'Will it still look like the idea?',
      meaning:
        'Silhouette, proportion, volume and material behaviour must be defined clearly enough that engineering supports the idea instead of quietly reshaping it.',
      terms: ['Silhouette', 'Proportion', 'Volume', 'Material behaviour'],
      editorial: 'The technical solution should serve the design — not replace it.',
    },
    fit: {
      question: 'Will it work on the body — and across sizes?',
      meaning: 'Balance, ease, grading and tolerance work as one system so fit remains coherent beyond the base size.',
      geometry: [
        ['Block architecture', 'how the shape is generated from a controlled base'],
        ['Balance', 'how front and back hang and align'],
        ['Ease', 'the allowance required for fit and movement'],
        ['POM relationships', 'linked measurements that preserve proportion'],
        ['Grade rules', 'how geometry evolves through the size range'],
        ['Tolerance', 'acceptable production variation'],
      ],
    },
    translation: {
      question: 'Will the factory understand the same garment?',
      meaning:
        'Pattern geometry, measurements, construction information and digital validation remove interpretation before hand-off.',
      spec: [
        ['Production pattern', 'defines cut-ready geometry and construction intent'],
        ['Construction specification', 'defines seams, operations and critical details'],
        ['Measurements & tolerances', 'define acceptance criteria across the size range'],
        ['3D validation', 'supports fit, proportion and drape decisions before and alongside physical sampling'],
      ],
    },
    production: {
      question: 'Will it stay correct when repetition begins?',
      meaning:
        'Manufacturability, first-piece verification and in-line control protect the approved product as production begins to repeat it.',
      states: [
        ['Reference', 'the approved product standard'],
        ['Deviation', 'production moving away from the approved reference'],
        ['Correction', 'the cause resolved before deviation multiplies through bulk'],
      ],
      risk: 'A good sample is not proof of a good production system. The real test is whether the approved product can be repeated consistently.',
    },
    bridge: {
      eyebrow: 'Next / Evidence',
      title: 'Control is a claim<br />until the work <em>proves</em> it.',
      line: 'The portfolio is where the thinking becomes evidence in real work.',
      cta: 'See the work',
    },
    visualAlts: [
  "A designer supports a length of charcoal-blue wool crepe by hand to evaluate its weight and natural drape.",
  "A fitter pinches excess cotton at the side waist of an unfinished bodice toile on a tailoring form to assess ease.",
  "A patternmaker lifts the wrist edge of a single hanging paper sleeve pattern to review its cut geometry.",
  "A quality controller lifts the fabric beside an enclosed side seam in a finished navy shirt to inspect the stitching."
],
  },
  {
    fr: {
      title: 'Expertise — Soufiane Aberbach',
      description:
        'Un vêtement, quatre lectures : intention créative, système de bien-aller, traduction technique et maîtrise de la production — les quatre systèmes qui doivent concorder pour qu’une idée visuelle survive à la production.',
      eyebrow: 'Expertise / 01',
      heroTitle: 'Un vêtement.<br />Quatre systèmes<br />doivent <em>concorder</em>.',
      thought:
        'Intention créative, bien-aller, informations techniques et réalité de production doivent décrire le même produit. Quand l’un dérive, le produit dérive avec lui.',
      indexLabel: 'Les quatre systèmes',
      systems: ['Intention créative', 'Système de bien-aller', 'Traduction technique', 'Maîtrise de la production'],
      intent: {
        question: 'Ressemblera-t-il encore à l’idée ?',
        meaning:
          'Silhouette, proportions, volume et comportement de la matière doivent être définis assez clairement pour que la technique serve l’idée au lieu de la remodeler en silence.',
        terms: ['Silhouette', 'Proportions', 'Volume', 'Comportement de la matière'],
        editorial: 'La solution technique doit servir le design — jamais s’y substituer.',
      },
      fit: {
        question: 'Tombera-t-il juste sur le corps — et dans toutes les tailles ?',
        meaning:
          'Équilibre, aisance, gradation et tolérances fonctionnent comme un seul système, pour que le bien-aller reste cohérent au-delà de la taille de base.',
        geometry: [
          ['Architecture du patron de base', 'comment la forme naît d’une base maîtrisée'],
          ['Équilibre', 'comment le devant et le dos tombent et s’alignent'],
          ['Aisance', 'l’ampleur nécessaire au bien-aller et au mouvement'],
          ['Relations entre points de mesure', 'des mesures liées qui préservent les proportions'],
          ['Règles de gradation', 'comment la géométrie évolue d’une taille à l’autre'],
          ['Tolérance', 'la variation admise en production'],
        ],
      },
      translation: {
        question: 'L’usine comprendra-t-elle le même vêtement ?',
        meaning:
          'Géométrie du patron, mesures, informations de montage et validation numérique éliminent toute interprétation avant la transmission.',
        spec: [
          ['Patron de production', 'définit une géométrie prête à couper et l’intention de montage'],
          ['Spécification de montage', 'définit coutures, opérations et points critiques'],
          ['Mesures & tolérances', 'définissent les critères d’acceptation sur toute la gamme de tailles'],
          ['Validation 3D', 'éclaire les décisions de bien-aller, de proportion et de tombé, avant et pendant le prototypage physique'],
        ],
      },
      production: {
        question: 'Restera-t-il juste quand la série commence ?',
        meaning:
          'Faisabilité industrielle, contrôle de la première pièce et contrôle en ligne protègent le produit approuvé au moment où la production commence à le reproduire.',
        states: [
          ['Référence', 'le standard du produit approuvé'],
          ['Écart', 'la production qui s’éloigne de la référence approuvée'],
          ['Correction', 'la cause traitée avant que l’écart ne se multiplie dans la série'],
        ],
        risk: 'Un bon prototype ne prouve pas que le système de production est bon. Le vrai test : le produit approuvé peut-il être reproduit de façon constante ?',
      },
      bridge: {
        eyebrow: 'Suite / Preuves',
        title: 'La maîtrise reste une promesse<br />tant que le travail ne la <em>prouve</em> pas.',
        line: 'Le portfolio est l’endroit où la réflexion devient preuve, dans un travail réel.',
        cta: 'Voir le travail',
      },
      visualAlts: [
  "Un designer soutient à la main une longueur de crêpe de laine bleu anthracite pour en évaluer le poids et le tombé naturel.",
  "Un professionnel de l’essayage pince l’excédent de coton à la taille côté d’une toile de corsage inachevée sur un buste pour évaluer l’aisance.",
  "Un modéliste soulève le bord du poignet d’un patron de manche en papier suspendu pour examiner la géométrie de sa coupe.",
  "Un contrôleur qualité soulève le tissu près d’une couture de côté à bords enfermés sur une chemise bleu marine finie pour en examiner les piqûres."
],
    },
    es: {
      title: 'Especialidad — Soufiane Aberbach',
      description:
        'Una prenda, cuatro lecturas: intención de diseño, sistema de ajuste, traducción técnica y control de producción; los cuatro sistemas que deben coincidir para que una idea visual sobreviva a la producción.',
      eyebrow: 'Especialidad / 01',
      heroTitle: 'Una prenda.<br />Cuatro sistemas<br />deben <em>coincidir</em>.',
      thought:
        'Intención de diseño, ajuste, información técnica y realidad productiva deben describir el mismo producto. Cuando uno se desvía, el producto se desvía con él.',
      indexLabel: 'Los cuatro sistemas',
      systems: ['Intención de diseño', 'Sistema de ajuste', 'Traducción técnica', 'Control de producción'],
      intent: {
        question: '¿Seguirá pareciéndose a la idea?',
        meaning:
          'Silueta, proporción, volumen y comportamiento del material deben definirse con la claridad suficiente para que la técnica sostenga la idea en lugar de reformularla en silencio.',
        terms: ['Silueta', 'Proporción', 'Volumen', 'Comportamiento del material'],
        editorial: 'La solución técnica debe servir al diseño, no sustituirlo.',
      },
      fit: {
        question: '¿Funcionará en el cuerpo y en toda la gama de tallas?',
        meaning:
          'Equilibrio, holgura, escalado y tolerancias funcionan como un solo sistema para que el ajuste se mantenga coherente más allá de la talla base.',
        geometry: [
          ['Arquitectura del patrón base', 'cómo se genera la forma a partir de una base controlada'],
          ['Equilibrio', 'cómo caen y se alinean delantero y espalda'],
          ['Holgura', 'el margen necesario para el ajuste y el movimiento'],
          ['Relaciones entre puntos de medida', 'medidas vinculadas que preservan la proporción'],
          ['Reglas de escalado', 'cómo evoluciona la geometría a lo largo de la gama de tallas'],
          ['Tolerancia', 'la variación aceptable en producción'],
        ],
      },
      translation: {
        question: '¿Entenderá la fábrica la misma prenda?',
        meaning:
          'La geometría del patrón, las medidas, la información de confección y la validación digital eliminan la interpretación antes del traspaso.',
        spec: [
          ['Patrón de producción', 'define una geometría lista para el corte y la intención de confección'],
          ['Especificación de confección', 'define costuras, operaciones y detalles críticos'],
          ['Medidas y tolerancias', 'definen los criterios de aceptación en toda la gama de tallas'],
          ['Validación 3D', 'respalda las decisiones de ajuste, proporción y caída antes y a la par de las muestras físicas'],
        ],
      },
      production: {
        question: '¿Seguirá siendo correcta cuando empiece la serie?',
        meaning:
          'La fabricabilidad, la verificación de la primera prenda y el control en línea protegen el producto aprobado cuando la producción empieza a repetirlo.',
        states: [
          ['Referencia', 'el estándar del producto aprobado'],
          ['Desviación', 'la producción alejándose de la referencia aprobada'],
          ['Corrección', 'la causa resuelta antes de que la desviación se multiplique en la producción en serie'],
        ],
        risk: 'Una buena muestra no demuestra un buen sistema de producción. La verdadera prueba es si el producto aprobado puede repetirse de forma constante.',
      },
      bridge: {
        eyebrow: 'Siguiente / Evidencia',
        title: 'El control es solo una promesa<br />hasta que el trabajo lo <em>demuestra</em>.',
        line: 'El portfolio es donde el criterio se convierte en evidencia, en trabajo real.',
        cta: 'Ver el trabajo',
      },
      visualAlts: [
  "Un diseñador sostiene con la mano un largo de crepé de lana azul antracita para evaluar su peso y su caída natural.",
  "Un profesional del ajuste pellizca el exceso de algodón en la cintura lateral de una toile de cuerpo sin terminar sobre un maniquí para evaluar la holgura.",
  "Un patronista levanta el borde del puño de un patrón de manga de papel suspendido para revisar la geometría de su corte.",
  "Un controlador de calidad levanta el tejido junto a una costura lateral con bordes encerrados de una camisa azul marino terminada para inspeccionar los pespuntes."
],
    },
  },
);
