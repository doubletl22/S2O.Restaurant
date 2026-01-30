import http from "@/lib/http";
import { Result, GuestOrderHistory, OrderStatus } from "@/lib/types";

// Endpoint giả định (Backend S2O.Order.Api)
const ORDER_ENDPOINT = "/api/orders"; 

export interface StaffOrderDto {
  id: string;
  tableId: string;
  tableName: string;
  branchId: string;
  items: {
    id: string;
    productName: string;
    quantity: number;
    note?: string;
    status: OrderStatus;
  }[];
  createdAt: string;
  totalAmount: number;
  status: OrderStatus; // Trạng thái chung của đơn
}

export const staffService = {
  // 1. Lấy danh sách đơn hàng theo trạng thái (Dùng cho Bếp/Phục vụ)
  getOrders: async (status?: OrderStatus): Promise<Result<StaffOrderDto[]>> => {
    // Backend nên hỗ trợ filter: GET /api/orders?status=Pending,Cooking...
    const params = status ? { status } : {};
    return await http.get(ORDER_ENDPOINT, { params });
  },

  // 2. Cập nhật trạng thái MÓN ĂN (Item Status)
  updateOrderItemStatus: async (orderId: string, itemId: string, newStatus: OrderStatus): Promise<Result<void>> => {
    // PUT /api/orders/{orderId}/items/{itemId}/status
    return await http.put(`${ORDER_ENDPOINT}/${orderId}/items/${itemId}/status`, { status: newStatus });
  },

  // 3. Cập nhật trạng thái TOÀN BỘ ĐƠN (Ví dụ: Thanh toán xong)
  updateOrderStatus: async (orderId: string, newStatus: OrderStatus): Promise<Result<void>> => {
    return await http.put(`${ORDER_ENDPOINT}/${orderId}/status`, { status: newStatus });
  }
};