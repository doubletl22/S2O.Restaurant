import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { toast } from "sonner";
import { getCookie } from "cookies-next";

const config: AxiosRequestConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
};

const http: AxiosInstance = axios.create(config);

/**
 * NOTE:
 * - Project này đang lưu token ở cookie (token, tenant_id) sau khi login.
 * - Một số phần cũ dùng localStorage(accessToken). Để không vỡ, ta fallback cả 2.
 */
http.interceptors.request.use(
  (cfg) => {
    if (typeof window !== "undefined") {
      // ✅ ưu tiên cookie
      const tokenFromCookie = getCookie("token") as string | undefined;
      const tenantIdFromCookie = getCookie("tenant_id") as string | undefined;

      // ✅ fallback localStorage (code cũ)
      const tokenFromLocal = window.localStorage.getItem("accessToken") || undefined;

      const token = tokenFromCookie || tokenFromLocal;

      if (token && cfg.headers) cfg.headers.Authorization = `Bearer ${token}`;
      if (tenantIdFromCookie && cfg.headers) cfg.headers["X-Tenant-ID"] = tenantIdFromCookie;
    }
    return cfg;
  },
  (error) => Promise.reject(error)
);

http.interceptors.response.use(
  (response: AxiosResponse) => response.data, // unwrap data
  (error: AxiosError<any>) => {
    const status = error.response?.status;

    if (
      status === 401 &&
      typeof window !== "undefined" &&
      !window.location.pathname.includes("/login")
    ) {
      toast.error("Phiên đăng nhập hết hạn");
      try {
        window.localStorage.clear();
      } catch {}
      window.location.href = "/login";
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default http;
