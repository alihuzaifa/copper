import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { store } from '@/store/store';
import { logout } from '@/store/slices/authSlice';
import type { RootState } from '@/store/store';

interface ApiError {
  message: string;
  status: number;
  data?: unknown;
}

// Create axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
  baseURL: `https://stock.hsusayausbs.xyz/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const state = store.getState() as RootState;
    const token = state.auth.token;
    
    if (token && config.headers) {
      // Remove any existing Bearer prefix to avoid duplication
      const cleanToken = token.replace('Bearer ', '');
      config.headers.Authorization = `Bearer ${cleanToken}`;
    }
    return config;
  }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error: AxiosError<{ message?: string }>) => {
    // Log detailed error information
    console.log('Error details:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      fullResponse: error.response?.data,
      requestHeaders: error.config?.headers
    });

    if (error.response?.status === 401) {
      // if (window.location.pathname !== '/login') {
      //   store.dispatch(logout());
      //   window.location.href = '/login';
      // }
    }

    const apiError: ApiError = {
      message: error.response?.data?.message || error.message || 'An error occurred',
      status: error.response?.status || 500,
      data: error.response?.data
    };
    throw apiError;
  }
);

// HTTP method type
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Generic request configuration type
interface RequestConfig<TData> {
  url: string;
  method?: HttpMethod;
  data?: TData;
  params?: Record<string, string | number | boolean>;
}

export async function request<TData, TResponse>({
  url,
  method = 'GET',
  data,
  params
}: RequestConfig<TData>): Promise<TResponse> {
  const config: AxiosRequestConfig = {
    url,
    method,
    params,
    data
  };

  return axiosInstance.request<TData, TResponse>(config);
}

export type { RequestConfig, HttpMethod, ApiError };
export default request;

// User related types
export interface ApiUser {
  _id: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  categoryId: number;
  role: string;
  status: 'active' | 'inactive';
  shopId: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  totalAmount?: number;
  paidAmount?: number;
  remainingAmount?: number;
}

export interface Category {
  id: number;
  name: string;
}

export interface GetUsersResponse {
  success: boolean;
  message?: string;
  data: ApiUser[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface GetCategoriesResponse {
  success: boolean;
  message?: string;
  data: Category[];
}

export interface CreateUserRequest {
  categoryId: number;
  name?: string;
  phoneNumber?: string;
  email?: string;
  password?: string;
  status?: string;
  role?: string;
}

export interface CreateUserResponse {
  success: boolean;
  message: string;
  data: ApiUser;
}

export interface UpdateUserRequest {
  categoryId?: number;
  name?: string;
  phoneNumber?: string;
  email?: string;
  password?: string;
  status?: string;
  role?: string;
}

export interface UpdateUserResponse {
  success: boolean;
  message: string;
  data: ApiUser;
}

export interface DeleteUserResponse {
  success: boolean;
  message: string;
}

export interface ToggleUserStatusResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    status: 'active' | 'inactive';
  };
} 