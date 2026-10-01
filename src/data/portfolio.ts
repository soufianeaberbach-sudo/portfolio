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
  /* HOW MANY VIEWS OF THE GARMENT ARE IN THE FRAME.
     2 — the photograph is a two-up: the front view on the left, the back view
         on the right, one garment, one composition.
     1 — the photograph holds a single view.
     Recorded rather than inferred, because anything that treats a frame as a
     two-up (a half-frame crop, a front-to-back camera move) would cut a
     single-view model down the centre. Optional: a consumer that has not been
     told MUST assume 1 and leave the frame whole. */
  views?: 1 | 2;
  /* WHETHER THE TWO VIEWS OF A TWO-UP CAN BE CUT APART WITHOUT CUTTING
     EITHER. `false` where the models touch — there is then no line between
     them that leaves both garments whole, so anything that would split the
     frame shows it whole instead. Recorded from the same measurement as
     `front`; unset means separable. */
  separable?: boolean;
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

/* --------------------------------------------------------------------------
   A GARMENT IS A FASHION OBJECT WITH A HISTORY, NOT A PICTURE WITH
   ATTACHMENTS.

   These types describe what one project can actually contain: the finished
   garment in as many views as were shot, where the idea started, and how it
   was built. EVERY field is optional and independently supplied. A renderer
   shows what exists and says nothing whatever about what does not — there is
   no placeholder, no substitution and no inference from an image anywhere in
   this file.

   Nothing here assumes the shape of the temporary reference archive. A future
   project may arrive as one two-up photograph, as separate front and back
   files, as renders, as a photographed sample, or as any mixture of those,
   and the same structure holds it.
   -------------------------------------------------------------------------- */

export interface GarmentAsset {
  image: ImageAsset;
  /* One short line about this asset, in the designer's own words. Never
     generated, never inferred from the picture. */
  note?: string;
}

/** THE FINISHED GARMENT. Front and back are the information; how they are
 *  presented is art direction, and the two are kept apart on purpose. */
export interface FinalViews {
  front?: ImageAsset;
  back?: ImageAsset;
  side?: ImageAsset;
  editorial?: ImageAsset;
  details?: GarmentAsset[];
  /* ONE photograph that already holds more than one view — what the current
     reference archive happens to use. Optional, and never assumed:
     `ImageAsset.views` says how many views a single frame contains, and
     `ImageAsset.front` says where the first one ends. */
  composite?: ImageAsset;
}

/** WHERE IT STARTED. */
export interface ConceptStage {
  sketch?: ImageAsset;
  illustration?: ImageAsset;
  note?: string;
}

/** HOW IT WAS BUILT. */
export interface DevelopmentStage {
  flat?: ImageAsset;
  pattern?: ImageAsset;
  clo?: ImageAsset;
  fit?: ImageAsset;
  iterations?: GarmentAsset[];
  note?: string;
}

/** HOW A PROJECT GIVES UP ITS VIEWS.
 *  The information is consistent across the portfolio; the presentation is
 *  deliberately not, because a front/back switch repeated on every project is
 *  an e-commerce control rather than art direction.
 *    turn        the frame travels from one view to the other
 *    together    both views stand side by side, at rest
 *    foreground  the second view arrives small and then takes the front
 *    drag        the visitor moves between the views themselves
 *    single      there is one view, and nothing is invented to pad it */
export type Reveal = 'turn' | 'together' | 'foreground' | 'drag' | 'single';

/** AN EDITORIAL ROLE, not a quality rating. The designer decides how much
 *  space a project deserves; the interface obeys.
 *    hero        a major fashion moment with a story worth close attention
 *    featured    a real individual presentation, fewer stages
 *    supporting  part of a territory's range, still enterable and inspectable */
