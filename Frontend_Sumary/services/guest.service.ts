import api from '@/lib/api';
import { PublicMenuResponse } from '@/lib/types';

interface TableInfoResponse {
  tableId: string;
  tableName: string;
  tenantId: string;
  tenantName: string;
  branchId: string;
  guestPhone: string;
}

export interface PlaceOrderPayload {
  tableId: string;
  tenantId: string;
  branchId: string;
  guestName: string;
  guestPhone: string;
  items: {
    productId: string;
    quantity: number;
    note?: string;
  }[];
}

export const guestService = {
  getTableInfo: async (tableId: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!tableId || !uuidRegex.test(tableId)) {
        console.warn("Table ID không hợp lệ (không phải UUID):", tableId);
        return null; // Trả về null luôn, không gọi API
    }

    try {
        const response = await api.get<TableInfoResponse>(`/public/tenant/resolve-table/${tableId}`);
        return response.data;
    } catch (error) {
        console.error("Lỗi resolve table:", error);
        return null;
    }
  },

  getPublicMenu: async (tenantId: string) => {
    const response = await api.get<any>(`/public/menu/${tenantId}`);
    if (response.data.isSuccess) {
       return response.data.value;
    }
    return null;
  },
  placeGuestOrder: async (payload: PlaceOrderPayload) => {
    const response = await api.post('/orders/guest', payload);
    return response.data;
  }
};

