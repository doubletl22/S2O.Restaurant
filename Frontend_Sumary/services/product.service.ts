import http from "@/lib/http";
import { Product, Result, CreateProductRequest } from "@/lib/types";

export const productService = {
  getAll: async (params?: any): Promise<Result<any>> => http.get("/api/v1/products", { params }) as any,
  getById: async (id: string): Promise<Result<Product>> => http.get(`/api/v1/products/${id}`) as any,
  create: async (payload: CreateProductRequest): Promise<Result<string>> => http.post("/api/v1/products", payload) as any,
  update: async (id: string, payload: CreateProductRequest): Promise<Result<void>> => http.put(`/api/v1/products/${id}`, payload) as any,
  delete: async (id: string): Promise<Result<void>> => http.delete(`/api/v1/products/${id}`) as any,
  
  // Alias cho code cũ
  getProducts: async (p: any) => productService.getAll(p),
  createProduct: async (p: any) => productService.create(p),
  deleteProduct: async (id: string) => productService.delete(id),
};