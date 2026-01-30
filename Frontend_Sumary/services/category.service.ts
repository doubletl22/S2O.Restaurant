import http from "@/lib/http";
import { Category, Result } from "@/lib/types";

const ENDPOINT = "/api/categories";

export const categoryService = {
  // Lấy danh sách (Backend trả về list category hoặc PagedResult)
  // Giả sử backend trả về mảng trực tiếp hoặc bọc trong Result
  getAll: async (): Promise<Result<Category[]>> => {
    return await http.get(ENDPOINT);
  },

  getById: async (id: string): Promise<Result<Category>> => {
    return await http.get(`${ENDPOINT}/${id}`);
  },

  create: async (data: { name: string; description?: string }): Promise<Result<string>> => {
    return await http.post(ENDPOINT, data);
  },

  update: async (id: string, data: { name: string; description?: string; isActive: boolean }): Promise<Result<void>> => {
    return await http.put(`${ENDPOINT}/${id}`, data);
  },

  delete: async (id: string): Promise<Result<void>> => {
    return await http.delete(`${ENDPOINT}/${id}`);
  },
};