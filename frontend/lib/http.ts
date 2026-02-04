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

<<<<<<< HEAD
=======
/* ================= REQUEST ================= */
>>>>>>> 98f502a017b968266f72ce2c7b3d1a9609db6743

http.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');

<<<<<<< HEAD
=======
      // ✅ Chỉ gắn token nếu có
>>>>>>> 98f502a017b968266f72ce2c7b3d1a9609db6743
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

<<<<<<< HEAD
=======
/* ================= RESPONSE ================= */
>>>>>>> 98f502a017b968266f72ce2c7b3d1a9609db6743

http.interceptors.response.use(
  (response: AxiosResponse) => response.data,

  (error: AxiosError<any>) => {
    const status = error.response?.status;

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');

<<<<<<< HEAD
=======
      // ✅ CHỈ đá login nếu:
      // - Có token (đang đăng nhập)
      // - Bị 401 từ API protected
>>>>>>> 98f502a017b968266f72ce2c7b3d1a9609db6743
      if (
        status === 401 &&
        token && 
        !window.location.pathname.includes('/login')
      ) {
<<<<<<< HEAD
        toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.');
        
        // Xóa token cũ
        localStorage.removeItem('accessToken'); 
        
        // Chuyển hướng về trang login
=======
        toast.error('Phiên đăng nhập hết hạn');
        localStorage.removeItem('accessToken'); // ❗không clear hết

>>>>>>> 98f502a017b968266f72ce2c7b3d1a9609db6743
        window.location.href = '/login';
      }
    }

<<<<<<< HEAD
=======
    // Trả lỗi chuẩn cho service xử lý tiếp
>>>>>>> 98f502a017b968266f72ce2c7b3d1a9609db6743
    return Promise.reject(error.response?.data || error);
  }
);

export default http;
