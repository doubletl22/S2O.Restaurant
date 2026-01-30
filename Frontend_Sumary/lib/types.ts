// Định nghĩa các Interface dùng chung cho toàn hệ thống

// 1. Cấu trúc Response chuẩn từ Backend (Result Wrapper)
export interface Result<T> {
  isSuccess: boolean;
  isFailure: boolean;
  error: ErrorDetail | null;
  value: T;
}

export interface ErrorDetail {
  code: string;
  message: string;
}

// 2. Cấu trúc Phân trang (PagedResult)
export interface PagedResult<T> {
  items: T[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// 3. User & Auth Types
export interface User {
  id: string;
  fullName: string;
  email: string;
  roles: string[]; // "Owner", "Staff", "SysAdmin"
  branchId?: string | null;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

// 4. Common Parameter cho API Get (Search, Filter)
export interface SearchParams {
  pageIndex?: number;
  pageSize?: number;
  searchTerm?: string;
  [key: string]: any;
}

// 5. Product Type (Ví dụ cho Quản lý thực đơn)
export interface Category {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId: string;
  categoryName?: string;
  isActive: boolean;
  isSoldOut?: boolean;
}

// DTO dùng cho Form Create/Update
export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  
  // Thống nhất dùng 'image' thay vì 'imageFile'
  image?: File | null; 
  
  // Cho phép cập nhật trạng thái nếu cần
  isActive?: boolean;
}

export interface PagedResult<T> {
  items: T[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Result<T> {
  isSuccess: boolean;
  isFailure: boolean;
  error: { code: string; message: string } | null;
  value: T;
}

export interface CartItem extends Product {
  cartId: string; // ID unique trong giỏ hàng (để phân biệt nếu sau này có topping)
  quantity: number;
  note?: string; // Ghi chú món (ít cay, không hành...)
}

export interface GuestOrderRequest {
  qrToken: string; // Token từ URL
  items: {
    productId: string;
    quantity: number;
    note?: string;
  }[];
}

export interface PublicMenu {
  categories: Category[];
  products: Product[];
}

export interface TableInfo {
  id: string;
  name: string;
  branchName: string;
  isOccupied: boolean;
}

export enum OrderStatus {
  Pending = "Pending",      // Chờ xác nhận
  Confirmed = "Confirmed",  // Đã xác nhận (Bếp nhận đơn)
  Cooking = "Cooking",      // Đang nấu
  Ready = "Ready",          // Đã xong (Chờ bưng)
  Served = "Served",        // Đã phục vụ
  Cancelled = "Cancelled",  // Đã hủy
}

export interface GuestOrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  note?: string;
  status: OrderStatus;
  imageUrl?: string;
  updatedAt: string;
}

export interface GuestOrderHistory {
  items: GuestOrderItem[];
  totalAmount: number;
  status: string; // Trạng thái chung của cả bàn (nếu cần)
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
}

export interface Table {
  id: string;
  name: string;       // Bàn 1, Bàn 2...
  capacity: number;   // Số ghế (4, 6, 10...)
  status: string;     // "Available", "Occupied"
  qrToken: string;    // Token dùng để tạo QR Code
  isActive: boolean;
  branchId: string;
}

export interface CreateTableRequest {
  name: string;
  capacity: number;
  branchId: string;
}

export interface StaffProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: string;      // "Staff", "Chef", "Cashier" (Tùy backend)
  branchId: string;
  branchName?: string;
  isActive: boolean;
}

export interface CreateStaffRequest {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  branchId: string;
  role: string; 
}

export interface Tenant {
  id: string;
  name: string;
  planType: string;             // Hoặc dùng subscriptionPlan nếu muốn đổi tên
  subscriptionPlan?: string;// Alias để tránh lỗi nếu code cũ gọi tên này
  isLocked: boolean;
  isActive: boolean;
  createdAt: string;
  ownerEmail?: string;      // Email chủ quán
  connectionString?: string;
}

export interface RegisterTenantRequest {
  restaurantName: string;
  ownerName: string;
  email: string;
  password: string;
  address: string;
  phoneNumber: string;
  planType: string; // "Free", "Premium"
}

export interface SysAdminStats {
  totalTenants: number;
  activeTenants: number;
  totalRevenue: number;     // Doanh thu từ phí thuê bao (nếu có)
  totalUsers: number;       // Tổng user toàn hệ thống
  recentTenants: Tenant[];
}

