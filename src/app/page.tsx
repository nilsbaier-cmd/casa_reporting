'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/authContext';
import { useAnalysisStore } from '@/stores/analysisStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileUpload } from '@/components/dashboard/FileUpload';
import { SemesterSelector } from '@/components/dashboard/SemesterSelector';
import { MetricsBar } from '@/components/dashboard/MetricsBar';
import { Step1Airlines } from '@/components/tabs/Step1Airlines';
import { Step2Routes } from '@/components/tabs/Step2Routes';
import { Step3Density } from '@/components/tabs/Step3Density';

export default function DashboardPage() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const { error, step1Results } = useAnalysisStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  const hasResults = step1Results !== null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">INAD Analysis Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Carrier Sanctions Reporting Tool
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            Logout
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* File Upload */}
        <FileUpload />

        {/* Semester Selection */}
        <SemesterSelector />

        {/* Error display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Metrics */}
        {hasResults && <MetricsBar />}

        {/* Analysis Tabs */}
        {hasResults && (
          <Tabs defaultValue="step1" className="bg-white rounded-lg border">
            <TabsList className="w-full justify-start border-b rounded-none p-0 h-auto">
              <TabsTrigger
                value="step1"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Step 1: Airlines
              </TabsTrigger>
              <TabsTrigger
                value="step2"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Step 2: Routes
              </TabsTrigger>
              <TabsTrigger
                value="step3"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
              >
                Step 3: Density Analysis
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="step1" className="mt-0">
                <Step1Airlines />
              </TabsContent>

              <TabsContent value="step2" className="mt-0">
                <Step2Routes />
              </TabsContent>

              <TabsContent value="step3" className="mt-0">
                <Step3Density />
              </TabsContent>
            </div>
          </Tabs>
        )}

        {/* Empty state */}
        {!hasResults && (
          <div className="bg-white rounded-lg border p-12 text-center">
            <h2 className="text-lg font-semibold mb-2">No Analysis Results</h2>
            <p className="text-muted-foreground">
              Upload both INAD and BAZL Excel files to run the analysis.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
