import http from "@/lib/http";
import { Branch, Result } from "@/lib/types";

export const branchService = {
  // GET: /api/v1/branches
  getAll: async (): Promise<Result<Branch[]>> => {
    // Ép kiểu 'as any' để bypass type check mặc định của axios
    const response = await http.get("/api/v1/branches");
    return response as any; 
  },

  create: async (body: { name: string; address: string; phone: string }): Promise<Result<string>> => {
    const response = await http.post("/api/v1/branches", body);
    return response as any;
  },

  update: async (id: string, body: any): Promise<Result<void>> => {
    const response = await http.put(`/api/v1/branches/${id}`, body);
    return response as any;
  },
  
  delete: async (id: string): Promise<Result<void>> => {
    const response = await http.delete(`/api/v1/branches/${id}`);
    return response as any;
  },

  // Alias để tương thích code cũ (nếu có)
  getBranches: async () => branchService.getAll(),
  createBranch: async (b: any) => branchService.create(b),
  updateBranch: async (id: string, b: any) => branchService.update(id, b),
  deleteBranch: async (id: string) => branchService.delete(id),
};