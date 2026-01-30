import http from "@/lib/http";
import { Result, SysAdminStats } from "@/lib/types";

// Endpoint giả định (chưa có thật)
const REPORT_ENDPOINT = "/api/admin-reports"; 

export const adminService = {
  // Lấy thống kê tổng quan (Dashboard)
  getStats: async (): Promise<Result<SysAdminStats>> => {
    try {
      // Thử gọi API thật
      return await http.get(`${REPORT_ENDPOINT}/dashboard`);
    } catch (error) {
      console.warn("API Dashboard chưa sẵn sàng, sử dụng dữ liệu giả lập (Mock Data).");
      
      // Trả về dữ liệu giả để UI không bị lỗi 404
      return {
        isSuccess: true,
        isFailure: false,
        error: null,
        value: {
          totalTenants: 12,
          activeTenants: 10,
          totalRevenue: 15000000,
          totalUsers: 45,
          recentTenants: [
            {
              id: "mock-1",
              name: "Nhà hàng Biển Đông",
              planType: "Premium",
              isActive: true,
              isLocked: false,
              createdAt: new Date().toISOString(),
              ownerEmail: "owner1@biendong.com"
            },
            {
              id: "mock-2",
              name: "Kichi Kichi Mock",
              planType: "Enterprise",
              isActive: true,
              isLocked: false,
              createdAt: new Date(Date.now() - 86400000).toISOString(), // Hôm qua
              ownerEmail: "admin@kichi.com"
            }
          ]
        }
      };
    }
  }
};