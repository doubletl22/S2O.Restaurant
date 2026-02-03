import http from "@/lib/http";
import { LoginBody, RegisterTenantBody, LoginResponse, LoginRequest } from "@/lib/types";

export const authService = {
  // Login: /api/v1/auth/login
   login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await http.post<LoginResponse>("/api/v1/auth/login", data);
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