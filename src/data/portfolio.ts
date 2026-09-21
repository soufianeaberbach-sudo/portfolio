/* Portfolio V6 — the whole taxonomy, in one typed place.
 *
 * TWO KINDS OF CONTENT, AND THE LINE BETWEEN THEM
 * -----------------------------------------------
 * This module distinguishes, in the type system, between:
 *
 *   Project        VERIFIED work. Authored by Soufiane, with a title, garment
 *                  type, fabric family, description and development evidence
 *                  that come from real project information — never from
 *                  looking at a photograph.
 *
 *   ReferenceImage TEMPORARY visual reference. A photograph used to show that
 *                  the portfolio interface works, and nothing else. It carries
 *                  an image and a descriptive alt attribute. It has no title,
 *                  no garment type, no fabric family, no description, no
 *                  capability tags and no evidence, because none of those are
 *                  knowable from a photograph.
 *
 * The 49 photographs under public/portfolio/ are ReferenceImages. The page
 * this replaced said so in plain words — "Images are temporary visual
 * references and do not claim authorship of the photographed garments" — and
 * an earlier pass of V6 wrongly promoted them to 49 named projects with
 * inferred construction history (bias cut, ruffle method, grading, fit
 * correction). Every one of those claims has been removed. They were read off
 * the picture, which is not evidence of anything.
 *
 * A category therefore holds both lists. `projects` is authoritative; it is
 * empty today. `references` is the demo set. The UI renders project detail
 * only from `projects`, so the day a real project is added it displaces the
 * reference set with no component changes.
 *
 * PUBLICATION STATE
 * -----------------
 * Derived, never hand-maintained, so it cannot drift from the content:
 *
 *   published         has verified work
 *   reference-preview no verified work, but reference imagery to demonstrate
 *                     the interface — always labelled as such in the UI
 *   unpublished       nothing to show yet; the chapter is listed but not
 *                     presented as finished evidence and is not interactive
 *
 * WHAT IS DELIBERATELY ABSENT
 * ---------------------------
 * No verified menswear project photography and no sketch, pattern or
 * simulation still for any garment. Menswear uses explicitly labelled
 * reference-preview imagery, and the five tech-pack PDFs remain unmistakably
 * stamped interface demos rather than client work.
 */

import { editorial } from './portfolio-editorial';

export type Gender = 'womenswear' | 'menswear';

/* Construction families, not fibre compositions. Only ever set from verified
   project information — it is not read off a photograph. */
export type FabricFamily =
  | 'Woven'
  | 'Tailored Woven'
  | 'Jersey / Knit'
  | 'Stretch'
  | 'Performance Stretch';

export interface ImageAsset {
  src: string;
  srcset: string;
  /* Intrinsic size of the largest rendition, so the browser reserves the box
     before the bytes land. */
  width: number;
  height: number;
  alt: string;
  /* How much of the image, measured from its left edge, has to stay visible
     for the front view to read completely. The deck overlaps each card on its
     right, so this is the fraction that must never be covered. Per image, not
     a global guess — see FRONT below. */
  front: number;
}

export interface ImageCredit {
  source: string;
  sourcePage?: string;
  photographer?: string;
}

export interface ChapterCover {
  image: ImageAsset;
  credit: ImageCredit;
  focalPosition?: string;
}

export type EvidenceStage = 'sketch' | 'pattern' | 'simulation';

export interface EvidenceAsset {
  image: ImageAsset;
  note?: string;
}

/* Every stage is optional and independently supplied. A project with only a
   pattern renders only a pattern; nothing is substituted for the other two,
   and a project with none renders no strip at all. */
export type ProjectEvidence = Partial<Record<EvidenceStage, EvidenceAsset>>;

/* VERIFIED WORK ONLY. Nothing on this type may be populated by inference from
   an image. If a value is not known from the project itself, the field is left
   unset and the UI omits it. */
