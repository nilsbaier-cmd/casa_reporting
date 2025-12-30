'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/authContext';
import { useViewerStore } from '@/stores/viewerStore';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ViewerDashboard } from '@/components/viewer/ViewerDashboard';
import { ViewerTrends } from '@/components/viewer/ViewerTrends';
import { ViewerPaxTab } from '@/components/viewer/ViewerPaxTab';
import { ViewerInadTab } from '@/components/viewer/ViewerInadTab';
import { DocumentationTab } from '@/components/tabs/DocumentationTab';
import { AlertCircle, Upload, FileJson, BarChart3, Plane, Users, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useDropzone } from 'react-dropzone';

export default function ViewerPage() {
  const { isAuthenticated, isLoading: authLoading, role } = useAuth();
  const { publishedData, isLoading, error, loadFromFile, loadFromUrl } = useViewerStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const t = useTranslations('viewer');
  const tCommon = useTranslations('common');
  const tHero = useTranslations('hero');

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
      case 'pax':
        return (
          <section className="bg-white border border-neutral-200 p-6">
            <ViewerPaxTab />
          </section>
        );
      case 'inad':
        return (
          <section className="bg-white border border-neutral-200 p-6">
            <ViewerInadTab />
          </section>
        );
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
        <section
          className="relative bg-neutral-900 text-white overflow-hidden"
          aria-labelledby="hero-heading"
        >
          {/* Geometric grid pattern - Aviation/Technical aesthetic */}
          <div className="absolute inset-0" aria-hidden="true">
            {/* Grid lines */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `
                  linear-gradient(to right, white 1px, transparent 1px),
                  linear-gradient(to bottom, white 1px, transparent 1px)
                `,
                backgroundSize: '48px 48px',
              }}
            />
            {/* Diagonal accent lines - Flight path inspired */}
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.02]">
              <svg className="w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="none">
                <line x1="0" y1="300" x2="400" y2="0" stroke="white" strokeWidth="0.5" />
                <line x1="100" y1="300" x2="400" y2="50" stroke="white" strokeWidth="0.5" />
                <line x1="200" y1="300" x2="400" y2="100" stroke="white" strokeWidth="0.5" />
              </svg>
            </div>
            {/* Blue accent corner */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-600/20 to-transparent" />
          </div>

          {/* Large plane silhouette */}
          <div className="absolute -right-24 top-1/2 -translate-y-1/2 opacity-[0.04]" aria-hidden="true">
            <Plane className="w-[500px] h-[500px] transform -rotate-12" strokeWidth={0.3} />
          </div>

          <div className="sem-container relative">
            <div className="py-16 lg:py-20">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                {/* Left column - Main content */}
                <div className="animate-sem-fade-in">
                  {/* Document reference */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-px bg-blue-500" aria-hidden="true" />
                    <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">
                      {t('viewerMode')}
                    </span>
                  </div>

                  <h2
                    id="hero-heading"
                    className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-[1.1] tracking-tight"
                  >
                    <span className="text-white">{t('title')}</span>
                  </h2>

                  <p className="text-lg text-neutral-300 leading-relaxed max-w-xl">
                    {t('subtitle', {
                      semester: publishedData.metadata.semester,
                      date: new Date(publishedData.metadata.publishedAt).toLocaleDateString(),
                    })}
                  </p>
                </div>

                {/* Right column - Metric cards (3 Kacheln) */}
                <div className="grid grid-cols-3 gap-4 animate-sem-fade-in" style={{ animationDelay: '150ms' }}>
                  {/* INAD Card */}
                  <div className="bg-white/5 border border-white/10 p-5 group hover:bg-white/10 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <Plane className="w-5 h-5 text-blue-400" />
                      <span className="text-xs font-bold tracking-wider text-neutral-500 uppercase">{tHero('cards.analysis')}</span>
                    </div>
                    <p className="text-2xl font-bold mb-1">{publishedData.summary.totalInads.toLocaleString()}</p>
                    <p className="text-xs text-neutral-500">{tHero('cards.inadLabel')}</p>
                  </div>

                  {/* PAX Card */}
                  <div className="bg-white/5 border border-white/10 p-5 group hover:bg-white/10 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <Users className="w-5 h-5 text-blue-400" />
                      <span className="text-xs font-bold tracking-wider text-neutral-500 uppercase">{tHero('cards.data')}</span>
                    </div>
                    <p className="text-2xl font-bold mb-1">{(publishedData.summary.totalPax / 1000000).toFixed(1)}M</p>
                    <p className="text-xs text-neutral-500">{tHero('cards.paxLabel')}</p>
                  </div>

                  {/* Status Card */}
                  <div className="relative bg-blue-600 p-5 overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/50 rounded-full -translate-y-10 translate-x-10" aria-hidden="true" />
                    <div className="relative">
                      <div className="flex items-start justify-between mb-3">
                        <TrendingUp className="w-5 h-5 text-blue-200" />
                        <span className="text-xs font-bold tracking-wider text-blue-200 uppercase">{tHero('cards.status')}</span>
                      </div>
                      <p className="text-2xl font-bold mb-1">{tHero('cards.active')}</p>
                      <p className="text-xs text-blue-200">{tHero('cards.ready')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom border with document-like detail */}
          <div className="absolute bottom-0 left-0 right-0">
            <div className="h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />
            <div className="h-1 bg-blue-600" />
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
