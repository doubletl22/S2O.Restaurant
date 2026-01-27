import api from '@/lib/api';
import { PublicMenuResponse } from '@/lib/types';

interface TableInfoResponse {
  tableId: string;
  tableName: string;
  tenantId: string;
  tenantName: string;
}

export const guestService = {
  getTableInfo: async (tableId: string) => {
    const response = await api.get<TableInfoResponse>(`/public/tenant/resolve-table/${tableId}`);
    return response.data;
  },

  getPublicMenu: async (tenantId: string) => {
    const response = await api.get<any>(`/public/menu/${tenantId}`);
    if (response.data.isSuccess) {
       return response.data.value;
    }
    return null;
  }
};