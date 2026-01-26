import axios from 'axios';
import { getCookie } from 'cookies-next';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // Nhận giá trị từ .env.local
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getCookie('access_token');
  
  // Giả sử bạn lưu tenant_id vào cookie lúc login luôn
  // Nếu chưa có, bạn có thể hardcode một ID tenant của bạn để test trước
  const tenantId = getCookie('tenant_id') || "ff644609-666d-4cc3-9ca7-dcab16ab4c73"; // ID lấy từ ví dụ JSON bạn gửi
  console.log(">>> Đang gọi API:", config.url);
  console.log(">>> Token gửi đi:", token ? "Có token (Bearer ...)" : "KHÔNG CÓ TOKEN!");
  console.log(">>> TenantId:", tenantId);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // QUAN TRỌNG: Gửi thêm TenantId để Backend biết đang làm việc với quán nào
  if (tenantId) {
    config.headers['X-Tenant-Id'] = tenantId; 
  }
  
  return config;
});

// 2. Interceptor: Xử lý lỗi chung (Ví dụ: 401 Unauthorized thì đá về login)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ -> Redirect về login
      //window.location.href = '/login';
      alert("Lỗi 401: Không có quyền truy cập API!");
    }
    return Promise.reject(error);
  }
);

export default api;