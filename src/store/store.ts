import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface WorkflowItem {
  id: string;
  stage: number;
  status: string;
  data: any;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  sidebarCollapsed: boolean;
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
  };
  displayDensity: 'comfortable' | 'compact' | 'standard';
}

export type AuthStep = 'login' | 'signup' | 'forgot-password' | 'verify-otp' | 'reset-password';
export type Theme = 'light' | 'dark';

interface StoreState {
  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // Auth State
  user: User | null;
  token: string | null;
  authStep: AuthStep;
  authEmail: string | null;
  isOtpVerified: boolean;
  authLoading: boolean;
  authError: string | null;

  // Workflow State
  currentStage: number;
  workflowItems: WorkflowItem[];

  // Settings State
  settings: Settings;

  // Auth Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setAuthStep: (step: AuthStep) => void;
  setAuthEmail: (email: string | null) => void;
  setIsOtpVerified: (verified: boolean) => void;
  setAuthLoading: (loading: boolean) => void;
  setAuthError: (error: string | null) => void;
  logout: () => void;
  resetAuth: () => void;

  // Workflow Actions
  setCurrentStage: (stage: number) => void;
  addWorkflowItem: (item: WorkflowItem) => void;
  updateWorkflowItem: (id: string, updates: Partial<WorkflowItem>) => void;
  removeWorkflowItem: (id: string) => void;
  getWorkflowItemsByStage: (stage: number) => WorkflowItem[];

  // Settings Actions
  updateSettings: (settings: Partial<Settings>) => void;
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  theme: 'system',
  language: 'en',
  sidebarCollapsed: false,
  notifications: {
    email: true,
    push: true,
    desktop: true,
  },
  displayDensity: 'standard',
};

// Get initial theme from system preference
const getInitialTheme = (): Theme => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // First try to get theme from localStorage
    const savedTheme = localStorage.getItem('copper-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }

    // If no saved theme, use system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  }
  return 'light';
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Theme
      theme: getInitialTheme(),
      setTheme: (theme) => {
        set({ theme });
        if (typeof window !== 'undefined') {
          localStorage.setItem('copper-theme', theme);
        }
      },

      // Auth State
      user: null,
      token: null,
      authStep: 'login',
      authEmail: null,
      isOtpVerified: false,
      authLoading: false,
      authError: null,

      // Initial Workflow State
      currentStage: 1,
      workflowItems: [],

      // Initial Settings State
      settings: defaultSettings,

      // Auth Actions
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setAuthStep: (step) => set({ authStep: step }),
      setAuthEmail: (email) => set({ authEmail: email }),
      setIsOtpVerified: (verified) => set({ isOtpVerified: verified }),
      setAuthLoading: (loading) => set({ authLoading: loading }),
      setAuthError: (error) => set({ authError: error }),
      logout: () => {
        set({
          user: null,
          token: null,
          authStep: 'login',
          authEmail: null,
          isOtpVerified: false,
          authError: null,
        });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('copper-storage');
        }
      },
      resetAuth: () => set({
        authStep: 'login',
        authEmail: null,
        isOtpVerified: false,
        authError: null,
      }),

      // Workflow Actions
      setCurrentStage: (stage) => set({ currentStage: stage }),
      addWorkflowItem: (item) => set((state) => ({
        workflowItems: [...state.workflowItems, item]
      })),
      updateWorkflowItem: (id, updates) => set((state) => ({
        workflowItems: state.workflowItems.map((item) =>
          item.id === id
            ? { ...item, ...updates, updatedAt: new Date().toISOString() }
            : item
        ),
      })),
      removeWorkflowItem: (id) => set((state) => ({
        workflowItems: state.workflowItems.filter((item) => item.id !== id),
      })),
      getWorkflowItemsByStage: (stage) => {
        return get().workflowItems.filter((item) => item.stage === stage);
      },

      // Settings Actions
      updateSettings: (newSettings) => set((state) => ({
        settings: {
          ...state.settings,
          ...newSettings,
          notifications: {
            ...state.settings.notifications,
            ...newSettings.notifications,
          },
        },
      })),
      resetSettings: () => set({ settings: defaultSettings }),
    }),
    {
      name: 'copper-storage',
      partialize: (state) => ({
        theme: state.theme,
        token: state.token,
        user: state.user,
        workflowItems: state.workflowItems,
        settings: state.settings,
      }),
    }
  )
); 