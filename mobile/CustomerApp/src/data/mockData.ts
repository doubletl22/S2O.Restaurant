// src/data/mockData.ts
import { Restaurant } from '../models/types'; // (Hoặc đường dẫn tới file types của bạn)

// 👇 Tên biến chuẩn là: MOCK_RESTAURANTS
export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: '1',
    name: 'The Six Premium',
    address: '123 Nguyễn Huệ, Quận 1',
    rating: 4.8,
    distance: '0.5 km',
    // 👇 Dùng link ảnh mạng để hết lỗi màn hình đỏ
    image: { uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80' },
    description: 'Không gian sang trọng, đẳng cấp...',
    menu: [
      { id: 'd1', name: 'Lẩu Bò Wagyu', price: 500000, image: { uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c' } },
      { id: 'd2', name: 'Sashimi', price: 350000, image: { uri: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c' } }
    ]
  },
  {
    id: '2',
    name: 'Pizza 4P\'s',
    address: '8 Thủ Khoa Huân, Quận 1',
    rating: 4.9,
    distance: '1.2 km',
    image: { uri: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80' },
    description: 'Pizza nướng củi kiểu Nhật...',
    menu: []
  }
];