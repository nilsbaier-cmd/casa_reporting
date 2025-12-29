'use client';

import { useTransition } from 'react';
import { useLocale } from 'next-intl';
import { locales, type Locale } from '@/i18n/config';
import Cookies from 'js-cookie';
import { cn } from '@/lib/utils';

const LOCALE_COOKIE = 'NEXT_LOCALE';

export function LanguagePicker() {
  const locale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === locale) return;

    startTransition(() => {
      // Set cookie with new locale
      Cookies.set(LOCALE_COOKIE, newLocale, {
        expires: 365,
        path: '/',
        sameSite: 'lax',
      });
      // Reload the page to apply the new locale
      window.location.reload();
    });
  };

  return (
    <div
      className={cn(
        'flex items-center gap-1 text-sm',
        isPending && 'opacity-50 pointer-events-none'
      )}
      role="navigation"
      aria-label="Sprachwahl / Choix de langue"
    >
      {locales.map((loc, index) => (
        <span key={loc} className="flex items-center">
          {index > 0 && (
            <span className="text-neutral-500 mx-1" aria-hidden="true">
              |
            </span>
          )}
          <button
            onClick={() => handleLocaleChange(loc)}
            className={cn(
              'px-1 py-0.5 transition-colors font-medium',
              locale === loc
                ? 'text-white'
                : 'text-neutral-400 hover:text-white'
            )}
            aria-current={locale === loc ? 'true' : undefined}
            aria-label={loc === 'de' ? 'Deutsch' : 'Français'}
          >
            {loc.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}