export interface Project {
  id: string;
  gender: Gender;
  marketCategory: string;
  title: string;
  garmentType: string;
  fabricFamily?: FabricFamily;
  materials?: string[];
  description?: string;
  finalGarmentImage: ImageAsset;
  evidence: ProjectEvidence;
  tags?: string[];
}

/* A photograph, and nothing claimed about it beyond what is visible in the
   frame. There is deliberately no title, description, fabricFamily, tags or
   evidence field here — the type makes the claim impossible to make. */
export interface ReferenceImage {
  id: string;
  image: ImageAsset;
  credit?: ImageCredit;
}

export interface MarketCategory {
  id: string;
  number: string;
  label: string;
  blurb: string;
  projects: Project[];
  references: ReferenceImage[];
  cover?: ImageAsset;
}

export type Publication = 'published' | 'reference-preview' | 'unpublished';

export interface GarmentWorld {
  id: string;
  number: string;
  title: string;
  descriptor: string;
  categories: MarketCategory[];
}

export interface TechPack {
  id: string;
  title: string;
  garmentType: string;
  category: string;
  gender: Gender;
  pdfUrl?: string;
  coverImage?: ImageAsset;
  pageCount?: number;
  scope?: string[];
  /* An interface prototype rather than a document. Demo packs exist so the
     folio viewer can be designed against something that actually opens; every
     page of them says DEMO / INTERFACE PROTOTYPE / NOT CLIENT WORK and carries
     no measurement, grading or BOM value. The UI must never present one as
     published work. */
  demo?: boolean;
}

export interface SimulationSession {
  id: string;
  title: string;
  description: string;
  /* What this recording actually is. A short clip of a garment simulating is
     a sample; it is not a recorded working session showing a pattern being
     built. Labelling it keeps the two apart on the public page. */
  kind: 'sample' | 'working-session';
  youtubeId?: string;
  videoSrc?: string;
  poster?: string;
  posterAlt?: string;
  workflowLabels?: string[];
  duration?: number;
  /* A slot in the interface, not a recording. Demo sessions carry no source
     and are rendered as a design state — never as a broken player. */
  demo?: boolean;
}

/* The three development stages, in order. Exported so the world component and
   the tests read the same list. */
export const EVIDENCE_STAGES: Array<{ key: EvidenceStage; step: string; name: string }> = [
  { key: 'sketch', step: '01', name: 'Sketch' },
  { key: 'pattern', step: '02', name: '2D Pattern' },
  { key: 'simulation', step: '03', name: '3D Simulation' },
];

/* Shown on the demo evidence strip so the placeholder can never be mistaken
   for work. */
export const EVIDENCE_DEMO_NOTE = 'Demo layout — real project assets pending';

/* The sentence the pre-V6 portfolio carried, restored. It is rendered at body
   size in the flow of the page, never as fine print. */
export const REFERENCE_DISCLAIMER =
  'Temporary visual references for interface demonstration. No authorship of photographed garments is claimed.';

/* --------------------------------------------------------------------------
   Image helpers.
   -------------------------------------------------------------------------- */

const RENDITIONS = [900, 1400] as const;

/* Measured from the actual files. 39 of the 49 renditions are 1400x1868
   (0.749, i.e. 3:4). The rest are taller (0.558-0.563) or square (1.000),
   which is why the stage uses object-fit: contain on one fixed 3:4 canvas —
   the odd sizes letterbox instead of being cropped. */
const INTRINSIC: Record<string, [number, number]> = {
  'evening/3': [1400, 2486], 'evening/6': [1400, 2508], 'evening/7': [1400, 2508],
  'evening/9': [1400, 2508], 'evening/10': [1400, 2508],
  'jersey/3': [1400, 2486], 'jersey/8': [1400, 2086], 'jersey/9': [1400, 2486],
  'jersey/10': [1400, 2486],
  'sport/8': [1400, 1400],
};

