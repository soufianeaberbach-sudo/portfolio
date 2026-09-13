/* Portfolio V6 — the whole taxonomy, in one typed place.
 *
 * The page used to carry its own taxonomy inline as a literal blob inside the
 * Astro template and a second, differently-shaped copy inside the client
 * script. Adding a garment meant editing both. Everything the Portfolio knows
 * now lives here, and both the server render and the browser read the same
 * object.
 *
 * WHAT THE OLD FOLDER NAMES ACTUALLY CONTAIN
 * ------------------------------------------
 * The renditions still live under public/portfolio/{evening,jersey,woven,
 * sport,swim}/ because that is where .devtools/gen-portfolio.sh writes them
 * and the sources are named to match. Those five words were never market
 * categories — `jersey` and `woven` are cloth, not a market — so the mapping
 * below was made by looking at all 49 photographs rather than by renaming
 * folders:
 *
 *   evening/1-10      -> Evening & Occasionwear      (10 gowns)
 *   woven/7           -> Evening & Occasionwear      (strapless column gown)
 *   woven/ rest       -> Ready-to-Wear & Contemporary
 *   jersey/1,2,3,4,
 *          7,8,9,10   -> Ready-to-Wear & Contemporary
 *   jersey/5,6        -> Streetwear & Casualwear     (jersey tee; hoodie + joggers)
 *   sport/1-10        -> Activewear & Athleisure
 *   swim/1-9          -> Swimwear & Resortwear
 *
 * WHAT IS NOT HERE, AND WHY
 * -------------------------
 * - No `materials` on any project. Fibre composition is not derivable from a
 *   photograph and the repository holds no spec sheets, so the field is
 *   declared, consumed by the UI, and left unset everywhere. `fabricFamily` is
 *   a construction family, which is readable from the garment.
 * - No project `evidence`. There are no sketches, pattern files or CLO3D
 *   stills in the repository for these 49 garments. The three stages are
 *   modelled and rendered; not one of them is illustrated with an unrelated
 *   image.
 * - No Menswear projects. There is no menswear photography in the repository.
 *   The four menswear categories exist and are empty. Relabelling a
 *   womenswear garment would be a lie about who the work was developed for.
 * - No tech pack PDFs and no YouTube ids. Both are modelled; neither is
 *   invented.
 */

export type Gender = 'womenswear' | 'menswear';

/* Construction families, not compositions. A bias-cut satin dress is Woven
   whatever its fibre is; leggings are Performance Stretch whether or not the
   elastane percentage is known. */
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
  /* Optional one-line caption for the stage as it applies to this project. */
  note?: string;
}

/* Every stage is optional and independently supplied. A project with only a
   pattern renders only a pattern; nothing is substituted for the other two. */
export type ProjectEvidence = Partial<Record<EvidenceStage, EvidenceAsset>>;

export interface Project {
  id: string;
  gender: Gender;
  marketCategory: string;
  title: string;
  garmentType: string;
  fabricFamily: FabricFamily;
  /* Only ever set from a verified source. Absent means the UI omits the row
     entirely — it never prints UNKNOWN, N/A or TODO. */
  materials?: string[];
  description: string;
  finalGarmentImage: ImageAsset;
  evidence: ProjectEvidence;
  tags?: string[];
}

export interface MarketCategory {
  id: string;
  number: string;
  label: string;
  blurb: string;
  projects: Project[];
}

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
  /* Absent until a real document exists. The viewer is never rendered for an
     entry without one. */
  pdfUrl?: string;
  coverImage?: ImageAsset;
  pageCount?: number;
  scope?: string[];
}

export interface SimulationSession {
  id: string;
  title: string;
  description: string;
  /* Exactly one source is expected. `youtubeId` is the intended production
     path; `videoSrc` covers the sessions already hosted on this domain. Both
     load only after an explicit play. */
  youtubeId?: string;
  videoSrc?: string;
  poster?: string;
  posterAlt?: string;
  workflowLabels?: string[];
  /* Seconds. Omitted rather than guessed. */
  duration?: number;
}

/* --------------------------------------------------------------------------
   Image helpers. Two renditions exist per source (900 and 1400 wide); the
   page never references the ~6 MB PNG masters under assets/source/.
   -------------------------------------------------------------------------- */

