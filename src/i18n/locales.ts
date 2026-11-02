/* THE THREE LANGUAGES, AND HOW A URL SAYS WHICH ONE IT IS.
 *
 * English is the original and keeps every existing public URL unchanged.
 * French and Spanish are the same pages under a language prefix:
 * /fr/portfolio/ and /es/contact/. Slugs after the prefix are never
 * translated, so a page has one stable identity in every language and the
 * language switcher can always find the equivalent page.
 *
 * The locale is read from the URL, never from a cookie, a header or the
 * browser's language: every language is a directly addressable, independently
 * rendered static page, and nothing redirects a visitor anywhere.
 */

export const locales = ['en', 'fr', 'es'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';
/** The languages that live under a URL prefix. */
export const prefixedLocales = locales.filter((locale) => locale !== defaultLocale) as Exclude<Locale, 'en'>[];

export interface LocaleMeta {
  /** What the switcher shows. Each label is written in its own language. */
  label: string;
  /** Full native name, for accessible names and hreflang link titles. */
  name: string;
  dir: 'ltr';
  /** Open Graph locale. */
  og: string;
}

export const localeMeta: Record<Locale, LocaleMeta> = {
  en: { label: 'EN', name: 'English', dir: 'ltr', og: 'en_US' },
  fr: { label: 'FR', name: 'Français', dir: 'ltr', og: 'fr_FR' },
  es: { label: 'ES', name: 'Español', dir: 'ltr', og: 'es_ES' },
};

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (locales as readonly string[]).includes(value);

/** The locale a URL belongs to. Anything without a known prefix is English. */
export function getLocale(url: URL | string): Locale {
  const pathname = typeof url === 'string' ? url : url.pathname;
  const first = pathname.split('/')[1];
  return isLocale(first) && first !== defaultLocale ? first : defaultLocale;
}

/** A pathname with its language prefix removed: /fr/contact/ -> /contact/. */
export function stripLocale(pathname: string): string {
  const locale = getLocale(pathname);
  if (locale === defaultLocale) return pathname || '/';
  const rest = pathname.slice(locale.length + 1);
  return rest.startsWith('/') ? rest : `/${rest}`;
}

/** Puts a site-relative href into a language: ('/contact/#brief', 'fr') ->
 *  '/fr/contact/#brief'. External, mailto, tel and fragment-only hrefs are
 *  returned untouched. */
export function localizePath(href: string, locale: Locale): string {
  if (!href.startsWith('/') || href.startsWith('//')) return href;
  const base = stripLocale(href.replace(/[?#].*$/, ''));
  const tail = href.slice(href.replace(/[?#].*$/, '').length);
  if (locale === defaultLocale) return base + tail;
  return `/${locale}${base === '/' ? '/' : base}${tail}`;
}

/** getStaticPaths for every prefixed language. */
export const localeStaticPaths = () => prefixedLocales.map((locale) => ({ params: { locale } }));
