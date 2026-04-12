import http from "@/lib/http";
import { Result, DashboardStats, OrderStatus } from "@/lib/types";
import { ownerStaffService } from "@/services/owner-staff.service";
import { productService } from "@/services/product.service";
import { branchService } from "@/services/branch.service";

const ENDPOINT = "/api/v1/reports"; 

export interface RevenueChartData {
  date: string;
  revenue: number;
}

export interface BranchRevenueData {
  branchId: string;
  branchName: string;
  revenue: number;
  orderCount: number;
  percentage: number;
}

type AnyOrder = {
  id: string;
  orderNumber?: string;
  tableName?: string;
  status: number | string;
  totalAmount?: number;
  createdAt?: string;
  createdOn?: string;
  createdAtUtc?: string;
  items?: Array<{ productName?: string; quantity?: number }>;
};

function toOrderStatus(status: unknown): OrderStatus {
  if (typeof status === "number") return status as OrderStatus;

  const key = String(status ?? "").toLowerCase();
  if (key === "pending") return OrderStatus.Pending;
  if (key === "confirmed") return OrderStatus.Confirmed;
  if (key === "cooking" || key === "processing") return OrderStatus.Cooking;
  if (key === "ready") return OrderStatus.Ready;
  if (key === "completed" || key === "complete") return OrderStatus.Completed;
  if (key === "cancelled" || key === "canceled") return OrderStatus.Cancelled;
  if (key === "paid" || key === "served") return OrderStatus.Served;
  return OrderStatus.Pending;
}

function getOrderCreatedAt(order: AnyOrder): string {
  return String(order.createdAtUtc || order.createdAt || order.createdOn || "");
}

function isSameLocalDay(value: string, targetDate = new Date()): boolean {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return false;

  return (
    d.getFullYear() === targetDate.getFullYear() &&
    d.getMonth() === targetDate.getMonth() &&
    d.getDate() === targetDate.getDate()
  );
}

function toOrderList(payload: any): AnyOrder[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.value)) return payload.value;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

function toCountFromPayload(payload: any): number {
  if (Array.isArray(payload?.value)) return payload.value.length;
  if (Array.isArray(payload?.items)) return payload.items.length;
  if (Array.isArray(payload)) return payload.length;
  if (typeof payload?.totalCount === "number") return payload.totalCount;
  return 0;
}

function toBranchList(payload: any): Array<{ id: string; name: string }> {
  const raw = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.items)
      ? payload.items
      : Array.isArray(payload?.value)
        ? payload.value
        : [];

  return raw
    .map((b: any) => ({
      id: String(b?.id || b?.branchId || "").trim(),
      name: String(b?.name || b?.branchName || "Chi nhánh").trim(),
    }))
    .filter((b: { id: string }) => b.id.length > 0);
}

function toIsoDate(value: Date): string {
  const yyyy = value.getFullYear();
  const mm = String(value.getMonth() + 1).padStart(2, "0");
  const dd = String(value.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function normalizeBranchRevenuePayload(payload: any): BranchRevenueData[] {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.items)
      ? payload.items
      : Array.isArray(payload?.value)
        ? payload.value
        : [];

  if (!Array.isArray(list)) return [];

  const normalized = list
    .map((item: any) => ({
      branchId: String(item?.branchId || item?.id || "").trim(),
      branchName: String(item?.branchName || item?.name || "Chi nhánh").trim(),
      revenue: Number(item?.revenue || item?.totalRevenue || item?.amount || 0),
      orderCount: Number(item?.orderCount || item?.orders || item?.totalOrders || 0),
    }))
    .filter((x: { branchId: string }) => x.branchId.length > 0);

  const total = normalized.reduce((sum: number, x: { revenue: number }) => sum + x.revenue, 0);
  return normalized.map((x: { branchId: string; branchName: string; revenue: number; orderCount: number }) => ({
    ...x,
    percentage: total > 0 ? (x.revenue / total) * 100 : 0,
  }));
}

function normalizeRevenueSeriesPayload(payload: any): RevenueChartData[] {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.items)
      ? payload.items
      : Array.isArray(payload?.value)
        ? payload.value
        : [];

  if (!Array.isArray(list)) return [];

  return list
    .map((item: any) => {
      const rawDate = item?.date || item?.Date;
      const d = new Date(rawDate);
      const date = Number.isNaN(d.getTime())
        ? String(rawDate || "")
        : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

      return {
        date,
        revenue: Number(item?.revenue || item?.Revenue || item?.totalRevenue || 0),
      };
    })
    .filter((x: RevenueChartData) => x.date.length > 0)
    .sort((a: RevenueChartData, b: RevenueChartData) => a.date.localeCompare(b.date));
}

