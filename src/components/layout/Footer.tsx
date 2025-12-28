'use client';

import { SwissCoat } from '@/components/ui/swiss-coat';

interface FooterProps {
  version?: string;
  lastUpdated?: string;
}

export function Footer({ version = '1.0.0', lastUpdated }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const formattedDate = lastUpdated || new Date().toLocaleDateString('de-CH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return (
    <footer className="bg-neutral-900 text-white" role="contentinfo">
      {/* Top border accent */}
      <div className="h-1 bg-red-600" aria-hidden="true" />

      <div className="sem-container">
        <div className="py-12">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Branding */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <SwissCoat size="md" />
                <div>
                  <p className="font-bold text-sm">Schweizerische Eidgenossenschaft</p>
                  <p className="text-neutral-400 text-sm">Staatssekretariat für Migration SEM</p>
                </div>
              </div>
              <p className="text-neutral-500 text-sm max-w-xs">
                CASA Reporting Dashboard zur Überwachung und Analyse von Einreiseverweigerungen
                im Schweizer Luftverkehr.
              </p>
            </div>

            {/* System Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold tracking-wider uppercase text-neutral-500">
                System
              </h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Version</dt>
                  <dd className="font-mono text-neutral-300">{version}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Letzte Aktualisierung</dt>
                  <dd className="font-mono text-neutral-300">{formattedDate}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Status</dt>
                  <dd className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse-subtle" aria-hidden="true" />
                    <span className="text-green-400">Aktiv</span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-neutral-800 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-neutral-500">
            <p>
              &copy; {currentYear} Staatssekretariat für Migration SEM.
              Alle Rechte vorbehalten.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
