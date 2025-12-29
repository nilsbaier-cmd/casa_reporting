'use client';

import { useState, useCallback } from 'react';
import { useAnalysisStore } from '@/stores/analysisStore';
import {
  parseINADFile,
  parseBAZLFile,
  validateINADData,
  validateBAZLData,
} from '@/lib/analysis';
import { cn } from '@/lib/utils';
import { Upload, FileCheck, FileX, Loader2, FileSpreadsheet, Plane } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface FileDropZoneProps {
  label: string;
  description: string;
  accept: string;
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  fileName: string | null;
  status: 'idle' | 'success' | 'error';
  statusMessage?: string;
  icon: React.ReactNode;
  dragOrClickText: string;
  processingText: string;
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
  icon,
  dragOrClickText,
  processingText,
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
    <div
      className={cn(
        'relative bg-white border-2 transition-all cursor-pointer group',
        isDragging && 'border-red-600 bg-red-50',
        status === 'idle' && !isDragging && 'border-neutral-200 hover:border-neutral-400',
        status === 'success' && 'border-green-600 bg-green-50',
        status === 'error' && 'border-red-600 bg-red-50'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Top accent bar */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-1',
          status === 'success' ? 'bg-green-600' : status === 'error' ? 'bg-red-600' : 'bg-neutral-900'
        )}
        aria-hidden="true"
      />

      <label className="block p-6 cursor-pointer">
        <input
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="sr-only"
          disabled={isLoading}
          aria-describedby={`${label}-desc`}
        />

        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={cn(
              'p-3 transition-colors',
              status === 'success'
                ? 'bg-green-100 text-green-700'
                : status === 'error'
                ? 'bg-red-100 text-red-700'
                : 'bg-neutral-100 text-neutral-600 group-hover:bg-neutral-200'
            )}
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : status === 'success' ? (
              <FileCheck className="w-6 h-6" />
            ) : status === 'error' ? (
              <FileX className="w-6 h-6" />
            ) : (
              icon
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-neutral-900 mb-1">{label}</p>

            {isLoading ? (
              <p className="text-sm text-neutral-500">{processingText}</p>
            ) : fileName ? (
              <div>
                <p
                  className={cn(
                    'text-sm font-medium truncate',
                    status === 'success' ? 'text-green-700' : 'text-red-700'
                  )}
                >
                  {fileName}
                </p>
                {statusMessage && (
                  <p
                    id={`${label}-desc`}
                    className={cn(
                      'text-xs mt-1',
                      status === 'success' ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {statusMessage}
                  </p>
                )}
              </div>
            ) : (
              <div id={`${label}-desc`}>
                <p className="text-sm text-neutral-600">{description}</p>
                <p className="text-xs text-neutral-400 mt-1">
                  {dragOrClickText}
                </p>
              </div>
            )}
          </div>

          {/* Upload indicator */}
          {!isLoading && !fileName && (
            <Upload className="w-5 h-5 text-neutral-400 group-hover:text-neutral-600 transition-colors" />
          )}
        </div>
      </label>
    </div>
  );
}

export function FileUpload() {
  const t = useTranslations('fileUpload');
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
        const message = err instanceof Error ? err.message : t('errorParsingInad');
        setInadMessage(message);
        setError(message);
      } finally {
        setIsLoadingInad(false);
      }
    },
    [setINADData, setError, t]
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
        const message = err instanceof Error ? err.message : t('errorParsingBazl');
        setBazlMessage(message);
        setError(message);
      } finally {
        setIsLoadingBazl(false);
      }
    },
    [setBAZLData, setError, t]
  );

  const handleReset = () => {
    reset();
    setInadStatus('idle');
    setBazlStatus('idle');
    setInadMessage('');
    setBazlMessage('');
  };

  const hasFiles = inadFileName || bazlFileName;

  return (
    <div className="space-y-4">
      {/* File upload zones with optional reset button */}
      <div className="grid md:grid-cols-[1fr_1fr_auto] gap-4 items-stretch">
        <FileDropZone
          label={t('inadLabel')}
          description={t('inadDescription')}
          accept=".xlsx,.xlsm"
          onFileSelect={handleINADFile}
          isLoading={isLoadingInad}
          fileName={inadFileName}
          status={inadStatus}
          statusMessage={inadMessage}
          icon={<Plane className="w-6 h-6" />}
          dragOrClickText={t('dragOrClick')}
          processingText={t('processing')}
        />

        <FileDropZone
          label={t('bazlLabel')}
          description={t('bazlDescription')}
          accept=".xlsx"
          onFileSelect={handleBAZLFile}
          isLoading={isLoadingBazl}
          fileName={bazlFileName}
          status={bazlStatus}
          statusMessage={bazlMessage}
          icon={<FileSpreadsheet className="w-6 h-6" />}
          dragOrClickText={t('dragOrClick')}
          processingText={t('processing')}
        />

        {/* Reset button - always rendered but invisible when no files to maintain layout */}
        <div className={cn(
          'flex items-center',
          !hasFiles && 'invisible'
        )}>
          <button
            onClick={handleReset}
            className="px-4 py-2 h-fit text-sm font-medium text-neutral-600 hover:text-neutral-900 border border-neutral-300 hover:border-neutral-400 transition-colors whitespace-nowrap"
          >
            {t('reset')}
          </button>
        </div>
      </div>

      {/* Analysis indicator */}
      {isAnalyzing && (
        <div className="flex items-center gap-3 p-4 bg-neutral-100 border-l-4 border-neutral-900">
          <Loader2 className="w-5 h-5 animate-spin text-neutral-600" />
          <p className="text-sm font-medium text-neutral-700">{t('analyzing')}</p>
        </div>
      )}
    </div>
  );
}
