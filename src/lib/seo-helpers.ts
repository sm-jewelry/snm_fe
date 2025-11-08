/**
 * SEO Helper Functions for Multi-language Support
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://stonemetaljewelry.com";

export const locales = ['en', 'es', 'fr', 'hi', 'ar'] as const;
export type Locale = (typeof locales)[number];

/**
 * Convert next-intl locale to og:locale format
 * @param locale - 2-letter locale code (e.g., 'en')
 * @returns og:locale format (e.g., 'en_US')
 */
export function localeToOgLocale(locale: Locale): string {
  const localeMap: Record<Locale, string> = {
    en: 'en_US',
    es: 'es_ES',
    fr: 'fr_FR',
    hi: 'hi_IN',
    ar: 'ar_SA',
  };

  return localeMap[locale] || 'en_US';
}

/**
 * Generate hreflang alternates for all supported locales
 * @param pathname - Current pathname without locale prefix (e.g., '/products/123')
 * @param currentLocale - Current locale
 * @returns Array of hreflang alternate objects
 */
export function generateHreflangAlternates(
  pathname: string,
  currentLocale: Locale = 'en'
): { hrefLang: string; href: string }[] {
  const alternates = locales.map((locale) => ({
    hrefLang: locale,
    href: `${SITE_URL}/${locale}${pathname}`,
  }));

  // Add x-default for English
  alternates.push({
    hrefLang: 'x-default',
    href: `${SITE_URL}/en${pathname}`,
  });

  return alternates;
}

/**
 * Get canonical URL for current page
 * @param pathname - Current pathname with locale (e.g., '/en/products/123')
 * @returns Canonical URL
 */
export function getCanonicalUrl(pathname: string): string {
  return `${SITE_URL}${pathname}`;
}

/**
 * Remove locale prefix from pathname
 * @param pathname - Pathname with locale (e.g., '/en/products/123')
 * @returns Pathname without locale (e.g., '/products/123')
 */
export function removeLocalePrefix(pathname: string): string {
  const match = pathname.match(/^\/(en|es|fr|hi|ar)(\/.*)?$/);
  return match ? (match[2] || '/') : pathname;
}

/**
 * Get locale from pathname
 * @param pathname - Full pathname (e.g., '/en/products/123')
 * @returns Locale or default 'en'
 */
export function getLocaleFromPathname(pathname: string): Locale {
  const match = pathname.match(/^\/(en|es|fr|hi|ar)/);
  return (match?.[1] as Locale) || 'en';
}
