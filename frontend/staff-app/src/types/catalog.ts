// src/types/catalog.ts
export interface ProductDto {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  // Các field khác trả về từ GetPublicMenuQuery
}