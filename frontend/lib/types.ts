export interface Result<T> {
  value: T;
  isSuccess: boolean;
  error?: {
    code: string;
    description: string;
    message?: string;
  };
}

export interface PagedResult<T> {
  items: T[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// --- AUTH & USER ---
export interface User {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
}
export interface LoginRequest { email: string; password: string; }
export type LoginBody = LoginRequest;
export interface LoginResponse { accessToken: string; user: User; }

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  roles: string[]; // Backend phải trả về mảng role
}

export interface RegisterTenantRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
  password?: string;
  subscriptionPlanId?: string;
}
export type RegisterTenantBody = RegisterTenantRequest;

// --- TENANT & BRANCH ---
export interface Tenant {
  id: string;
  name: string;
  email?: string; // Email liên hệ
  phone?: string;
  address?: string;
  isActive: boolean;
  isLocked: boolean;
  createdOn?: string;
  ownerEmail?: string;      
  planType?: string;        
  subscriptionPlan?: string; 
  createdAt?: string;       
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
}
export interface BranchDto extends Branch {}

export interface Table {
  id: string;
  name: string;
  capacity: number;
  branchId: string;
  isActive: boolean;
  qrToken?: string;
  status?: string;
}
export interface TableDto extends Table {}

// --- CATALOG ---
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
  isActive: boolean;
  isSoldOut?: boolean;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  isActive: boolean;
  imageUrl?: string;
  imageFile?: File;
}

// --- STAFF ---
export interface Staff {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  isActive: boolean;
  branchId?: string;
}
export interface StaffProfile extends Staff {}
export interface CreateStaffRequest {
  email: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  branchId: string;
  password?: string;
}

// --- GUEST ---
export interface TableInfo {
  tableId: string;
  tableName: string;
  tenantId: string;
  tenantName: string;
  branchId: string;
  branchName?: string;
}
export type PublicTableInfo = TableInfo;

export interface PublicMenu {
  categories: { id: string; name: string; products: Product[] }[];
  products?: Product[];
}

export interface CartItem extends Product {
  cartId: string;
  quantity: number;
  note?: string;
}

export interface GuestOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  note?: string;
  unitPrice: number;   
  totalPrice: number;
  status: number;
  imageUrl?: string;
  price?: number; 
}

// --- ORDER ---
export enum OrderStatus {
  Pending = 0,
  Confirmed = 1,
  Cooking = 2,
  Ready = 3,
  Completed = 4,
  Cancelled = 5,
  Served = 6 
}

export interface OrderItemDto {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  note?: string;
  status: OrderStatus;
}

export interface Order {
  id: string;
  orderNumber: string;
  tableId?: string;
  tableName?: string;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItemDto[]; 
  createdOn: string;
  createdAt: string; 
}

export interface StaffOrderDto extends Order {}

// --- DASHBOARD ---
export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  activeOrders: number;
  totalProducts: number;
  totalStaff: number;
  todayRevenue?: number;
  todayOrders?: number;
  recentOrders?: Order[];
  topSellingProducts: { name: string; quantity: number }[];
}

export interface SysAdminStats {
  totalTenants: number;
  activeTenants: number;
  totalRevenue: number;
  totalUsers: number;
  recentTenants?: any[];
}

