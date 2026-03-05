'use client';

import { useState } from 'react';
import { useAnalysisStore } from '@/stores/analysisStore';
import { generatePublishData } from '@/lib/analysis/generatePublishData';
import { useAuth } from '@/lib/auth/authContext';
import {
  Upload,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

export function PublishDialog() {
  const t = useTranslations('publish');
  const locale = useLocale();
  const localeFormat = locale === 'fr' ? 'fr-CH' : 'de-CH';
  const { csrfToken } = useAuth();

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

  const handlePublishToGitHub = async () => {
    const publishData = generateData();
    if (!publishData) return;
    if (!csrfToken) {
      setPublishError('Authentication state expired. Please log in again.');
      return;
    }

    setIsPublishing(true);
    setPublishError(null);
    setShowConfirmDialog(false);

    try {
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
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
      setTimeout(() => setPublishSuccess(false), 5000);
    } catch (error) {
      console.error('Publish error:', error);
      setPublishError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="relative h-full border-2 border-neutral-200 bg-white">
      <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-900" aria-hidden="true" />
      <div className="flex h-full flex-col p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 bg-blue-100 p-3 text-blue-600">
            <Upload className="w-6 h-6" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-neutral-900">{t('title')}</h3>
            <p className="mt-1 text-sm text-neutral-600">
              {canPublish ? t('compactReady') : t('compactPending')}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {selectedSemester && (
            <div className="border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs">
              <p className="font-bold uppercase tracking-wider text-neutral-500">{t('semester')}</p>
              <p className="mt-1 font-medium text-neutral-900">{selectedSemester.label}</p>
            </div>
          )}
          <div
            className={`px-3 py-2 text-xs font-medium ${
              canPublish
                ? 'border border-green-200 bg-green-50 text-green-700'
                : 'border border-neutral-200 bg-neutral-50 text-neutral-600'
            }`}
          >
            {canPublish ? t('statusReady') : t('statusPending')}
          </div>
        </div>

        {publishError && (
          <div className="mt-4 flex items-start gap-3 border border-red-200 bg-red-50 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-800">{t('publishError')}</p>
              <p className="text-xs text-red-700">{publishError}</p>
            </div>
          </div>
        )}

        {publishSuccess && (
          <div className="mt-4 flex items-start gap-3 border border-green-200 bg-green-50 p-3">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">{t('publishSuccess')}</p>
              <p className="text-xs text-green-700">{t('publishSuccessHint')}</p>
            </div>
          </div>
        )}

        {showConfirmDialog && (
          <div className="mt-4 border border-blue-200 bg-blue-50 p-4">
            <p className="mb-3 text-sm font-medium text-blue-900">
              {t('confirmTitle', { semester: selectedSemester?.label ?? '' })}
            </p>
            <p className="mb-4 text-xs text-blue-700">{t('confirmDescription')}</p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handlePublishToGitHub}
                disabled={isPublishing}
                className="inline-flex items-center gap-2 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t('publishing')}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>{t('confirmYes')}</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowConfirmDialog(false)}
                disabled={isPublishing}
                className="px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
              >
                {t('confirmNo')}
              </button>
            </div>
          </div>
        )}

        <div className="mt-auto pt-5">
          {!showConfirmDialog && (
            <>
              {!canPublish && (
                <p className="mb-4 text-xs text-neutral-500">
                  {t('requirementsHint')}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <button
                    onClick={() => setShowConfirmDialog(true)}
                    disabled={!canPublish || isPublishing}
                    className="peer inline-flex items-center gap-2 bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-describedby="publish-tooltip"
                  >
                    {isPublishing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{t('publishing')}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        <span>{t('publishToGitHub')}</span>
                      </>
                    )}
                  </button>
                  <div
                    id="publish-tooltip"
                    role="tooltip"
                    className="pointer-events-none absolute left-0 top-full z-10 mt-2 w-72 border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 opacity-0 shadow-sm transition-all duration-150 peer-hover:opacity-100 peer-focus-visible:opacity-100"
                  >
                    {t('warning')}
                  </div>
                </div>

                <a
                  href="/viewer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>{t('viewerLink')}</span>
                </a>
              </div>

              {lastPublished && (
                <p className="mt-3 text-xs text-neutral-500">
                  {t('lastPublish')}: {lastPublished}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
