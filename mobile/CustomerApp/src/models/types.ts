// src/models/types.ts

// 1. Định nghĩa món ăn
export interface Dish {
  id: string;
  name: string;
  price: number;
  image: any; // Link ảnh hoặc require
  description?: string;
}

// 2. Định nghĩa nhà hàng
export interface Restaurant {
  id: string;
  name: string;
  address: string;
  rating: number;
  distance: string; // VD: "0.5 km"
  image: any;
  description: string;
  menu: Dish[]; // Danh sách món ăn của nhà hàng này
}

// 3. Định nghĩa User (cho màn Profile)
export interface User {
  id: string;
  name: string;
  avatar: any;
  phone: string;
}