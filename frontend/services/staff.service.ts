import http from "@/lib/http";
import { getBranchId } from "@/lib/jwt";
import { OrderStatus, StaffOrderDto, Result } from "@/lib/types";

function normalizeOrderStatus(status: unknown): OrderStatus {
  if (typeof status === "number") {
    return status as OrderStatus;
  }

  const key = String(status ?? "").toLowerCase();
  if (key === "pending") return OrderStatus.Pending;
  if (key === "confirmed") return OrderStatus.Confirmed;
  if (key === "cooking" || key === "processing") return OrderStatus.Cooking;
  if (key === "ready") return OrderStatus.Ready;
  if (key === "completed" || key === "complete") return OrderStatus.Completed;
  if (key === "cancelled" || key === "canceled") return OrderStatus.Cancelled;
  if (key === "paid") return OrderStatus.Served;
  if (key === "served") return OrderStatus.Served;
  return OrderStatus.Pending;
}

function normalizeOrders(payload: unknown): StaffOrderDto[] {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as any)?.value)
      ? (payload as any).value
      : [];

  return list.map((order: any) => ({
    ...order,
    createdAt: order?.createdAtUtc || order?.createdAt,
    createdOn: order?.createdAtUtc || order?.createdOn,
    status: normalizeOrderStatus(order?.status),
    items: Array.isArray(order?.items)
      ? order.items.map((item: any) => ({
          ...item,
          status: normalizeOrderStatus(item?.status),
        }))
      : [],
  }));
}

export const staffService = {
  // 1. Dùng cho trang Order Ticket (Phục vụ)
  getOrders: async (status?: OrderStatus): Promise<Result<StaffOrderDto[]>> => {
    const params = status !== undefined ? { status } : {};
    const response = await http.get("/api/v1/orders", { params }) as any;
    return {
      isSuccess: true,
      value: normalizeOrders(response),
    };
  },

  // 2. Dùng cho trang Kitchen (Bếp)
  getKitchenOrders: async (branchId: string) => {
    return await http.get(`/api/v1/kitchen?branchId=${branchId}`) as any;
  },
  
  // 3. Cập nhật trạng thái ORDER (Manager confirm)
  updateOrderStatus: async (orderId: string, newStatus: OrderStatus) => {
    const currentBranchId = getBranchId();
    if (!currentBranchId) {
      throw new Error("Không xác định được chi nhánh của bạn");
    }
    // Backend .NET expects PascalCase
    return await http.patch(`/api/v1/orders/${orderId}/status`, { 
      OrderId: orderId,
      NewStatus: newStatus,
      CurrentBranchId: currentBranchId 
    }) as any;
  },

  // 4. Cập nhật trạng thái món (Chung cho cả 2)
  updateOrderItemStatus: async (orderId: string, itemId: string, status: OrderStatus) => {
    // API: PUT /api/v1/orders/{orderId}/items/{itemId}/status
    // Hoặc nếu bạn dùng route kitchen: PUT /api/v1/kitchen/{itemId}/status (tùy backend)
    // Ở đây tôi dùng route chuẩn của Order:
    return await http.patch(`/api/v1/orders/${orderId}/items/${itemId}/status`, { status }) as any;
  },

  updateOrderItemQuantity: async (orderId: string, itemId: string, newQuantity: number) => {
    return await http.patch(`/api/v1/orders/${orderId}/items/${itemId}`, {
      orderId,
      orderItemId: itemId,
      newQuantity,
      currentBranchId: getBranchId() || "00000000-0000-0000-0000-000000000000",
    }) as any;
  },

  // 5. Lấy chi tiết đơn
  getOrderDetail: async (id: string) => {
    return await http.get(`/api/v1/orders/${id}`) as any;
  }
};