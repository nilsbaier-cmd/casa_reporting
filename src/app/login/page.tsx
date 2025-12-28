'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/authContext';
import { SwissCoat } from '@/components/ui/swiss-coat';
import { Lock, ArrowRight, AlertCircle, Shield } from 'lucide-react';

export default function LoginPage() {
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

    if (login(password)) {
      router.push('/');
    } else {
      setError(true);
      setPassword('');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-neutral-900 relative overflow-hidden">
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

        {/* Red accent */}
        <div className="absolute top-0 left-0 w-1 h-full bg-red-600" aria-hidden="true" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Top branding */}
          <div className="flex items-center gap-4">
            <SwissCoat size="lg" />
            <div className="text-white">
              <p className="font-bold">Schweizerische Eidgenossenschaft</p>
              <p className="text-neutral-400 text-sm">Staatssekretariat für Migration SEM</p>
            </div>
          </div>

          {/* Center content */}
          <div className="space-y-8">
            <div>
              <p className="sem-doc-number text-neutral-500 mb-4">SEM-CASA-2024</p>
              <h1 className="text-4xl font-bold text-white leading-tight mb-4">
                CASA Reporting
                <span className="block text-red-500">Dashboard</span>
              </h1>
              <p className="text-neutral-400 text-lg max-w-md">
                Analyse und Überwachung von INAD-Fällen zur Gewährleistung der
                Beförderungsvorschriften im Schengen-Luftverkehr.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 p-4">
                <Shield className="w-5 h-5 text-red-500 mb-2" />
                <p className="text-white font-medium text-sm">Sanktionsüberwachung</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-4">
                <Lock className="w-5 h-5 text-red-500 mb-2" />
                <p className="text-white font-medium text-sm">Gesicherter Zugang</p>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <p className="text-neutral-600 text-sm">
            &copy; {new Date().getFullYear()} Staatssekretariat für Migration SEM
          </p>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-neutral-50">
        <div className="w-full max-w-md">
          {/* Mobile branding */}
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <SwissCoat size="md" />
            <div>
              <p className="font-bold text-neutral-900">SEM</p>
              <p className="text-neutral-500 text-sm">CASA Reporting</p>
            </div>
          </div>

          {/* Login card */}
          <div className="bg-white border border-neutral-200 shadow-sm animate-sem-scale-in">
            {/* Red top accent */}
            <div className="h-1 bg-red-600" aria-hidden="true" />

            <div className="p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-neutral-100 rounded-full mb-4">
                  <Lock className="w-5 h-5 text-neutral-600" />
                </div>
                <h2 className="text-xl font-bold text-neutral-900 mb-1">
                  Anmeldung
                </h2>
                <p className="text-neutral-500 text-sm">
                  Bitte geben Sie Ihr Passwort ein
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-neutral-700"
                  >
                    Passwort
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Passwort eingeben"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                    required
                    className="w-full px-4 py-3 border border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-shadow"
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
                      <p className="font-medium">Anmeldung fehlgeschlagen</p>
                      <p className="text-sm text-red-700">
                        Das eingegebene Passwort ist ungültig.
                      </p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <span>Wird angemeldet...</span>
                  ) : (
                    <>
                      <span>Anmelden</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Bottom info */}
            <div className="px-8 py-4 bg-neutral-50 border-t border-neutral-200">
              <p className="text-xs text-neutral-500 text-center">
                Zugang nur für autorisiertes Personal des SEM.
                Bei Problemen kontaktieren Sie den IT-Support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
