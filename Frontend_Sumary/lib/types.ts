// ==========================================
// 1. COMMON / API RESPONSE
// ==========================================

// Cấu trúc trả về chuẩn của Backend (Result<T>)
export interface ApiResponse<T> {
  value: T;
  isSuccess: boolean;
  isFailure: boolean;
  error: ApiError | null;
}

export interface ApiError {
  code: string;
  message: string;
}

// ==========================================
// 2. ENUMS (Các hằng số định danh)
// ==========================================

export enum UserRole {
  SuperAdmin = 'SuperAdmin',
  RestaurantOwner = 'RestaurantOwner',
  Staff = 'Staff'
}

export enum BookingStatus {
  Pending = 0,
  Confirmed = 1,
  Cancelled = 2,
  Completed = 3
}

// ==========================================
// 3. IDENTITY SERVICE (Auth & User)
// ==========================================

export interface User {
  id: string;
  email: string;
  fullName: string;
  roles: string[]; // Mảng role từ JWT
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ==========================================
// 4. TENANT SERVICE (Nhà hàng & Chi nhánh)
// ==========================================

// Dành cho Super Admin xem danh sách
export interface TenantDto {
  id: string;
  name: string;
  plan: string;       // "Free", "Premium", etc.
  isLocked: boolean;  // Trạng thái khóa
  createdAt: string;  // ISO Date string
}

// Dành cho Chủ nhà hàng (Owner)
export interface Branch {
  id: string;
  tenantId: string;
  name: string;
  address: string;
  phoneNumber: string;
  isActive: boolean;
}

export interface Table {
  id: string;
  branchId: string;
  name: string;      // Vd: "Bàn VIP 1"
  capacity: number;  // Số ghế
  isAvailable: boolean;
}

// Payload để tạo bàn mới
export interface CreateTablePayload {
  branchId: string;
  name: string;
  capacity: number;
}

// ==========================================
// 5. CATALOG SERVICE (Menu & Sản phẩm)
// ==========================================

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null; // Đường dẫn ảnh (VD: /uploads/products/...)
  isAvailable: boolean;
  categoryId?: string;
}

// Thống kê Dashboard (Admin)
export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  outOfStockProducts: number;
}

// Payload để tạo/sửa sản phẩm (Dùng cho Form)
// Lưu ý: Khi gửi lên server sẽ dùng FormData, không dùng JSON thường
export interface ProductFormPayload {
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
  imageFile?: File; // File ảnh từ input type="file"
}

export interface CategoryDto {
  id: string;
  name: string;
  description?: string;
}

// Khớp với cấu trúc Product từ Backend
export interface ProductDto {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId: string;
  isAvailable: boolean;
}

// Khớp với response của GetPublicMenuQuery
export interface PublicMenuResponse {
  tenantId: string;
  tenantName: string;
  categories: CategoryDto[];
  products: ProductDto[];
}

// ==========================================
// 6. BOOKING SERVICE (Đặt bàn)
// ==========================================

export interface Booking {
  id: string;
  tenantId: string;
  branchId: string;
  tableId?: string; // Có thể null nếu chưa xếp bàn
  
  guestName: string;
  phoneNumber: string;
  bookingTime: string; // ISO Date String
  partySize: number;
  note?: string;
  status: BookingStatus; // 0, 1, 2, 3
  createdAtUtc: string;
}

export interface CreateBookingPayload {
  branchId: string;
  tableId?: string;
  guestName: string;
  phoneNumber: string;
  bookingTime: string; // "2026-01-25T18:30:00Z"
  partySize: number;
  note?: string;
}
