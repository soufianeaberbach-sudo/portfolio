import type { Locale } from './locales';

/* TRANSLATION DICTIONARIES — the one pattern every page and component uses.
 *
 * English is written first and is the shape. The other three languages must
 * supply exactly the same keys, the same nesting and arrays of the same
 * length; `defineDict` states that in the type system and
 * tests/i18n.mjs checks it again at build-output level, so a missing or extra
 * key cannot ship silently.
 *
 * Strings may carry a little trusted inline markup — <em>, <br>, <b>, <a> —
 * where a headline's line breaks and its one highlighted word are part of the
 * composition. That markup is authored per language, which is the point: a
 * French or Spanish headline breaks and accents where its own grammar wants,
 * not where the English did. Such strings are rendered with set:html and are
 * never built from visitor input.
 */

export type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? Widen<U>[]
    : T extends object
      ? { [K in keyof T]: Widen<T[K]> }
      : T;

export type Dict<T> = Record<Locale, Widen<T>>;

/* French typography: a narrow no-break space before : ; ? ! so the mark never
   wraps onto a line of its own. Applied here once instead of trusting every
   string to carry an invisible character. */
const frenchSpacing = (value: unknown): unknown => {
  if (typeof value === 'string') return value.replace(/ ([:;?!])/g, '\u202f$1');
  if (Array.isArray(value)) return value.map(frenchSpacing);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, frenchSpacing(entry)]));
  }
  return value;
};

export function defineDict<const T>(en: T, others: Record<Exclude<Locale, 'en'>, Widen<T>>): Dict<T> {
  return { en: en as Widen<T>, ...others, fr: frenchSpacing(others.fr) as Widen<T> };
}

/** Replaces {name} placeholders. */
export const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (match, key) => (key in values ? String(values[key]) : match));
