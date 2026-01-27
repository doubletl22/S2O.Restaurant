import axios from 'axios';
import { getCookie } from 'cookies-next';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, 
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getCookie('access_token');
  
  const tenantId = getCookie('tenant_id') || "ff644609-666d-4cc3-9ca7-dcab16ab4c73"; 
  console.log(">>> Đang gọi API:", config.url);
  console.log(">>> Token gửi đi:", token ? "Có token (Bearer ...)" : "KHÔNG CÓ TOKEN!");
  console.log(">>> TenantId:", tenantId);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (tenantId) {
    config.headers['X-Tenant-Id'] = tenantId; 
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      alert("Lỗi 401: Không có quyền truy cập API!");
    }
    return Promise.reject(error);
  }
);

export default api;