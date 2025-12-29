// Định nghĩa Nhà hàng
export interface Restaurant {
  id: string;
  name: string;
  address: string;
  rating: number;
  image: string;
  distance: string;
  isAiSuggested?: boolean; // Được AI gợi ý?
}

// Định nghĩa Món ăn
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  categoryId: string;
}

// Định nghĩa Danh mục
export interface Category {
  id: string;
  name: string;
  icon: string;
}