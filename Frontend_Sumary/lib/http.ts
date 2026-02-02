import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'sonner';

const config: AxiosRequestConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
};

const http: AxiosInstance = axios.create(config);

http.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

http.interceptors.response.use(
  (response: AxiosResponse) => response.data, // Unwrap data
  (error: AxiosError<any>) => {
    const status = error.response?.status;
    if (status === 401 && typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
       toast.error("Phiên đăng nhập hết hạn");
       localStorage.clear();
       window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default http;