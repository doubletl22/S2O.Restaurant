// file: lib/api.ts
import axios from 'axios';
import { getCookie } from 'cookies-next'; // Cần cài: npm install cookies-next

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Interceptor: Tự động gắn Token vào Header
api.interceptors.request.use((config) => {
  // Lấy token từ cookie (nơi chúng ta sẽ lưu sau khi login)
  const token = getCookie('access_token'); 
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Interceptor: Xử lý lỗi chung (Ví dụ: 401 Unauthorized thì đá về login)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ -> Redirect về login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;