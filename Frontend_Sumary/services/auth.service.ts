import http from "@/lib/http";
import { LoginBody, RegisterTenantBody, LoginResponse } from "@/lib/types";

export const authService = {
  // Login: /api/v1/auth/login
  login: async (body: LoginBody) => {
    // [FIX] Không destructure { data } vì http interceptor đã unwrap data rồi.
    // Ép kiểu 'as any' để tránh xung đột type với Axios nếu cần thiết
    const response = await http.post<LoginResponse>("/api/v1/auth/login", body);
    return response as unknown as LoginResponse;
  },

  // Đăng ký quán mới: /api/v1/tenants/registration
  registerTenant: async (body: RegisterTenantBody) => {
    const response = await http.post("/api/v1/tenants/registration", body);
    return response;
  },

  // Refresh Token
  refreshToken: async () => {
    const response = await http.post("/api/v1/auth/refresh-token");
    return response;
  },
  
  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
  }
};