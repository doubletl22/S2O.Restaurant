import http from "@/lib/http";
import { OrderStatus, StaffOrderDto, Result } from "@/lib/types";

export const staffService = {
  // 1. Dùng cho trang Order Ticket (Phục vụ)
  getOrders: async (status?: OrderStatus): Promise<Result<StaffOrderDto[]>> => {
    const params = status !== undefined ? { status } : {};
    return await http.get("/api/v1/orders", { params }) as any; 
  },

  // 2. Dùng cho trang Kitchen (Bếp)
  getKitchenOrders: async (branchId: string) => {
    return await http.get(`/api/v1/kitchen?branchId=${branchId}`) as any;
  },
  
  // 3. Cập nhật trạng thái món (Chung cho cả 2)
  updateOrderItemStatus: async (orderId: string, itemId: string, status: OrderStatus) => {
    // API: PUT /api/v1/orders/{orderId}/items/{itemId}/status
    // Hoặc nếu bạn dùng route kitchen: PUT /api/v1/kitchen/{itemId}/status (tùy backend)
    // Ở đây tôi dùng route chuẩn của Order:
    return await http.patch(`/api/v1/orders/${orderId}/items/${itemId}/status`, { status }) as any;
  },

  // 4. Lấy chi tiết đơn
  getOrderDetail: async (id: string) => {
    return await http.get(`/api/v1/orders/${id}`) as any;
  }
};