export type ProjectRole = 'hero' | 'featured' | 'supporting';

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
  /* The one view a range shows: the project's cover. */
  finalGarmentImage: ImageAsset;
  /* THE PROJECT'S OWN STORY. */
  final?: FinalViews;
  concept?: ConceptStage;
  development?: DevelopmentStage;
  /* ONE real design decision, in the designer's words, or nothing. This is
     the only place in the chapter where a sentence may be specific about a
     garment, and it is rendered only when a project supplies it. */
  decision?: string;
  role?: ProjectRole;
  reveal?: Reveal;
  /* The three-stage shape the Menswear world's evidence strip still reads.
     New work uses `concept` and `development`, which hold more and say it
     more precisely; this stays so nothing already built has to change. */
  evidence?: ProjectEvidence;
  tags?: string[];
  /* CURATION, not a quality claim. A spotlit project is the one a territory
     is led by — it owns a scene of its own rather than sitting in the
     supporting run. Unset means "place me in order"; a territory with no
     spotlit project leads with its first. Set by the designer, never
     inferred. */
  spotlight?: boolean;
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

/* The nine swimwear photographs are the archive's single-view set — the same
   fact FRONT's note above records, kept here as the thing a renderer asks. */
const SINGLE_VIEW = /^swim\//;

/* The three two-ups FRONT's note records as having no gap: the models touch,
   so a split anywhere cuts one of the two garments. */
const TOUCHING = new Set(['evening/1', 'jersey/9', 'sport/10']);

