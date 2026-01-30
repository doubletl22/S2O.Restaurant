import http from "@/lib/http";
import { LoginResponse, Result, User } from "@/lib/types";

// Endpoint trỏ tới S2O.Gateway -> S2O.Identity.Api
const ENDPOINT = "/api/auth";

export interface LoginRequest {
  email: string;
  password: string;
}

export const authService = {
  // 1. Đăng nhập
  login: async (credentials: LoginRequest): Promise<Result<LoginResponse>> => {
    // Gọi POST /api/auth/login
    const response: any = await http.post(`${ENDPOINT}/login`, credentials);

    // FIX: Kiểm tra xem Backend trả về dạng Wrapper hay Raw Data
    
    // Trường hợp 1: Backend trả về Result Wrapper chuẩn (có isSuccess)
    if (response && typeof response.isSuccess === 'boolean') {
      return response as Result<LoginResponse>;
    }

    // Trường hợp 2: Backend trả về Raw Data thành công (có accessToken)
    // Tự động đóng gói lại thành Result thành công để Frontend hiểu
    if (response && response.accessToken) {
      return {
        isSuccess: true,
        isFailure: false,
        error: null,
        value: response as LoginResponse
      };
    }

    // Trường hợp 3: Phản hồi không xác định (Lỗi không đúng format)
    return {
      isSuccess: false,
      isFailure: true,
      error: { code: 'UNKNOWN', message: 'Phản hồi từ server không đúng định dạng mong đợi' },
      value: null as any
    };
  },

  // ... giữ nguyên các hàm setSession, getCurrentUser, logout ...
  // 2. Lưu phiên làm việc (Chạy sau khi login thành công)
  
  // 3. Lấy thông tin user hiện tại từ LocalStorage
  getCurrentUser: (): User | null => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) return JSON.parse(userStr) as User;
    }
    return null;
  },

  // 4. Đăng xuất
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      // Redirect về login hoặc trang chủ
      window.location.href = "/login";
    }
  },
  
  // 5. Kiểm tra quyền (Optional Helper)
  hasRole: (role: string): boolean => {
    const user = authService.getCurrentUser();
    return user?.roles?.includes(role) ?? false;
  }
};