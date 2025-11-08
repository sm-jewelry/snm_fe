import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'es', 'fr', 'hi', 'ar'],

  // Used when no locale matches
  defaultLocale: 'en',

  // Don't redirect if locale is in URL
  localePrefix: 'as-needed'
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(en|es|fr|hi|ar)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
