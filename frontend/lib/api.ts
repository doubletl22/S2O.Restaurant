import axios from "axios";
import { getCookie } from "cookies-next";

const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");

const api = axios.create({
  baseURL: base, // bạn đã set NEXT_PUBLIC_API_URL=http://localhost:5000
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getCookie("token");
  const tenantId = getCookie("tenant_id");

  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (tenantId) config.headers["X-Tenant-ID"] = tenantId;

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // log rõ request nào fail
    const method = err?.config?.method?.toUpperCase?.() || "UNKNOWN";
    const url = `${err?.config?.baseURL || ""}${err?.config?.url || ""}`;
    // eslint-disable-next-line no-console
    console.error(`[API ERROR] ${method} ${url}`, err?.response?.status, err?.response?.data || err?.message);
    return Promise.reject(err);
  }
);

export default api;
