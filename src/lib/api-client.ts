import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useStore } from '@/store/store';

interface ApiError {
  message: string;
  status: number;
  data?: unknown;
}

// Create axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
  baseURL: `http://localhost:5000/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = useStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error: AxiosError<{ message?: string }>) => {
    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      useStore.getState().logout();
      window.location.href = '/login';
    }

    // Throw typed error
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

  const response = await axiosInstance.request<TData, AxiosResponse<TResponse>>(config);
  return response.data;
}

export type { RequestConfig, HttpMethod, ApiError };
export default request; 