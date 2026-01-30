import http from "@/lib/http";
import { Branch, Result } from "@/lib/types";

const ENDPOINT = "/api/owner-branches"; // Endpoint dành cho Owner

export const branchService = {
  // Lấy danh sách chi nhánh của Owner hiện tại
  getAll: async (): Promise<Result<Branch[]>> => {
    return await http.get(ENDPOINT);
  },

  create: async (data: { name: string; address: string; phone: string }): Promise<Result<string>> => {
    return await http.post(ENDPOINT, data);
  },

  update: async (id: string, data: Partial<Branch>): Promise<Result<void>> => {
    return await http.put(`${ENDPOINT}/${id}`, data);
  },

  delete: async (id: string): Promise<Result<void>> => {
    return await http.delete(`${ENDPOINT}/${id}`);
  }
};