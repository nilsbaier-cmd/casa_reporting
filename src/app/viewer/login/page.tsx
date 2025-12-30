'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/authContext';
import { SwissCoat } from '@/components/ui/swiss-coat';
import { LanguagePicker } from '@/components/ui/LanguagePicker';
import { Lock, ArrowRight, AlertCircle, Eye, BarChart3 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ViewerLoginPage() {
  const t = useTranslations('login');
  const tHeader = useTranslations('header');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setIsLoading(true);

    // Simulate brief loading for UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (login(password, 'viewer')) {
      router.push('/viewer');
    } else {
      setError(true);
      setPassword('');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-neutral-800 relative overflow-hidden">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, white 1px, transparent 1px),
              linear-gradient(to bottom, white 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
          aria-hidden="true"
        />

        {/* Blue accent for viewer */}
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-600" aria-hidden="true" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Top branding */}
          <div className="flex items-center gap-4">
            <SwissCoat size="lg" />
            <p className="text-neutral-400 text-sm">{tHeader('sem')}</p>
          </div>

          {/* Center content */}
          <div className="space-y-8">
            <div>
              <p className="sem-doc-number text-neutral-500 mb-4">SEM-CASA-VIEWER</p>
              <h1 className="text-4xl font-bold text-white leading-tight mb-4">
                {t('brandingTitle')}
                <span className="block text-blue-400">{t('viewerSubtitle')}</span>
              </h1>
              <p className="text-neutral-400 text-lg max-w-md">
                {t('viewerDesc')}
              </p>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 p-4">
                <BarChart3 className="w-5 h-5 text-blue-400 mb-2" />
                <p className="text-white font-medium text-sm">{t('viewerFeature1')}</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-4">
                <Eye className="w-5 h-5 text-blue-400 mb-2" />
                <p className="text-white font-medium text-sm">{t('viewerFeature2')}</p>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <p className="text-neutral-600 text-sm">
            &copy; {new Date().getFullYear()} {tHeader('sem')}
          </p>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-neutral-50">
        <div className="w-full max-w-md">
          {/* Language Picker for mobile */}
          <div className="lg:hidden flex justify-end mb-4">
            <div className="bg-neutral-800 px-3 py-2 rounded">
              <LanguagePicker />
            </div>
          </div>

          {/* Mobile branding */}
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <SwissCoat size="md" />
            <div>
              <p className="font-bold text-neutral-900">SEM</p>
              <p className="text-neutral-500 text-sm">CASA Viewer</p>
            </div>
          </div>

          {/* Login card */}
          <div className="bg-white border border-neutral-200 shadow-sm animate-sem-scale-in">
            {/* Blue top accent for viewer */}
            <div className="h-1 bg-blue-600" aria-hidden="true" />

            <div className="p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-neutral-900 mb-1">
                  {t('viewerTitle')}
                </h2>
                <p className="text-neutral-500 text-sm">
                  {t('subtitle')}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-neutral-700"
                  >
                    {t('password')}
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder={t('passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                    required
                    className="w-full px-4 py-3 border border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-shadow"
                    aria-describedby={error ? 'password-error' : undefined}
                  />
                </div>

                {error && (
                  <div
                    id="password-error"
                    className="flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-600 text-red-800"
                    role="alert"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">{t('errorTitle')}</p>
                      <p className="text-sm text-red-700">
                        {t('errorMessage')}
                      </p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <span>{t('submitting')}</span>
                  ) : (
                    <>
                      <span>{t('submit')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Bottom info */}
            <div className="px-8 py-4 bg-neutral-50 border-t border-neutral-200">
              <p className="text-xs text-neutral-500 text-center">
                {t('viewerInfo')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
