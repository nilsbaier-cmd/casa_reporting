import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { defaultLocale, locales, type Locale } from './i18n/config';

const LOCALE_COOKIE = 'NEXT_LOCALE';

function getPreferredLocale(request: NextRequest): Locale {
  // Check if user has a stored preference
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }

  // Parse Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language');
  if (acceptLanguage) {
    // Extract language codes and their quality values
    const languages = acceptLanguage
      .split(',')
      .map((lang) => {
        const [code, quality] = lang.trim().split(';q=');
        return {
          code: code.toLowerCase().split('-')[0], // Get base language (de from de-CH)
          quality: quality ? parseFloat(quality) : 1,
        };
      })
      .sort((a, b) => b.quality - a.quality);

    // Find the first matching locale
    for (const lang of languages) {
      if (locales.includes(lang.code as Locale)) {
        return lang.code as Locale;
      }
    }
  }

  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Only set cookie if not already present
  if (!request.cookies.has(LOCALE_COOKIE)) {
    const preferredLocale = getPreferredLocale(request);
    response.cookies.set(LOCALE_COOKIE, preferredLocale, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  // Match all paths except static files and api routes
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
