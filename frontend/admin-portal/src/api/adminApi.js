import axios from "axios";

const adminApi = axios.create({
  // Gọi vào cổng Gateway 5000 (Cổng chính của hệ thống)
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Tự động gắn Token vào mỗi request (để sau này gọi API lấy dữ liệu không bị chặn)
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default adminApi;
