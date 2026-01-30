import http from "@/lib/http";
import { Table, Result, CreateTableRequest } from "@/lib/types";

// Endpoint quản lý bàn (thường nằm trong Tenant Service)
const ENDPOINT = "/api/tables";

export const tableService = {
  // Lấy danh sách bàn theo BranchId
  getByBranch: async (branchId: string): Promise<Result<Table[]>> => {
    return await http.get(`${ENDPOINT}/by-branch/${branchId}`);
  },

  create: async (data: CreateTableRequest): Promise<Result<string>> => {
    return await http.post(ENDPOINT, data);
  },

  // Generate lại QR Token mới (nếu cần đổi mã bàn)
  regenerateQr: async (tableId: string): Promise<Result<string>> => {
    return await http.post(`${ENDPOINT}/${tableId}/regenerate-qr`);
  },

  delete: async (id: string): Promise<Result<void>> => {
    return await http.delete(`${ENDPOINT}/${id}`);
  }
};