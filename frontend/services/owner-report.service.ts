import http from "@/lib/http";
import { Result, DashboardStats, OrderStatus } from "@/lib/types";

const ENDPOINT = "/api/v1/reports"; 

export interface RevenueChartData {
  date: string;
  revenue: number;
}

export const ownerReportService = {
  // GET /api/v1/reports/dashboard
  getDashboardStats: async (): Promise<Result<DashboardStats>> => {
    // [MOCK] Trả về dữ liệu giả để UI không bị trắng trang nếu API chưa sẵn sàng
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          isSuccess: true,
          value: {
            totalRevenue: 15400000,
            todayRevenue: 2500000,
            totalOrders: 150,
            todayOrders: 24,
            activeOrders: 5,
            totalProducts: 45,
            totalStaff: 8,
            topSellingProducts: [
              { name: "Phở Bò Đặc Biệt", quantity: 120 },
              { name: "Cà Phê Sữa Đá", quantity: 95 }
            ],
            recentOrders: [
              {
                id: "ord-001",
                orderNumber: "101",
                tableName: "Bàn 01",
                status: OrderStatus.Served,
                totalAmount: 150000,
                createdOn: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                items: []
              },
              {
                id: "ord-002",
                orderNumber: "102",
                tableName: "Bàn 05",
                status: OrderStatus.Cooking,
                totalAmount: 320000,
                createdOn: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                items: []
              },
              {
                id: "ord-003",
                orderNumber: "103",
                tableName: "Bàn 02",
                status: OrderStatus.Pending,
                totalAmount: 85000,
                createdOn: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                items: []
              }
            ]
          }
        });
      }, 800); // Giả lập độ trễ mạng
    });

    // Khi có API thật, bỏ comment dòng dưới:
    // return await http.get(`${ENDPOINT}/dashboard`);
  },

  // GET /api/v1/reports/revenue
  getRevenueData: async (days: number = 7): Promise<Result<RevenueChartData[]>> => {
    // [MOCK] Dữ liệu biểu đồ
    return {
      isSuccess: true,
      value: Array.from({ length: days }).map((_, i) => ({
        date: new Date(Date.now() - (days - 1 - i) * 86400000).toLocaleDateString('vi-VN'),
        revenue: Math.floor(Math.random() * 2000000) + 1000000
      }))
    };
    // API thật: return await http.get(`${ENDPOINT}/revenue`, { params: { days } });
  }
};