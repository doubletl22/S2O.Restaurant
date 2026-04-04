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
  
  logout: async () => {
    // Gọi API logout ở server để revoke session
    try {
      await http.post("/api/v1/auth/logout");
    } catch (error) {
      // Tiếp tục logout client-side ngay cả khi server error
      console.warn("Server logout failed:", error);
    }

    // Xóa tất cả tokens và user data từ localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    
    // Xóa tất cả cookies liên quan
    const cookiesToRemove = ["token", "role", "s2o_auth_token", "auth_token", "user_role"];
    cookiesToRemove.forEach(name => {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
    });

    // Redirect về login
    window.location.href = "/login";
  }
};