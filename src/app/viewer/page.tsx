'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/authContext';
import { useViewerStore } from '@/stores/viewerStore';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ViewerDashboard } from '@/components/viewer/ViewerDashboard';
import { ViewerTrends } from '@/components/viewer/ViewerTrends';
import { DocumentationTab } from '@/components/tabs/DocumentationTab';
import { AlertCircle, Upload, FileJson, BarChart3 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useDropzone } from 'react-dropzone';

export default function ViewerPage() {
  const { isAuthenticated, isLoading: authLoading, role } = useAuth();
  const { publishedData, isLoading, error, loadFromFile, loadFromUrl } = useViewerStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const t = useTranslations('viewer');
  const tCommon = useTranslations('common');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/viewer/login');
    } else if (!authLoading && isAuthenticated && role !== 'viewer') {
      // If logged in as admin, redirect to admin
      router.push('/admin');
    }
  }, [isAuthenticated, authLoading, role, router]);

  // Try to load data from default URL on mount
  useEffect(() => {
    // First try environment variable, then fallback to local file
    const dataUrl = process.env.NEXT_PUBLIC_VIEWER_DATA_URL || '/data/published.json';
    if (!publishedData && !isLoading) {
      loadFromUrl(dataUrl);
    }
  }, [loadFromUrl, publishedData, isLoading]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        loadFromFile(acceptedFiles[0]);
      }
    },
    [loadFromFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
    },
    maxFiles: 1,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center animate-sem-fade-in">
          <div className="w-12 h-12 border-2 border-neutral-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-500 text-sm font-medium">{tCommon('loading')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || role !== 'viewer') {
    return null;
  }

  const hasData = publishedData !== null;

  // Render content based on active tab
  const renderTabContent = () => {
    if (!hasData) {
      return (
        <section className="bg-white border border-neutral-200 p-12">
          <div className="max-w-md mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-3">
              {t('noData')}
            </h3>
            <p className="text-neutral-600 mb-6">
              {t('noDataHint')}
            </p>

            {/* File Upload for Viewer */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed p-8 cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-neutral-300 hover:border-blue-400'
              }`}
            >
              <input {...getInputProps()} />
              <FileJson className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
              <p className="text-sm text-neutral-600">
                {isDragActive ? t('dropHere') : t('dragOrClick')}
              </p>
              <p className="text-xs text-neutral-400 mt-2">{t('jsonOnly')}</p>
            </div>
          </div>
        </section>
      );
    }

    switch (activeTab) {
      case 'trends':
        return (
          <section className="bg-white border border-neutral-200 p-6">
            <ViewerTrends />
          </section>
        );
      case 'docs':
        return (
          <section className="bg-white border border-neutral-200 p-6">
            <DocumentationTab />
          </section>
        );
      case 'dashboard':
      default:
        return <ViewerDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* Header */}
      <Header activeTab={activeTab} onTabChange={setActiveTab} isAdmin={false} isViewer />

      {/* Hero Section for Viewer */}
      {activeTab === 'dashboard' && hasData && (
        <section className="bg-gradient-to-br from-neutral-800 to-neutral-900 text-white py-8">
          <div className="sem-container">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-px bg-blue-500" aria-hidden="true" />
              <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">
                {t('viewerMode')}
              </span>
            </div>
            <h1 className="text-2xl font-bold mb-2">{t('title')}</h1>
            <p className="text-neutral-400">
              {t('subtitle', {
                semester: publishedData.metadata.semester,
                date: new Date(publishedData.metadata.publishedAt).toLocaleDateString(),
              })}
            </p>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="flex-1">
        <div className="sem-container py-8 lg:py-12 space-y-8">
          {/* Data Status */}
          {hasData && (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                <span className="text-sm text-blue-900">
                  {t('dataLoaded', { semester: publishedData.metadata.semester })}
                </span>
              </div>
              <span className="text-xs text-blue-600">
                {t('publishedOn', {
                  date: new Date(publishedData.metadata.publishedAt).toLocaleString(),
                })}
              </span>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-neutral-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div
              className="flex items-start gap-4 p-5 bg-red-50 border-l-4 border-red-600"
              role="alert"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-900">{tCommon('error')}</p>
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Tab Content */}
          {!isLoading && renderTabContent()}
        </div>
      </main>

      {/* Footer */}
      <Footer version="1.0.0" />
    </div>
  );
}
