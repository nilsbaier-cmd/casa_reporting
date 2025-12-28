'use client';

import { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAnalysisStore } from '@/stores/analysisStore';
import {
  parseINADFile,
  parseBAZLFile,
  validateINADData,
  validateBAZLData,
} from '@/lib/analysis';
import { cn } from '@/lib/utils';

interface FileDropZoneProps {
  label: string;
  description: string;
  accept: string;
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  fileName: string | null;
  status: 'idle' | 'success' | 'error';
  statusMessage?: string;
}

function FileDropZone({
  label,
  description,
  accept,
  onFileSelect,
  isLoading,
  fileName,
  status,
  statusMessage,
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  return (
    <Card
      className={cn(
        'transition-colors cursor-pointer',
        isDragging && 'border-primary bg-primary/5',
        status === 'success' && 'border-green-500 bg-green-50',
        status === 'error' && 'border-red-500 bg-red-50'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <label className="block">
          <input
            type="file"
            accept={accept}
            onChange={handleFileInput}
            className="hidden"
            disabled={isLoading}
          />
          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
            {isLoading ? (
              <p className="text-muted-foreground">Processing...</p>
            ) : fileName ? (
              <div>
                <p className="font-medium text-green-700">{fileName}</p>
                {statusMessage && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {statusMessage}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <p className="text-muted-foreground">{description}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Drag & drop or click to select
                </p>
              </div>
            )}
          </div>
        </label>
      </CardContent>
    </Card>
  );
}

export function FileUpload() {
  const {
    inadFileName,
    bazlFileName,
    setINADData,
    setBAZLData,
    setError,
    reset,
    isAnalyzing,
  } = useAnalysisStore();

  const [inadStatus, setInadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [bazlStatus, setBazlStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [inadMessage, setInadMessage] = useState<string>('');
  const [bazlMessage, setBazlMessage] = useState<string>('');
  const [isLoadingInad, setIsLoadingInad] = useState(false);
  const [isLoadingBazl, setIsLoadingBazl] = useState(false);

  const handleINADFile = useCallback(
    async (file: File) => {
      setIsLoadingInad(true);
      setInadStatus('idle');
      setError(null);

      try {
        const data = await parseINADFile(file);
        const validation = validateINADData(data);

        if (!validation.valid) {
          setInadStatus('error');
          setInadMessage(validation.message);
          setError(validation.message);
        } else {
          setInadStatus('success');
          setInadMessage(validation.message);
          setINADData(data, file.name);
        }
      } catch (err) {
        setInadStatus('error');
        const message = err instanceof Error ? err.message : 'Failed to parse INAD file';
        setInadMessage(message);
        setError(message);
      } finally {
        setIsLoadingInad(false);
      }
    },
    [setINADData, setError]
  );

  const handleBAZLFile = useCallback(
    async (file: File) => {
      setIsLoadingBazl(true);
      setBazlStatus('idle');
      setError(null);

      try {
        const data = await parseBAZLFile(file);
        const validation = validateBAZLData(data);

        if (!validation.valid) {
          setBazlStatus('error');
          setBazlMessage(validation.message);
          setError(validation.message);
        } else {
          setBazlStatus('success');
          setBazlMessage(validation.message);
          setBAZLData(data, file.name);
        }
      } catch (err) {
        setBazlStatus('error');
        const message = err instanceof Error ? err.message : 'Failed to parse BAZL file';
        setBazlMessage(message);
        setError(message);
      } finally {
        setIsLoadingBazl(false);
      }
    },
    [setBAZLData, setError]
  );

  const handleReset = () => {
    reset();
    setInadStatus('idle');
    setBazlStatus('idle');
    setInadMessage('');
    setBazlMessage('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Data Files</h2>
        {(inadFileName || bazlFileName) && (
          <Button variant="outline" size="sm" onClick={handleReset}>
            Reset
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <FileDropZone
          label="INAD Data"
          description="Upload INAD Tabelle (.xlsx or .xlsm)"
          accept=".xlsx,.xlsm"
          onFileSelect={handleINADFile}
          isLoading={isLoadingInad}
          fileName={inadFileName}
          status={inadStatus}
          statusMessage={inadMessage}
        />

        <FileDropZone
          label="BAZL Passenger Data"
          description="Upload BAZL-Daten (.xlsx)"
          accept=".xlsx"
          onFileSelect={handleBAZLFile}
          isLoading={isLoadingBazl}
          fileName={bazlFileName}
          status={bazlStatus}
          statusMessage={bazlMessage}
        />
      </div>

      {isAnalyzing && (
        <Alert>
          <AlertDescription>Running analysis...</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
