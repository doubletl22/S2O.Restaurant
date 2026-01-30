import axios from 'axios';
import { getCookie } from 'cookies-next';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getCookie('token');        
    const tenantId = getCookie('tenant_id'); 

    // ===== DEBUG (rất nên giữ khi dev) =====
    console.log(">>> Đang gọi API:", config.url);
    console.log(">>> Token:", token ? "Có (Bearer ...)" : "❌ Không có token");
    console.log(">>> Tenant ID:", tenantId || "❌ Không có tenant");

    // ===== GẮN HEADER CHUẨN BACKEND =====
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId; // ⚠ đúng key backend đọc
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("❌ API ERROR:", {
        url: error.config?.url,
        status: error.response.status,
        data: error.response.data,
      });

      if (error.response.status === 401) {
        alert("Phiên đăng nhập hết hạn hoặc thiếu token!");
      }

      if (error.response.status === 403) {
        alert("Không có quyền với tenant này!");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