function buildStatsFromOrders(orders: AnyOrder[], totalProducts: number, totalStaff: number): DashboardStats {
  const paidStatuses = new Set<OrderStatus>([OrderStatus.Served, OrderStatus.Completed]);
  const activeStatuses = new Set<OrderStatus>([
    OrderStatus.Pending,
    OrderStatus.Confirmed,
    OrderStatus.Cooking,
    OrderStatus.Ready,
  ]);

  const paidOrders = orders.filter((o) => paidStatuses.has(toOrderStatus(o.status)));
  const todayOrders = orders.filter((o) => isSameLocalDay(getOrderCreatedAt(o)));
  const todayRevenue = paidOrders
    .filter((o) => isSameLocalDay(getOrderCreatedAt(o)))
    .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(getOrderCreatedAt(b)).getTime() - new Date(getOrderCreatedAt(a)).getTime())
    .slice(0, 5)
    .map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber || o.id?.substring?.(0, 8) || "N/A",
      tableName: o.tableName || "Mang về",
      status: toOrderStatus(o.status),
      totalAmount: Number(o.totalAmount || 0),
      createdOn: getOrderCreatedAt(o),
      createdAt: getOrderCreatedAt(o),
      items: [],
    }));

  const topSellingMap = new Map<string, number>();
  paidOrders.forEach((order) => {
    (order.items || []).forEach((item) => {
      const name = String(item.productName || "Món ăn").trim();
      if (!name) return;
      topSellingMap.set(name, (topSellingMap.get(name) || 0) + Number(item.quantity || 0));
    });
  });

  const topSellingProducts = Array.from(topSellingMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, quantity]) => ({ name, quantity }));

  return {
    totalRevenue,
    totalOrders: orders.length,
    activeOrders: orders.filter((o) => activeStatuses.has(toOrderStatus(o.status))).length,
    totalProducts,
    totalStaff,
    todayRevenue,
    todayOrders: todayOrders.length,
    recentOrders,
    topSellingProducts,
  };
}

