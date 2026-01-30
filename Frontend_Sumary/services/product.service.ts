import http from "@/lib/http";
import { Product, Result, PagedResult, CreateProductRequest } from "@/lib/types";

const OWNER_ENDPOINT = "/api/owner-products";

export const productService = {
  getProducts: async (params?: any): Promise<Result<PagedResult<Product>>> => {
    return await http.get(OWNER_ENDPOINT, { params });
  },

  create: async (data: CreateProductRequest): Promise<Result<string>> => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("price", data.price.toString());
    formData.append("categoryId", data.categoryId);
    if (data.description) formData.append("description", data.description);
    
    // Xử lý ảnh
    if (data.image) formData.append("image", data.image);

    return await http.post(OWNER_ENDPOINT, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  update: async (id: string, data: Partial<CreateProductRequest>): Promise<Result<void>> => {
    const formData = new FormData();
    if (data.name) formData.append("name", data.name);
    if (data.price !== undefined) formData.append("price", data.price.toString());
    if (data.categoryId) formData.append("categoryId", data.categoryId);
    if (data.description !== undefined) formData.append("description", data.description || "");
    
    if (data.isActive !== undefined) formData.append("isActive", data.isActive.toString());

    if (data.image) {
      formData.append("image", data.image);
    }

    return await http.put(`${OWNER_ENDPOINT}/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  delete: async (id: string): Promise<Result<void>> => {
    return await http.delete(`${OWNER_ENDPOINT}/${id}`);
  }
};