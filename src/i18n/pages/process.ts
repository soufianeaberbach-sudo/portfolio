import { defineDict } from '../dict';

/* PROCESS. Stage order and visuals stay in the page; this file holds every
   word. Optional stage fields (note, terms, spec, receive) are empty strings
   or empty arrays where a stage has none, so every language has one shape. */
export const process = defineDict(
  {
    title: 'Process — Soufiane Aberbach',
    description:
      'How a development project actually moves: five stages — brief and intent lock, technical build, fit validation, specification lock and pre-production handoff — each one ending with a decision.',
    eyebrow: 'Process / 03',
    heroTitle: 'Every stage<br />ends with<br />a <em>decision</em>.',
    thought:
      'Development moves forward only when the current question is resolved and the next person knows exactly what they are receiving.',
    ledgerHead: 'The five decisions',
    ledgerRule: 'No stage advances with an unresolved decision.',
    resolvedLabel: 'What gets resolved',
    specLabel: 'What the specification fixes',
    receiveLabel: 'What you get back',
    gateLabel: 'Gate {n} / 05 · Decision required',
    leavesLabel: 'What leaves / {n}',
    priorLabel: 'Already in the file',
    stages: [
      {
        name: 'Brief / Intent lock',
        tag: 'Where the project starts',
        inputLabel: 'What enters — from you',
        input: [
          'A sketch, or reference imagery',
          'Measurements, if they exist',
          'Fabric information',
          'The target product and market',
          'Commercial constraints',
        ],
        note: 'None of this has to be complete. Closing the gap is what this stage is for.',
        resolved:
          'Unclear design intent, missing information, open feasibility questions and development priorities are settled here, in writing, before anything is cut. Two people can describe the same garment and mean two different products; this stage removes that distance before it becomes expensive to correct.',
        terms: [],
        spec: [],
        receive: [],
        gate: 'Are we developing the same product?',
        output: 'Development direction',
      },
      {
        name: 'Technical build',
        tag: 'Structure before opinion',
        inputLabel: 'What enters',
        input: ['The agreed development direction'],
        note: '',
        resolved:
          'Pattern architecture, construction logic, initial measurements and the seam and assembly implications of the design are built and tested against each other. Whether a product can be built is a separate question from whether it is wanted, and it gets answered before fit is discussed.',
        terms: ['Pattern architecture', 'Construction logic', 'Seam & assembly implication'],
        spec: [],
        receive: [],
        gate: 'Is the product technically buildable?',
        output: 'First technical build',
      },
      {
        name: 'Fit / Validation',
        tag: 'Evaluated before it is locked',
        inputLabel: 'What enters',
        input: ['The first technical build', 'Physical fit information'],
        note: '',
        resolved:
          'Proportion, balance, drape and construction corrections are worked through against physical fit information, with 3D simulation supporting that reading rather than standing in for it. Simulation is where proportion and drape can be examined and a correction tested before it goes back onto the stand; every correction is recorded against the build it changes, so nothing is carried forward on memory.',
        terms: [],
        spec: [],
        receive: [],
        gate: 'Is the product ready to be locked?',
        output: 'Validated fit direction',
      },
      {
        name: 'Size / Specification lock',
        tag: 'Repeatable, or not finished',
        inputLabel: 'What enters',
        input: ['The validated fit direction', 'The required size range'],
        note: '',
        resolved:
          'Grading, size relationships, points of measure, tolerances and construction specification are fixed into technical documentation. A garment that works in one size is not yet a product; this stage is where it becomes something a line can repeat.',
        terms: [],
        spec: [
          'Grade rules and size relationships',
          'Points of measure',
          'Tolerances',
          'Construction specification',
          'Trim and material references',
        ],
        receive: [],
        gate: 'Can the approved product be repeated across the required range?',
        output: 'Production specification',
      },
      {
        name: 'Pre-production / Handoff',
        tag: 'The line works from the reference',
        inputLabel: 'What enters',
        input: ['The production specification', 'The approved reference'],
        note: '',
        resolved:
          'Handoff, critical-risk clarification and first-piece and pre-production verification happen against the specification rather than against an interpretation of it. Production questions and corrective decisions are resolved at the point they appear, not after the run.',
        terms: [],
        spec: [],
        receive: [
          'The reference the line works from',
          'Complete technical documentation',
          'Verification at first piece and pre-production',
          'Named milestones, with visibility at each one',
        ],
        gate: 'Is production working from the approved reference?',
        output: 'Controlled production handoff',
      },
    ],
    bridge: {
      eyebrow: 'Next / Experience',
      title: 'A process is only<br />as strong as the person<br />making the <em>decisions</em>.',
      line: 'Six positions shaped how those decisions are made.',
      cta: 'See the experience',
    },
  },
  {
    fr: {
      title: 'Méthode — Soufiane Aberbach',
      description:
        'Comment avance réellement un projet de développement : cinq étapes — brief et intention validée, construction technique, validation du bien-aller, spécifications figées et transmission en préproduction — chacune conclue par une décision.',
      eyebrow: 'Méthode / 03',
      heroTitle: 'Chaque étape<br />se conclut par<br />une <em>décision</em>.',
      thought:
        'Le développement n’avance que lorsque la question en cours est tranchée et que la personne suivante sait exactement ce qu’elle reçoit.',
      ledgerHead: 'Les cinq décisions',
      ledgerRule: 'Aucune étape n’avance tant qu’une décision reste en suspens.',
      resolvedLabel: 'Ce qui est tranché',
      specLabel: 'Ce que fixent les spécifications',
      receiveLabel: 'Ce que vous recevez',
      gateLabel: 'Validation {n} / 05 · Décision requise',
      leavesLabel: 'Ce qui sort / {n}',
      priorLabel: 'Déjà au dossier',
      stages: [
        {
          name: 'Brief / Intention validée',
          tag: 'Là où tout commence',
          inputLabel: 'Ce qui entre — de votre part',
          input: [
            'Un croquis ou des images de référence',
            'Des mesures, s’il en existe',
            'Des informations sur le tissu',
            'Le produit et le marché visés',
            'Les contraintes commerciales',
          ],
          note: 'Rien de tout cela n’a besoin d’être complet. Combler les manques, c’est précisément le rôle de cette étape.',
          resolved:
            'Une intention créative floue, des informations manquantes, des questions de faisabilité et les priorités de développement sont tranchées ici, par écrit, avant toute coupe. Deux personnes peuvent décrire le même vêtement en pensant à deux produits différents ; cette étape supprime cet écart avant qu’il ne devienne coûteux à corriger.',
          terms: [],
          spec: [],
          receive: [],
          gate: 'Développons-nous bien le même produit ?',
          output: 'Orientation de développement',
        },
        {
          name: 'Construction technique',
          tag: 'La structure avant l’opinion',
          inputLabel: 'Ce qui entre',
          input: ['L’orientation de développement validée'],
          note: '',
          resolved:
            'L’architecture du patron, la logique de montage, les premières mesures et les implications du modèle sur les coutures et l’assemblage sont construites et confrontées les unes aux autres. Savoir si un produit peut être construit est une autre question que savoir s’il est souhaité — et elle trouve sa réponse avant de parler de bien-aller.',
          terms: ['Architecture du patron', 'Logique de montage', 'Incidences coutures & assemblage'],
          spec: [],
          receive: [],
          gate: 'Le produit est-il techniquement réalisable ?',
          output: 'Première construction technique',
        },
        {
          name: 'Bien-aller / Validation',
          tag: 'Évalué avant d’être figé',
          inputLabel: 'Ce qui entre',
          input: ['La première construction technique', 'Les retours d’essayage physique'],
          note: '',
          resolved:
            'Les corrections de proportion, d’équilibre, de tombé et de montage sont travaillées à partir des essayages physiques, la simulation 3D venant éclairer cette lecture sans jamais s’y substituer. La simulation permet d’examiner proportions et tombé, et de tester une correction avant qu’elle ne revienne sur le buste ; chaque correction est consignée en regard de la construction qu’elle modifie, pour que rien ne repose sur la mémoire.',
          terms: [],
          spec: [],
          receive: [],
          gate: 'Le produit est-il prêt à être figé ?',
          output: 'Orientation de bien-aller validée',
        },
        {
          name: 'Tailles / Spécifications figées',
          tag: 'Reproductible, sinon inachevé',
          inputLabel: 'Ce qui entre',
          input: ['L’orientation de bien-aller validée', 'La gamme de tailles requise'],
          note: '',
          resolved:
            'La gradation, les relations entre tailles, les points de mesure, les tolérances et les spécifications de montage sont fixés dans la documentation technique. Un vêtement qui fonctionne dans une seule taille n’est pas encore un produit ; c’est ici qu’il devient quelque chose qu’une chaîne peut reproduire.',
          terms: [],
          spec: [
            'Règles de gradation et relations entre tailles',
            'Points de mesure',
            'Tolérances',
            'Spécifications de montage',
            'Références de fournitures et de matières',
          ],
          receive: [],
          gate: 'Le produit approuvé peut-il être reproduit sur toute la gamme requise ?',
          output: 'Spécifications de production',
        },
        {
          name: 'Préproduction / Transmission',
          tag: 'La chaîne travaille d’après la référence',
          inputLabel: 'Ce qui entre',
          input: ['Les spécifications de production', 'La référence approuvée'],
          note: '',
          resolved:
            'La transmission, la clarification des risques critiques et les contrôles de la première pièce et de préproduction se font au regard des spécifications, et non d’une interprétation de celles-ci. Les questions de production et les décisions correctives se règlent au moment où elles surgissent, pas après la série.',
          terms: [],
          spec: [],
          receive: [
            'La référence sur laquelle travaille la chaîne',
            'Une documentation technique complète',
            'Un contrôle à la première pièce et en préproduction',
            'Des jalons définis, avec une visibilité à chacun d’eux',
          ],
          gate: 'La production travaille-t-elle d’après la référence approuvée ?',
          output: 'Transmission maîtrisée à la production',
        },
      ],
      bridge: {
        eyebrow: 'Suite / Parcours',
        title: 'Une méthode ne vaut<br />que par la personne<br />qui prend les <em>décisions</em>.',
        line: 'Six postes ont façonné la manière dont ces décisions sont prises.',
        cta: 'Voir le parcours',
      },
    },
    es: {
      title: 'Proceso — Soufiane Aberbach',
      description:
        'Cómo avanza de verdad un proyecto de desarrollo: cinco etapas —brief e intención cerrada, construcción técnica, validación del ajuste, especificación cerrada y traspaso a preproducción—, cada una cerrada con una decisión.',
      eyebrow: 'Proceso / 03',
      heroTitle: 'Cada etapa<br />termina con<br />una <em>decisión</em>.',
      thought:
        'El desarrollo solo avanza cuando la pregunta en curso está resuelta y la siguiente persona sabe exactamente qué recibe.',
      ledgerHead: 'Las cinco decisiones',
      ledgerRule: 'Ninguna etapa avanza con una decisión pendiente.',
      resolvedLabel: 'Qué se resuelve',
      specLabel: 'Qué fija la especificación',
      receiveLabel: 'Qué recibes',
      gateLabel: 'Validación {n} / 05 · Decisión necesaria',
      leavesLabel: 'Qué sale / {n}',
      priorLabel: 'Ya en el expediente',
      stages: [
        {
          name: 'Brief / Intención cerrada',
          tag: 'Donde empieza el proyecto',
          inputLabel: 'Qué entra — de tu parte',
          input: [
            'Un boceto o imágenes de referencia',
            'Medidas, si existen',
            'Información del tejido',
            'El producto y el mercado objetivo',
            'Las restricciones comerciales',
          ],
          note: 'Nada de esto tiene que estar completo. Cerrar esos huecos es justo para lo que sirve esta etapa.',
          resolved:
            'La intención de diseño poco clara, la información que falta, las dudas de viabilidad y las prioridades de desarrollo se resuelven aquí, por escrito, antes de cortar nada. Dos personas pueden describir la misma prenda y referirse a dos productos distintos; esta etapa elimina esa distancia antes de que corregirla salga caro.',
          terms: [],
          spec: [],
          receive: [],
          gate: '¿Estamos desarrollando el mismo producto?',
          output: 'Dirección de desarrollo',
        },
        {
          name: 'Construcción técnica',
          tag: 'La estructura antes que la opinión',
          inputLabel: 'Qué entra',
          input: ['La dirección de desarrollo acordada'],
          note: '',
          resolved:
            'La arquitectura del patrón, la lógica de confección, las medidas iniciales y lo que el diseño implica en costuras y montaje se construyen y se contrastan entre sí. Si un producto puede construirse es una pregunta distinta de si se desea, y se responde antes de hablar de ajuste.',
          terms: ['Arquitectura del patrón', 'Lógica de confección', 'Implicaciones de costura y montaje'],
          spec: [],
          receive: [],
          gate: '¿Es el producto técnicamente realizable?',
          output: 'Primera construcción técnica',
        },
        {
          name: 'Ajuste / Validación',
          tag: 'Evaluado antes de cerrarse',
          inputLabel: 'Qué entra',
          input: ['La primera construcción técnica', 'La información de la prueba de ajuste física'],
          note: '',
          resolved:
            'Las correcciones de proporción, equilibrio, caída y confección se trabajan a partir de la prueba de ajuste física, con la simulación 3D apoyando esa lectura, nunca sustituyéndola. La simulación permite examinar proporción y caída y probar una corrección antes de volver al maniquí; cada corrección queda registrada frente a la construcción que modifica, para que nada dependa de la memoria.',
          terms: [],
          spec: [],
          receive: [],
          gate: '¿Está el producto listo para cerrarse?',
          output: 'Dirección de ajuste validada',
        },
        {
          name: 'Tallas / Especificación cerrada',
          tag: 'Repetible, o no está terminado',
          inputLabel: 'Qué entra',
          input: ['La dirección de ajuste validada', 'La gama de tallas necesaria'],
          note: '',
          resolved:
            'El escalado, las relaciones entre tallas, los puntos de medida, las tolerancias y la especificación de confección se fijan en la documentación técnica. Una prenda que funciona en una sola talla todavía no es un producto; aquí se convierte en algo que una línea puede repetir.',
          terms: [],
          spec: [
            'Reglas de escalado y relaciones entre tallas',
            'Puntos de medida',
            'Tolerancias',
            'Especificación de confección',
            'Referencias de fornituras y materiales',
          ],
          receive: [],
          gate: '¿Puede repetirse el producto aprobado en toda la gama necesaria?',
          output: 'Especificación de producción',
        },
        {
          name: 'Preproducción / Traspaso',
          tag: 'La línea trabaja desde la referencia',
          inputLabel: 'Qué entra',
          input: ['La especificación de producción', 'La referencia aprobada'],
          note: '',
          resolved:
            'El traspaso, la aclaración de riesgos críticos y la verificación en primera prenda y en preproducción se hacen frente a la especificación, no frente a una interpretación de ella. Las dudas de producción y las decisiones correctivas se resuelven en el momento en que aparecen, no después de la tirada.',
          terms: [],
          spec: [],
          receive: [
            'La referencia con la que trabaja la línea',
            'Documentación técnica completa',
            'Verificación en primera prenda y en preproducción',
            'Hitos definidos, con visibilidad en cada uno',
          ],
          gate: '¿Trabaja producción desde la referencia aprobada?',
          output: 'Traspaso controlado a producción',
        },
      ],
      bridge: {
        eyebrow: 'Siguiente / Trayectoria',
        title: 'Un proceso vale<br />lo que vale la persona<br />que toma las <em>decisiones</em>.',
        line: 'Seis puestos han definido cómo se toman esas decisiones.',
        cta: 'Ver la trayectoria',
      },
    },
  },
);