const RENDITIONS = [900, 1400] as const;

/* Measured from the actual files, not assumed. 39 of the 49 renditions are
   1400x1868 (0.749, i.e. 3:4). The rest are taller (0.558-0.563) or square
   (1.000), which is exactly why the stage uses object-fit: contain on one
   fixed 3:4 canvas — the odd sizes letterbox into white instead of being
   cropped. */
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

/* Every photograph in this set is a single composition already containing the
   front and the back of one garment, side by side. It is never split, cropped
   into two, or paired with a generated back view. The alt text says so, since
   that is what a screen-reader user would otherwise have no way to know. */
const bothViews = (garment: string) => `Front and back views of ${garment}, photographed together on a white studio ground.`;

type ProjectSeed = Omit<Project, 'gender' | 'marketCategory' | 'finalGarmentImage' | 'evidence'> & {
  ref: string;
  alt: string;
};

const buildCategory = (
  gender: Gender,
  id: string,
  number: string,
  label: string,
  blurb: string,
  seeds: ProjectSeed[],
): MarketCategory => ({
  id,
  number,
  label,
  blurb,
  projects: seeds.map(({ ref, alt, ...rest }) => ({
    ...rest,
    gender,
    marketCategory: label,
    finalGarmentImage: image(ref, alt),
    /* Deliberately empty. See the header note: no sketch, pattern or
       simulation asset exists for any of these garments yet. */
    evidence: {},
  })),
});

/* --------------------------------------------------------------------------
   WOMENSWEAR
   -------------------------------------------------------------------------- */

