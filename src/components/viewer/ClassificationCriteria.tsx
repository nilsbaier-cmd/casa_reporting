'use client';

import { AlertTriangle, Eye, CheckCircle, HelpCircle, Info } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import type { PublishedClassificationConfig } from '@/lib/analysis/publishTypes';

interface ClassificationCriteriaProps {
  config: PublishedClassificationConfig;
  medianThreshold: number;
}

export function ClassificationCriteria({ config, medianThreshold }: ClassificationCriteriaProps) {
  const t = useTranslations('priority');
  const tDocs = useTranslations('docs');
  const tCriteria = useTranslations('criteria');
  const locale = useLocale();
  const localeFormat = locale === 'fr' ? 'fr-CH' : 'de-CH';

  // Calculate actual threshold values
  const highPriorityThreshold = medianThreshold * config.highPriorityMultiplier;

  return (
    <div className="bg-neutral-50 border border-neutral-200 p-6">
      <div className="flex items-start gap-3 mb-4">
        <Info className="w-5 h-5 text-neutral-500 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-bold text-neutral-900">{tDocs('classification')}</h4>
          <p className="text-sm text-neutral-600 mt-1">
            {tCriteria('medianThreshold')}: <span className="font-semibold">{medianThreshold.toFixed(4)}‰</span>
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {/* Kritisch / High Priority */}
        <div className="flex items-start gap-3 p-3 bg-red-50 border-2 border-red-600">
          <AlertTriangle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-900 text-sm uppercase tracking-wide">{t('critical')}</p>
            <ul className="text-xs text-red-700 mt-1 space-y-0.5">
              <li>{tCriteria('densityGte')} ≥ {highPriorityThreshold.toFixed(4)}‰ ({config.highPriorityMultiplier}x {tCriteria('median')})</li>
              <li>{tCriteria('and')} {tCriteria('densityGte')} ≥ {config.minDensity.toFixed(2)}‰</li>
              <li>{tCriteria('and')} {tCriteria('minInads')} {config.highPriorityMinInad} INADs</li>
            </ul>
          </div>
        </div>

        {/* Beobachtung / Watch List */}
        <div className="flex items-start gap-3 p-3 bg-amber-50 border-2 border-amber-600">
          <Eye className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-900 text-sm uppercase tracking-wide">{t('watchList')}</p>
            <ul className="text-xs text-amber-700 mt-1 space-y-0.5">
              <li>{tCriteria('densityGte')} ≥ {medianThreshold.toFixed(4)}‰ ({tCriteria('median')})</li>
              <li>{tCriteria('notAllCriteria')}</li>
            </ul>
          </div>
        </div>

        {/* Konform / Clear */}
        <div className="flex items-start gap-3 p-3 bg-green-50 border-2 border-green-600">
          <CheckCircle className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-green-900 text-sm uppercase tracking-wide">{t('clear')}</p>
            <ul className="text-xs text-green-700 mt-1 space-y-0.5">
              <li>{tCriteria('densityLt')} &lt; {medianThreshold.toFixed(4)}‰ ({tCriteria('median')})</li>
            </ul>
          </div>
        </div>

        {/* Unzuverlaessig / Unreliable */}
        <div className="flex items-start gap-3 p-3 bg-neutral-100 border-2 border-neutral-400">
          <HelpCircle className="w-5 h-5 text-neutral-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-neutral-700 text-sm uppercase tracking-wide">{t('unreliable')}</p>
            <ul className="text-xs text-neutral-600 mt-1 space-y-0.5">
              <li>{tCriteria('paxCount')} &lt; {config.minPax.toLocaleString(localeFormat)}</li>
              <li>{tCriteria('densityUnreliable')}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-4 pt-4 border-t border-neutral-200">
        <p className="text-xs text-neutral-500">
          {tCriteria('minInadInfo')} {config.minInad} INADs {tCriteria('requiredForAnalysis')}.
        </p>
      </div>
    </div>
  );
}
