import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'sonner';

const config: AxiosRequestConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
};

const http: AxiosInstance = axios.create(config);

// Request Interceptor: Gắn Token
http.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Xử lý lỗi & Data unwrapping
http.interceptors.response.use(
  (response: AxiosResponse) => {
    // Trả về data raw từ backend (thường là dạng Result<T>)
    return response.data;
  },
  (error: AxiosError<any>) => {
    const status = error.response?.status;
    // Nếu backend trả về lỗi dạng Result failure
    const errorMessage = error.response?.data?.error?.message || error.message || 'Đã có lỗi xảy ra';

    if (status === 401) {
      // Xử lý hết hạn session
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
         toast.error("Phiên đăng nhập hết hạn");
         localStorage.clear();
         window.location.href = '/login';
      }
    } else {
        // Chỉ toast nếu không phải 401 (để tránh spam khi redirect)
        // toast.error(errorMessage); // Có thể comment lại để page tự handle
    }
    
    return Promise.reject(error.response?.data || error);
  }
);

export default http;