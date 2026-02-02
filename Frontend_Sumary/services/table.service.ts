import http from "@/lib/http";
import { Table, Result } from "@/lib/types";

export const tableService = {
  getByBranch: async (branchId: string): Promise<Result<Table[]>> => {
    const response = await http.get("/api/v1/tables", { params: { branchId } });
    return response as any;
  },

  create: async (body: { name: string; capacity: number; branchId: string }): Promise<Result<string>> => {
    const response = await http.post("/api/v1/tables", body);
    return response as any;
  },

  update: async (id: string, body: any): Promise<Result<void>> => {
    const response = await http.put(`/api/v1/tables/${id}`, body);
    return response as any;
  },

  delete: async (id: string): Promise<Result<void>> => {
    const response = await http.delete(`/api/v1/tables/${id}`);
    return response as any;
  },

  // Alias
  getTables: async (branchId: string) => tableService.getByBranch(branchId),
  createTable: async (b: any) => tableService.create(b),
  updateTable: async (id: string, b: any) => tableService.update(id, b),
  deleteTable: async (id: string) => tableService.delete(id),
};