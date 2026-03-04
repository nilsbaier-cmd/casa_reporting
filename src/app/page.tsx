'use client';

import { useRouter } from 'next/navigation';
import { Shield, Eye, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth/authContext';

type Portal = 'admin' | 'viewer';

const LAST_PORTAL_KEY = 'casa_last_portal';

export default function RootPage() {
  const t = useTranslations('landing');
  const router = useRouter();
  const { isLoading, isAuthenticated, role } = useAuth();

  const navigateToPortal = (portal: Portal) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LAST_PORTAL_KEY, portal);
    }

    const targetPath =
      isAuthenticated
        ? portal === 'admin'
          ? '/admin'
          : '/viewer'
        : portal === 'admin'
        ? '/admin/login'
        : '/viewer/login';

    router.push(targetPath);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center animate-sem-fade-in">
          <div className="w-12 h-12 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin mx-auto mb-4" />
        </div>
      </div>
    );
  }

  const lastPortalLabel =
    role === 'admin'
      ? t('lastAdmin')
      : role === 'viewer'
      ? t('lastViewer')
      : null;

  return (
    <div className="min-h-screen bg-neutral-50">
      <main className="sem-container py-12 lg:py-20">
        <section className="mx-auto max-w-5xl space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-neutral-900 md:text-4xl">{t('title')}</h1>
            <p className="mt-3 text-neutral-600">{t('subtitle')}</p>
          </div>

          {lastPortalLabel && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => navigateToPortal((role ?? 'viewer') as Portal)}
                className="inline-flex items-center gap-2 border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
              >
                <span>{t('continueLast', { portal: lastPortalLabel })}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <article className="border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <Shield className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900">{t('adminTitle')}</h2>
              <p className="mt-2 text-sm text-neutral-600">{t('adminDesc')}</p>
              <button
                type="button"
                onClick={() => navigateToPortal('admin')}
                className="mt-6 inline-flex items-center gap-2 bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                {t('openAdmin')}
                <ArrowRight className="h-4 w-4" />
              </button>
            </article>

            <article className="border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Eye className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900">{t('viewerTitle')}</h2>
              <p className="mt-2 text-sm text-neutral-600">{t('viewerDesc')}</p>
              <button
                type="button"
                onClick={() => navigateToPortal('viewer')}
                className="mt-6 inline-flex items-center gap-2 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                {t('openViewer')}
                <ArrowRight className="h-4 w-4" />
              </button>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
