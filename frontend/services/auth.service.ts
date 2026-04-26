import http from "@/lib/http";
import { LoginBody, RegisterTenantBody, LoginResponse, LoginRequest, ChangePasswordRequest, UpdateProfileRequest, UserProfile } from "@/lib/types";

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

  getProfile: async (): Promise<UserProfile> => {
    const response = await http.get<any>("/api/users/me");
    const payload = response?.value ?? response?.Value ?? response ?? {};
    return {
      id: payload.id ?? payload.Id ?? "",
      fullName: payload.fullName ?? payload.FullName ?? "",
      email: payload.email ?? payload.Email ?? "",
      phoneNumber: payload.phoneNumber ?? payload.PhoneNumber,
      roles: payload.roles ?? payload.Roles ?? [],
    };
  },

  updateProfile: async (payload: UpdateProfileRequest) => {
    const response = await http.put("/api/users/me", payload);
    return response;
  },

  changePassword: async (payload: ChangePasswordRequest) => {
    const response = await http.post("/api/users/me/change-password", payload);
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

    // Redirect về login với flag để show thông báo
    window.location.href = "/login?logged_out=true";
  }
};