/* WHERE THE FRONT VIEW ENDS, PER IMAGE.
 *
 * Most of these photographs place the front view on the left of the frame and
 * the back view on the right, so the deck can overlap the right side of a card
 * and still leave a complete front model readable. That boundary is not in the
 * same place twice, and one number for all 49 would cut somebody in half.
 *
 * Measured, not assumed: each rendition was reduced to a column ink-density
 * profile, and the widest near-empty run of columns whose centre falls between
 * 40% and 64% of the width was taken as the gap between the two models. The
 * value stored is the RIGHT edge of that gap, so the entire front model plus
 * the gap stays exposed. 37 of 49 resolved that way, clustering near 0.55.
 *
 * Two exceptions, both handled rather than ignored:
 *   - evening/1, jersey/9 and sport/10 have the two models touching, so there
 *     is no gap to find. They take 0.54, the cluster median, and were then
 *     checked by eye: the front model is complete in all three.
 *   - the nine swimwear photographs are SINGLE-view. There is no back view to
 *     hide, and splitting them near the middle would cut the only model down
 *     the centre. Their value is the right edge of the model's own ink extent,
 *     which is why they run 0.68-0.81 rather than ~0.55.
 *
 * An image with the arrangement reversed would simply carry a value near 1.0
 * and stay effectively unoccluded. Nothing here assumes a side.
 */
const FRONT: Record<string, number> = {
  'evening/1': 0.54, 'evening/2': 0.512, 'evening/3': 0.537, 'evening/4': 0.504,
  'evening/5': 0.529, 'evening/6': 0.529, 'evening/7': 0.504, 'evening/8': 0.596,
  'evening/9': 0.546, 'evening/10': 0.571,
  'jersey/1': 0.571, 'jersey/2': 0.596, 'jersey/3': 0.563, 'jersey/4': 0.596,
  'jersey/5': 0.563, 'jersey/6': 0.554, 'jersey/7': 0.596, 'jersey/8': 0.579,
  'jersey/9': 0.54, 'jersey/10': 0.563,
  'woven/1': 0.596, 'woven/2': 0.579, 'woven/3': 0.579, 'woven/4': 0.579,
  'woven/5': 0.588, 'woven/6': 0.588, 'woven/7': 0.604, 'woven/8': 0.596,
  'woven/9': 0.504, 'woven/10': 0.604,
  'sport/1': 0.554, 'sport/2': 0.554, 'sport/3': 0.579, 'sport/4': 0.588,
  'sport/5': 0.554, 'sport/6': 0.579, 'sport/7': 0.596, 'sport/8': 0.554,
  'sport/9': 0.588, 'sport/10': 0.54,
  'swim/1': 0.796, 'swim/2': 0.813, 'swim/3': 0.771, 'swim/4': 0.679, 'swim/5': 0.804,
  'swim/6': 0.704, 'swim/7': 0.771, 'swim/8': 0.713, 'swim/9': 0.762,
};

const image = (ref: string, alt: string): ImageAsset => {
  const [width, height] = INTRINSIC[ref] ?? [1400, 1868];
  return {
    src: `/portfolio/${ref}-1400.webp`,
    srcset: RENDITIONS.map((w) => `/portfolio/${ref}-${w}.webp ${w}w`).join(', '),
    width,
    height,
    alt,
    front: FRONT[ref] ?? 0.55,
  };
};

/* Each photograph is a single composition already containing the front and the
   back of one garment. It is never split, cropped in two, or paired with a
   generated back view.

   The alt text describes what is visible in the frame and stops there. That is
   what alt is for, and a description of a picture is not a claim about who
   developed the garment in it. */
const bothViews = (garment: string) =>
  `Front and back views of ${garment}, photographed together on a white studio ground.`;

const buildCategory = (
  id: string,
  number: string,
  label: string,
  blurb: string,
  refs: Array<[string, string]>,
): MarketCategory => ({
  id,
  number,
  label,
  blurb,
  /* Empty, and the only place verified work will ever go. */
  projects: [],
  references: refs.map(([ref, alt], index) => ({
    id: `${id}-ref-${String(index + 1).padStart(2, '0')}`,
    image: image(ref, alt),
  })),
});

