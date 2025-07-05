import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  authStep: 'login' | 'signup' | 'forgot-password' | 'verify-otp' | 'reset-password';
  authEmail: string | null;
  isOtpVerified: boolean;
  authLoading: boolean;
  authError: string | null;
}

// Load initial state from localStorage if available
const loadState = (): AuthState => {
  try {
    const serializedToken = localStorage.getItem('auth_token');
    const serializedUser = localStorage.getItem('auth_user');
    return {
      user: serializedUser ? JSON.parse(serializedUser) : null,
      token: serializedToken,
      authStep: 'login',
      authEmail: null,
      isOtpVerified: false,
      authLoading: false,
      authError: null,
    };
  } catch (err) {
    return {
      user: null,
      token: null,
      authStep: 'login',
      authEmail: null,
      isOtpVerified: false,
      authLoading: false,
      authError: null,
    };
  }
};

const initialState: AuthState = loadState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      if (action.payload) {
        localStorage.setItem('auth_user', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('auth_user');
      }
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
      if (action.payload) {
        localStorage.setItem('auth_token', action.payload);
      } else {
        localStorage.removeItem('auth_token');
      }
    },
    setAuthStep: (state, action: PayloadAction<AuthState['authStep']>) => {
      state.authStep = action.payload;
    },
    setAuthEmail: (state, action: PayloadAction<string | null>) => {
      state.authEmail = action.payload;
    },
    setIsOtpVerified: (state, action: PayloadAction<boolean>) => {
      state.isOtpVerified = action.payload;
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.authLoading = action.payload;
    },
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.authError = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.authStep = 'login';
      state.authEmail = null;
      state.isOtpVerified = false;
      state.authError = null;
      // Clear localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    },
    resetAuth: (state) => {
      state.authStep = 'login';
      state.authEmail = null;
      state.isOtpVerified = false;
      state.authError = null;
    },
  },
});

export const {
  setUser,
  setToken,
  setAuthStep,
  setAuthEmail,
  setIsOtpVerified,
  setAuthLoading,
  setAuthError,
  logout,
  resetAuth,
} = authSlice.actions;

export default authSlice.reducer; 