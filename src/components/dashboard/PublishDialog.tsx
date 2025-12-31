'use client';

import { useState } from 'react';
import { useAnalysisStore } from '@/stores/analysisStore';
import { generatePublishData } from '@/lib/analysis/generatePublishData';
import {
  Upload,
  Download,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Info,
  Github,
  Loader2,
} from 'lucide-react';
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
    config,
  } = useAnalysisStore();

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [lastPublished, setLastPublished] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const canPublish =
    inadData &&
    bazlData &&
    selectedSemester &&
    step1Results &&
    step2Results &&
    step3Results &&
    threshold !== null;

  const generateData = () => {
    if (!canPublish) return null;

    return generatePublishData({
      inadData: inadData!,
      bazlData: bazlData!,
      selectedSemester: selectedSemester!,
      availableSemesters,
      step1Results: step1Results!,
      step2Results: step2Results!,
      step3Results: step3Results!,
      threshold: threshold!,
      config,
    });
  };

  const handleDownloadJson = () => {
    const publishData = generateData();
    if (!publishData) return;

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

    setLastPublished(new Date().toLocaleString(localeFormat));
  };

  const handlePublishToGitHub = async () => {
    const publishData = generateData();
    if (!publishData) return;

    setIsPublishing(true);
    setPublishError(null);
    setShowConfirmDialog(false);

    try {
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: publishData,
          semester: selectedSemester!.label,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.details || 'Failed to publish');
      }

      setPublishSuccess(true);
      setLastPublished(new Date().toLocaleString(localeFormat));

      // Reset success state after 5 seconds
      setTimeout(() => setPublishSuccess(false), 5000);
    } catch (error) {
      console.error('Publish error:', error);
      setPublishError(error instanceof Error ? error.message : 'Unknown error');
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
          <h3 className="text-lg font-bold text-neutral-900 mb-1">{t('title')}</h3>
          <p className="text-sm text-neutral-600 mb-4">{t('description')}</p>

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
                  <p className="font-semibold text-neutral-900">
                    {totalInads.toLocaleString(localeFormat)}
                  </p>
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
            <p className="text-xs text-amber-800">{t('warning')}</p>
          </div>

          {/* Error Display */}
          {publishError && (
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 mb-4">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">{t('publishError')}</p>
                <p className="text-xs text-red-700">{publishError}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {publishSuccess && (
            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 mb-4">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">{t('publishSuccess')}</p>
                <p className="text-xs text-green-700">{t('publishSuccessHint')}</p>
              </div>
            </div>
          )}

          {/* Confirmation Dialog */}
          {showConfirmDialog && (
            <div className="bg-blue-50 border border-blue-200 p-4 mb-4">
              <p className="text-sm font-medium text-blue-900 mb-3">
                {t('confirmTitle', { semester: selectedSemester?.label ?? '' })}
              </p>
              <p className="text-xs text-blue-700 mb-4">{t('confirmDescription')}</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePublishToGitHub}
                  disabled={isPublishing}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('publishing')}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>{t('confirmYes')}</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  disabled={isPublishing}
                  className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  {t('confirmNo')}
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          {!showConfirmDialog && (
            <div className="flex flex-wrap items-center gap-3">
              {/* GitHub Publish Button */}
              <button
                onClick={() => setShowConfirmDialog(true)}
                disabled={!canPublish || isPublishing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>{t('publishToGitHub')}</span>
              </button>

              {/* Download Button */}
              <button
                onClick={handleDownloadJson}
                disabled={!canPublish}
                className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 text-neutral-700 text-sm font-medium hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>{t('downloadJson')}</span>
              </button>

              {lastPublished && (
                <span className="text-xs text-neutral-500">
                  {t('lastPublish')}: {lastPublished}
                </span>
              )}
            </div>
          )}

          {/* Viewer Link */}
          <div className="mt-4 pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-2 text-sm">
              <ExternalLink className="w-4 h-4 text-neutral-400" />
              <a
                href="/viewer"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {t('viewerLink')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
