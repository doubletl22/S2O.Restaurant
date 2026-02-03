import http from "@/lib/http";
import { Result, DashboardStats, OrderStatus, Order, Product, StaffProfile } from "@/lib/types";

/**
 * Lưu ý:
 * - Backend hiện KHÔNG có /api/v1/reports, file này trước đây mock.
 * - Vì vậy ta lấy dữ liệu THẬT từ các API sẵn có:
 *    - Orders:   GET /api/v1/orders
 *    - Products: GET /api/v1/products
 *    - Staff:    GET /api/v1/staff
 *  rồi tổng hợp ngay ở frontend cho Owner Dashboard + Revenue.
 */

export interface RevenueChartData {
  date: string;   // dd/MM/yyyy (vi-VN)
  revenue: number;
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function parseOrderDate(o: any): Date {
  const raw = o?.createdAt || o?.createdOn || o?.createdAtUtc;
  const d = raw ? new Date(raw) : new Date();
  return isNaN(d.getTime()) ? new Date() : d;
}

function formatDateVN(d: Date) {
  return d.toLocaleDateString("vi-VN");
}

function sumRevenue(orders: Order[]) {
  return orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
}

export const ownerReportService = {
  /**
   * Tổng hợp số liệu dashboard từ dữ liệu thật
   */
  getDashboardStats: async (): Promise<Result<DashboardStats>> => {
    try {
      const [orders, products, staffs] = await Promise.all([
        http.get<Order[]>("/api/v1/orders"),
        http.get<Product[]>("/api/v1/products"),
        http.get<StaffProfile[]>("/api/v1/staff"),
      ]);

      const allOrders: Order[] = Array.isArray(orders) ? orders : [];
      const allProducts: Product[] = Array.isArray(products) ? products : [];
      const allStaffs: StaffProfile[] = Array.isArray(staffs) ? staffs : [];

      const today = new Date();

      const todayOrders = allOrders.filter((o) => isSameDay(parseOrderDate(o), today));
      const completedOrders = allOrders.filter((o) => o.status === OrderStatus.Completed);
      const todayCompleted = todayOrders.filter((o) => o.status === OrderStatus.Completed);

      const activeOrders = allOrders.filter(
        (o) => o.status !== OrderStatus.Completed && o.status !== OrderStatus.Cancelled
      );

      // Top selling (tính theo các order đã Completed)
      const productQty = new Map<string, { name: string; qty: number }>();
      for (const o of completedOrders) {
        for (const it of o.items || []) {
          const key = it.productId || it.productName || it.id;
          if (!key) continue;
          const curr = productQty.get(key) || { name: it.productName || "Unknown", qty: 0 };
          curr.qty += it.quantity || 0;
          productQty.set(key, curr);
        }
      }
      const topSellingProducts = Array.from(productQty.values())
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5)
        .map((x) => ({ name: x.name, quantity: x.qty }));

      // Recent orders
      const recentOrders = [...allOrders]
        .sort((a, b) => parseOrderDate(b).getTime() - parseOrderDate(a).getTime())
        .slice(0, 3);

      const stats: DashboardStats = {
        totalRevenue: sumRevenue(completedOrders),
        todayRevenue: sumRevenue(todayCompleted),
        totalOrders: allOrders.length,
        todayOrders: todayOrders.length,
        activeOrders: activeOrders.length,
        totalProducts: allProducts.length,
        totalStaff: allStaffs.length,
        topSellingProducts,
        recentOrders,
      };

      return { isSuccess: true, value: stats };
    } catch (e: any) {
      return {
        isSuccess: false,
        value: null as any,
        error: {
          code: "DASHBOARD_ERROR",
          description: "Không thể tải dữ liệu dashboard",
          message: e?.message || "Request failed",
        },
      };
    }
  },

  /**
   * Lấy dữ liệu doanh thu THẬT theo khoảng ngày.
   * - FE tự tổng hợp theo ngày từ Orders đã Completed.
   */
  getRevenueByRange: async (from: Date, to: Date): Promise<Result<RevenueChartData[]>> => {
    try {
      const orders = await http.get<Order[]>("/api/v1/orders");
      const allOrders: Order[] = Array.isArray(orders) ? orders : [];

      const fromD = startOfDay(from);
      const toD = endOfDay(to);

      const completed = allOrders.filter((o) => o.status === OrderStatus.Completed);

      // group by day
      const map = new Map<string, number>(); // key yyyy-mm-dd
      for (const o of completed) {
        const d = parseOrderDate(o);
        if (d < fromD || d > toD) continue;

        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
          d.getDate()
        ).padStart(2, "0")}`;

        map.set(key, (map.get(key) || 0) + (o.totalAmount || 0));
      }

      // build continuous series
      const out: RevenueChartData[] = [];
      for (let d = new Date(fromD); d <= toD; d.setDate(d.getDate() + 1)) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
          d.getDate()
        ).padStart(2, "0")}`;
        out.push({ date: formatDateVN(new Date(d)), revenue: map.get(key) || 0 });
      }

      return { isSuccess: true, value: out };
    } catch (e: any) {
      return {
        isSuccess: false,
        value: [],
        error: {
          code: "REVENUE_ERROR",
          description: "Không thể tải dữ liệu doanh thu",
          message: e?.message || "Request failed",
        },
      };
    }
  },

  /**
   * Helper export CSV doanh thu theo range (Client-side).
   */
  exportRevenueCsv: async (from: Date, to: Date): Promise<Result<string>> => {
    const res = await ownerReportService.getRevenueByRange(from, to);
    if (!res.isSuccess) return { isSuccess: false, value: "", error: res.error };

    const lines = ["date,revenue"];
    for (const row of res.value) {
      lines.push(`${row.date},${row.revenue}`);
    }
    return { isSuccess: true, value: lines.join("\\n") };
  },
};
