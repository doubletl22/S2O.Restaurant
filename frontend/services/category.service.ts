import http from "@/lib/http";
import { Category, Result } from "@/lib/types";

const toBoolean = (value: unknown, fallback = false): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  if (typeof value === "number") return value !== 0;
  return fallback;
};

const mapCategory = (raw: any): Category => ({
  id: raw?.id ?? raw?.Id ?? "",
  name: raw?.name ?? raw?.Name ?? "",
  description: raw?.description ?? raw?.Description ?? "",
  isActive: toBoolean(raw?.isActive ?? raw?.IsActive, false),
});

const normalizeCategoryListResult = (payload: any): Result<Category[]> => {
  const rawList = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.value)
      ? payload.value
      : Array.isArray(payload?.items)
        ? payload.items
        : [];

  const normalized = rawList.map(mapCategory);

  if (payload && typeof payload === "object" && "isSuccess" in payload) {
    return {
      ...payload,
      value: normalized,
    } as Result<Category[]>;
  }

  return {
    isSuccess: true,
    value: normalized,
  };
};

export const categoryService = {
  // Đổi tên cho khớp với Page: getAll, create, delete
  getAll: async (): Promise<Result<Category[]>> => {
    const data = await http.get("/api/v1/categories") as any;
    return normalizeCategoryListResult(data);
  },

  create: async (body: { name: string; description?: string; isActive?: boolean; }): Promise<Result<string>> => {
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