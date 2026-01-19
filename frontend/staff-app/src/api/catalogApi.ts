// src/api/catalogApi.ts
import axiosClient from './axiosClient';
// Thêm chữ "type"
import { type ProductDto } from '../types/catalog'; 

export const catalogApi = {
  getMenu: async (tenantId: string) => {
    const response = await axiosClient.get<ProductDto[]>(`/products/${tenantId}`);
    return response.data;
  }
};