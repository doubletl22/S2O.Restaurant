import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';
import { toast } from 'sonner';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
console.log(" [HTTP Client] Base URL:", apiUrl);

const config: AxiosRequestConfig = {
  baseURL: apiUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
};

const http: AxiosInstance = axios.create(config);


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


http.interceptors.response.use(
  (response: AxiosResponse) => response.data,

  (error: AxiosError<any>) => {
    const status = error.response?.status;

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');

      if (
        status === 401 &&
        token && 
        !window.location.pathname.includes('/login')
      ) {
        toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.');
        
        // Xóa token cũ
        localStorage.removeItem('accessToken'); 
        
        // Chuyển hướng về trang login
        window.location.href = '/login';
      }
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default http;