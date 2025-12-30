'use client';

import { useState } from 'react';
import { useAnalysisStore } from '@/stores/analysisStore';
import { generatePublishData } from '@/lib/analysis/generatePublishData';
import { Upload, Download, CheckCircle, AlertTriangle, ExternalLink, Info } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

export function PublishDialog() {
  const t = useTranslations('publish');
  const locale = useLocale();
  const localeFormat = locale === 'fr' ? 'fr-CH' : 'de-CH';

  const {
    inadData,
    bazlData,
    selectedSemester,
    availableSemesters,
    step1Results,
    step2Results,
    step3Results,
    threshold,
  } = useAnalysisStore();

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [lastPublished, setLastPublished] = useState<string | null>(null);

  const canPublish =
    inadData &&
    bazlData &&
    selectedSemester &&
    step1Results &&
    step2Results &&
    step3Results &&
    threshold !== null;

  const handleDownloadJson = () => {
    if (!canPublish) return;

    setIsPublishing(true);

    try {
      const publishData = generatePublishData({
        inadData: inadData!,
        bazlData: bazlData!,
        selectedSemester: selectedSemester!,
        availableSemesters,
        step1Results: step1Results!,
        step2Results: step2Results!,
        step3Results: step3Results!,
        threshold: threshold!,
      });

      // Create and download JSON file
      const jsonString = JSON.stringify(publishData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `casa-data-${selectedSemester!.label.replace(' ', '-')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setPublishSuccess(true);
      setLastPublished(new Date().toLocaleString(localeFormat));

      // Reset success state after 3 seconds
      setTimeout(() => setPublishSuccess(false), 3000);
    } catch (error) {
      console.error('Error generating publish data:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  // Calculate summary for preview
  const totalInads = inadData
    ? inadData.filter(
        (r) =>
          selectedSemester &&
          r.year === selectedSemester.year &&
          r.month >= (selectedSemester.half === 1 ? 1 : 7) &&
          r.month <= (selectedSemester.half === 1 ? 6 : 12) &&
          r.included
      ).length
    : 0;

  const routesAnalyzed = step3Results?.length || 0;

  return (
    <div className="bg-white border border-neutral-200 p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <Upload className="w-5 h-5 text-blue-600" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-neutral-900 mb-1">
            {t('title')}
          </h3>
          <p className="text-sm text-neutral-600 mb-4">
            {t('description')}
          </p>

          {/* Current Analysis Preview */}
          {canPublish && (
            <div className="bg-neutral-50 border border-neutral-200 p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-neutral-500" />
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                  {t('currentAnalysis')}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-neutral-500">{t('semester')}</p>
                  <p className="font-semibold text-neutral-900">{selectedSemester?.label}</p>
                </div>
                <div>
                  <p className="text-neutral-500">{t('inads')}</p>
                  <p className="font-semibold text-neutral-900">{totalInads.toLocaleString(localeFormat)}</p>
                </div>
                <div>
                  <p className="text-neutral-500">{t('routes')}</p>
                  <p className="font-semibold text-neutral-900">{routesAnalyzed}</p>
                </div>
                <div>
                  <p className="text-neutral-500">{t('threshold')}</p>
                  <p className="font-semibold text-neutral-900">{threshold?.toFixed(4)}‰</p>
                </div>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              {t('warning')}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadJson}
              disabled={!canPublish || isPublishing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPublishing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t('generating')}</span>
                </>
              ) : publishSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>{t('downloaded')}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{t('downloadJson')}</span>
                </>
              )}
            </button>

            {lastPublished && (
              <span className="text-xs text-neutral-500">
                {t('lastDownload')}: {lastPublished}
              </span>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <p className="text-xs text-neutral-500 mb-2">{t('instructionsTitle')}</p>
            <ol className="text-xs text-neutral-600 space-y-1 list-decimal list-inside">
              <li>{t('instruction1')}</li>
              <li>{t('instruction2')}</li>
              <li>{t('instruction3')}</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
