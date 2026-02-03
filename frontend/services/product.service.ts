import http from "@/lib/http";
import { Product, Result, CreateProductRequest } from "@/lib/types";

const toFormData = (data: CreateProductRequest) => {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('price', data.price.toString());
  formData.append('categoryId', data.categoryId);
  formData.append('isActive', String(data.isActive)); 
  
  if (data.description) formData.append('description', data.description);
  
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

  create: async (payload: CreateProductRequest): Promise<Result<string>> => {
    const formData = toFormData(payload);
    return http.post("/api/v1/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  update: async (id: string, data: any) => {
    const formData = new FormData();
    formData.append("id", id); // Backend yêu cầu ID trong body
    formData.append("name", data.name);
    formData.append("price", data.price.toString());
    formData.append("categoryId", data.categoryId);
    formData.append("isActive", data.isActive.toString());
    if (data.description) formData.append("description", data.description);
    if (data.imageFile instanceof File) {formData.append("imageFile", data.imageFile);
    }
    return http.put(`/api/v1/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  delete: async (id: string) => http.delete(`/api/v1/products/${id}`),

  getProducts: async (p: any) => productService.getAll(p),
  createProduct: async (p: any) => productService.create(p),
  deleteProduct: async (id: string) => productService.delete(id),
};