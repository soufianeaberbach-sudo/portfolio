import type { Locale } from './locales';

/* GARMENT DESCRIPTIONS — alt text and reader captions for every photograph.
 *
 * The data modules describe each photograph in English, and the photography
 * work keeps maintaining them there. This map gives the same description in
 * French, Spanish and Arabic, keyed by that exact English text, so no data
 * file has to change. Descriptions say what is visible and nothing more,
 * exactly like the English: garment, colour, construction detail, pose,
 * ground. Where the English does not say who is pictured ("a model"), the
 * translations stay neutral too rather than guessing a gender.
 *
 * Women's two-up and single-view studio photographs share one English frame
 * ("Front and back views of …, photographed together on a white studio
 * ground."); only the garment phrase is stored, and each language wraps it in
 * its own sentence. A description missing from this map falls back to English
 * and is reported by tests/i18n.mjs.
 */

type Row = readonly [fr: string, es: string, ar: string];

const garments: Record<string, Row> = {
  /* ---- Womenswear studio photographs: garment phrases -------------------- */
  'A bandeau bikini with contrast binding and long tie sides': [
    'Un bikini bandeau à biais contrastant et longs liens sur les côtés',
    'Un bikini bandeau con ribete en contraste y largas tiras laterales para anudar',
    'بيكيني بقصّة باندو بحواف متباينة وأربطة جانبية طويلة',
  ],
  'A black cut-out one-piece swimsuit with a bandeau neckline': [
    'Un maillot une pièce noir à découpes, encolure bandeau',
    'Un bañador negro de una pieza con aberturas y escote bandeau',
    'ملابس سباحة سوداء قطعة واحدة بفتحات وخطّ صدر باندو',
  ],
  'A blue one-piece swimsuit with a front ring detail and high-cut legs': [
    'Un maillot une pièce bleu à anneau devant, échancré haut sur les hanches',
    'Un bañador azul de una pieza con detalle de anilla delantera y pierna alta',
    'ملابس سباحة زرقاء قطعة واحدة بحلقة أمامية وقصّة عالية عند الساقين',
  ],
  'A magenta textured bandeau bikini with tie-side briefs': [
    'Un bikini bandeau magenta texturé, culotte à nouer sur les côtés',
    'Un bikini bandeau magenta con textura y braguita de lazada lateral',
    'بيكيني باندو أرجواني بملمس بارز مع سروال بأربطة جانبية',
  ],
  'A printed bikini with contrast red trim and thin straps': [
    'Un bikini imprimé à liseré rouge contrastant et fines bretelles',
    'Un bikini estampado con ribete rojo en contraste y tirantes finos',
    'بيكيني مطبوع بحواف حمراء متباينة وحمّالات رفيعة',
  ],
  'A silver bikini with a ruched top and tie-side briefs': [
    'Un bikini argenté, haut froncé et culotte à nouer sur les côtés',
    'Un bikini plateado con top fruncido y braguita de lazada lateral',
    'بيكيني فضّي بجزء علوي مكشكش وسروال بأربطة جانبية',
  ],
  'A silver bikini with long ties wrapped around the waist': [
    'Un bikini argenté aux longs liens enroulés autour de la taille',
    'Un bikini plateado con largas tiras enrolladas en la cintura',
    'بيكيني فضّي بأربطة طويلة ملفوفة حول الخصر',
  ],
  'A silver halter bikini with high-cut briefs': [
    'Un bikini argenté à col halter, culotte échancrée',
    'Un bikini plateado de cuello halter con braguita de corte alto',
    'بيكيني فضّي برقبة هالتر وسروال بقصّة عالية',
  ],
  'A silver triangle bikini with tie sides': [
    'Un bikini triangle argenté à nouer sur les côtés',
    'Un bikini triángulo plateado con lazadas laterales',
    'بيكيني مثلّث فضّي بأربطة جانبية',
  ],
  'a beige tie-waist wrap blouse worn with brown wide-leg trousers': [
    'un chemisier portefeuille beige noué à la taille, porté avec un pantalon large marron',
    'una blusa cruzada beige anudada a la cintura con pantalón ancho marrón',
    'بلوزة ملفوفة بيج تُعقد عند الخصر مع بنطال واسع بنّي',
  ],
  'a black long-sleeved sequinned gown with a high neck, open back and front slit': [
    'une robe longue noire à sequins, manches longues, col montant, dos nu et fente devant',
    'un vestido largo negro de lentejuelas con manga larga, cuello alto, espalda abierta y abertura delantera',
    'فستان طويل أسود مطرّز بالترتر بأكمام طويلة ورقبة عالية وظهر مكشوف وشقّ أمامي',
  ],
  'a black long-sleeved top and cropped black leggings with white side stripes': [
    'un haut noir à manches longues et un legging court noir à bandes latérales blanches',
    'una camiseta negra de manga larga y leggings cortos negros con franjas laterales blancas',
    'قميص أسود بأكمام طويلة وليغنغ أسود قصير بخطوط جانبية بيضاء',
  ],
  'a black long-sleeved training top and full-length black leggings': [
    'un haut d’entraînement noir à manches longues et un legging long noir',
    'una camiseta de entrenamiento negra de manga larga y leggings negros largos',
    'قميص تدريب أسود بأكمام طويلة وليغنغ أسود بطول كامل',
  ],
  'a black racerback tank and black leggings with white side stripes': [
    'un débardeur noir dos nageur et un legging noir à bandes latérales blanches',
    'una camiseta de tirantes negra de espalda nadadora y leggings negros con franjas laterales blancas',
    'قميص أسود بلا أكمام بظهر رياضي وليغنغ أسود بخطوط جانبية بيضاء',
  ],
  'a black ruffled blouse worn with black slim trousers': [
    'un chemisier noir à volants porté avec un pantalon slim noir',
    'una blusa negra con volantes y pantalón pitillo negro',
    'بلوزة سوداء بكشكشة مع بنطال أسود ضيّق',
  ],
  'a black short-sleeved training top and cropped black leggings': [
    'un haut d’entraînement noir à manches courtes et un legging court noir',
    'una camiseta de entrenamiento negra de manga corta y leggings cortos negros',
    'قميص تدريب أسود بأكمام قصيرة وليغنغ أسود قصير',
  ],
  'a blue and white diagonally striped sleeveless midi dress with an open back': [
    'une robe midi sans manches à rayures diagonales bleues et blanches, dos ouvert',
    'un vestido midi sin mangas de rayas diagonales azules y blancas con espalda abierta',
    'فستان ميدي بلا أكمام بخطوط مائلة زرقاء وبيضاء وظهر مفتوح',
  ],
  'a brightly printed floral mini dress with puff sleeves and an open back': [
    'une robe courte à imprimé floral vif, manches bouffantes et dos ouvert',
    'un vestido corto de estampado floral vivo con mangas abullonadas y espalda abierta',
    'فستان قصير بطبعة زهرية زاهية وأكمام منفوخة وظهر مفتوح',
  ],
  'a brown cold-shoulder top with tie sleeves worn with camel wide-leg trousers': [
    'un haut marron à épaules dénudées et manches à nouer, porté avec un pantalon large camel',
    'un top marrón de hombros descubiertos con mangas anudadas y pantalón ancho camel',
    'قميص بنّي بكتفين مكشوفين وأكمام تُعقد مع بنطال واسع بلون الجمل',
  ],
  'a brown column gown with an open cut-out waist and a tie at the back': [
    'une robe colonne marron à découpe ouverte à la taille, nouée dans le dos',
    'un vestido columna marrón con abertura en la cintura y lazada en la espalda',
    'فستان طويل بقصّة عمودية بنّي بفتحة عند الخصر ورباط في الخلف',
  ],
  'a brown ribbed tank top and matching brown wide flared trousers': [
    'un débardeur marron côtelé et un pantalon large évasé assorti',
    'una camiseta de tirantes marrón de canalé y pantalón ancho acampanado a juego',
    'قميص بنّي مضلّع بلا أكمام مع بنطال واسع متّسع الأطراف من اللون نفسه',
  ],
  'a burgundy cropped hooded sweatshirt worn with olive green joggers': [
    'un sweat à capuche court bordeaux porté avec un pantalon de jogging vert olive',
    'una sudadera corta con capucha burdeos con pantalón jogger verde oliva',
    'سويتشيرت قصيرة بقلنسوة بلون العنّابي مع بنطال رياضي أخضر زيتوني',
  ],
  'a champagne slip dress with a gathered V neckline and an open back': [
    'une robe nuisette champagne à décolleté en V froncé et dos ouvert',
    'un vestido lencero champán con escote en V fruncido y espalda abierta',
    'فستان انسيابي رفيع الحمّالات بلون الشمبانيا بفتحة صدر V مجعّدة وظهر مفتوح',
  ],
  'a champagne strapless calf-length dress with a gathered front': [
    'une robe bustier champagne mi-mollet, froncée devant',
    'un vestido palabra de honor champán a media pierna con frunce delantero',
    'فستان بلون الشمبانيا بلا حمّالات بطول منتصف الساق، مجعّد من الأمام',
  ],
  'a cream high-neck blouse worn with an olive satin maxi skirt': [
    'un chemisier crème à col montant porté avec une jupe longue en satin olive',
    'una blusa crema de cuello alto con falda larga de satén verde oliva',
    'بلوزة كريمية برقبة عالية مع تنّورة طويلة من الساتان بلون الزيتون',
  ],
  'a cream jersey top gathered at one side with a drawcord, worn with brown wide-leg trousers': [
    'un haut en jersey crème froncé d’un côté par un cordon coulissant, porté avec un pantalon large marron',
    'un top de punto crema fruncido a un lado con cordón, con pantalón ancho marrón',
    'قميص جيرسيه كريمي مجعّد من جهة واحدة برباط منزلق، مع بنطال واسع بنّي',
  ],
  'a dark brown high-neck long-sleeved gown gathered through the body': [
    'une robe longue marron foncé à col montant et manches longues, froncée sur tout le corps',
    'un vestido largo marrón oscuro de cuello alto y manga larga, fruncido en todo el cuerpo',
    'فستان طويل بنّي داكن برقبة عالية وأكمام طويلة، مجعّد على امتداد الجسم',
  ],
  'a floral printed shirt-jacket worn with rust wide-leg trousers': [
    'une surchemise à imprimé floral portée avec un pantalon large rouille',
    'una sobrecamisa de estampado floral con pantalón ancho color óxido',
    'سترة-قميص بطبعة زهرية مع بنطال واسع بلون الصدأ',
  ],
  'a green off-shoulder knit top worn with brown trousers': [
    'un haut en maille vert à épaules dénudées porté avec un pantalon marron',
    'un top de punto verde de hombros descubiertos con pantalón marrón',
    'قميص تريكو أخضر بكتفين مكشوفين مع بنطال بنّي',
  ],
  'a grey belted jacket with a wide sleeve worn with grey trousers': [
    'une veste grise ceinturée à manches amples portée avec un pantalon gris',
    'una chaqueta gris con cinturón y manga ancha con pantalón gris',
    'سترة رمادية بحزام وأكمام واسعة مع بنطال رمادي',
  ],
  'a grey printed column gown with wide flared sleeves falling from the elbow': [
    'une robe colonne grise imprimée aux larges manches évasées à partir du coude',
    'un vestido columna gris estampado con mangas anchas acampanadas desde el codo',
    'فستان طويل بقصّة عمودية رمادي مطبوع بأكمام واسعة تتّسع من المرفق',
  ],
  'a navy halter gown with a fitted bodice and a tiered lace ruffle skirt': [
    'une robe longue bleu marine à col halter, buste ajusté et jupe à volants de dentelle étagés',
    'un vestido largo azul marino de cuello halter con cuerpo ajustado y falda de volantes de encaje escalonados',
    'فستان طويل كحلي برقبة هالتر وصدرية محكمة وتنّورة بطبقات كشكش من الدانتيل',
  ],
  'a nude floor-length gown with a fitted bodice and a draped skirt front': [
    'une robe longue nude jusqu’au sol, buste ajusté et jupe drapée devant',
    'un vestido largo nude hasta el suelo con cuerpo ajustado y falda drapeada delante',
    'فستان بلون البشرة يصل إلى الأرض بصدرية محكمة وتنّورة مُسدَلة من الأمام',
  ],
  'a nude off-shoulder column gown with a low open back': [
    'une robe colonne nude à épaules dénudées et dos largement ouvert',
    'un vestido columna nude de hombros descubiertos con espalda muy abierta',
    'فستان طويل بقصّة عمودية بلون البشرة بكتفين مكشوفين وظهر مفتوح منخفض',
  ],
  'a pale blue sleeveless gown gathered at one side with a deep V back': [
    'une robe longue bleu pâle sans manches, froncée d’un côté, dos en V profond',
    'un vestido largo azul claro sin mangas, fruncido a un lado, con espalda en V profunda',
    'فستان طويل أزرق فاتح بلا أكمام، مجعّد من جهة واحدة، بظهر على شكل V عميق',
  ],
  'a pink cropped shirt worn with stone wide-leg trousers': [
    'une chemise courte rose portée avec un pantalon large couleur pierre',
    'una camisa corta rosa con pantalón ancho color piedra',
    'قميص قصير وردي مع بنطال واسع بلون الحجر',
  ],
  'a pink floral wrap mini dress with flutter sleeves': [
    'une robe portefeuille courte rose à fleurs, manches volantées',
    'un vestido cruzado corto rosa de flores con mangas de volante',
    'فستان قصير ملفوف وردي مزهّر بأكمام متموّجة',
  ],
  'a red bandeau top and black leggings with white piping down the leg': [
    'un haut bandeau rouge et un legging noir à passepoil blanc le long de la jambe',
    'un top bandeau rojo y leggings negros con vivo blanco a lo largo de la pierna',
    'قميص باندو أحمر وليغنغ أسود بحاشية بيضاء على طول الساق',
  ],
  'a red high-neck long-sleeved top with an open midriff worn with a floor-length skirt': [
    'un haut rouge à col montant et manches longues, ventre découvert, porté avec une jupe longue jusqu’au sol',
    'un top rojo de cuello alto y manga larga con el abdomen al descubierto y falda larga hasta el suelo',
    'قميص أحمر برقبة عالية وأكمام طويلة يكشف منطقة البطن، مع تنّورة تصل إلى الأرض',
  ],
  'a red sports bra and red leggings with a white colourblocked side panel': [
    'une brassière de sport rouge et un legging rouge à empiècement latéral blanc en color block',
    'un sujetador deportivo rojo y leggings rojos con panel lateral blanco en bloque de color',
    'حمّالة صدر رياضية حمراء وليغنغ أحمر بلوح جانبي أبيض متباين اللون',
  ],
  'a rust chiffon gown with a ruffle running down the front': [
    'une robe longue en mousseline rouille, un volant courant sur tout le devant',
    'un vestido largo de gasa color óxido con un volante a lo largo del delantero',
    'فستان طويل من الشيفون بلون الصدأ بكشكش ينساب على طول الأمام',
  ],
  'a rust halter-neck mini dress with a tie back': [
    'une robe courte rouille à col halter, nouée dans le dos',
    'un vestido corto color óxido de cuello halter con lazada en la espalda',
    'فستان قصير بلون الصدأ برقبة هالتر ورباط في الخلف',
  ],
  'a sand long-sleeved mesh look with opaque bust and brief panels': [
    'une tenue en résille sable à manches longues, avec empiècements opaques à la poitrine et à la culotte',
    'un conjunto de malla color arena de manga larga con paneles opacos en el pecho y la braguita',
    'إطلالة من الشبك بلون الرمل بأكمام طويلة مع أجزاء معتمة عند الصدر والسروال',
  ],
  'a stone wide-leg jumpsuit with a V neckline and a high back': [
    'une combinaison-pantalon large couleur pierre, décolleté en V et dos montant',
    'un mono de pierna ancha color piedra con escote en V y espalda alta',
    'جمبسوت واسع الساقين بلون الحجر بفتحة صدر على شكل V وظهر مرتفع',
  ],
  'a taupe funnel-neck peplum jacket worn with matching slim trousers': [
    'une veste à basque taupe à col cheminée portée avec un pantalon slim assorti',
    'una chaqueta peplum topo de cuello chimenea con pantalón pitillo a juego',
    'سترة ببيبلوم بلون التوب برقبة قمعية مع بنطال ضيّق من اللون نفسه',
  ],
  'a white bandeau top and white leggings with a red side stripe': [
    'un haut bandeau blanc et un legging blanc à bande latérale rouge',
    'un top bandeau blanco y leggings blancos con franja lateral roja',
    'قميص باندو أبيض وليغنغ أبيض بخطّ جانبي أحمر',
  ],
  'a white lace high-neck top worn with a navy midi pencil skirt': [
    'un haut en dentelle blanche à col montant porté avec une jupe crayon midi bleu marine',
    'un top de encaje blanco de cuello alto con falda lápiz midi azul marino',
    'قميص دانتيل أبيض برقبة عالية مع تنّورة قلم ميدي كحلية',
  ],
  'a white lace high-neck top worn with matching white lace trousers': [
    'un haut en dentelle blanche à col montant porté avec un pantalon assorti en dentelle blanche',
    'un top de encaje blanco de cuello alto con pantalón de encaje blanco a juego',
    'قميص دانتيل أبيض برقبة عالية مع بنطال دانتيل أبيض من الطقم نفسه',
  ],
  'a white tank top and white leggings with a black side stripe': [
    'un débardeur blanc et un legging blanc à bande latérale noire',
    'una camiseta de tirantes blanca y leggings blancos con franja lateral negra',
    'قميص أبيض بلا أكمام وليغنغ أبيض بخطّ جانبي أسود',
  ],

  /* ---- Womenswear licensed reference photographs: full sentences --------- */
  'A barefoot model in a loose black jacket and trousers, standing with arms extended.': [
    'Mannequin pieds nus en veste et pantalon noirs amples, debout, les bras tendus.',
    'Modelo con chaqueta y pantalón negros holgados, con los pies descalzos y los brazos extendidos.',
    'إطلالة بسترة وبنطال أسودين واسعين، بقدمين حافيتين وذراعين ممدودتين.',
  ],
  'A model in a black-and-white patterned jacket, olive cargo trousers and black boots, in a three-quarter pose.': [
    'Mannequin en veste à motif noir et blanc, pantalon cargo olive et bottes noires, pose de trois quarts.',
    'Modelo con chaqueta estampada en blanco y negro, pantalón cargo verde oliva y botas negras, en pose de tres cuartos.',
    'إطلالة بسترة بنقشة سوداء وبيضاء وبنطال كارغو زيتوني وحذاء طويل أسود، في وضعية ثلاثة أرباع.',
  ],
  'A model in a grey hoodie, grey joggers and white sneakers against a tiled wall.': [
    'Mannequin en sweat à capuche gris, pantalon de jogging gris et baskets blanches devant un mur carrelé.',
    'Modelo con sudadera gris con capucha, pantalón jogger gris y zapatillas blancas ante una pared de azulejos.',
    'إطلالة بسويتشيرت رمادية بقلنسوة وبنطال رياضي رمادي وحذاء رياضي أبيض أمام جدار مكسوّ بالبلاط.',
  ],
  'A model in a white cut-out one-piece swimsuit, barefoot against a muted pink studio ground.': [
    'Mannequin en maillot une pièce blanc à découpes, pieds nus, sur un fond de studio rose poudré.',
    'Modelo con bañador blanco de una pieza con aberturas, con los pies descalzos, sobre un fondo de estudio rosa empolvado.',
    'ملابس سباحة بيضاء قطعة واحدة بفتحات، بقدمين حافيتين أمام خلفية استوديو وردية هادئة.',
  ],
  'A model in a white lace camisole and high-waisted blue jeans against a blue studio ground.': [
    'Mannequin en caraco de dentelle blanche et jean bleu taille haute sur un fond de studio bleu.',
    'Modelo con camisola de encaje blanco y vaqueros azules de talle alto sobre un fondo de estudio azul.',
    'إطلالة بقميص دانتيل أبيض رفيع الحمّالات وجينز أزرق بخصر عالٍ أمام خلفية استوديو زرقاء.',
  ],
  'A model in an oversized brown hoodie and white sneakers, with one knee raised.': [
    'Mannequin en sweat à capuche marron oversize et baskets blanches, un genou levé.',
    'Modelo con sudadera marrón oversize con capucha y zapatillas blancas, con una rodilla levantada.',
    'إطلالة بسويتشيرت بنّية واسعة بقلنسوة وحذاء رياضي أبيض، مع ركبة مرفوعة.',
  ],
  'A model in an oversized olive shirt and white wide-leg trousers against a cloth studio ground.': [
    'Mannequin en chemise olive oversize et pantalon large blanc devant un fond de studio en tissu.',
    'Modelo con camisa oversize verde oliva y pantalón ancho blanco ante un fondo de estudio de tela.',
    'إطلالة بقميص زيتوني واسع وبنطال أبيض واسع الساقين أمام خلفية استوديو من القماش.',
  ],
  'A seated model in a checked overshirt, black graphic T-shirt, loose dark trousers and sneakers.': [
    'Mannequin assis en surchemise à carreaux, t-shirt graphique noir, pantalon sombre ample et baskets.',
    'Modelo en posición sentada con sobrecamisa de cuadros, camiseta gráfica negra, pantalón oscuro holgado y zapatillas.',
    'إطلالة جلوساً بقميص خارجي مربّعات وتيشيرت أسود بطبعة رسومية وبنطال داكن واسع وحذاء رياضي.',
  ],
  'A seated model in an oversized purple graphic T-shirt, shorts, orange socks and white sneakers.': [
    'Mannequin assis en t-shirt graphique violet oversize, short, chaussettes orange et baskets blanches.',
    'Modelo en posición sentada con camiseta gráfica morada oversize, pantalón corto, calcetines naranjas y zapatillas blancas.',
    'إطلالة جلوساً بتيشيرت بنفسجي واسع بطبعة رسومية وشورت وجوارب برتقالية وحذاء رياضي أبيض.',
  ],

  /* ---- Menswear licensed reference photographs ----------------------------- */
  'A fashionable man in a suit poses against a dark studio backdrop, exuding sophistication.': [
    'Un homme élégant en costume pose devant un fond de studio sombre, avec une allure raffinée.',
    'Un hombre elegante con traje posa ante un fondo de estudio oscuro, con un aire sofisticado.',
    'رجل أنيق ببدلة يقف أمام خلفية استوديو داكنة بحضور راقٍ.',
  ],
  'A male athlete in athletic wear prepares in an indoor gym setting, showcasing fitness and focus.': [
    'Un athlète en tenue de sport se prépare dans une salle de sport, concentré et en pleine forme.',
    'Un atleta con ropa deportiva se prepara en un gimnasio, con buena forma física y concentración.',
    'رياضيّ بملابس رياضية يستعدّ داخل صالة رياضية، بلياقة وتركيز.',
  ],
  'Adult man in black clothing posing confidently against a white studio backdrop.': [
    'Homme vêtu de noir posant avec assurance devant un fond de studio blanc.',
    'Hombre vestido de negro posando con seguridad ante un fondo de estudio blanco.',
    'رجل بملابس سوداء يقف بثقة أمام خلفية استوديو بيضاء.',
  ],
  'Asian male athlete runs during a workout on a grassy field wearing sportswear.': [
    'Un athlète asiatique en tenue de sport court pendant un entraînement sur un terrain herbeux.',
    'Un atleta asiático con ropa deportiva corre durante un entrenamiento en un campo de césped.',
    'رياضيّ آسيوي بملابس رياضية يركض خلال تمرين على أرض عشبية.',
  ],
  'Black and white portrait of a businessman standing confidently in a studio.': [
    'Portrait en noir et blanc d’un homme d’affaires debout, plein d’assurance, en studio.',
    'Retrato en blanco y negro de un hombre de negocios de pie, con seguridad, en un estudio.',
    'صورة بالأبيض والأسود لرجل أعمال يقف بثقة في الاستوديو.',
  ],
  'Complete barefoot figure in a white shirt and green trousers on a white studio ground.': [
    'Silhouette complète, pieds nus, en chemise blanche et pantalon vert sur fond de studio blanc.',
    'Figura completa, con los pies descalzos, con camisa blanca y pantalón verde sobre fondo de estudio blanco.',
    'هيئة كاملة بقدمين حافيتين وقميص أبيض وبنطال أخضر على خلفية استوديو بيضاء.',
  ],
  'Complete figure in a cream hoodie and matching trousers against a concrete wall.': [
    'Silhouette complète en sweat à capuche crème et pantalon assorti devant un mur de béton.',
    'Figura completa con sudadera crema con capucha y pantalón a juego ante una pared de hormigón.',
    'هيئة كاملة بسويتشيرت كريمية بقلنسوة وبنطال من اللون نفسه أمام جدار إسمنتي.',
  ],
  'Complete figure in a dark suit with elbow patches and brown shoes on a light studio ground.': [
    'Silhouette complète en costume sombre à coudières et chaussures marron sur un fond de studio clair.',
    'Figura completa con traje oscuro con coderas y zapatos marrones sobre un fondo de estudio claro.',
    'هيئة كاملة ببدلة داكنة برقع عند المرفقين وحذاء بنّي على خلفية استوديو فاتحة.',
  ],
  'Complete figure in a teal oversized jacket, white wide-leg trousers and bucket hat in a grey studio.': [
    'Silhouette complète en veste oversize bleu canard, pantalon large blanc et bob, dans un studio gris.',
    'Figura completa con chaqueta oversize verde azulado, pantalón ancho blanco y gorro de pescador en un estudio gris.',
    'هيئة كاملة بسترة واسعة بلون أزرق مخضرّ وبنطال أبيض واسع وقبّعة صيّاد في استوديو رمادي.',
  ],
  'Complete figure in an ivory suit and black bow tie leaning on a plinth in a dark studio.': [
    'Silhouette complète en costume ivoire et nœud papillon noir, appuyée sur un socle dans un studio sombre.',
    'Figura completa con traje marfil y pajarita negra, apoyada en un pedestal en un estudio oscuro.',
    'هيئة كاملة ببدلة عاجية وربطة عنق فراشة سوداء، مستندة إلى قاعدة في استوديو داكن.',
  ],
  'Complete kneeling pose in a black T-shirt, shorts and trainers on a white studio floor.': [
    'Pose complète à genoux en t-shirt noir, short et baskets sur un sol de studio blanc.',
    'Pose completa de rodillas con camiseta negra, pantalón corto y zapatillas sobre un suelo de estudio blanco.',
    'وضعية كاملة على الركبة بتيشيرت أسود وشورت وحذاء رياضي على أرضية استوديو بيضاء.',
  ],
  'Complete photographed pose in a white frill-front shirt and black trousers, arms raised in a red and dark studio.': [
    'Pose complète en chemise blanche à jabot et pantalon noir, bras levés, dans un studio rouge et sombre.',
    'Pose completa con camisa blanca de chorreras y pantalón negro, con los brazos en alto, en un estudio rojo y oscuro.',
    'وضعية كاملة بقميص أبيض بكشكش أمامي وبنطال أسود، بذراعين مرفوعتين في استوديو أحمر داكن.',
  ],
  'Confident man in a blue checkered suit sits and smiles in a studio setting.': [
    'Un homme sûr de lui en costume bleu à carreaux, assis et souriant, en studio.',
    'Un hombre seguro de sí con traje azul de cuadros, sentado y sonriente, en un estudio.',
    'رجل واثق ببدلة زرقاء مربّعة يجلس مبتسماً في الاستوديو.',
  ],
  'Confident young man in white hoodie and joggers posing in studio.': [
    'Un jeune homme assuré en sweat à capuche et pantalon de jogging blancs, posant en studio.',
    'Un joven seguro de sí con sudadera con capucha y pantalón jogger blancos, posando en estudio.',
    'شابّ واثق بسويتشيرت بقلنسوة وبنطال رياضي أبيضين يقف في الاستوديو.',
  ],
  'Elegant businessman in formal suit posing confidently in a studio setting.': [
    'Un homme d’affaires élégant en costume habillé, posant avec assurance en studio.',
    'Un elegante hombre de negocios con traje formal posando con seguridad en un estudio.',
    'رجل أعمال أنيق ببدلة رسمية يقف بثقة في الاستوديو.',
  ],
  'Elegant man in a suit and overcoat stands on a city street, exuding confidence and style.': [
    'Un homme élégant en costume et pardessus, debout dans une rue de ville, plein d’assurance et de style.',
    'Un hombre elegante con traje y abrigo, de pie en una calle de la ciudad, con seguridad y estilo.',
    'رجل أنيق ببدلة ومعطف يقف في شارع بالمدينة بثقة وأناقة.',
  ],
  'Fashionable man in a black suit and turtleneck poses confidently against a vibrant red backdrop.': [
    'Un homme élégant en costume noir et col roulé pose avec assurance devant un fond rouge vif.',
    'Un hombre a la moda con traje negro y jersey de cuello alto posa con seguridad ante un fondo rojo intenso.',
    'رجل أنيق ببدلة سوداء وكنزة بياقة عالية يقف بثقة أمام خلفية حمراء زاهية.',
  ],
  'Full-body portrait of a stylish man in a cream suit against a minimalist backdrop.': [
    'Portrait en pied d’un homme élégant en costume crème sur un fond minimaliste.',
    'Retrato de cuerpo entero de un hombre elegante con traje crema ante un fondo minimalista.',
    'صورة كاملة لرجل أنيق ببدلة كريمية أمام خلفية بسيطة.',
  ],
  'Full-length portrait of an androgynous model in casual attire, posing indoors.': [
    'Portrait en pied d’un mannequin androgyne en tenue décontractée, posant en intérieur.',
    'Retrato de cuerpo entero de una persona de estética andrógina con ropa informal, posando en interior.',
    'صورة كاملة لشخص بمظهر أندروجيني بملابس يومية، في وضعية داخل مكان مغلق.',
  ],
  'Full-length studio photograph of a man in a black T-shirt and shorts.': [
    'Photographie en pied, en studio, d’un homme en t-shirt noir et short.',
    'Fotografía de cuerpo entero en estudio de un hombre con camiseta negra y pantalón corto.',
    'صورة استوديو كاملة لرجل بتيشيرت أسود وشورت.',
  ],
  'Full-length studio photograph of a man in a suit.': [
    'Photographie en pied, en studio, d’un homme en costume.',
    'Fotografía de cuerpo entero en estudio de un hombre con traje.',
    'صورة استوديو كاملة لرجل ببدلة.',
  ],
  'Full-length studio photograph of a man in a white sports polo and black shorts.': [
    'Photographie en pied, en studio, d’un homme en polo de sport blanc et short noir.',
    'Fotografía de cuerpo entero en estudio de un hombre con polo deportivo blanco y pantalón corto negro.',
    'صورة استوديو كاملة لرجل بقميص بولو رياضي أبيض وشورت أسود.',
  ],
  'Man in a dark suit photographed against black.': [
    'Homme en costume sombre photographié sur fond noir.',
    'Hombre con traje oscuro fotografiado sobre fondo negro.',
    'رجل ببدلة داكنة مصوَّر على خلفية سوداء.',
  ],
  'Man in a light knit sweater and dark trousers, seated against an olive backdrop.': [
    'Homme en pull de maille clair et pantalon sombre, assis devant un fond olive.',
    'Hombre con jersey de punto claro y pantalón oscuro, sentado ante un fondo verde oliva.',
    'رجل بكنزة تريكو فاتحة وبنطال داكن، جالس أمام خلفية زيتونية.',
  ],
  'Man in a white T-shirt, dark trousers and white trainers seated on a white plinth in a pale blue studio.': [
    'Homme en t-shirt blanc, pantalon sombre et baskets blanches, assis sur un socle blanc dans un studio bleu pâle.',
    'Hombre con camiseta blanca, pantalón oscuro y zapatillas blancas, sentado en un pedestal blanco en un estudio azul claro.',
    'رجل بتيشيرت أبيض وبنطال داكن وحذاء رياضي أبيض، جالس على قاعدة بيضاء في استوديو أزرق فاتح.',
  ],
  'Man in casual suit posing with a folding chair in studio setting.': [
    'Homme en costume décontracté posant avec une chaise pliante en studio.',
    'Hombre con traje informal posando con una silla plegable en un estudio.',
    'رجل ببدلة غير رسمية يقف مع كرسي قابل للطيّ في الاستوديو.',
  ],
  'Man in hoodie and jeans sitting in relaxed pose, studio shot.': [
    'Homme en sweat à capuche et jean, assis dans une pose détendue, photographié en studio.',
    'Hombre con sudadera con capucha y vaqueros, sentado en una pose relajada; foto de estudio.',
    'رجل بسويتشيرت بقلنسوة وجينز يجلس بوضعية مسترخية، صورة استوديو.',
  ],
  'Man running beside the waterfront in dark sportswear.': [
    'Homme courant au bord de l’eau en tenue de sport sombre.',
    'Hombre corriendo junto al agua con ropa deportiva oscura.',
    'رجل يركض بمحاذاة الواجهة المائية بملابس رياضية داكنة.',
  ],
  'Man wearing a black tank top and loose denim outside.': [
    'Homme en débardeur noir et jean ample, en extérieur.',
    'Hombre con camiseta de tirantes negra y vaqueros holgados, al aire libre.',
    'رجل بقميص أسود بلا أكمام وجينز واسع في الهواء الطلق.',
  ],
  'Man wearing a dark patterned performance top.': [
    'Homme portant un haut technique sombre à motifs.',
    'Hombre con una camiseta técnica oscura estampada.',
    'رجل يرتدي قميصاً رياضياً تقنياً داكناً بنقشة.',
  ],
  'Man wearing a dark suit and open white shirt.': [
    'Homme en costume sombre et chemise blanche ouverte.',
    'Hombre con traje oscuro y camisa blanca abierta.',
    'رجل ببدلة داكنة وقميص أبيض مفتوح الياقة.',
  ],
  'Man wearing a white T-shirt and dark trousers walking through a city.': [
    'Homme en t-shirt blanc et pantalon sombre marchant en ville.',
    'Hombre con camiseta blanca y pantalón oscuro caminando por la ciudad.',
    'رجل بتيشيرت أبيض وبنطال داكن يمشي في المدينة.',
  ],
  'Model in a casual denim and hoodie outfit, studio setting.': [
    'Mannequin en tenue décontractée, denim et sweat à capuche, en studio.',
    'Modelo con un conjunto informal de denim y sudadera con capucha, en estudio.',
    'إطلالة يومية من الدنيم وسويتشيرت بقلنسوة، في الاستوديو.',
  ],
  'Portrait of a fashionable man standing with afro hair and casual attire in a minimalist studio setting.': [
    'Portrait d’un homme élégant aux cheveux afro, debout, en tenue décontractée, dans un studio minimaliste.',
    'Retrato de un hombre con estilo y pelo afro, de pie, con ropa informal en un estudio minimalista.',
    'صورة لرجل أنيق بشعر أفرو يقف بملابس يومية في استوديو بسيط.',
  ],
  'Portrait of a male athlete in a red tracksuit holding a basketball indoors.': [
    'Portrait d’un athlète en survêtement rouge tenant un ballon de basket, en intérieur.',
    'Retrato de un atleta con chándal rojo sosteniendo un balón de baloncesto en interior.',
    'صورة لرياضيّ ببدلة رياضية حمراء يحمل كرة سلّة في مكان مغلق.',
  ],
  'Portrait of a muscular man in sportswear posing in a studio setting.': [
    'Portrait d’un homme musclé en tenue de sport posant en studio.',
    'Retrato de un hombre musculoso con ropa deportiva posando en un estudio.',
    'صورة لرجل مفتول العضلات بملابس رياضية في الاستوديو.',
  ],
  'Portrait of a stylish man in oversized streetwear with an edgy pose in a studio setting.': [
    'Portrait d’un homme stylé en streetwear oversize, dans une pose affirmée, en studio.',
    'Retrato de un hombre con estilo con streetwear oversize, en una pose atrevida, en un estudio.',
    'صورة لرجل أنيق بأزياء شارع واسعة في وضعية جريئة داخل الاستوديو.',
  ],
  'Portrait of a young man sitting in a studio wearing a cream hoodie and sweatpants, showcasing street style fashion.': [
    'Portrait d’un jeune homme assis en studio, en sweat à capuche et pantalon de jogging crème, dans un style streetwear.',
    'Retrato de un joven sentado en un estudio con sudadera con capucha y pantalón de chándal crema, de estilo urbano.',
    'صورة لشابّ جالس في الاستوديو بسويتشيرت بقلنسوة وبنطال رياضي كريميين، بأسلوب أزياء الشارع.',
  ],
  'Smiling man in a white shirt and jeans standing in a minimalist studio against a plain background.': [
    'Homme souriant en chemise blanche et jean, debout dans un studio minimaliste sur fond uni.',
    'Hombre sonriente con camisa blanca y vaqueros, de pie en un estudio minimalista con fondo liso.',
    'رجل مبتسم بقميص أبيض وجينز يقف في استوديو بسيط أمام خلفية سادة.',
  ],
  'Stylish man in black and white indoors, standing against a minimalist backdrop.': [
    'Homme élégant en noir et blanc, debout en intérieur devant un fond minimaliste.',
    'Hombre con estilo vestido de blanco y negro, de pie en interior ante un fondo minimalista.',
    'رجل أنيق بالأبيض والأسود يقف في الداخل أمام خلفية بسيطة.',
  ],
  'Stylish man in urban outfit posing with skateboard in a studio setting.': [
    'Homme stylé en tenue urbaine posant avec un skateboard en studio.',
    'Hombre con estilo y look urbano posando con un monopatín en un estudio.',
    'رجل أنيق بإطلالة حضرية يقف مع لوح تزلّج في الاستوديو.',
  ],
  'Stylish man posing in a beige puffer jacket and cargo pants in a minimalist studio setting.': [
    'Homme élégant posant en doudoune beige et pantalon cargo dans un studio minimaliste.',
    'Hombre con estilo posando con plumífero beige y pantalón cargo en un estudio minimalista.',
    'رجل أنيق بسترة منفوخة بيج وبنطال كارغو في استوديو بسيط.',
  ],
  'Stylish man wearing sportswear and sunglasses poses confidently in studio.': [
    'Homme stylé en tenue de sport et lunettes de soleil posant avec assurance en studio.',
    'Hombre con estilo, con ropa deportiva y gafas de sol, posa con seguridad en estudio.',
    'رجل أنيق بملابس رياضية ونظّارات شمسية يقف بثقة في الاستوديو.',
  ],
  'Stylish young man in Adidas sportswear striking a pose, full of energy and style.': [
    'Jeune homme stylé en tenue de sport Adidas, prenant la pose avec énergie et style.',
    'Joven con estilo con ropa deportiva Adidas, posando con energía y estilo.',
    'شابّ أنيق بملابس Adidas الرياضية في وضعية مفعمة بالطاقة والأناقة.',
  ],
  'Two male models in grey and beige tailoring.': [
    'Deux mannequins hommes en costumes gris et beige.',
    'Dos modelos masculinos con sastrería gris y beige.',
    'عارضان ببدلات رمادية وبيج.',
  ],
};

