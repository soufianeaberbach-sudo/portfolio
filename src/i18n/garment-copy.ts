import { createHash } from 'node:crypto';
import sourceEntries from '../data/garment-copy.json';
import translations from './garment-copy.json';
import generatedMenswear from '../data/menswear-ai-production.json';
import { garmentCopy } from '../data/garment-copy';
import type { Subject } from '../data/portfolio';
import type { Locale } from './locales';

/** Build-time editorial overlay. Current English garment copy remains the
 * source of truth; aliases with identical reviewed English share one translated
 * record. A source edit invalidates its translation instead of silently shipping
 * stale prose. Identifiers, photographs and garment ordering never change. */
type Copy = { title: string; description: string };
type TranslatedCopy = { sourceHash: string; fr: Copy; es: Copy };
const rows = translations as Record<string, TranslatedCopy>;
const source = sourceEntries as Record<string, Copy>;
const signature = (copy: Copy) => JSON.stringify(copy);
const digest = (copy: Copy) => createHash('sha256').update(signature(copy)).digest('hex');
const bySource = new Map<string, TranslatedCopy>();
const byTitle = new Map<string, TranslatedCopy>();

for (const [id, row] of Object.entries(rows)) {
  const english = source[id];
  if (!english || row.sourceHash !== digest(english)) {
    throw new Error(`Stale localized garment copy: ${id}`);
  }
  for (const locale of ['fr', 'es'] as const) {
    if (!row[locale].title.trim() || !row[locale].description.trim()) {
      throw new Error(`Missing ${locale} garment copy: ${id}`);
    }
  }
  bySource.set(signature(english), row);
  byTitle.set(english.title, row);
}
for (const [id, english] of Object.entries(source)) {
  if (!bySource.has(signature(english))) {
    throw new Error(`Untranslated reviewed garment: ${id}`);
  }
}

// Generation-time product labels can predate the reviewed visible garment copy
// (for example, a fabric claim later removed during source review). Resolve
// those photograph labels through their immutable look id, using the current
// reviewed title rather than repeating an unsupported material claim.
for (const look of generatedMenswear.selectedCompleteLooks) {
  const english = source[look.id];
  const row = english && bySource.get(signature(english));
  if (!row) throw new Error(`Untranslated generated garment: ${look.id}`);
  for (const photo of Object.values(look.views)) {
    const match = photo.alt.match(/^(.+), (front|back|editorial) view\. Original AI fashion concept\.$/);
    if (!match) throw new Error(`Unrecognized generated photograph label: ${look.id}`);
    byTitle.set(match[1], row);
  }
}

export function localizedGarmentCopy(subject: Subject, locale: Locale): Copy {
  const english = garmentCopy(subject);
  if (locale === 'en' || subject.fixture) return english;
  const row = bySource.get(signature(english));
  if (!row) throw new Error(`Untranslated reviewed garment: ${subject.id}`);
  return row[locale];
}

/** Generated Menswear views use the reviewed editorial title and one stable
 * disclosure. Return null for other descriptions so the complete legacy and
 * Womenswear alt map can handle them without circular imports. */
export function localizedGarmentAlt(englishAlt: string, locale: Locale): string | null {
  if (locale === 'en') return englishAlt;
  const match = englishAlt.match(/^(.+), (front|back|editorial) view\. Original AI fashion concept\.$/);
  if (!match) return null;
  const row = byTitle.get(match[1]);
  if (!row) throw new Error(`Untranslated generated garment photograph: ${match[1]}`);
  const views = {
    fr: { front: 'vue de face', back: 'vue de dos', editorial: 'vue éditoriale' },
    es: { front: 'vista delantera', back: 'vista trasera', editorial: 'vista editorial' },
  };
  const disclosure = {
    fr: 'Concept de mode original créé par IA.',
    es: 'Concepto de moda original creado con IA.',
  };
  return `${row[locale].title}, ${views[locale][match[2] as keyof typeof views.fr]}. ${disclosure[locale]}`;
}

export const garmentTranslationCoverage = {
  records: Object.keys(source).length,
  uniqueCopies: bySource.size,
  locales: ['fr', 'es'],
} as const;
