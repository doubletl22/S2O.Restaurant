import http from "@/lib/http";
import { PublicMenu, TableInfo, Result, Order } from "@/lib/types";

export const guestService = {
  resolveTable: async (tableId: string): Promise<TableInfo> => {
    return await http.get(`/api/v1/storefront/tenants/resolve-table/${tableId}`) as any;
  },

  getMenu: async (tenantId: string, categoryId?: string): Promise<PublicMenu> => {
    return await http.get(`/api/v1/storefront/menus/${tenantId}`, { params: { categoryId } }) as any;
  },

  getMenuByToken: async (qrToken: string): Promise<Result<{ table: TableInfo; menu: PublicMenu }>> => {
    try {
      const tableInfo = await guestService.resolveTable(qrToken);
      if (!tableInfo || !tableInfo.tenantId) {
        return { isSuccess: false, value: null as any, error: { code: "404", description: "Invalid Table" } };
      }
      const menu = await guestService.getMenu(tableInfo.tenantId);
      return { isSuccess: true, value: { table: tableInfo, menu } };
    } catch (error: any) {
      return { isSuccess: false, value: null as any, error: error };
    }
  },

  placeOrder: async (payload: any) => {
    return await http.post("/api/v1/storefront/orders/guest", payload) as any;
  },

  getOrders: async (qrToken: string): Promise<Result<Order[]>> => {
      // Mock hoặc gọi API thật
      return { isSuccess: true, value: [] }; 
  }
};