/* --------------------------------------------------------------------------
   WOMENSWEAR — five approved market categories.

   The photographs are grouped by what is visibly in them, so the category
   index can be demonstrated. Grouping a picture of a gown under Evening is a
   statement about the picture, not about who made the garment.
   -------------------------------------------------------------------------- */

const rtw = buildCategory('rtw', '01', 'Ready-to-Wear & Contemporary',
  'Day dresses, separates and jumpsuits, where the commercial decision and the construction decision are the same decision.', [
  ['woven/1', bothViews('a champagne satin slip dress with a cowl neckline and a low open back')],
  ['woven/2', bothViews('a pink cropped shirt worn with stone wide-leg trousers')],
  ['woven/3', bothViews('a stone wide-leg jumpsuit with a V neckline and a high back')],
  ['woven/4', bothViews('a blue and white diagonally striped sleeveless midi dress with an open back')],
  ['woven/5', bothViews('a floral printed shirt-jacket worn with rust wide-leg trousers')],
  ['woven/6', bothViews('a rust halter-neck mini dress with a tie back')],
  ['woven/8', bothViews('a cream high-neck blouse worn with an olive satin maxi skirt')],
  ['woven/9', bothViews('a pink floral wrap mini dress with flutter sleeves')],
  ['woven/10', bothViews('a brightly printed floral mini dress with puff sleeves and an open back')],
  ['jersey/1', bothViews('a white lace high-neck top worn with matching white lace trousers')],
  ['jersey/2', bothViews('a black ruffled blouse worn with black slim trousers')],
  ['jersey/3', bothViews('a beige tie-waist wrap blouse worn with brown wide-leg trousers')],
  ['jersey/4', bothViews('a taupe funnel-neck peplum jacket worn with matching slim trousers')],
  ['jersey/7', bothViews('a brown cold-shoulder top with tie sleeves worn with camel wide-leg trousers')],
  ['jersey/8', bothViews('a green off-shoulder knit top worn with brown trousers')],
  ['jersey/9', bothViews('a grey belted jacket with a wide sleeve worn with grey trousers')],
  ['jersey/10', bothViews('a white lace high-neck top worn with a navy midi pencil skirt')],
]);

const active = buildCategory('activewear', '02', 'Activewear & Athleisure',
  'Panelled performance product, where the pattern is engineered around stretch and recovery rather than imposed on it.', [
  ['sport/1', bothViews('a white bandeau top and white leggings with a red side stripe')],
  ['sport/2', bothViews('a red bandeau top and black leggings with white piping down the leg')],
  ['sport/3', bothViews('a white tank top and white leggings with a black side stripe')],
  ['sport/4', bothViews('a black racerback tank and black leggings with white side stripes')],
  ['sport/5', bothViews('a black long-sleeved training top and full-length black leggings')],
  ['sport/6', bothViews('a black short-sleeved training top and cropped black leggings')],
  ['sport/7', bothViews('a brown ribbed tank top and matching brown wide flared trousers')],
  ['sport/8', bothViews('a red sports bra and red leggings with a white colourblocked side panel')],
  ['sport/9', bothViews('a sand long-sleeved top and a matching high-cut bodysuit')],
  ['sport/10', bothViews('a black long-sleeved top and cropped black leggings with white side stripes')],
]);

const street = buildCategory('streetwear', '03', 'Streetwear & Casualwear',
  'Relaxed volumes, where the fit has to read as deliberate rather than as ease left in by accident.', [
  ['jersey/5', bothViews('a cream jersey top gathered at one side with a drawcord, worn with brown wide-leg trousers')],
  ['jersey/6', bothViews('a burgundy cropped hooded sweatshirt worn with olive green joggers')],
]);

