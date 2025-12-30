'use client';

import { FileText, Calculator, AlertTriangle, CheckCircle, Eye, HelpCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function DocumentationTab() {
  const t = useTranslations('docs');
  const tPriority = useTranslations('priority');

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Einführung */}
      <section>
        <h3 className="text-xl font-bold text-neutral-900 mb-4">{t('title')}</h3>
        <p className="text-neutral-600 leading-relaxed">
          {t('intro')}
        </p>
      </section>

      {/* Datenquellen */}
      <section>
        <h4 className="text-lg font-bold text-neutral-900 mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-red-600" />
          {t('dataSources')}
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-neutral-50 border border-neutral-200 p-4">
            <h5 className="font-bold text-neutral-900 mb-2">{t('inadTable')}</h5>
            <p className="text-sm text-neutral-600 mb-2">
              {t('inadTableDesc')}
            </p>
            <ul className="text-sm text-neutral-500 space-y-1">
              <li>{t('inadTableDetails.sheet')}</li>
              <li>{t('inadTableDetails.columns')}</li>
              <li>{t('inadTableDetails.refusalCode')}</li>
            </ul>
          </div>
          <div className="bg-neutral-50 border border-neutral-200 p-4">
            <h5 className="font-bold text-neutral-900 mb-2">{t('bazlData')}</h5>
            <p className="text-sm text-neutral-600 mb-2">
              {t('bazlDataDesc')}
            </p>
            <ul className="text-sm text-neutral-500 space-y-1">
              <li>{t('bazlDataDetails.sheet')}</li>
              <li>{t('bazlDataDetails.columns')}</li>
              <li>{t('bazlDataDetails.passengers')}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3-Stufen-Analyse */}
      <section>
        <h4 className="text-lg font-bold text-neutral-900 mb-3 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-red-600" />
          {t('analysisMethod')}
        </h4>

        <div className="space-y-4">
          {/* Stufe 1 */}
          <div className="border-l-4 border-neutral-900 pl-4 py-2">
            <h5 className="font-bold text-neutral-900">{t('step1Title')}</h5>
            <p className="text-sm text-neutral-600 mt-1">
              {t('step1Desc')}
            </p>
          </div>

          {/* Stufe 2 */}
          <div className="border-l-4 border-neutral-700 pl-4 py-2">
            <h5 className="font-bold text-neutral-900">{t('step2Title')}</h5>
            <p className="text-sm text-neutral-600 mt-1">
              {t('step2Desc')}
            </p>
          </div>

          {/* Stufe 3 */}
          <div className="border-l-4 border-red-600 pl-4 py-2">
            <h5 className="font-bold text-neutral-900">{t('step3Title')}</h5>
            <p className="text-sm text-neutral-600 mt-1">
              {t('step3Desc')}
            </p>
          </div>
        </div>
      </section>

      {/* Klassifizierung */}
      <section>
        <h4 className="text-lg font-bold text-neutral-900 mb-3">{t('classification')}</h4>
        <div className="grid sm:grid-cols-2 gap-3">
          {/* Kritisch */}
          <div className="flex items-start gap-3 p-3 bg-red-50 border-2 border-red-600">
            <AlertTriangle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-900 text-sm uppercase tracking-wide">{tPriority('critical')}</p>
              <p className="text-xs text-red-700 mt-1">
                {t('criticalDesc')}
              </p>
            </div>
          </div>

          {/* Beobachtung */}
          <div className="flex items-start gap-3 p-3 bg-amber-50 border-2 border-amber-600">
            <Eye className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900 text-sm uppercase tracking-wide">{tPriority('watchList')}</p>
              <p className="text-xs text-amber-700 mt-1">
                {t('watchListDesc')}
              </p>
            </div>
          </div>

          {/* Konform */}
          <div className="flex items-start gap-3 p-3 bg-green-50 border-2 border-green-600">
            <CheckCircle className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-green-900 text-sm uppercase tracking-wide">{tPriority('clear')}</p>
              <p className="text-xs text-green-700 mt-1">
                {t('clearDesc')}
              </p>
            </div>
          </div>

          {/* Unzuverlässig */}
          <div className="flex items-start gap-3 p-3 bg-neutral-100 border-2 border-neutral-400">
            <HelpCircle className="w-5 h-5 text-neutral-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-neutral-700 text-sm uppercase tracking-wide">{tPriority('unreliable')}</p>
              <p className="text-xs text-neutral-600 mt-1">
                {t('unreliableDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ausgeschlossene Codes */}
      <section>
        <h4 className="text-lg font-bold text-neutral-900 mb-3">{t('excludedCodes')}</h4>
        <p className="text-sm text-neutral-600 mb-3">
          {t('excludedCodesDesc')}
        </p>
        <div className="flex flex-wrap gap-2">
          {['B1n', 'B2n', 'C4n', 'C5n', 'C8', 'D1n', 'D2n', 'E', 'F1n', 'G', 'H', 'I'].map((code) => (
            <span
              key={code}
              className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs font-mono border border-neutral-300"
            >
              {code}
            </span>
          ))}
        </div>
      </section>

      {/* Hinweise */}
      <section className="bg-neutral-50 border border-neutral-200 p-5">
        <h4 className="font-bold text-neutral-900 mb-2">{t('processingNotes')}</h4>
        <ul className="text-sm text-neutral-600 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-red-600 font-bold">1.</span>
            {t('note1')}
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-600 font-bold">2.</span>
            {t('note2')}
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-600 font-bold">3.</span>
            {t('note3')}
          </li>
        </ul>
      </section>
    </div>
  );
}
