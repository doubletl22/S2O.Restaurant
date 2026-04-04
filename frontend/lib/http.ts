import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';
import { toast } from 'sonner';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const config: AxiosRequestConfig = {
  baseURL: apiUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
};

const http: AxiosInstance = axios.create(config);

/* ================= REQUEST INTERCEPTOR ================= */

http.interceptors.request.use(
  (config) => {
    // Chỉ truy cập localStorage khi chạy ở phía Client (Browser)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');

      // Nếu có token thì gắn vào Header Authorization
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= RESPONSE INTERCEPTOR ================= */

http.interceptors.response.use(
  (response: AxiosResponse) => response.data,

  (error: AxiosError<any>) => {
    const status = error.response?.status;

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');

      // Tự động logout nếu gặp lỗi 401 (Unauthorized) và đang có token
      if (
        status === 401 &&
        token && 
        !window.location.pathname.includes('/login')
      ) {
        // Xóa token ngay để tránh request lại
        localStorage.removeItem('accessToken'); 
        localStorage.removeItem('user');
        
        // Xóa cookies
        const cookiesToRemove = ['token', 'role', 's2o_auth_token', 'auth_token', 'user_role'];
        cookiesToRemove.forEach(name => {
          document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
        });

        // Show toast + delay redirect để user thấy message
        toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.');
        setTimeout(() => {
          window.location.href = '/login?session_expired=true';
        }, 1000);
      }
    }

    // Trả lỗi về để component xử lý tiếp (hiện toast lỗi, v.v.)
    return Promise.reject(error.response?.data || error);
  }
);

export default http;