const evening = buildCategory('evening', '04', 'Evening & Occasionwear',
  'Long-line construction, where drape, support and the back view are resolved at the same time.', [
  ['evening/1', bothViews('a grey printed column gown with wide flared sleeves falling from the elbow')],
  ['evening/2', bothViews('a nude off-shoulder column gown with a low open back')],
  ['evening/3', bothViews('a navy halter gown with a fitted bodice and a tiered lace ruffle skirt')],
  ['evening/4', bothViews('a black long-sleeved sequinned gown with a high neck, open back and front slit')],
  ['evening/5', bothViews('a rust chiffon gown with a ruffle running down the front')],
  ['evening/6', bothViews('a pale blue sleeveless gown gathered at one side with a deep V back')],
  ['evening/7', bothViews('a nude floor-length gown with a fitted bodice and a draped skirt front')],
  ['evening/8', bothViews('a brown column gown with an open cut-out waist and a tie at the back')],
  ['evening/9', bothViews('a dark brown high-neck long-sleeved gown gathered through the body')],
  ['evening/10', bothViews('a red high-neck long-sleeved top with an open midriff worn with a floor-length skirt')],
  ['woven/7', bothViews('a champagne strapless column gown with ruching across the front and a fishtail hem')],
]);

const swim = buildCategory('swimwear', '05', 'Swimwear & Resortwear',
  'The category with nowhere to hide: balance, recovery and millimetre tolerances are all visible on the body.', [
  ['swim/1', 'A bandeau bikini with contrast binding and long tie sides, photographed on a white studio ground.'],
  ['swim/2', 'A silver triangle bikini with tie sides, photographed on a white studio ground.'],
  ['swim/3', 'A printed bikini with contrast red trim and thin straps, photographed on a white studio ground.'],
  ['swim/4', 'A magenta textured bandeau bikini with tie-side briefs, photographed on a white studio ground.'],
  ['swim/5', 'A silver halter bikini with high-cut briefs, photographed on a white studio ground.'],
  ['swim/6', 'A blue one-piece swimsuit with a front ring detail and high-cut legs, photographed on a white studio ground.'],
  ['swim/7', 'A silver bikini with long ties wrapped around the waist, photographed on a white studio ground.'],
  ['swim/8', 'A black bandeau top with a high-waisted brief, photographed on a white studio ground.'],
  ['swim/9', 'A silver underwired bikini with tie-side briefs, photographed on a white studio ground.'],
]);

/* --------------------------------------------------------------------------
   MENSWEAR — approved category order with temporary reference previews.

   Real menswear work exists but is not in this repository. The chapter reuses
   a small, clearly disclosed subset of the reference archive only to make all
   four category routes and gallery mechanics reviewable; none is presented as
   authored menswear project evidence.
   -------------------------------------------------------------------------- */

const menswearCategories: MarketCategory[] = [
  buildCategory('m-streetwear', '01', 'Streetwear & Casualwear',
    'Relaxed volume, dropped shoulders, and the construction that keeps a loose garment from reading as an oversized one.', [
      ['jersey/6', bothViews('a cropped hooded sweatshirt worn with relaxed joggers')],
      ['jersey/5', bothViews('a gathered jersey top worn with wide-leg trousers')],
    ]),
  buildCategory('m-activewear', '02', 'Activewear & Performance',
    'Panelled performance product engineered around movement, stretch and recovery.', [
      ['sport/5', bothViews('a long-sleeved performance top with full-length leggings')],
      ['sport/6', bothViews('a short-sleeved performance top with cropped leggings')],
      ['sport/10', bothViews('a long-sleeved performance set with contrast side stripes')],
    ]),
  buildCategory('m-rtw', '03', 'Contemporary Ready-to-Wear',
    'Shirting, knitwear and trousers, where the commercial and construction decisions meet.', [
      ['woven/2', bothViews('a cropped shirt worn with wide-leg trousers')],
      ['woven/5', bothViews('a printed shirt-jacket worn with wide-leg trousers')],
      ['jersey/8', bothViews('an off-shoulder knit top worn with tailored trousers')],
    ]),
  buildCategory('m-tailoring', '04', 'Tailoring & Outerwear',
    'Internal construction, canvas and balance — the work that is invisible once the garment is finished.', [
      ['jersey/9', bothViews('a belted jacket with a wide sleeve worn with tailored trousers')],
      ['jersey/4', bothViews('a funnel-neck peplum jacket worn with slim trousers')],
    ]),
];

