import http from "@/lib/http";
import { Table, Result } from "@/lib/types";

export const tableService = {
  getByBranch: async (branchId?: string | null): Promise<Result<Table[]>> => {
    const response = await http.get("/api/v1/tables", {
      params: branchId ? { branchId } : undefined,
    });
    return response as any;
  },

  create: async (body: { name: string; capacity: number; branchId: string; isActive?: boolean; isOccupied?: boolean }): Promise<Result<string>> => {
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
  getTables: async (branchId?: string | null) => tableService.getByBranch(branchId),
  getAll: async () => tableService.getByBranch(null),
  createTable: async (b: any) => tableService.create(b),
  updateTable: async (id: string, b: any) => tableService.update(id, b),
  deleteTable: async (id: string) => tableService.delete(id),
};