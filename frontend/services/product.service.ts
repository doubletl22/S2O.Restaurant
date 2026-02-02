import http from "@/lib/http";
import { Product, Result, CreateProductRequest } from "@/lib/types";

// Helper chuyển object sang FormData
const toFormData = (data: CreateProductRequest) => {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('price', data.price.toString());
  formData.append('categoryId', data.categoryId);
  // Backend có thể cần boolean dạng string "true"/"false" hoặc int
  formData.append('isActive', String(data.isActive)); 
  
  if (data.description) formData.append('description', data.description);
  
  // Quan trọng: Tên trường phải khớp với Backend (CreateProductCommand.cs -> public IFormFile ImageFile { get; set; })
  if (data.imageFile) {
    formData.append('imageFile', data.imageFile);
  }
  
  return formData;
};

export const productService = {
  getAll: async (params?: any): Promise<Result<any>> => 
    http.get("/api/v1/products", { params }),

  getById: async (id: string): Promise<Result<Product>> => 
    http.get(`/api/v1/products/${id}`),

  // [FIX] Chuyển đổi sang FormData để upload ảnh
  create: async (payload: CreateProductRequest): Promise<Result<string>> => {
    const formData = toFormData(payload);
    return http.post("/api/v1/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  update: async (id: string, payload: CreateProductRequest): Promise<Result<void>> => {
    // Nếu update có ảnh thì cũng phải dùng FormData, nếu không thì dùng JSON tùy Backend
    // Hiện tại giả sử update giống create
     const formData = toFormData(payload);
     return http.put(`/api/v1/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
     });
  },

  delete: async (id: string): Promise<Result<void>> => 
    http.delete(`/api/v1/products/${id}`),

  // Alias giữ tương thích code cũ
  getProducts: async (p: any) => productService.getAll(p),
  createProduct: async (p: any) => productService.create(p),
  deleteProduct: async (id: string) => productService.delete(id),
};