/* -------------------------------------------------------------------------- */

// Menswear reference photography replaces the inherited cross-category placeholders.
const menswearReferenceIds = [
  [8505243, 30599804, 30954220, 16711124],
  [7648388, 20038943, 30954220, 5037287],
  [16711124, 8505243, 17552351, 4651396],
  [4651396, 16862147, 17552351, 18320052],
];
menswearCategories.forEach((category, index) => {
  category.references = menswearReferenceIds[index].map((id) => ({
    id: `${category.id}-pexels-${id}`, ...editorial[id],
  }));
  category.cover = category.references[0].image;
});
/* The Ready-to-Wear cover was pointed at a licensed editorial photograph. A
   category's own first garment is both truer and stronger: it is the actual
   content of the category, it is authored work, and it stopped one stock image
   appearing three times on a single journey (landing, chapter cover, category
   cover). The chapter cover above still uses editorial imagery and says so. */

export const womenswear: GarmentWorld = {
  id: 'womenswear',
  number: '01',
  title: 'Womenswear',
  descriptor: 'Commercial product development across ready-to-wear, active, street, occasion and swim.',
  categories: [rtw, active, street, evening, swim],
};

export const menswear: GarmentWorld = {
  id: 'menswear',
  number: '02',
  title: 'Menswear',
  descriptor: 'Casual, performance, contemporary and tailored product development.',
  categories: menswearCategories,
};

export const garmentWorlds: GarmentWorld[] = [womenswear, menswear];

/* FIVE DEMO PACKS, for interface review only.
 *
 * No real technical document is published here yet, and selected real examples
 * are intended to be. These five exist so the folio viewer can be designed and
 * judged against documents that genuinely open. They are generated by
 * .devtools/gen-demo-techpacks.mjs and every page of every one of them is
 * stamped DEMO / INTERFACE PROTOTYPE / NOT CLIENT WORK. They carry the
 * SECTION STRUCTURE of a pack and nothing else: no client name, no season, no
 * measurement, no grading increment, no BOM quantity — every field is an empty
 * rule.
 *
 * `demo: true` keeps them out of the published-work accounting below, so the
 * chapter still reports itself as an interface preview rather than as
 * finished evidence. */
const demoPack = (id: string, slug: string, title: string, garmentType: string): TechPack => ({
  id,
  title,
  garmentType,
  category: 'Womenswear',
  gender: 'womenswear',
  pdfUrl: `/demo/techpacks/${slug}.pdf`,
  /* Page 01 of the document beside it, rendered by the same generator. The
     interface shows the actual first page — watermark, header and the
     NOT CLIENT WORK footer included — rather than a drawing of a document. */
  coverImage: {
    src: `/demo/techpacks/${slug}-p1.webp`,
    srcset: `/demo/techpacks/${slug}-p1.webp 1200w`,
    width: 1200,
    height: 849,
    alt: `First page of the ${title.toLowerCase()} demo technical pack: section 01, technical flat, stamped DEMO — interface prototype, with every field left blank.`,
    front: 1,
  },
  pageCount: 6,
  scope: ['Technical flat', 'Construction detail', 'Measurement chart', 'Grading', 'Bill of materials', 'Label and packing'],
  demo: true,
});

export const techPacks: TechPack[] = [
  demoPack('tp-01', 'demo-01-jersey-top', 'Jersey Top', 'Jersey top'),
  demoPack('tp-02', 'demo-02-tailored-trouser', 'Tailored Trouser', 'Tailored trouser'),
  demoPack('tp-03', 'demo-03-performance-legging', 'Performance Legging', 'Performance legging'),
  demoPack('tp-04', 'demo-04-woven-dress', 'Woven Dress', 'Woven dress'),
  demoPack('tp-05', 'demo-05-hooded-sweatshirt', 'Hooded Sweatshirt', 'Hooded sweatshirt'),
];

