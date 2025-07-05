import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
const getInitialTheme = (): Settings['theme'] => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('copper-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  }
  return 'light';
};

const initialState: Settings = {
  ...defaultSettings,
  theme: getInitialTheme(),
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<Settings>>) => {
      const newSettings = action.payload;
      if (newSettings.theme) {
        localStorage.setItem('copper-theme', newSettings.theme);
      }
      return { ...state, ...newSettings };
    },
    resetSettings: () => defaultSettings,
  },
});

export const { updateSettings, resetSettings } = settingsSlice.actions;

export default settingsSlice.reducer; 