const rtw = buildCategory('womenswear', 'rtw', '01', 'Ready-to-Wear & Contemporary',
  'Day dresses, separates and jumpsuits where the commercial decision and the construction decision are the same decision.', [
  { id: 'w-rtw-01', ref: 'woven/1', title: 'Bias Satin Slip Dress', garmentType: 'Slip dress', fabricFamily: 'Woven',
    alt: bothViews('a champagne satin slip dress with a cowl neckline and a low open back'),
    description: 'A bias-cut satin slip dress with a cowl front and a low back. Cut on the bias the cloth carries its own weight, so seam placement decides whether the skirt hangs straight or twists.',
    tags: ['Pattern Development', 'Woven'] },
  { id: 'w-rtw-02', ref: 'woven/2', title: 'Cropped Shirt and Wide-Leg Trouser', garmentType: 'Shirt and trouser', fabricFamily: 'Woven',
    alt: bothViews('a pink cropped shirt worn with stone wide-leg trousers'),
    description: 'A cropped shirt with a full placket worn over high-waisted wide-leg trousers. The look depends on the two hems meeting at one deliberate height.',
    tags: ['Pattern Development', 'Grading'] },
  { id: 'w-rtw-03', ref: 'woven/3', title: 'Wide-Leg Jumpsuit', garmentType: 'Jumpsuit', fabricFamily: 'Woven',
    alt: bothViews('a stone wide-leg jumpsuit with a V neckline and a high funnel back'),
    description: 'A V-neck jumpsuit with a raised back neckline and full-length wide legs. A one-piece has no waist seam to absorb error, so rise and torso length have to be right first time.',
    tags: ['Pattern Development', 'Fit'] },
  { id: 'w-rtw-04', ref: 'woven/4', title: 'Diagonal Stripe Midi Dress', garmentType: 'Midi dress', fabricFamily: 'Woven',
    alt: bothViews('a blue and white diagonally striped sleeveless midi dress with an open back'),
    description: 'A sleeveless midi dress with an open back, cut so the stripe runs diagonally through bodice and skirt. Striped cloth makes every seam a matching problem.',
    tags: ['Pattern Development', 'Woven'] },
  { id: 'w-rtw-05', ref: 'woven/5', title: 'Printed Shirt-Jacket and Trouser', garmentType: 'Shirt-jacket and trouser', fabricFamily: 'Woven',
    alt: bothViews('a floral printed shirt-jacket worn with rust wide-leg trousers'),
    description: 'A printed shirt-jacket with a notched collar over wide-leg trousers. Print placement is decided at the pattern stage, not at the cutting table.',
    tags: ['Pattern Development', 'Woven'] },
  { id: 'w-rtw-06', ref: 'woven/6', title: 'Halter Mini Dress', garmentType: 'Mini dress', fabricFamily: 'Woven',
    alt: bothViews('a rust halter-neck mini dress with a tie back'),
    description: 'A fitted halter mini dress fastening at the back neck. All of the vertical support comes from one neck tie, which sets how the front panel has to be shaped.',
    tags: ['Pattern Development', 'Fit'] },
  { id: 'w-rtw-07', ref: 'woven/8', title: 'Blouse and Satin Maxi Skirt', garmentType: 'Blouse and skirt', fabricFamily: 'Woven',
    alt: bothViews('a cream high-neck blouse worn with an olive satin maxi skirt'),
    description: 'A high-necked blouse with a full sleeve over a bias satin maxi skirt. Two very different weights meeting at the waist is the balance being resolved.',
    tags: ['Pattern Development', 'Woven'] },
  { id: 'w-rtw-08', ref: 'woven/9', title: 'Floral Wrap Mini Dress', garmentType: 'Wrap dress', fabricFamily: 'Woven',
    alt: bothViews('a pink floral wrap mini dress with flutter sleeves'),
    description: 'A wrap mini dress with flutter sleeves and a tie waist. A wrap has to stay closed through movement without the underlap showing.',
    tags: ['Pattern Development', 'Fit'] },
  { id: 'w-rtw-09', ref: 'woven/10', title: 'Puff-Sleeve Floral Dress', garmentType: 'Mini dress', fabricFamily: 'Woven',
    alt: bothViews('a brightly printed floral mini dress with puff sleeves and an open back'),
    description: 'A printed mini dress with gathered puff sleeves and an open back. Sleeve head fullness and armhole depth are set together or the sleeve collapses.',
    tags: ['Pattern Development', 'Grading'] },
  { id: 'w-rtw-10', ref: 'jersey/1', title: 'Lace Top and Trouser', garmentType: 'Top and trouser', fabricFamily: 'Woven',
    alt: bothViews('a white lace high-neck top worn with matching white lace trousers'),
    description: 'A high-necked lace top with a matching lace trouser. Lace has an open ground, so seam allowances and any lining are part of the visible design.',
    tags: ['Pattern Development', 'Woven'] },
  { id: 'w-rtw-11', ref: 'jersey/2', title: 'Ruffle Blouse and Coated Trouser', garmentType: 'Blouse and trouser', fabricFamily: 'Woven',
    alt: bothViews('a black ruffled blouse worn with black coated slim trousers'),
    description: 'A ruffled blouse with a deep V front over a slim coated trouser. The ruffle is cut, not gathered, so its fall is controlled by the pattern.',
    tags: ['Pattern Development', 'Woven'] },
  { id: 'w-rtw-12', ref: 'jersey/3', title: 'Tie-Waist Blouse and Trouser', garmentType: 'Blouse and trouser', fabricFamily: 'Woven',
    alt: bothViews('a beige tie-waist wrap blouse worn with brown wide-leg trousers'),
    description: 'A wrap blouse with a peplum and a self tie, worn with wide-leg trousers. The tie sets the waist position, so the peplum has to be cut to fall from wherever it lands.',
    tags: ['Pattern Development', 'Fit'] },
  { id: 'w-rtw-13', ref: 'jersey/4', title: 'Funnel-Neck Peplum Jacket', garmentType: 'Jacket and trouser', fabricFamily: 'Jersey / Knit',
    alt: bothViews('a taupe funnel-neck peplum jacket worn with matching slim trousers'),
    description: 'A funnel-necked jacket with a drawn peplum over a slim trouser. In a knit the peplum shaping comes from the gather rather than from a seamed flare.',
    tags: ['Pattern Development', 'Jersey / Knit'] },
  { id: 'w-rtw-14', ref: 'jersey/7', title: 'Tie-Sleeve Top and Wide Trouser', garmentType: 'Top and trouser', fabricFamily: 'Jersey / Knit',
    alt: bothViews('a brown cold-shoulder top with tie sleeves worn with camel wide-leg trousers'),
    description: 'A cold-shoulder top with laced sleeve openings over a camel wide-leg trouser. The open shoulder removes the usual anchor point, which moves the fit onto the neckline.',
    tags: ['Pattern Development', 'Jersey / Knit'] },
  { id: 'w-rtw-15', ref: 'jersey/8', title: 'Off-Shoulder Knit Top', garmentType: 'Knit top and trouser', fabricFamily: 'Jersey / Knit',
    alt: bothViews('a green off-shoulder knit top worn with brown trousers'),
    description: 'An off-shoulder knit top with a folded band, worn with a straight trouser. The band has to hold position on the arm without gripping.',
    tags: ['Pattern Development', 'Jersey / Knit'] },
  { id: 'w-rtw-16', ref: 'jersey/9', title: 'Belted Jacket and Trouser', garmentType: 'Jacket and trouser', fabricFamily: 'Tailored Woven',
    alt: bothViews('a grey belted jacket with a wide sleeve worn with grey tailored trousers'),
    description: 'A belted jacket with a full sleeve and a matching tailored trouser. Tailoring is where the internal construction, not the outer cloth, decides the line.',
    tags: ['Pattern Development', 'Tailoring'] },
  { id: 'w-rtw-17', ref: 'jersey/10', title: 'Lace Top and Midi Skirt', garmentType: 'Top and skirt', fabricFamily: 'Woven',
    alt: bothViews('a white lace high-neck top worn with a navy midi pencil skirt'),
    description: 'A sheer lace high-neck top over a navy midi skirt. A narrow skirt is resolved at the walk, not at the stand.',
    tags: ['Pattern Development', 'Fit'] },
]);

