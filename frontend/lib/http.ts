import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';
import { toast } from 'sonner';

// [DEBUG] In ra console để kiểm tra xem Next.js đã load được biến môi trường chưa
// Bạn có thể xem log này ở Terminal (nếu SSR) hoặc F12 Console (nếu Client)
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
console.log("🚀 [HTTP Client] Base URL:", apiUrl);

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
        toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.');
        
        // Xóa token cũ
        localStorage.removeItem('accessToken'); 
        
        // Chuyển hướng về trang login
        window.location.href = '/login';
      }
    }

    // Trả lỗi về để component xử lý tiếp (hiện toast lỗi, v.v.)
    return Promise.reject(error.response?.data || error);
  }
);

export default http;