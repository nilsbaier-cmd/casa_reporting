import { create } from 'zustand';
import type { PublishedData } from '@/lib/analysis/publishTypes';

export type ViewerDataStatus = 'idle' | 'loading' | 'loaded' | 'notPublished' | 'error';

interface ViewerState {
  // Published data
  publishedData: PublishedData | null;

  // Status
  isLoading: boolean;
  error: string | null;
  dataStatus: ViewerDataStatus;

  // Actions
  loadPublishedData: (data: PublishedData) => void;
  loadFromUrl: (url: string) => Promise<void>;
  loadFromFile: (file: File) => Promise<void>;
  reset: () => void;
  setError: (error: string | null) => void;
}

export const useViewerStore = create<ViewerState>()((set) => ({
  // Initial state
  publishedData: null,
  isLoading: false,
  error: null,
  dataStatus: 'idle',

  // Actions
  loadPublishedData: (data) => {
    set({
      publishedData: data,
      error: null,
      dataStatus: 'loaded',
    });
  },

  loadFromUrl: async (url) => {
    set({ isLoading: true, error: null, dataStatus: 'loading' });

    try {
      const response = await fetch(url);

      // If file doesn't exist (404), silently fail - data not published yet
      if (response.status === 404) {
        set({
          publishedData: null,
          isLoading: false,
          error: null,
          dataStatus: 'notPublished',
        });
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Validate the data structure
      if (!data.metadata || !data.summary || !data.routes) {
        throw new Error('Invalid data format');
      }

      set({
        publishedData: data as PublishedData,
        isLoading: false,
        dataStatus: 'loaded',
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load data',
        isLoading: false,
        dataStatus: 'error',
      });
    }
  },

  loadFromFile: async (file) => {
    set({ isLoading: true, error: null, dataStatus: 'loading' });

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate the data structure
      if (!data.metadata || !data.summary || !data.routes) {
        throw new Error('Invalid data format');
      }

      set({
        publishedData: data as PublishedData,
        isLoading: false,
        dataStatus: 'loaded',
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load file',
        isLoading: false,
        dataStatus: 'error',
      });
    }
  },

  reset: () => {
    set({
      publishedData: null,
      isLoading: false,
      error: null,
      dataStatus: 'idle',
    });
  },

  setError: (error) => {
    set({ error });
  },
}));