const active = buildCategory('womenswear', 'activewear', '02', 'Activewear & Athleisure',
  'Panelled performance product where the pattern is engineered around stretch and recovery rather than imposed on it.', [
  { id: 'w-act-01', ref: 'sport/1', title: 'Bandeau and Side-Stripe Legging', garmentType: 'Bandeau and legging', fabricFamily: 'Performance Stretch',
    alt: bothViews('a white bandeau top and white leggings with a red side stripe'),
    description: 'A bandeau top with a full-length legging carrying a contrast side stripe. The stripe follows the side panel seam, so panel width and stripe width are one decision.',
    tags: ['Pattern Development', 'Grading', 'Stretch'] },
  { id: 'w-act-02', ref: 'sport/2', title: 'Bandeau and Piped Legging', garmentType: 'Bandeau and legging', fabricFamily: 'Performance Stretch',
    alt: bothViews('a red bandeau top and black leggings with white piping down the leg'),
    description: 'A red bandeau with a black legging piped along the side seam. Piping on a stretch seam has to travel with the cloth or it restricts the leg.',
    tags: ['Pattern Development', 'Stretch'] },
  { id: 'w-act-03', ref: 'sport/3', title: 'Tank and Contrast Legging', garmentType: 'Tank and legging', fabricFamily: 'Performance Stretch',
    alt: bothViews('a white tank top and white leggings with a black side stripe'),
    description: 'A scoop-neck tank with a high-waisted legging. The waistband height is what makes the set work as a pair rather than as two pieces.',
    tags: ['Pattern Development', 'Fit', 'Stretch'] },
  { id: 'w-act-04', ref: 'sport/4', title: 'Racerback Tank and Striped Legging', garmentType: 'Tank and legging', fabricFamily: 'Performance Stretch',
    alt: bothViews('a black racerback tank and black leggings with white side stripes'),
    description: 'A racerback tank over a striped side-panel legging. A racerback moves the load onto the centre back, which changes how the armhole has to be cut.',
    tags: ['Pattern Development', 'Grading', 'Stretch'] },
  { id: 'w-act-05', ref: 'sport/5', title: 'Long-Sleeve Training Set', garmentType: 'Long-sleeve top and legging', fabricFamily: 'Performance Stretch',
    alt: bothViews('a black long-sleeved training top and full-length black leggings'),
    description: 'A long-sleeved top with a full-length legging in one cloth. With no colour break the whole set is read as a single line, so the seams have to align across the waist.',
    tags: ['Pattern Development', 'Fit', 'Stretch'] },
  { id: 'w-act-06', ref: 'sport/6', title: 'Short-Sleeve Set with Cropped Legging', garmentType: 'Top and cropped legging', fabricFamily: 'Performance Stretch',
    alt: bothViews('a black short-sleeved training top and cropped black leggings'),
    description: 'A short-sleeved top with a cropped legging. The crop point is a proportion decision that has to survive grading up and down the size range.',
    tags: ['Pattern Development', 'Grading', 'Stretch'] },
  { id: 'w-act-07', ref: 'sport/7', title: 'Ribbed Tank and Flared Trouser', garmentType: 'Tank and flared trouser', fabricFamily: 'Performance Stretch',
    alt: bothViews('a brown ribbed tank top and matching brown wide flared trousers'),
    description: 'A ribbed tank with a high-waisted flared trouser — athleisure rather than training. The flare has to fall from the knee without the waist losing its hold.',
    tags: ['Pattern Development', 'Stretch'] },
  { id: 'w-act-08', ref: 'sport/8', title: 'Bra Top and Colourblock Legging', garmentType: 'Bra top and legging', fabricFamily: 'Performance Stretch',
    alt: bothViews('a red sports bra and red leggings with a white colourblocked side panel'),
    description: 'A bra top with a colourblocked legging. Every colour change is a seam, so the block plan and the fit plan are the same drawing.',
    tags: ['Pattern Development', 'Grading', 'Stretch'] },
  { id: 'w-act-09', ref: 'sport/9', title: 'Long-Sleeve Top and Bodysuit', garmentType: 'Top and bodysuit', fabricFamily: 'Performance Stretch',
    alt: bothViews('a sand long-sleeved top and a matching high-cut bodysuit'),
    description: 'A long-sleeved top with a high-cut bodysuit. A bodysuit is fitted between two fixed points, so torso length is the controlling measurement.',
    tags: ['Pattern Development', 'Fit', 'Stretch'] },
  { id: 'w-act-10', ref: 'sport/10', title: 'Long-Sleeve Top and Cropped Legging', garmentType: 'Top and cropped legging', fabricFamily: 'Performance Stretch',
    alt: bothViews('a black long-sleeved top and cropped black leggings with white side stripes'),
    description: 'A long-sleeved top with a striped cropped legging. Stripe continuity across the side seam is what the pattern is being held to.',
    tags: ['Pattern Development', 'Stretch'] },
]);

