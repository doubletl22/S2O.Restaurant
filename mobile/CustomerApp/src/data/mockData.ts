import { Restaurant, Product, Category } from '../models';

export const RESTAURANTS: Restaurant[] = [
  {
    id: '1',
    name: 'The Six Premium',
    address: '123 Nguyễn Huệ, Quận 1',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500',
    distance: '0.5 km',
    isAiSuggested: true,
  },
  {
    id: '2',
    name: 'The Six Garden',
    address: '45 Thảo Điền, Quận 2',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500',
    distance: '3.2 km',
  },
];

export const PRODUCTS: Product[] = [
  {
    id: '1', name: 'Bò Wagyu Nướng', price: 500000, description: 'Thượng hạng', categoryId: '1',
    image: 'https://cdn-icons-png.flaticon.com/512/1046/1046784.png'
  },
];

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Món Âu', icon: '🥩' },
  { id: '2', name: 'Món Á', icon: '🍜' },
  { id: '3', name: 'Đồ uống', icon: '🍷' },
];