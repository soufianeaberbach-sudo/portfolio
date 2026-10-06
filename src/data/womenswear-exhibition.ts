import type { ImageAsset } from './portfolio';

// Centres of the clear studio gaps in the Womenswear two-up photographs.
// The shared archive's front values mark the right edge for overlapping decks;
// the exhibition needs a clean split. Touching silhouettes stay whole.
const studioGaps: Record<string, number | null> = {
  'evening/1': null,
  'evening/10': 0.56,
  'evening/2': 0.51125,
  'evening/3': 0.51,
  'evening/4': 0.48125,
  'evening/5': 0.51,
  'evening/6': 0.50875,
  'evening/7': 0.49375,
  'evening/8': 0.4925,
  'evening/9': 0.52375,
  'jersey/1': 0.53375,
  'jersey/10': 0.52875,
  'jersey/2': 0.52,
  'jersey/3': 0.5225,
  'jersey/4': 0.5475,
  'jersey/5': 0.53375,
  'jersey/6': 0.51125,
  'jersey/7': 0.545,
  'jersey/8': 0.53375,
  'jersey/9': null,
  'sport/1': 0.56125,
  'sport/10': null,
  'sport/2': 0.55125,
  'sport/3': 0.52125,
  'sport/4': 0.56125,
  'sport/5': 0.535,
  'sport/6': 0.56,
  'sport/7': 0.525,
  'sport/8': 0.50875,
  'sport/9': 0.5775,
  'woven/1': 0.51125,
  'woven/10': 0.51375,
  'woven/2': 0.51,
  'woven/3': 0.5425,
  'woven/4': 0.50375,
  'woven/5': 0.52,
  'woven/6': 0.53375,
  'woven/7': 0.51375,
  'woven/8': 0.49875,
  'woven/9': null,
};
export function exhibitionImage(image: ImageAsset): ImageAsset {
  const key = image.src.match(/\/portfolio\/(.+)-1400\.webp$/)?.[1];
  if (!key || !(key in studioGaps)) return image;
  const gap = studioGaps[key];
  return gap === null ? { ...image, separable: false } : { ...image, front: gap };
}