/** Descriptions of the current studio illustrations, introduced after PR #46. */
export const processVisuals = defineDict(
[
  "Two fashion professionals discuss the shoulder and collar of a finished navy shirt used as a product reference.",
  "A patternmaker draws a sleeve-cap curve with a graphite pencil on a single sheet of flat pattern paper.",
  "A fitter checks upper-back ease in an unfinished cotton shirt toile worn by an adult fit model, with raw hem and sleeve ends.",
  "A technician checks the chest width of a finished navy shirt with a flexible centimetre tape laid flat from one side edge to the other.",
  "Two studio colleagues hand over a finished navy shirt hanging from a wooden hanger at a white atelier doorway."
],
{
  "fr": [
    "Deux professionnels de la mode discutent de l’épaule et du col d’une chemise bleu marine finie, utilisée comme référence produit.",
    "Un modéliste trace la courbe d’une tête de manche au crayon graphite sur une feuille de papier à patron posée à plat.",
    "Un professionnel de l’essayage vérifie l’aisance du haut du dos d’une toile de chemise en coton portée par un mannequin d’essayage adulte, avec l’ourlet et les bas de manches non finis.",
    "Un technicien vérifie la largeur de poitrine d’une chemise bleu marine finie avec un mètre souple posé à plat d’un bord latéral à l’autre.",
    "Deux collègues se transmettent une chemise bleu marine finie sur un cintre en bois, à l’entrée d’un atelier blanc."
  ],
  "es": [
    "Dos profesionales de la moda comentan el hombro y el cuello de una camisa azul marino terminada que sirve como referencia de producto.",
    "Un patronista dibuja la curva de la copa de una manga con un lápiz de grafito sobre una hoja de papel de patronaje extendida.",
    "Un profesional del ajuste comprueba la holgura de la espalda superior en una toile de camisa de algodón sin terminar, sobre un modelo de pruebas adulto, con el bajo y las bocamangas sin rematar.",
    "Un técnico comprueba el ancho de pecho de una camisa azul marino terminada con una cinta métrica flexible extendida en plano de un borde lateral al otro.",
    "Dos compañeros se entregan una camisa azul marino terminada en una percha de madera, en la entrada de un taller blanco."
  ]
}
);
