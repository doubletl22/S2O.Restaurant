import http from "@/lib/http";
import { PublicMenu, Result, GuestOrderRequest, TableInfo, GuestOrderHistory } from "@/lib/types";

const CATALOG_PUBLIC = "/api/public-menu"; 
const ORDER_PUBLIC = "/api/public-orders";

export const guestService = {
  getMenuByToken: async (qrToken: string): Promise<Result<{ menu: PublicMenu; table: TableInfo }>> => {
    return await http.get(`${CATALOG_PUBLIC}/${qrToken}`);
  },

  placeOrder: async (data: GuestOrderRequest): Promise<Result<string>> => {
    return await http.post(ORDER_PUBLIC, data);
  },

  // --- MỚI: Lấy danh sách món đã đặt ---
  getOrders: async (qrToken: string): Promise<Result<GuestOrderHistory>> => {
    return await http.get(`${ORDER_PUBLIC}/${qrToken}`);
  }
};