const street = buildCategory('womenswear', 'streetwear', '03', 'Streetwear & Casualwear',
  'Relaxed volumes where the fit has to read as deliberate rather than as ease left in by accident.', [
  { id: 'w-str-01', ref: 'jersey/5', title: 'Gathered Jersey Tee', garmentType: 'Jersey top and trouser', fabricFamily: 'Jersey / Knit',
    alt: bothViews('a cream jersey top gathered at one side with a drawcord, worn with brown wide-leg trousers'),
    description: 'A jersey tee drawn up at one side on a cord, worn with a wide-leg trouser. The gather has to look chosen at every setting of the cord.',
    tags: ['Pattern Development', 'Jersey / Knit'] },
  { id: 'w-str-02', ref: 'jersey/6', title: 'Cropped Hoodie and Jogger', garmentType: 'Hoodie and jogger', fabricFamily: 'Jersey / Knit',
    alt: bothViews('a burgundy cropped hooded sweatshirt worn with olive green joggers'),
    description: 'A cropped hoodie with a dropped shoulder over a cuffed jogger. Dropped shoulders move the armhole off the body, so the sleeve is drafted to the garment rather than to the arm.',
    tags: ['Pattern Development', 'Grading', 'Jersey / Knit'] },
]);

const evening = buildCategory('womenswear', 'evening', '04', 'Evening & Occasionwear',
  'Long-line construction where drape, support and the back view are resolved at the same time.', [
  { id: 'w-eve-01', ref: 'evening/1', title: 'Printed Gown with Flared Sleeves', garmentType: 'Evening gown', fabricFamily: 'Woven',
    alt: bothViews('a grey printed column gown with wide flared sleeves falling from the elbow'),
    description: 'A printed column gown with wide sleeves falling from the elbow. The sleeve volume is the silhouette, so its hang is settled before the body is.',
    tags: ['Pattern Development', 'Woven'] },
  { id: 'w-eve-02', ref: 'evening/2', title: 'Off-Shoulder Column Gown', garmentType: 'Evening gown', fabricFamily: 'Woven',
    alt: bothViews('a nude off-shoulder column gown with a low open back'),
    description: 'An off-shoulder gown with a low open back. With nothing resting on the shoulder the whole garment hangs from the bodice, which sets the fit priority.',
    tags: ['Pattern Development', 'Fit'] },
  { id: 'w-eve-03', ref: 'evening/3', title: 'Tiered Halter Gown', garmentType: 'Evening gown', fabricFamily: 'Woven',
    alt: bothViews('a navy halter gown with a fitted bodice and a tiered lace ruffle skirt'),
    description: 'A halter gown with a fitted bodice and a tiered skirt. Tier depth and hem sweep are the two proportions under control.',
    tags: ['Pattern Development', 'Woven'] },
  { id: 'w-eve-04', ref: 'evening/4', title: 'Sequinned High-Neck Gown', garmentType: 'Evening gown', fabricFamily: 'Woven',
    alt: bothViews('a black long-sleeved sequinned gown with a high neck, open back and front slit'),
    description: 'A long-sleeved sequinned gown with a high neck, open back and front slit. Sequinned cloth will not ease, so the fit is carried entirely by seam placement.',
    tags: ['Pattern Development', 'Fit'] },
  { id: 'w-eve-05', ref: 'evening/5', title: 'Cascading Chiffon Gown', garmentType: 'Evening gown', fabricFamily: 'Woven',
    alt: bothViews('a rust chiffon gown with a ruffle cascading down the front'),
    description: 'A chiffon gown with a ruffle running the length of the front. In a cloth this light the cascade is shaped by how it is cut, not by what is under it.',
    tags: ['Pattern Development', 'Woven'] },
  { id: 'w-eve-06', ref: 'evening/6', title: 'Draped High-Neck Gown', garmentType: 'Evening gown', fabricFamily: 'Jersey / Knit',
    alt: bothViews('a pale blue sleeveless jersey gown gathered at one side with a deep V back'),
    description: 'A sleeveless jersey gown gathered at one side, with a deep V back. The drape is held by the gathering, which fixes where the seam has to sit.',
    tags: ['Pattern Development', 'Jersey / Knit'] },
  { id: 'w-eve-07', ref: 'evening/7', title: 'Corseted Draped Gown', garmentType: 'Evening gown', fabricFamily: 'Woven',
    alt: bothViews('a nude floor-length gown with a corseted bodice and a draped skirt front'),
    description: 'A floor-length gown with a corseted bodice and a draped skirt. The join between a rigid bodice and a moving skirt is the construction problem.',
    tags: ['Pattern Development', 'Fit'] },
  { id: 'w-eve-08', ref: 'evening/8', title: 'Cut-Out Waist Gown', garmentType: 'Evening gown', fabricFamily: 'Woven',
    alt: bothViews('a brown column gown with an open cut-out waist and a tie at the back'),
    description: 'A column gown opened at the waist and tied at the back. A cut-out removes the waist seam, so the bodice and skirt have to hold their own alignment.',
    tags: ['Pattern Development', 'Fit'] },
  { id: 'w-eve-09', ref: 'evening/9', title: 'Draped Jersey Gown', garmentType: 'Evening gown', fabricFamily: 'Jersey / Knit',
    alt: bothViews('a dark brown high-neck long-sleeved jersey gown gathered through the body'),
    description: 'A high-necked long-sleeved gown gathered through the body. In jersey the gathers carry the shaping, so the pattern controls fullness instead of darts.',
    tags: ['Pattern Development', 'Jersey / Knit'] },
  { id: 'w-eve-10', ref: 'evening/10', title: 'Cut-Out Two-Piece Gown', garmentType: 'Two-piece gown', fabricFamily: 'Stretch',
    alt: bothViews('a red high-neck long-sleeved top with an open midriff worn with a floor-length skirt'),
    description: 'A high-necked long-sleeved top with an open midriff over a floor-length skirt. Read as one look, the two pieces have to stay aligned in movement.',
    tags: ['Pattern Development', 'Stretch'] },
  { id: 'w-eve-11', ref: 'woven/7', title: 'Strapless Jacquard Column Gown', garmentType: 'Evening gown', fabricFamily: 'Woven',
    alt: bothViews('a champagne strapless column gown with ruching across the front and a fishtail hem'),
    description: 'A strapless column gown with ruching across the front and a fishtail hem. A strapless line has to hold its position without visible support.',
    tags: ['Pattern Development', 'Fit'] },
]);