export const ownerReportService = {
  // GET /api/v1/reports/dashboard
  getDashboardStats: async (): Promise<Result<DashboardStats>> => {
    try {
      const direct = await http.get(`${ENDPOINT}/dashboard`) as any;
      // Direct endpoint may return 204 NoContent or empty response
      // In those cases, fall back to local aggregation
      if (!direct) {
        // Empty response - proceed to fallback
      } else if (direct?.isSuccess && direct?.value) {
        return direct;
      } else if (direct && typeof direct === "object" && "totalRevenue" in direct) {
        return { isSuccess: true, value: direct as DashboardStats };
      }
    } catch {
      // Fall back to local aggregation below (covers any network errors)
    }

    const [ordersRes, productsRes, staffRes] = await Promise.allSettled([
      http.get("/api/v1/orders"),
      productService.getAll({ pageSize: 1000 }),
      ownerStaffService.getAll(),
    ]);

    const orders = ordersRes.status === "fulfilled" ? toOrderList(ordersRes.value) : [];
    const totalProducts = productsRes.status === "fulfilled" ? toCountFromPayload(productsRes.value) : 0;
    const totalStaff = staffRes.status === "fulfilled" ? toCountFromPayload(staffRes.value) : 0;

    return {
      isSuccess: true,
      value: buildStatsFromOrders(orders, totalProducts, totalStaff),
    };
  },

  getRevenueData: async (input?: {
    from?: Date;
    to?: Date;
    allTime?: boolean;
    branchId?: string;
  }): Promise<Result<RevenueChartData[]>> => {
    const now = new Date();
    const from = input?.from ?? (() => {
      const d = new Date();
      d.setDate(d.getDate() - 6);
      return d;
    })();
    const to = input?.to ?? now;
    const allTime = Boolean(input?.allTime);

    const params: Record<string, string | boolean> = {
      allTime,
    };

    if (!allTime) {
      params.from = toIsoDate(from);
      params.to = toIsoDate(to);
    }

    if (input?.branchId && input.branchId !== "all") {
      params.branchId = input.branchId;
    }

    try {
      const api = await http.get(`/api/v1/orders/owner/revenue-series`, { params }) as any;
      const parsed = normalizeRevenueSeriesPayload(api);
      if (parsed.length > 0) return { isSuccess: true, value: parsed };
    } catch {
      // fallback
    }

    const ordersRaw = await http.get("/api/v1/orders") as any;
    const orders = toOrderList(ordersRaw);
    const paidStatuses = new Set<OrderStatus>([OrderStatus.Served, OrderStatus.Completed]);

    const pointsMap = new Map<string, number>();
    const fromTime = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
    const toTime = new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 999).getTime();

    orders.forEach((o) => {
      const status = toOrderStatus(o.status);
      if (!paidStatuses.has(status)) return;

      if (input?.branchId && input.branchId !== "all") {
        const oid = String((o as any)?.branchId || (o as any)?.BranchId || "").trim();
        if (oid !== input.branchId) return;
      }

      const createdAt = getOrderCreatedAt(o);
      const d = new Date(createdAt);
      if (Number.isNaN(d.getTime())) return;

      if (!allTime) {
        const t = d.getTime();
        if (t < fromTime || t > toTime) return;
      }

      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      pointsMap.set(key, (pointsMap.get(key) || 0) + Number(o.totalAmount || 0));
    });

    const values = Array.from(pointsMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, revenue]) => ({ date, revenue }));

    return { isSuccess: true, value: values };
  },

  getBranchRevenueComparison: async (input?: {
    from?: Date;
    to?: Date;
    allTime?: boolean;
  }): Promise<Result<BranchRevenueData[]>> => {
    const now = new Date();
    const from = input?.from ?? (() => {
      const d = new Date();
      d.setDate(d.getDate() - 6);
      return d;
    })();
    const to = input?.to ?? now;
    const allTime = Boolean(input?.allTime);

    const params: Record<string, string | boolean> = {
      allTime,
    };

    if (!allTime) {
      params.from = toIsoDate(from);
      params.to = toIsoDate(to);
    }

    const reportEndpoints = [
      "/api/v1/orders/owner/revenue-by-branch",
      `${ENDPOINT}/revenue/branches`,
      `${ENDPOINT}/branch-revenue`,
      `${ENDPOINT}/revenue-by-branch`,
    ];

    for (const endpoint of reportEndpoints) {
      try {
        const api = await http.get(endpoint, { params }) as any;
        const parsed = normalizeBranchRevenuePayload(api);
        if (parsed.length > 0) {
          return { isSuccess: true, value: parsed };
        }
      } catch {
        // Try next endpoint shape.
      }
    }

    const [ordersRaw, branchesRaw] = await Promise.allSettled([
      http.get("/api/v1/orders"),
      branchService.getAll(),
    ]);

    const orders = ordersRaw.status === "fulfilled" ? toOrderList(ordersRaw.value) : [];
    const branchList = branchesRaw.status === "fulfilled" ? toBranchList(branchesRaw.value) : [];
    const paidStatuses = new Set<OrderStatus>([OrderStatus.Served, OrderStatus.Completed]);

    const fromTime = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
    const toTime = new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 999).getTime();

    const map = new Map<string, { branchName: string; revenue: number; orderCount: number }>();
    branchList.forEach((b) => {
      map.set(b.id, { branchName: b.name, revenue: 0, orderCount: 0 });
    });

    orders.forEach((order: any) => {
      const status = toOrderStatus(order?.status);
      if (!paidStatuses.has(status)) return;

      const created = new Date(getOrderCreatedAt(order)).getTime();
      if (Number.isNaN(created)) return;
      if (!allTime && (created < fromTime || created > toTime)) return;

      const branchId = String(order?.branchId || order?.BranchId || "").trim();
      const branchName = String(order?.branchName || order?.BranchName || "Chi nhánh không xác định").trim();
      if (!branchId) return;

      const current = map.get(branchId) || {
        branchName,
        revenue: 0,
        orderCount: 0,
      };

      current.revenue += Number(order?.totalAmount || 0);
      current.orderCount += 1;
      if (!current.branchName) current.branchName = branchName;

      map.set(branchId, current);
    });

    const result = Array.from(map.entries()).map(([branchId, item]) => ({
      branchId,
      branchName: item.branchName,
      revenue: item.revenue,
      orderCount: item.orderCount,
      percentage: 0,
    }));

    const totalRevenue = result.reduce((sum, item) => sum + item.revenue, 0);
    const withPercent = result.map((item) => ({
      ...item,
      percentage: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0,
    }));

    return { isSuccess: true, value: withPercent };
  }
};