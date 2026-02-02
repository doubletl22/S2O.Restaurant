import http from "@/lib/http";
import { Category, Result } from "@/lib/types";

export const categoryService = {
  // Đổi tên cho khớp với Page: getAll, create, delete
  getAll: async (): Promise<Result<Category[]>> => {
    return await http.get("/api/v1/categories") as any;
  },

  create: async (body: { name: string; description?: string }): Promise<Result<string>> => {
    return await http.post("/api/v1/categories", body) as any;
  },

  update: async (id: string, body: any): Promise<Result<void>> => {
    return await http.put(`/api/v1/categories/${id}`, body) as any;
  },

  delete: async (id: string): Promise<Result<void>> => {
    return await http.delete(`/api/v1/categories/${id}`) as any;
  },
  
  // Alias tương thích ngược (nếu component cũ gọi tên khác)
  getCategories: async () => categoryService.getAll(),
  createCategory: async (b: any) => categoryService.create(b),
  deleteCategory: async (id: string) => categoryService.delete(id)
};