/* The five supplied recordings. Posters are YouTube's own static thumbnails;
 * the privacy-enhanced player is still created only after an intentional
 * click, so opening the chapter never preloads an iframe. */
export const SIMULATION_COVER = {
  src: '/CLO3D-cover.jpg',
  alt: 'Two digital avatars mid-walk in CLO3D, one in a corduroy harrington jacket and wide trousers, one in a ribbed top and wide trousers.',
};

const suppliedYouTubeIds = [
  'dfbUl82h8Ck',
  'iOyhNjVEe_U',
  'UToex4DCeZ8',
  'TDfFjjnbPq4',
  'ure0EK4gq3k',
] as const;

export const simulationSessions: SimulationSession[] = suppliedYouTubeIds.map((youtubeId, index) => ({
  id: `video-${String(index + 1).padStart(2, '0')}`,
  title: `Development recording ${String(index + 1).padStart(2, '0')}`,
  kind: 'working-session',
  youtubeId,
  poster: `/portfolio/posters/${youtubeId}.jpg`,
  posterAlt: `Poster frame for development recording ${String(index + 1).padStart(2, '0')}.`,
  description: 'A supplied recording from the pattern and 3D development process.',
}));

/* --------------------------------------------------------------------------
   Publication state, derived from content so it cannot drift.
   -------------------------------------------------------------------------- */

export const worldPublication = (world: GarmentWorld): Publication => {
  if (world.categories.some((category) => category.projects.length > 0)) return 'published';
  if (world.categories.some((category) => category.references.length > 0)) return 'reference-preview';
  return 'unpublished';
};

export const verifiedProjectCount = (world: GarmentWorld): number =>
  world.categories.reduce((total, category) => total + category.projects.length, 0);

export interface Chapter {
  id: string;
  number: string;
  title: string;
  /* Two or three words naming what kind of chapter this is. It sits in the
     cover's register opposite the number — the only other thing on a cover
     besides its name. */
  kind: string;
  descriptor: string;
  publication: Publication;
  cover: ChapterCover;
  /* One restrained line shown when the chapter is not published work. Never
     promotional, never a promise with a date. */
  stateNote?: string;
}

export const chapters: Chapter[] = [
  {
    id: 'womenswear',
    number: '01',
    title: 'Womenswear',
    /* The two garment chapters used to carry the same `kind`, so the register
       line above their covers read "Product development" twice, side by side,
       and differentiated nothing. Each now names what it is about. */
    kind: 'Silhouette',
    descriptor: womenswear.descriptor,
    publication: worldPublication(womenswear),
    cover: {
      ...editorial[13364876],
      focalPosition: '50% 38%',
    },
    stateNote: 'Interface preview — temporary visual references, not authored project evidence.',
  },
  {
    id: 'menswear',
    number: '02',
    title: 'Menswear',
    kind: 'Structure',
    descriptor: menswear.descriptor,
    publication: worldPublication(menswear),
    cover: {
      ...editorial[4651396],
      focalPosition: '50% 32%',
    },
    stateNote: 'Selected menswear work will be published here.',
  },
  {
    id: 'tech-packs',
    number: '03',
    title: 'Tech Packs',
    kind: 'Technical documentation',
    descriptor: 'Production-ready technical documentation.',
    /* Demo packs are not published work, so the chapter reports itself as an
       interface preview. It flips to 'published' the moment a pack without
       `demo` is added — no edit needed here. */
    publication: techPacks.some((pack) => !pack.demo)
      ? 'published'
      : techPacks.length > 0 ? 'reference-preview' : 'unpublished',
    cover: {
      image: techPacks[0].coverImage!,
      credit: { source: 'Portfolio demo document archive' },
      focalPosition: '50% 18%',
    },
    stateNote: 'Demo documents for interface review. Selected real technical packs will replace them.',
  },
  {
    /* The id stays `3d-simulation` so every link, hash and history entry that
       already exists keeps working. The PUBLIC name is wider than that: these
       recordings start at the first pattern lines, not at the finished
       simulation, and calling the chapter after its last step undersold the
       work in it. */
    id: '3d-simulation',
    number: '04',
    title: 'Pattern Development',
    kind: 'Digital validation',
    descriptor:
      'Recorded development sessions from first pattern lines through 2D construction, CLO3D validation and fit decisions.',
    publication: simulationSessions.some((session) => !session.demo)
      ? 'published'
      : simulationSessions.length > 0 ? 'reference-preview' : 'unpublished',
    cover: {
      image: {
        src: SIMULATION_COVER.src,
        srcset: `${SIMULATION_COVER.src} 512w`,
        width: 512,
        height: 910,
        alt: SIMULATION_COVER.alt,
        front: 1,
      },
      credit: { source: 'Portfolio CLO3D archive' },
      focalPosition: '50% 32%',
    },
  },
];