const swim = buildCategory('womenswear', 'swimwear', '05', 'Swimwear & Resortwear',
  'The category with nowhere to hide: balance, recovery and millimetre tolerances are all visible on the body.', [
  { id: 'w-swm-01', ref: 'swim/1', title: 'Bandeau Bikini with Tie Sides', garmentType: 'Bikini', fabricFamily: 'Performance Stretch',
    alt: 'A bandeau bikini with contrast binding and long tie sides, photographed on a white studio ground.',
    description: 'A bandeau top with tie-side briefs. Ties make the brief adjustable, which means the pattern has to work across a range of settings rather than one.',
    tags: ['Pattern Development', 'Grading', 'Stretch'] },
  { id: 'w-swm-02', ref: 'swim/2', title: 'Triangle Bikini', garmentType: 'Bikini', fabricFamily: 'Performance Stretch',
    alt: 'A silver triangle bikini with tie sides, photographed on a white studio ground.',
    description: 'A sliding triangle top with tie-side briefs. Almost nothing is fixed, so the cup shape has to hold once it is set.',
    tags: ['Pattern Development', 'Stretch'] },
  { id: 'w-swm-03', ref: 'swim/3', title: 'Printed Bikini with Contrast Trim', garmentType: 'Bikini', fabricFamily: 'Performance Stretch',
    alt: 'A printed bikini with contrast red trim and thin straps, photographed on a white studio ground.',
    description: 'A printed bikini finished with a contrast trim. Trim tension is what decides whether an edge lies flat or cuts in.',
    tags: ['Pattern Development', 'Stretch'] },
  { id: 'w-swm-04', ref: 'swim/4', title: 'Bandeau Bikini in Textured Cloth', garmentType: 'Bikini', fabricFamily: 'Performance Stretch',
    alt: 'A magenta textured bandeau bikini with tie-side briefs, photographed on a white studio ground.',
    description: 'A textured bandeau with tie-side briefs. A textured stretch cloth recovers differently along each grain, which the pattern has to allow for.',
    tags: ['Pattern Development', 'Stretch'] },
  { id: 'w-swm-05', ref: 'swim/5', title: 'Halter Bikini', garmentType: 'Bikini', fabricFamily: 'Performance Stretch',
    alt: 'A silver halter bikini with high-cut briefs, photographed on a white studio ground.',
    description: 'A halter top with a high-cut brief. The halter carries the load at the neck, so strap length is a fit measurement, not a finish.',
    tags: ['Pattern Development', 'Fit', 'Stretch'] },
  { id: 'w-swm-06', ref: 'swim/6', title: 'Ring-Detail One-Piece', garmentType: 'One-piece swimsuit', fabricFamily: 'Performance Stretch',
    alt: 'A blue one-piece swimsuit with a front ring detail and high-cut legs, photographed on a white studio ground.',
    description: 'A one-piece opened at the front and joined on a ring. The ring becomes a structural point, so the panels either side of it are cut to pull evenly.',
    tags: ['Pattern Development', 'Fit', 'Stretch'] },
  { id: 'w-swm-07', ref: 'swim/7', title: 'Wrap-Tie Bikini', garmentType: 'Bikini', fabricFamily: 'Performance Stretch',
    alt: 'A silver bikini with long ties wrapped around the waist, photographed on a white studio ground.',
    description: 'A bikini with ties wrapped and knotted at the body. Wrapped ties change the effective size, so the brief is drafted to stay balanced as they tighten.',
    tags: ['Pattern Development', 'Stretch'] },
  { id: 'w-swm-08', ref: 'swim/8', title: 'Bandeau and High-Waist Brief', garmentType: 'Bikini', fabricFamily: 'Performance Stretch',
    alt: 'A black bandeau top with a high-waisted brief, photographed on a white studio ground.',
    description: 'A bandeau with a high-waisted brief. A high waist has to stay put through the widest part of the body, which is a grading problem before it is a fit problem.',
    tags: ['Pattern Development', 'Grading', 'Stretch'] },
  { id: 'w-swm-09', ref: 'swim/9', title: 'Underwired Bikini', garmentType: 'Bikini', fabricFamily: 'Performance Stretch',
    alt: 'A silver underwired bikini with tie-side briefs, photographed on a white studio ground.',
    description: 'An underwired top with tie-side briefs. A wire fixes one line of the garment absolutely, and everything else is cut around it.',
    tags: ['Pattern Development', 'Fit', 'Stretch'] },
]);

