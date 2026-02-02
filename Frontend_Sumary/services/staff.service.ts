import http from "@/lib/http";
import { StaffOrderDto, OrderStatus, Result } from "@/lib/types";

export const staffService = {
  // Lấy danh sách đơn hàng
  getOrders: async (status?: OrderStatus): Promise<Result<StaffOrderDto[]>> => {
    const params = status !== undefined ? { status } : {};
    // Ép kiểu any để tránh lỗi type check của axios interceptor
    return await http.get("/api/v1/orders", { params }) as any; 
  },
  
  // Cập nhật trạng thái từng món
  updateOrderItemStatus: async (orderId: string, itemId: string, status: OrderStatus) => {
    return await http.patch(`/api/v1/orders/${orderId}/items/${itemId}/status`, { status }) as any;
  },

  // Lấy chi tiết (nếu cần)
  getOrderDetail: async (id: string) => {
    return await http.get(`/api/v1/orders/${id}`) as any;
  }
};