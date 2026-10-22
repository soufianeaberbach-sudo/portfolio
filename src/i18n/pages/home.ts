import { defineDict } from '../dict';

/* HOME. Headlines carry their own <br> and <em>: each language breaks its
   line and chooses its accent word where its own grammar puts the weight. */
export const home = defineDict(
  {
    title: 'Soufiane Aberbach — Fashion Designer & Product Developer',
    description:
      'Senior fashion designer and product developer in Tangier, focused on production-ready pattern, fit and technical development.',
    hello: 'Hello, my name is',
    roleLead: 'And I’m a',
    roles: [
      'Fashion Designer',
      'Product Developer',
      'Pattern Maker',
      'Grading Specialist',
      '3D Simulation Developer',
      'Tech Pack Author',
      'Production Follower',
    ],
    rolesSentence:
      'Fashion Designer, Product Developer, Pattern Maker, Grading Specialist, 3D Simulation Developer, Tech Pack Author, and Production Follower.',
    portraitAlt: 'Soufiane Aberbach seated and drawing on a tablet',
    positioning: {
      eyebrow: 'Positioning',
      title: 'The expensive mistake happens <em>before</em> the sewing line.',
      body: [
        'Many expensive fitting rounds, fabric losses and sample delays begin with decisions made before the first metre is cut.',
        'That decision is the work: defining the pattern, validating fit and translating intent into instructions a factory can repeat.',
      ],
      cta: 'View expertise',
    },
    business: {
      tag: 'Business ready',
      lead: 'Ready for a direct professional engagement.',
      facts: [
        ['Status', 'Registered Moroccan Auto‑Entrepreneur'],
        ['Registered', 'Since 2018'],
        ['Invoicing', 'B2B invoicing available'],
        ['Based in', 'Tangier, Morocco'],
      ],
    },
    stats: {
      eyebrow: 'Production record',
      plus: '{n} plus',
      labels: ['Years in<br />production', 'Garments<br />engineered', 'Brand<br />programmes', 'Career<br />roles', 'Software<br />systems'],
    },
    brands: {
      eyebrow: 'Programme exposure',
      label: '16+ brand programmes / manufacturing development',
      listLabel: 'Brand programme exposure',
      note: 'Programme exposure through manufacturing work across Loratex, Lariconf and Ava Marie — not direct employment or brand endorsement.',
    },
    process: {
      eyebrow: 'The development sequence',
      title: 'Five stages.<br />Every stage ends with a decision.',
      cta: 'Explore the process',
      stages: [
        ['Brief / Intent lock', 'Design intent, missing information and open feasibility questions are settled before anything is cut.'],
        ['Technical build', 'Pattern architecture, construction logic and initial measurements are built and tested against each other.'],
        ['Fit / Validation', 'Proportion, balance, drape and construction corrections are worked through and recorded.'],
        ['Size / Specification lock', 'Grading, points of measure and tolerances are fixed into technical documentation.'],
        ['Pre-production / Handoff', 'Production works from the approved reference, with verification at first piece and pre-production.'],
      ],
    },
    simulation: {
      label: 'CLO3D simulation / selected work',
      title: '<em>See</em> it move.<br />Before you make it.',
      lede: 'CLO3D turns pattern, proportion and fabric behaviour into a moving prototype—so silhouette, proportion and drape can be explored before and alongside physical sampling.',
      cta: 'View the portfolio',
      videoLabel: 'Female and male digital fashion models walking, presented in CLO3D',
    },
  },
  {
    fr: {
      title: 'Soufiane Aberbach — Designer de mode & développeur produit',
      description:
        'Designer de mode senior et développeur produit basé à Tanger : patronage, bien-aller et développement technique prêts pour la production.',
      hello: 'Bonjour, je m’appelle',
      roleLead: 'Je suis',
      roles: [
        'designer de mode',
        'développeur produit',
        'modéliste',
        'spécialiste en gradation',
        'développeur en simulation 3D',
        'auteur de dossiers techniques',
        'chargé du suivi de production',
      ],
      rolesSentence:
        'Designer de mode, développeur produit, modéliste, spécialiste en gradation, développeur en simulation 3D, auteur de dossiers techniques et chargé du suivi de production.',
      portraitAlt: 'Soufiane Aberbach, assis, dessine sur une tablette',
      positioning: {
        eyebrow: 'Positionnement',
        title: 'L’erreur coûteuse se joue <em>avant</em> l’atelier de couture.',
        body: [
          'Bien des essayages à répétition, des pertes de tissu et des prototypes en retard naissent de décisions prises avant même le premier mètre coupé.',
          'C’est précisément là que se situe mon travail : définir le patron, valider le bien-aller et traduire une intention en instructions qu’un atelier peut reproduire.',
        ],
        cta: 'Découvrir l’expertise',
      },
      business: {
        tag: 'Prêt à contractualiser',
        lead: 'Prêt pour une collaboration professionnelle directe.',
        facts: [
          ['Statut', 'Auto‑entrepreneur immatriculé au Maroc'],
          ['Immatriculation', 'Depuis 2018'],
          ['Facturation', 'Facturation B2B possible'],
          ['Basé à', 'Tanger, Maroc'],
        ],
      },
      stats: {
        eyebrow: 'Parcours en production',
        plus: 'plus de {n}',
        labels: ['ans en<br />production', 'pièces<br />développées', 'programmes<br />de marques', 'postes<br />occupés', 'logiciels<br />maîtrisés'],
      },
      brands: {
        eyebrow: 'Programmes de marques',
        label: '16+ programmes de marques / développement en production',
        listLabel: 'Programmes de marques suivis',
        note: 'Programmes suivis dans le cadre de travaux de production chez Loratex, Lariconf et Ava Marie — il ne s’agit ni d’un emploi direct auprès de ces marques, ni d’une recommandation de leur part.',
      },
      process: {
        eyebrow: 'Le déroulé du développement',
        title: 'Cinq étapes.<br />Chacune se conclut par une décision.',
        cta: 'Découvrir la méthode',
        stages: [
          ['Brief / Intention validée', 'L’intention créative, les informations manquantes et les questions de faisabilité sont tranchées avant toute coupe.'],
          ['Construction technique', 'L’architecture du patron, la logique de montage et les premières mesures sont construites et confrontées les unes aux autres.'],
          ['Bien-aller / Validation', 'Les corrections de proportion, d’équilibre, de tombé et de montage sont travaillées puis consignées.'],
          ['Tailles / Spécifications figées', 'La gradation, les points de mesure et les tolérances sont fixés dans la documentation technique.'],
          ['Préproduction / Transmission', 'La production travaille à partir de la référence approuvée, avec un contrôle sur la première pièce et en préproduction.'],
        ],
      },
      simulation: {
        label: 'Simulation CLO3D / travaux choisis',
        title: '<em>Voyez</em>-le bouger.<br />Avant de le coudre.',
        lede: 'CLO3D transforme le patron, les proportions et le comportement du tissu en prototype animé : silhouette, proportions et tombé s’explorent avant et pendant le prototypage physique.',
        cta: 'Voir le portfolio',
        videoLabel: 'Mannequins numériques, femme et homme, défilant dans CLO3D',
      },
    },
    es: {
      title: 'Soufiane Aberbach — Diseñador de moda y desarrollador de producto',
      description:
        'Diseñador de moda sénior y desarrollador de producto en Tánger, especializado en patronaje, ajuste y desarrollo técnico listos para producción.',
      hello: 'Hola, me llamo',
      roleLead: 'Y soy',
      roles: [
        'diseñador de moda',
        'desarrollador de producto',
        'patronista',
        'especialista en escalado',
        'desarrollador de simulación 3D',
        'autor de fichas técnicas',
        'técnico de producción',
      ],
      rolesSentence:
        'Diseñador de moda, desarrollador de producto, patronista, especialista en escalado de tallas, desarrollador de simulación 3D, autor de fichas técnicas y técnico de seguimiento de producción.',
      portraitAlt: 'Soufiane Aberbach, sentado, dibujando en una tableta',
      positioning: {
        eyebrow: 'Enfoque',
        title: 'El error caro se comete <em>antes</em> de la costura.',
        body: [
          'Muchas pruebas de ajuste interminables, pérdidas de tejido y retrasos en las muestras nacen de decisiones tomadas antes de cortar el primer metro.',
          'Esa decisión es el trabajo: definir el patrón, validar el ajuste y convertir una intención en instrucciones que una fábrica pueda repetir.',
        ],
        cta: 'Ver la especialidad',
      },
      business: {
        tag: 'Listo para contratar',
        lead: 'Preparado para una colaboración profesional directa.',
        facts: [
          ['Situación', 'Autoempresario registrado en Marruecos'],
          ['Registro', 'Desde 2018'],
          ['Facturación', 'Facturación B2B disponible'],
          ['Ubicación', 'Tánger, Marruecos'],
        ],
      },
      stats: {
        eyebrow: 'Trayectoria en producción',
        plus: 'más de {n}',
        labels: ['años en<br />producción', 'prendas<br />desarrolladas', 'programas<br />de marca', 'puestos<br />desempeñados', 'sistemas<br />de software'],
      },
      brands: {
        eyebrow: 'Programas de marca',
        label: '16+ programas de marca / desarrollo en fábrica',
        listLabel: 'Programas de marca trabajados',
        note: 'Programas trabajados a través de la actividad productiva en Loratex, Lariconf y Ava Marie; no implica empleo directo con estas marcas ni su respaldo.',
      },
      process: {
        eyebrow: 'La secuencia de desarrollo',
        title: 'Cinco etapas.<br />Cada una termina con una decisión.',
        cta: 'Ver el proceso',
        stages: [
          ['Brief / Intención cerrada', 'La intención de diseño, la información que falta y las dudas de viabilidad se resuelven antes de cortar nada.'],
          ['Construcción técnica', 'La arquitectura del patrón, la lógica de confección y las medidas iniciales se construyen y se contrastan entre sí.'],
          ['Ajuste / Validación', 'Las correcciones de proporción, equilibrio, caída y confección se trabajan y quedan registradas.'],
          ['Tallas / Especificación cerrada', 'El escalado, los puntos de medida y las tolerancias se fijan en la documentación técnica.'],
          ['Preproducción / Traspaso', 'Producción trabaja a partir de la referencia aprobada, con verificación en la primera prenda y en preproducción.'],
        ],
      },
      simulation: {
        label: 'Simulación CLO3D / trabajos seleccionados',
        title: '<em>Míralo</em> moverse.<br />Antes de hacerlo.',
        lede: 'CLO3D convierte el patrón, las proporciones y el comportamiento del tejido en un prototipo en movimiento: silueta, proporciones y caída se exploran antes y a la par que las muestras físicas.',
        cta: 'Ver el portfolio',
        videoLabel: 'Modelos digitales, mujer y hombre, caminando en CLO3D',
      },
    },
    ar: {
      title: 'Soufiane Aberbach — مصمّم أزياء ومطوّر منتجات',
      description:
        'مصمّم أزياء أول ومطوّر منتجات في طنجة، يركّز على إعداد الباترونات وضبط المقاس والتطوير التقني الجاهز للإنتاج.',
      hello: 'مرحباً، اسمي',
      roleLead: 'وأنا',
      roles: [
        'مصمّم أزياء',
        'مطوّر منتجات',
        'مُعِدّ باترونات',
        'متخصّص في تدريج المقاسات',
        'مطوّر محاكاة ثلاثية الأبعاد',
        'مُعِدّ ملفات تقنية',
        'متابع للإنتاج',
      ],
      rolesSentence:
        'مصمّم أزياء، مطوّر منتجات، مُعِدّ باترونات، متخصّص في تدريج المقاسات، مطوّر محاكاة ثلاثية الأبعاد، مُعِدّ ملفات تقنية، ومتابع للإنتاج.',
      portraitAlt: 'Soufiane Aberbach جالساً يرسم على جهاز لوحي',
      positioning: {
        eyebrow: 'الرؤية',
        title: 'الخطأ المكلف يقع <em>قبل</em> خط الخياطة.',
        body: [
          'كثير من جولات القياس المتكرّرة، وهدر الأقمشة، وتأخّر العيّنات يبدأ بقرارات تُتّخذ قبل قصّ المتر الأول.',
          'وهذا القرار هو جوهر العمل: تحديد الباترون، والتحقّق من الملاءمة، وترجمة الفكرة إلى تعليمات يستطيع المصنع تكرارها بدقّة.',
        ],
        cta: 'اكتشف الخبرة',
      },
      business: {
        tag: 'جاهز للتعاقد',
        lead: 'جاهز لتعاون مهني مباشر.',
        facts: [
          ['الوضع القانوني', 'مقاول ذاتي مسجّل في المغرب'],
          ['التسجيل', 'منذ 2018'],
          ['الفوترة', 'فوترة بين الشركات متاحة'],
          ['المقرّ', 'طنجة، المغرب'],
        ],
      },
      stats: {
        eyebrow: 'السجلّ المهني في الإنتاج',
        plus: 'أكثر من {n}',
        labels: ['سنة في<br />الإنتاج', 'قطعة<br />مطوَّرة', 'برنامج<br />لعلامات تجارية', 'مناصب<br />مهنية', 'أنظمة<br />برمجية'],
      },
      brands: {
        eyebrow: 'برامج العلامات التجارية',
        label: 'أكثر من 16 برنامجاً لعلامات تجارية / تطوير في التصنيع',
        listLabel: 'برامج العلامات التجارية التي عُمل عليها',
        note: 'خبرة في برامج هذه العلامات من خلال العمل في التصنيع لدى Loratex وLariconf وAva Marie — وليست توظيفاً مباشراً لديها ولا تزكية منها.',
      },
      process: {
        eyebrow: 'مراحل التطوير',
        title: 'خمس مراحل.<br />وكلّ مرحلة تنتهي بقرار.',
        cta: 'اكتشف المنهجية',
        stages: [
          ['الموجز / تثبيت الفكرة', 'تُحسم الفكرة التصميمية والمعلومات الناقصة وأسئلة الجدوى المفتوحة قبل أيّ قصّ.'],
          ['البناء التقني', 'تُبنى بنية الباترون ومنطق التركيب والقياسات الأولى، ويُختبر كلّ منها في ضوء الآخر.'],
          ['المقاس / التحقّق', 'تُعالَج تصحيحات التناسب والتوازن والانسدال والتركيب، وتُوثَّق خطوة بخطوة.'],
          ['المقاسات / تثبيت المواصفات', 'يُثبَّت تدريج المقاسات ونقاط القياس وهوامش التفاوت في الملف التقني.'],
          ['ما قبل الإنتاج / التسليم', 'يعمل الإنتاج انطلاقاً من المرجع المعتمد، مع تحقّق عند القطعة الأولى وفي مرحلة ما قبل الإنتاج.'],
        ],
      },
      simulation: {
        label: 'محاكاة CLO3D / أعمال مختارة',
        title: '<em>شاهِدها</em> تتحرّك.<br />قبل أن تُصنَع.',
        lede: 'يحوّل CLO3D الباترون والتناسب وسلوك القماش إلى نموذج أوّلي متحرّك، فيمكن استكشاف القصّة والتناسب والانسدال قبل العيّنات الفعلية وبالتوازي معها.',
        cta: 'شاهد الأعمال',
        videoLabel: 'عارضة وعارض رقميان يمشيان، معروضان في CLO3D',
      },
    },
  },
);