/* --------------------------------------------------------------------------
   MENSWEAR — architecture complete, no photography in the repository.

   These four categories are the approved menswear order. Every one is empty
   because there is no menswear product photography here. Nothing womenswear
   has been relabelled to fill them.
   -------------------------------------------------------------------------- */

const menswearCategories: MarketCategory[] = [
  buildCategory('menswear', 'm-streetwear', '01', 'Streetwear & Casualwear',
    'Relaxed volume, dropped shoulders and the construction that keeps a loose garment from reading as an oversized one.', []),
  buildCategory('menswear', 'm-activewear', '02', 'Activewear & Performance',
    'Panelled performance product engineered around movement, stretch and recovery.', []),
  buildCategory('menswear', 'm-rtw', '03', 'Contemporary Ready-to-Wear',
    'Shirting, knitwear and trousers where the commercial and construction decisions meet.', []),
  buildCategory('menswear', 'm-tailoring', '04', 'Tailoring & Outerwear',
    'Internal construction, canvas and balance — the work that is invisible once the garment is finished.', []),
];

/* --------------------------------------------------------------------------
   THE FOUR WORLDS
   -------------------------------------------------------------------------- */

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

/* No PDF exists in this repository. The world, its index and its viewer are
   built; `techPacks` stays empty until real documents are supplied, and the
   page says so plainly rather than showing an invented document. */
