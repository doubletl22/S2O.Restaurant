import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';
import { toast } from 'sonner';

const config: AxiosRequestConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
};

const http: AxiosInstance = axios.create(config);

/* ================= REQUEST ================= */

http.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');

      // ✅ Chỉ gắn token nếu có
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= RESPONSE ================= */

http.interceptors.response.use(
  (response: AxiosResponse) => response.data,

  (error: AxiosError<any>) => {
    const status = error.response?.status;

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');

      // ✅ CHỈ đá login nếu:
      // - Có token (đang đăng nhập)
      // - Bị 401 từ API protected
      if (
        status === 401 &&
        token && 
        !window.location.pathname.includes('/login')
      ) {
        toast.error('Phiên đăng nhập hết hạn');
        localStorage.removeItem('accessToken'); // ❗không clear hết

        window.location.href = '/login';
      }
    }

    // Trả lỗi chuẩn cho service xử lý tiếp
    return Promise.reject(error.response?.data || error);
  }
);

export default http;