const index: Record<Exclude<Locale, 'en'>, number> = { fr: 0, es: 1, ar: 2 };
const BOTH = /^Front and back views of (.+), photographed together on a white studio ground\.$/;
const SINGLE = /^(.+), photographed on a white studio ground\.$/;
const frame = {
  both: {
    fr: '{x} — vues de face et de dos, photographiées ensemble sur fond de studio blanc.',
    es: '{x}: vistas delantera y de espalda, fotografiadas juntas sobre fondo de estudio blanco.',
    ar: '{x} — منظران أمامي وخلفي مصوَّران معاً على خلفية استوديو بيضاء.',
  },
  single: {
    fr: '{x} — photographie sur fond de studio blanc.',
    es: '{x}: fotografía sobre fondo de estudio blanco.',
    ar: '{x} — صورة على خلفية استوديو بيضاء.',
  },
};
const upper = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const lower = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

/** The phrase in a language, matching the English entry whatever the case
 *  of its first letter. */
const phrase = (english: string, locale: Exclude<Locale, 'en'>): string | null => {
  const row = garments[english] ?? garments[lower(english)] ?? garments[upper(english)];
  return row ? row[index[locale]] : null;
};

/** Alt text of a garment photograph in the page language. */
export function garmentAlt(alt: string, locale: Locale): string {
  if (locale === 'en' || !alt) return alt;
  const both = alt.match(BOTH);
  const single = !both && alt.match(SINGLE);
  const match = both || single;
  if (match) {
    const x = phrase(match[1], locale);
    return x ? frame[both ? 'both' : 'single'][locale].replace('{x}', upper(x)) : alt;
  }
  return phrase(alt, locale) ?? alt;
}

/** A reader caption (the garment phrase, or a full description). */
export function garmentCaption(caption: string, locale: Locale): string {
  if (locale === 'en' || !caption) return caption;
  const x = phrase(caption, locale);
  return x ? upper(x) : caption;
}

/** For tests: every English source this map knows. */
export const garmentSources = Object.keys(garments);
