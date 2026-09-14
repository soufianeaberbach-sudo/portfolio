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
 * No menswear photography, no tech pack PDF, no YouTube id, and no sketch,
 * pattern or simulation still for any garment. All four are modelled. None is
 * invented, and no womenswear image is relabelled to fill a menswear slot.
 */

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
}

export interface MarketCategory {
  id: string;
  number: string;
  label: string;
  blurb: string;
  projects: Project[];
  references: ReferenceImage[];
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
}

/* The sentence the pre-V6 portfolio carried, restored. It is rendered at body
   size in the flow of the page, never as fine print. */
export const REFERENCE_DISCLAIMER =
  'Temporary visual references used to demonstrate the portfolio interface. They do not claim authorship of the photographed garments.';

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

const image = (ref: string, alt: string): ImageAsset => {
  const [width, height] = INTRINSIC[ref] ?? [1400, 1868];
  return {
    src: `/portfolio/${ref}-1400.webp`,
    srcset: RENDITIONS.map((w) => `/portfolio/${ref}-${w}.webp ${w}w`).join(', '),
    width,
    height,
    alt,
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
   MENSWEAR — approved category order, no content.

   Real menswear work exists but is not in this repository. The architecture is
   here; the chapter resolves to `unpublished` and is not presented as finished
   evidence. Nothing womenswear has been relabelled to fill it.
   -------------------------------------------------------------------------- */

const menswearCategories: MarketCategory[] = [
  buildCategory('m-streetwear', '01', 'Streetwear & Casualwear',
    'Relaxed volume, dropped shoulders, and the construction that keeps a loose garment from reading as an oversized one.', []),
  buildCategory('m-activewear', '02', 'Activewear & Performance',
    'Panelled performance product engineered around movement, stretch and recovery.', []),
  buildCategory('m-rtw', '03', 'Contemporary Ready-to-Wear',
    'Shirting, knitwear and trousers, where the commercial and construction decisions meet.', []),
  buildCategory('m-tailoring', '04', 'Tailoring & Outerwear',
    'Internal construction, canvas and balance — the work that is invisible once the garment is finished.', []),
];

/* -------------------------------------------------------------------------- */

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

/* No PDF exists here yet. Selected technical pack examples are intended for
   publication, so the world is `unpublished` rather than carrying a policy
   statement about not publishing them. */
export const techPacks: TechPack[] = [];

/* One real recording: public/CLO3D.mp4 is Soufiane's own CLO3D output, already
   published on the home page, with its duration read from the file rather than
   estimated. It is a simulation sample — sixteen seconds of a finished
   simulation running — not a recorded working session, and it is labelled as
   such so it cannot be read as showing a pattern being built. The YouTube
   working-session videos are modelled and will slot in beside it. */
export const simulationSessions: SimulationSession[] = [
  {
    id: 'walk-sample',
    title: 'Garment Simulation Sample',
    kind: 'sample',
    description:
      'Sixteen seconds of a CLO3D simulation running, carrying two looks. It shows what simulation output looks like in motion; it is not a recording of the pattern being built.',
    videoSrc: '/CLO3D.mp4',
    poster: '/CLO3D-poster.jpg',
    posterAlt:
      'Two digital avatars mid-walk in CLO3D, one in a checked jacket and wide trousers, one in a waistcoat and wide trousers.',
    workflowLabels: ['CLO3D', 'Garment simulation'],
    duration: 16,
  },
];

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
  descriptor: string;
  publication: Publication;
  /* One restrained line shown when the chapter is not published work. Never
     promotional, never a promise with a date. */
  stateNote?: string;
}

export const chapters: Chapter[] = [
  {
    id: 'womenswear',
    number: '01',
    title: 'Womenswear',
    descriptor: womenswear.descriptor,
    publication: worldPublication(womenswear),
    stateNote: 'Interface preview — temporary visual references, not authored project evidence.',
  },
  {
    id: 'menswear',
    number: '02',
    title: 'Menswear',
    descriptor: menswear.descriptor,
    publication: worldPublication(menswear),
    stateNote: 'Selected menswear work will be published here.',
  },
  {
    id: 'tech-packs',
    number: '03',
    title: 'Tech Packs',
    descriptor: 'Production-ready technical documentation.',
    publication: techPacks.length > 0 ? 'published' : 'unpublished',
    stateNote: 'Selected technical pack examples will appear here.',
  },
  {
    id: '3d-simulation',
    number: '04',
    title: '3D Simulation',
    descriptor: 'Pattern construction, garment simulation and fit decisions in motion.',
    publication: simulationSessions.length > 0 ? 'published' : 'unpublished',
  },
];
