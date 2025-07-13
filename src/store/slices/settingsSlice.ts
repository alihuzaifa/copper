import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// API Settings Response type
export interface SettingsResponse {
  _id: string;
  shopId: string;
  shopName: string;
  softwareName: string;
  shopAddress: string;
  shopDescription: string;
  firstOwnerName: string;
  firstOwnerNumber1: string;
  firstOwnerNumber2?: string;
  secondOwnerName?: string;
  secondOwnerNumber1?: string;
  secondOwnerNumber2?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
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
  // API Settings
  apiSettings: SettingsResponse | null;
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
  apiSettings: null,
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
    setSettings: (state, action: PayloadAction<SettingsResponse>) => {
      state.apiSettings = action.payload;
    },
    resetSettings: () => defaultSettings,
  },
});

export const { updateSettings, setSettings, resetSettings } = settingsSlice.actions;

export default settingsSlice.reducer; 