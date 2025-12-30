import { create } from 'zustand';
import type { PublishedData } from '@/lib/analysis/publishTypes';

interface ViewerState {
  // Published data
  publishedData: PublishedData | null;

  // Status
  isLoading: boolean;
  error: string | null;

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

  // Actions
  loadPublishedData: (data) => {
    set({
      publishedData: data,
      error: null,
    });
  },

  loadFromUrl: async (url) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch(url);
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
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load data',
        isLoading: false,
      });
    }
  },

  loadFromFile: async (file) => {
    set({ isLoading: true, error: null });

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
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load file',
        isLoading: false,
      });
    }
  },

  reset: () => {
    set({
      publishedData: null,
      isLoading: false,
      error: null,
    });
  },

  setError: (error) => {
    set({ error });
  },
}));