const image = (ref: string, alt: string): ImageAsset => {
  const [width, height] = INTRINSIC[ref] ?? [1400, 1868];
  return {
    src: `/portfolio/${ref}-1400.webp`,
    srcset: RENDITIONS.map((w) => `/portfolio/${ref}-${w}.webp ${w}w`).join(', '),
    width,
    height,
    alt,
    front: FRONT[ref] ?? 0.55,
    views: SINGLE_VIEW.test(ref) ? 1 : 2,
    ...(TOUCHING.has(ref) ? { separable: false } : {}),
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
rtw.cover = editorial[13364876].image;

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
  description: 'A supplied recording from the pattern and 3D development archive.',
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

/* --------------------------------------------------------------------------
   THE SUBJECT.

   One shape the interface can render whether a territory holds verified
   projects or, as now, temporary reference photographs. It exists so the
   chapter's architecture does not depend on which of the two it is looking
   at — and so replacing references with real work makes the experience
   deeper without changing a single composition.

   A subject is deliberately NOT a picture with a caption. It is:
     cover   the one view a range shows
     views   every view of the finished garment that actually exists
     origin  where the idea started, where that is supplied
     build   how it was made, where that is supplied
     reveal  how its views are given up — art direction, not a toggle
     role    how much room the designer gave it

   TRUTH. For a reference, `views` comes only from what is inside the file —
   a two-up frame genuinely holds a front and a back, and a single-view frame
   holds one — `origin` and `build` are empty, `title` and `decision` are
   null, and `verified` is false. Nothing is generated to fill a gap.
   -------------------------------------------------------------------------- */

export type ViewKey = 'front' | 'back' | 'side' | 'editorial' | 'detail';
export type StageKey = 'sketch' | 'illustration' | 'flat' | 'pattern' | 'clo' | 'fit';

export interface SubjectView {
  key: ViewKey;
  label: string;
  image: ImageAsset;
  /* Which part of the file this view is. A two-up frame carries both views in
     one image, so the renderer is told which half to show; `whole` means the
     image is this view on its own. */
  crop: 'front' | 'back' | 'whole';
}

export interface SubjectStage {
  key: StageKey;
  step: string;
  label: string;
  image: ImageAsset;
  note?: string;
}

export interface Subject {
  id: string;
  /* Where it sits, so a subject can be addressed in the URL. */
  world: string;
  category: string;
  cover: ImageAsset;
  views: SubjectView[];
  origin: SubjectStage[];
  build: SubjectStage[];
  reveal: Reveal;
  role: ProjectRole;
  title: string | null;
  garmentType: string | null;
  /* WHAT THIS GARMENT IS. For a verified project, the project's own
     description. For a reference, the description of the photograph that the
     alt text already carries — which is a statement about the picture and
     never a claim about who made the garment in it. */
  caption: string | null;
  decision: string | null;
  verified: boolean;
  /* AN INTERNAL TEST SUBJECT, never public work. Set only by the
     development-only story lab (src/data/story-lab.ts), and the reader marks
     every one of its plates as a placeholder when it is set. */
  fixture?: boolean;
}

const VIEW_LABEL: Record<ViewKey, string> = {
  front: 'Front',
  back: 'Back',
  side: 'Side',
  editorial: 'Editorial',
  detail: 'Detail',
};

const STAGE_LABEL: Record<StageKey, { step: string; label: string }> = {
  sketch: { step: '01', label: 'Sketch' },
  illustration: { step: '01', label: 'Illustration' },
  flat: { step: '02', label: 'Technical flat' },
  pattern: { step: '03', label: '2D pattern' },
  clo: { step: '04', label: '3D development' },
  fit: { step: '05', label: 'Fit state' },
};

const stage = (key: StageKey, image?: ImageAsset, note?: string): SubjectStage[] =>
  image ? [{ key, ...STAGE_LABEL[key], image, note }] : [];

const view = (key: ViewKey, image: ImageAsset | undefined, crop: SubjectView['crop']): SubjectView[] =>
  image ? [{ key, label: VIEW_LABEL[key], image, crop }] : [];

/** A VERIFIED PROJECT, as the interface sees it. */
export const projectSubject = (project: Project, world: string): Subject => {
  const final = project.final ?? {};
  /* Separate files win over a two-up: a frame shot for one view is a better
     view than half of another frame. A composite is used only for the views
     it is not already supplying separately, and then its own measured
     geometry says where the front ends and the back begins. */
  const twoUp = final.composite?.views === 2 && final.composite.separable !== false ? final.composite : undefined;
  const views: SubjectView[] = [
    ...(final.front
      ? view('front', final.front, 'whole')
      : twoUp ? view('front', twoUp, 'front') : view('front', final.composite, 'whole')),
    ...(final.back
      ? view('back', final.back, 'whole')
      : twoUp ? view('back', twoUp, 'back') : []),
    ...view('side', final.side, 'whole'),
    ...view('editorial', final.editorial, 'whole'),
    ...(final.details ?? []).map((d) => ({
      key: 'detail' as ViewKey, label: VIEW_LABEL.detail, image: d.image, crop: 'whole' as const,
    })),
  ];
  const origin = [
    ...stage('sketch', project.concept?.sketch, project.concept?.note),
    ...stage('illustration', project.concept?.illustration),
  ];
  const build = [
    ...stage('flat', project.development?.flat),
    ...stage('pattern', project.development?.pattern, project.development?.note),
    ...stage('clo', project.development?.clo),
    ...stage('fit', project.development?.fit),
    ...(project.development?.iterations ?? []).map((it, i) => ({
      key: 'fit' as StageKey, step: `05.${i + 1}`, label: 'Iteration', image: it.image, note: it.note,
    })),
  ];
  return {
    id: project.id,
    world,
    category: project.marketCategory,
    cover: project.finalGarmentImage,
    views: views.length > 0 ? views : [{ key: 'front', label: VIEW_LABEL.front, image: project.finalGarmentImage, crop: 'whole' }],
    origin,
    build,
    reveal: project.reveal ?? (views.length > 1 ? 'turn' : 'single'),
    role: project.role ?? (project.spotlight ? 'hero' : 'supporting'),
    title: project.title,
    garmentType: project.garmentType,
    caption: project.description ?? null,
    decision: project.decision ?? null,
    verified: true,
  };
};

/** A REFERENCE PHOTOGRAPH, as the interface sees it. Everything here comes
 *  out of the file itself: how many views it holds and where the first one
 *  ends. There is no story, and the interface says so rather than filling
 *  one in. */
export const referenceSubject = (
  reference: ReferenceImage,
  world: string,
  category: string,
  reveal: Reveal,
): Subject => {
  /* A two-up whose models touch cannot be split without cutting one of the
     garments, so it is shown as the one frame it is: both views, whole. */
  const twoUp = reference.image.views === 2 && reference.image.separable !== false;
  const whole = reference.image.views === 2 && !twoUp;
  return {
    id: reference.id,
    world,
    category,
    cover: reference.image,
    views: twoUp
      ? [
          { key: 'front', label: VIEW_LABEL.front, image: reference.image, crop: 'front' },
          { key: 'back', label: VIEW_LABEL.back, image: reference.image, crop: 'back' },
        ]
      : [{ key: 'front', label: whole ? 'Front and back' : VIEW_LABEL.front, image: reference.image, crop: 'whole' }],
    origin: [],
    build: [],
    reveal: twoUp ? reveal : 'single',
    role: 'supporting',
    title: null,
    garmentType: null,
    /* The photograph's own description, with the boilerplate about the frame
       trimmed off the front so it reads as what it is: a description of the
       garment in the picture. */
    caption: reference.image.alt
      .replace(/^Front and back views of /i, '')
      .replace(/, photographed (together )?on a white studio ground\.?$/i, '')
      .replace(/^(.)/, (m) => m.toUpperCase()),
    decision: null,
    verified: false,
  };
};

/** WHAT THE INTERFACE SAYS WHEN A SUBJECT HAS NO STORY YET. It describes the
 *  architecture and claims nothing about the photograph. */
export const SUBJECT_STORY_PENDING =
  'Final views only. The idea, the pattern and the 3D development belong to the '
  + 'project that produced them, and arrive with it — nothing here is reconstructed '
  + 'from a photograph.';

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
  /* The chapter's own colour, as a reference to the ONE token sampled from
     that chapter's own garment. There are no variants of it: no lighter text
     colour, no darker hover, no secondary tint. It carries the chapter's
     highlighted display word, its marker, its rules and its motion cues, and
     wherever it would not be legible the text is set in ink instead. */
  accent: string;
  /* Where the subject stands in this chapter's plate, as a fraction of frame
     width — measured from the supplied file, not estimated. A phone cannot
     hold a full-length figure inside a 16:9 frame at any useful size, so
     there the cover zooms the plate and pans it until this point is centred.
     Measured from the file — the stylesheet caps it to whatever the zoomed
     window can reach without running off the edge of the plate. */
  subject: number;
  /* WHAT THE CHAPTER SELLS, in one sentence, with the single word that names
     the capability being sold. The chapter's NAME is the cover's headline —
     this is the line under it. `highlight` must appear verbatim in
     `statement`; the page splits on it rather than storing markup in data. */
  statement: string;
  highlight: string;
  action: string;
  /* One restrained line shown when the chapter is not published work. Never
     promotional, never a promise with a date. */
  stateNote?: string;
}

/* A supplied studio plate, 16:9, subject standing right of centre with the
   left of the frame left clean. Every photographic cover in the sequence is
   built from one, which is what makes the four covers read as one family. */
const scene = (name: string, alt: string): ChapterCover => ({
  image: {
    src: `/portfolio/master/${name}.png`,
    srcset: `/portfolio/master/${name}-900.webp 900w, /portfolio/master/${name}-1400.webp 1400w, /portfolio/master/${name}-1900.webp 1900w`,
    width: 1672,
    height: 941,
    alt,
    front: 1,
  },
  credit: { source: 'User-supplied chapter cover' },
});

/* THE SEQUENCE.
 *
 * The portfolio is read in the order the work is actually made: the two
 * product chapters first, then the development that proves them, then the
 * documentation that hands them over. Development therefore precedes Tech
 * Packs — a pack is written from a resolved pattern, not the other way round.
 *
 * Numbering is not stored twice. It is derived from this array's order below,
 * so a chapter cannot be moved without its number moving with it. */
const chapterSequence: Array<Omit<Chapter, 'number'>> = [
  {
    id: 'womenswear',
    title: 'Womenswear',
    kind: 'Product development',
    descriptor: womenswear.descriptor,
    publication: worldPublication(womenswear),
    cover: scene('womenswear-scene', 'Woman in a red evening dress with the skirt in full movement, in a bone studio.'),
    accent: 'var(--ww-accent)',
    subject: 0.755,
    statement: 'A strong silhouette starts with proportion, movement and a clear point of view.',
    highlight: 'silhouette',
    action: 'Enter Womenswear',
    stateNote: 'Interface preview — temporary visual references, not authored project evidence.',
  },
  {
    id: 'menswear',
    title: 'Menswear',
    kind: 'Product development',
    descriptor: menswear.descriptor,
    publication: worldPublication(menswear),
    cover: scene('menswear-scene', 'Man in a cobalt double-breasted suit standing in a bone studio.'),
    accent: 'var(--mw-accent)',
    subject: 0.794,
    statement: 'Strong proportion gives tailoring its structure, balance and presence.',
    highlight: 'proportion',
    action: 'Enter Menswear',
    stateNote: 'Selected menswear work will be published here.',
  },
  {
    /* The id stays `3d-simulation` so every link, hash and history entry that
       already exists keeps working. The PUBLIC name is wider than that: these
       recordings start at the first pattern lines, not at the finished
       simulation, and calling the chapter after its last step undersold the
       work in it. */
    id: '3d-simulation',
    /* DEVELOPMENT is the chapter's name on the cover and in the navigation —
       one word, the same weight of name as WOMENSWEAR and MENSWEAR beside
       it. The craft is named in the sentence under it and in the chapter's
       own deeper content, where the terminology can be as specific as the
       work is. */
    title: 'Development',
    kind: 'Digital validation',
    descriptor:
      'Recorded development sessions from first pattern lines through 2D construction, CLO3D validation and fit decisions.',
    publication: simulationSessions.some((session) => !session.demo)
      ? 'published'
      : simulationSessions.length > 0 ? 'reference-preview' : 'unpublished',
    cover: scene('pattern-scene', 'Chrome mannequin wearing a draped turquoise gown in a bone studio.'),
    accent: 'var(--dev-accent)',
    subject: 0.788,
    statement: 'Pattern development resolves fit, balance and construction before sampling.',
    highlight: 'fit',
    action: 'Enter Development',
  },
  {
    id: 'tech-packs',
    title: 'Tech Packs',
    kind: 'Technical documentation',
    descriptor: 'Production-ready technical documentation.',
    /* Demo packs are not published work, so the chapter reports itself as an
       interface preview. It flips to 'published' the moment a pack without
       `demo` is added — no edit needed here. */
    publication: techPacks.some((pack) => !pack.demo)
      ? 'published'
      : techPacks.length > 0 ? 'reference-preview' : 'unpublished',
    /* Not a studio plate: a sheet. The cover stages this as the front page of
       a small file, three more sheets behind it. */
    cover: {
      image: {
        src: '/portfolio/master/tech-pack-sheet.jpg',
        srcset: '/portfolio/master/tech-pack-sheet-900.webp 900w, /portfolio/master/tech-pack-sheet-1400.webp 1400w',
        width: 1199,
        height: 848,
        alt: 'Tech pack cover sheet: brand, season and style fields beside fabric swatches, with front and back flats of a tailored double-breasted coat.',
        front: 1,
      },
      credit: { source: 'User-supplied chapter cover' },
    },
    /* Tech Packs is the one chapter with no garment to sample: it uses the
       site's own technical signal, with the same restraint as everywhere else
       on aberbach.co. */
    accent: 'var(--signal)',
    subject: 0.5,
    statement: 'Clear specifications turn approved design decisions into instructions a factory can follow.',
    highlight: 'specifications',
    action: 'Enter Tech Packs',
    stateNote: 'Demo documents for interface review. Selected real technical packs will replace them.',
  },
];

export const chapters: Chapter[] = chapterSequence.map((chapter, index) => ({
  ...chapter,
  number: String(index + 1).padStart(2, '0'),
}));

/* The one place the running order is published to the rest of the interface,
   so a world's own bar and the continuity navigation cannot disagree with the
   covers about what chapter 03 is. */
export const chapterNumber = (id: string): string =>
  chapters.find((chapter) => chapter.id === id)?.number ?? '';
