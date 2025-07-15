import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { store } from '@/store/store';
import { setToken, setUser, logout } from '@/store/slices/authSlice';
import { resetSettings } from '@/store/slices/settingsSlice';
import { addWorkflowItem, updateWorkflowItem } from '@/store/slices/workflowSlice';

// Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Auth related types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  otp: string;
}

export interface ResetPasswordRequest {
  password: string;
  newPassword: string;
}

// Environment type augmentation
declare global {
  interface ImportMetaEnv {
    VITE_API_URL: string;
  }
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
      store.dispatch(resetSettings());
      window.location.href = '/login';
    }
    return Promise.reject({
      message: error.response?.data?.message || error.message || 'An error occurred',
      errors: error.response?.data?.errors,
    });
  }
);

// Helper function to make API calls
const makeApiCall = async <T>({ url, method = 'GET', data, params }: { 
  url: string; 
  method?: string; 
  data?: any;
  params?: any;
}): Promise<{ data: T; status: number; message?: string }> => {
  try {
    const response = await apiClient({ url, method, data, params });
    return {
      data: response.data,
      status: response.status,
      message: response.data?.message,
    };
  } catch (error) {
    throw error;
  }
};

// API service
export const apiService = {
  auth: {
    // Login with email and password
    login: async (data: LoginRequest) => {
      const response = await makeApiCall<{ token: string; user: any }>({
        url: '/auth/login',
        method: 'POST',
        data
      });
      // Update store with auth data
      store.dispatch(setToken(response.data.token));
      store.dispatch(setUser(response.data.user));
      return response;
    },

    // Sign up with name, email and password
    signup: async (data: SignupRequest) => {
      const response = await makeApiCall<{ token: string; user: any }>({
        url: '/auth/signup',
        method: 'POST',
        data
      });
      // Update store with auth data
      store.dispatch(setToken(response.data.token));
      store.dispatch(setUser(response.data.user));
      return response;
    },

    // Request OTP for forgot password
    forgotPassword: async (data: ForgotPasswordRequest) => {
      const response = await makeApiCall<{ message: string }>({
        url: '/auth/forgot-password',
        method: 'POST',
        data
      });
      return response;
    },

    // Verify OTP
    verifyOtp: async (data: VerifyOtpRequest) => {
      const response = await makeApiCall<{ message: string; verified: boolean }>({
        url: '/auth/verify-otp',
        method: 'POST',
        data
      });
      return response;
    },

    // Reset password with OTP
    resetPassword: async (data: ResetPasswordRequest) => {
      const response = await makeApiCall<{ message: string }>({
        url: '/auth/reset-password',
        method: 'POST',
        data
      });
      return response;
    },

    // Logout
    logout: async () => {
      store.dispatch(logout());
      store.dispatch(resetSettings());
      await makeApiCall({ url: '/auth/logout', method: 'POST' });
    },

    // Resend OTP
    resendOtp: async () => {
      const response = await makeApiCall<{ message: string }>({
        url: '/auth/resend-otp',
        method: 'POST'
      });
      return response;
    },
  },

  // User APIs
  users: {
    getAll: () => makeApiCall<any[]>({ url: '/users' }),
    getById: (id: string) => makeApiCall<any>({ url: `/users/${id}` }),
    create: (data: any) => makeApiCall<any>({ url: '/users', method: 'POST', data }),
    update: (id: string, data: any) => makeApiCall<any>({ url: `/users/${id}`, method: 'PUT', data }),
    delete: (id: string) => makeApiCall<void>({ url: `/users/${id}`, method: 'DELETE' }),
  },

  // Supplier APIs
  suppliers: {
    getAll: () => makeApiCall<any[]>({ url: '/suppliers' }),
    getById: (id: string) => makeApiCall<any>({ url: `/suppliers/${id}` }),
    create: (data: any) => makeApiCall<any>({ url: '/suppliers', method: 'POST', data }),
    update: (id: string, data: any) => makeApiCall<any>({ url: `/suppliers/${id}`, method: 'PUT', data }),
    delete: (id: string) => makeApiCall<void>({ url: `/suppliers/${id}`, method: 'DELETE' }),
  },

  // Transaction APIs
  transactions: {
    getAll: () => makeApiCall<any[]>({ url: '/transactions' }),
    getById: (id: string) => makeApiCall<any>({ url: `/transactions/${id}` }),
    create: (data: any) => makeApiCall<any>({ url: '/transactions', method: 'POST', data }),
  },

  // Check APIs
  checks: {
    getAll: (params?: any) => makeApiCall<{ checks: any[]; total: number }>({ url: '/checks', params }),
    getById: (id: string) => makeApiCall<any>({ url: `/checks/${id}` }),
    create: (data: any) => makeApiCall<any>({ url: '/checks', method: 'POST', data }),
    update: (id: string, data: any) => makeApiCall<any>({ url: `/checks/${id}`, method: 'PUT', data }),
    delete: (id: string) => makeApiCall<void>({ url: `/checks/${id}`, method: 'DELETE' }),
    updateStatus: (id: string, status: string) => makeApiCall<any>({ url: `/checks/${id}/status`, method: 'PUT', data: { status } }),
  },

  // Workflow APIs
  workflow: {
    // Purchase Management
    purchases: {
      getAll: async () => {
        const response = await makeApiCall<any[]>({ url: '/workflow/purchases' });
        return response;
      },
      create: async (data: any) => {
        const response = await makeApiCall<any>({ url: '/workflow/purchases', method: 'POST', data });
        store.dispatch(addWorkflowItem(response.data));
        return response;
      },
      update: async (id: string, data: any) => {
        const response = await makeApiCall<any>({ url: `/workflow/purchases/${id}`, method: 'PUT', data });
        store.dispatch(updateWorkflowItem({ id, updates: response.data }));
        return response;
      },
    },
    // Kacha Processing
    kachaProcessing: {
      getAll: () => makeApiCall<any[]>({ url: '/workflow/kacha-processing' }),
      create: (data: any) => makeApiCall<any>({ url: '/workflow/kacha-processing', method: 'POST', data }),
      update: (id: string, data: any) => makeApiCall<any>({ url: `/workflow/kacha-processing/${id}`, method: 'PUT', data }),
    },
    // Draw Process
    drawProcess: {
      getAll: () => makeApiCall<any[]>({ url: '/workflow/draw-process' }),
      create: (data: any) => makeApiCall<any>({ url: '/workflow/draw-process', method: 'POST', data }),
      update: (id: string, data: any) => makeApiCall<any>({ url: `/workflow/draw-process/${id}`, method: 'PUT', data }),
    },
  },

  // Custom API call
  custom: <T>(endpoint: string, method: string, data?: any, params?: any) => 
    makeApiCall<T>({ url: endpoint, method, data, params }),
};

export default apiService; 