export const techPacks: TechPack[] = [];

/* One real session. public/CLO3D.mp4 is Soufiane's own CLO3D output, already
   published on the home page, and its duration is read from the file rather
   than estimated. No YouTube id has been supplied yet; `youtubeId` is
   modelled and the player prefers it when one appears, but none is invented
   here. */
export const simulationSessions: SimulationSession[] = [
  {
    id: 'walk-simulation',
    title: 'Walk Simulation — Two Looks',
    description:
      'A CLO3D walk simulation carrying two looks at once. Movement is where drape, volume and hem behaviour become readable; a still render cannot show any of it.',
    videoSrc: '/CLO3D.mp4',
    poster: '/CLO3D-poster.jpg',
    posterAlt:
      'Two digital avatars mid-walk in CLO3D, one in a checked jacket and wide trousers, one in a waistcoat and wide trousers.',
    workflowLabels: ['CLO3D', 'Garment simulation', 'Drape'],
    duration: 16,
  },
];

/* --------------------------------------------------------------------------
   THE FOUR CHAPTERS OF THE LANDING INDEX
   -------------------------------------------------------------------------- */

export interface Chapter {
  id: string;
  number: string;
  title: string;
  descriptor: string;
  kind: 'garment' | 'documents' | 'motion';
}

export const chapters: Chapter[] = [
  { id: 'womenswear', number: '01', title: 'Womenswear', descriptor: womenswear.descriptor, kind: 'garment' },
  { id: 'menswear', number: '02', title: 'Menswear', descriptor: menswear.descriptor, kind: 'garment' },
  { id: 'tech-packs', number: '03', title: 'Tech Packs', descriptor: 'Production-ready technical documentation.', kind: 'documents' },
  { id: '3d-simulation', number: '04', title: '3D Simulation', descriptor: 'Pattern construction, garment simulation and fit decisions in motion.', kind: 'motion' },
];

export const projectCount = garmentWorlds.reduce(
  (total, world) => total + world.categories.reduce((sum, category) => sum + category.projects.length, 0),
  0,
);
