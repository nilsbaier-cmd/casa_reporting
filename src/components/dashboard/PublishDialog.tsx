'use client';

import { useState } from 'react';
import { useAnalysisStore } from '@/stores/analysisStore';
import { generatePublishData } from '@/lib/analysis/generatePublishData';
import { useAuth } from '@/lib/auth/authContext';
import {
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Github,
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
    <div className="bg-white border border-neutral-200 p-4">
      {/* Error Display */}
      {publishError && (
        <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 mb-3">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">{t('publishError')}</p>
            <p className="text-xs text-red-700">{publishError}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {publishSuccess && (
        <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 mb-3">
          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-800">{t('publishSuccess')}</p>
            <p className="text-xs text-green-700">{t('publishSuccessHint')}</p>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="bg-blue-50 border border-blue-200 p-4 mb-3">
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

      {/* Compact horizontal layout */}
      {!showConfirmDialog && (
        <div className="flex flex-wrap items-center gap-4">
          <h3 className="text-sm font-bold text-neutral-900">{t('title')}</h3>

          {selectedSemester && (
            <span className="text-sm font-medium text-neutral-600">
              {selectedSemester.label}
            </span>
          )}

          <button
            onClick={() => setShowConfirmDialog(true)}
            disabled={!canPublish || isPublishing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>{t('publishToGitHub')}</span>
          </button>

          <a
            href="/viewer"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {t('viewerLink')}
          </a>

          {lastPublished && (
            <span className="text-xs text-neutral-500">
              {t('lastPublish')}: {lastPublished}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
