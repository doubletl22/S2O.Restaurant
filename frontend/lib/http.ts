<<<<<<< HEAD
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'sonner';

const config: AxiosRequestConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
=======
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { getCookie } from "cookies-next";
import { toast } from "sonner";

/**
 * baseURL:
 * - ưu tiên NEXT_PUBLIC_API_URL
 * - loại bỏ dấu / cuối để tránh //route
 * - fallback: backend local
 */
const baseURL =
  (process.env.NEXT_PUBLIC_API_URL || "")
    .trim()
    .replace(/\/$/, "") || "http://localhost:5000";

const config: AxiosRequestConfig = {
  baseURL,
  headers: { "Content-Type": "application/json" },
>>>>>>> 020ff61bf (fix err big)
  timeout: 30000,
  withCredentials: false,
};

const http: AxiosInstance = axios.create(config);

<<<<<<< HEAD
http.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
=======
/*
===================================
 REQUEST INTERCEPTOR – TOKEN + TENANT
===================================
Ưu tiên:
1) Cookie (token, tenant_id)
2) Fallback localStorage (accessToken)
Ghi chú:
- Guest không có token vẫn gọi API public bình thường.
- Tránh lỗi SSR: chỉ đọc cookie khi chạy client.
*/
http.interceptors.request.use(
  (cfg) => {
    cfg.headers = cfg.headers || {};

    // ✅ Client-side only
    if (typeof window !== "undefined") {
      const tokenFromCookie = getCookie("token") as string | undefined;
      const tenantIdFromCookie = getCookie("tenant_id") as string | undefined;

      // fallback nếu bạn có lưu localStorage
      const tokenFromLocal =
        window.localStorage.getItem("accessToken") || undefined;

      const token = tokenFromCookie || tokenFromLocal;

      if (token) cfg.headers.Authorization = `Bearer ${token}`;
      if (tenantIdFromCookie) cfg.headers["X-Tenant-ID"] = tenantIdFromCookie;
    }

    // ✅ Debug route (bật nếu cần)
    // console.log("[HTTP]", cfg.method?.toUpperCase(), cfg.baseURL + (cfg.url || ""));

    return cfg;
>>>>>>> 020ff61bf (fix err big)
  },
  (error) => Promise.reject(error)
);

/*
===================================
 RESPONSE INTERCEPTOR – UNWRAP + ERROR
===================================
*/
http.interceptors.response.use(
<<<<<<< HEAD
  (response: AxiosResponse) => response.data, // Unwrap data
  (error: AxiosError<any>) => {
    const status = error.response?.status;
    if (status === 401 && typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
       toast.error("Phiên đăng nhập hết hạn");
       localStorage.clear();
       window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
=======
  (res: AxiosResponse) => res.data,
  (err: AxiosError<any>) => {
    const status = err.response?.status;
    const data = err.response?.data;

    const url =
      (err.config?.baseURL || baseURL) + (err.config?.url || "");

    // 🎯 Bắt message linh hoạt (cover nhiều format backend)
    const msg =
      data?.error?.description ||
      data?.Error?.Description ||
      data?.message ||
      data?.Message ||
      (typeof data === "string" ? data : null) ||
      err.message ||
      "Request failed";

    // ✅ Log để biết chính xác đang gọi vào đâu
    console.error("[HTTP ERROR]", {
      status,
      url,
      msg,
      data,
      method: err.config?.method,
      params: err.config?.params,
    });

    // ❗ 404: thường do sai baseURL hoặc sai route
    if (status === 404) {
      toast.error("[404] API không tồn tại (sai baseURL hoặc sai route)");
    }

    // 🔐 401: hết phiên đăng nhập (tránh loop ở /login)
    if (
      status === 401 &&
      typeof window !== "undefined" &&
      !window.location.pathname.includes("/login")
    ) {
      toast.error("Phiên đăng nhập đã hết hạn");

      try {
        window.localStorage.removeItem("accessToken");
      } catch {}

      window.location.href = "/login";
    }

    // Trả về Error gọn để UI bắt dễ
    return Promise.reject(new Error(status ? `[${status}] ${msg}` : msg));
>>>>>>> 020ff61bf (fix err big)
  }
);

export default http;