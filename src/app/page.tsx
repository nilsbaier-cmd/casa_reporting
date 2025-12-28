'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/authContext';
import { useAnalysisStore } from '@/stores/analysisStore';
import { Header } from '@/components/layout/Header';
import { HeroSection } from '@/components/layout/HeroSection';
import { Footer } from '@/components/layout/Footer';
import { FileUpload } from '@/components/dashboard/FileUpload';
import { SemesterSelector } from '@/components/dashboard/SemesterSelector';
import { MetricsBar } from '@/components/dashboard/MetricsBar';
import { Step1Airlines } from '@/components/tabs/Step1Airlines';
import { Step2Routes } from '@/components/tabs/Step2Routes';
import { Step3Density } from '@/components/tabs/Step3Density';
import { PaxTab } from '@/components/tabs/PaxTab';
import { InadTab } from '@/components/tabs/InadTab';
import { TrendsTab } from '@/components/tabs/TrendsTab';
import { DocumentationTab } from '@/components/tabs/DocumentationTab';
import { AlertCircle, Upload, FileSpreadsheet, Plane } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { error, step1Results, inadData, bazlData } = useAnalysisStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [analysisTab, setAnalysisTab] = useState('step1');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center animate-sem-fade-in">
          <div className="w-12 h-12 border-2 border-neutral-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-500 text-sm font-medium">Wird geladen...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const hasResults = step1Results !== null;
  const hasData = inadData !== null || bazlData !== null;

  const analysisTabs = [
    { id: 'step1', label: 'Schritt 1: Airlines', shortLabel: 'Airlines' },
    { id: 'step2', label: 'Schritt 2: Routen', shortLabel: 'Routen' },
    { id: 'step3', label: 'Schritt 3: Dichte-Analyse', shortLabel: 'Dichte' },
  ];

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'pax':
        return (
          <section className="bg-white border border-neutral-200 p-6">
            <PaxTab />
          </section>
        );
      case 'inad':
        return (
          <section className="bg-white border border-neutral-200 p-6">
            <InadTab />
          </section>
        );
      case 'trends':
        return (
          <section className="bg-white border border-neutral-200 p-6">
            <TrendsTab />
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
        return (
          <>
            {/* Metrics */}
            {hasResults && <MetricsBar />}

            {/* Analysis Results */}
            {hasResults && (
              <section aria-labelledby="analysis-heading">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-px bg-red-600" aria-hidden="true" />
                  <h2 id="analysis-heading" className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Analyseergebnisse
                  </h2>
                </div>

                <div className="bg-white border border-neutral-200">
                  {/* Tab Navigation */}
                  <div className="border-b border-neutral-200">
                    <nav className="flex" role="tablist" aria-label="Analyse-Schritte">
                      {analysisTabs.map((tab) => (
                        <button
                          key={tab.id}
                          role="tab"
                          aria-selected={analysisTab === tab.id}
                          aria-controls={`panel-${tab.id}`}
                          onClick={() => setAnalysisTab(tab.id)}
                          className={cn(
                            'relative px-6 py-4 text-sm font-medium transition-colors',
                            'focus:outline-none focus-visible:bg-neutral-100',
                            analysisTab === tab.id
                              ? 'text-red-600'
                              : 'text-neutral-500 hover:text-neutral-900'
                          )}
                        >
                          <span className="hidden sm:inline">{tab.label}</span>
                          <span className="sm:hidden">{tab.shortLabel}</span>
                          {analysisTab === tab.id && (
                            <span
                              className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      ))}
                    </nav>
                  </div>

                  {/* Tab Content */}
                  <div className="p-6">
                    <div
                      id="panel-step1"
                      role="tabpanel"
                      aria-labelledby="step1"
                      hidden={analysisTab !== 'step1'}
                    >
                      {analysisTab === 'step1' && <Step1Airlines />}
                    </div>
                    <div
                      id="panel-step2"
                      role="tabpanel"
                      aria-labelledby="step2"
                      hidden={analysisTab !== 'step2'}
                    >
                      {analysisTab === 'step2' && <Step2Routes />}
                    </div>
                    <div
                      id="panel-step3"
                      role="tabpanel"
                      aria-labelledby="step3"
                      hidden={analysisTab !== 'step3'}
                    >
                      {analysisTab === 'step3' && <Step3Density />}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Empty State */}
            {!hasResults && (
              <section className="bg-white border border-neutral-200 p-12">
                <div className="max-w-md mx-auto text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 rounded-full mb-6">
                    <Plane className="w-8 h-8 text-neutral-400" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-3">
                    Keine Analyseergebnisse
                  </h3>
                  <p className="text-neutral-600 mb-6">
                    Laden Sie die INAD- und BAZL-Excel-Dateien hoch, um die Analyse zu starten.
                  </p>
                  <div className="flex items-center justify-center gap-4 text-sm text-neutral-500">
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      <span>INAD-Datei</span>
                    </div>
                    <span className="text-neutral-300">+</span>
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>BAZL-Datei</span>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* Header */}
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Hero Section - Only on dashboard */}
      {activeTab === 'dashboard' && <HeroSection />}

      {/* Main Content */}
      <main className="flex-1">
        <div className="sem-container py-8 lg:py-12 space-y-8">
          {/* Data Control Bar - Semester links, Upload rechts */}
          <section aria-labelledby="controls-heading">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px bg-red-600" aria-hidden="true" />
              <h2 id="controls-heading" className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Datensteuerung
              </h2>
            </div>

            <div className="grid lg:grid-cols-12 gap-6 items-start">
              {/* Semester Selection - Left, compact */}
              <div className="lg:col-span-3">
                <SemesterSelector />
              </div>

              {/* File Upload - Right, larger */}
              <div className="lg:col-span-9">
                <FileUpload />
              </div>
            </div>
          </section>

          {/* Error Display */}
          {error && (
            <div
              className="flex items-start gap-4 p-5 bg-red-50 border-l-4 border-red-600"
              role="alert"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-900">Fehler bei der Analyse</p>
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Tab Content */}
          {renderTabContent()}
        </div>
      </main>

      {/* Footer */}
      <Footer version="1.0.0" />
    </div>
  );
}
