import http from "@/lib/http";
import { Result } from "@/lib/types";

const ENDPOINT = "/api/reports"; 

// DTO cho Dashboard
export interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  totalProducts: number;
  totalStaff: number;
  recentOrders: {
    id: string;
    tableName: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }[];
}

// DTO cho biểu đồ doanh thu
export interface RevenueChartData {
  date: string;
  revenue: number;
}

export const ownerReportService = {
  // Lấy thống kê tổng quan (Dashboard)
  getDashboardStats: async (): Promise<Result<DashboardStats>> => {
    return await http.get(`${ENDPOINT}/dashboard`);
  },

  // Lấy doanh thu theo khoảng thời gian (7 ngày, 30 ngày...)
  getRevenueData: async (days: number = 7): Promise<Result<RevenueChartData[]>> => {
    return await http.get(`${ENDPOINT}/revenue`, { params: { days } });
  }
};