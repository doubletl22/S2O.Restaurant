import http from "@/lib/http";
import { Product, Result, CreateProductRequest } from "@/lib/types";

// Helper để chuyển Object sang FormData
const toFormData = (data: Record<string, any>) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    const value = data[key];
    if (value !== null && value !== undefined) {
      formData.append(key, value);
    }
  });
  return formData;
};

export const productService = {
  getAll: async (params?: any): Promise<Result<any>> => 
    http.get("/api/v1/products", { params }),

  getById: async (id: string): Promise<Result<Product>> => 
    http.get(`/api/v1/products/${id}`),

  // [FIX] Chuyển sang FormData để gửi file ảnh
  create: async (payload: CreateProductRequest): Promise<Result<string>> => {
    const formData = toFormData(payload);
    return http.post("/api/v1/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  update: async (id: string, payload: CreateProductRequest): Promise<Result<void>> => 
    http.put(`/api/v1/products/${id}`, payload),

  delete: async (id: string): Promise<Result<void>> => 
    http.delete(`/api/v1/products/${id}`),
};  