/* --------------------------------------------------------------------------
   PER-GARMENT EVIDENCE RESOLUTION

   The three development surfaces — sketch, 2D pattern, 3D simulation — belong
   to ONE garment, not to a category. Advancing the deck changes which garment
   is under inspection, so the three surfaces have to change with it.

   WHY THIS LIVES HERE AND NOT ON THE TYPES ABOVE.
   `ReferenceImage` deliberately carries no evidence field: a photograph whose
   authorship is not claimed cannot have development evidence, and the type
   makes that unrepresentable. `Project.evidence` is the only place a real
   asset is ever declared. This function is the read side of both — it answers
   "what should the three surfaces show for the garment at this position?"
   without letting either type grow a field it must not have.

   THREE OUTCOMES PER SURFACE, and the caller can tell them apart:

     kind: 'authored'   a real supplied asset. `image` is that asset.
     kind: 'preview'    no asset yet, so the CURRENT GARMENT image stands in
                        so the dynamic system is visibly working. It is
                        labelled TEMP PREVIEW on the surface itself and is
                        never described as a sketch, a pattern or a
                        simulation.
     kind: 'empty'      nothing to show at all — no asset and no garment
                        image to borrow. Renders as a stated blank.

   Supplying `project.evidence.sketch` later turns that one surface from
   'preview' to 'authored'. Nothing structural changes.
   -------------------------------------------------------------------------- */

export type EvidenceKind = 'authored' | 'preview' | 'empty';

export interface EvidenceSurface {
  key: EvidenceStage;
  step: string;
  name: string;
  kind: EvidenceKind;
  /* Absent only when kind is 'empty'. */
  image?: ImageAsset;
  note?: string;
}

/* What the deck holds at one position: either a verified project or a
   reference photograph. One shape so the viewer does not branch. */
export interface GarmentSlot {
  id: string;
  image: ImageAsset;
  project: Project | null;
}

/* The marker printed on a surface that is standing in for an asset that does
   not exist yet. Exported so the component and the tests read one string. */
export const EVIDENCE_PREVIEW_MARK = 'Temp preview';

/* Said once, beside the three surfaces, when any of them is a stand-in. */
export const EVIDENCE_PREVIEW_NOTE =
  'Temporary previews — the active garment shown in place of its development assets.';

export const garmentEvidence = (slot: GarmentSlot): EvidenceSurface[] =>
  EVIDENCE_STAGES.map(({ key, step, name }) => {
    const authored = slot.project?.evidence?.[key];
    if (authored) {
      return { key, step, name, kind: 'authored' as const, image: authored.image, note: authored.note };
    }
    if (slot.image) {
      return { key, step, name, kind: 'preview' as const, image: slot.image };
    }
    return { key, step, name, kind: 'empty' as const };
  });

/* True when not one of the three surfaces holds a real asset. The viewer uses
   it to keep the evidence rail at a lower visual weight rather than giving a
   third of the best screen to three stand-ins. */
export const evidenceIsAllPreview = (surfaces: EvidenceSurface[]): boolean =>
  surfaces.every((surface) => surface.kind !== 'authored');
