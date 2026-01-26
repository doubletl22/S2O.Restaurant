import type { User, LoginResponse, ApiResponse } from './types'

// --- 1. CẤU HÌNH COOKIE (Phải khớp với LoginPage) ---
export const AUTH_COOKIE_NAME = 'access_token'
export const ROLE_COOKIE_NAME = 'user_role'
export const TENANT_COOKIE_NAME = 'tenant_id'
export const USER_NAME_COOKIE_NAME = 'user_name'

// --- 2. CẤU HÌNH ROUTE ---
export const ROUTE_CONFIG = {
  public: ['/login', '/guest', '/forgot-password'], // Các trang không cần login
  adminRoutes: ['/admin'],
  staffRoutes: ['/staff'],
}

// --- 3. ĐIỀU HƯỚNG THEO ROLE (Dùng sau khi Login) ---
export const ROLE_REDIRECTS: Record<string, string> = {
  SuperAdmin: '/admin/dashboard',
  SystemAdmin: '/admin/dashboard',      // Admin hệ thống -> Dashboard
  RestaurantOwner: '/admin/dashboard',  // Chủ nhà hàng -> Dashboard
  Staff: '/staff/kitchen',              // Nhân viên -> Vào thẳng Bếp
  Chef: '/staff/kitchen',
  Waiter: '/staff/tables',
}

// --- 4. HÀM KIỂM TRA QUYỀN (Dùng trong Middleware) ---

// Lấy role chính từ mảng roles (nếu user có nhiều quyền)
export function getPrimaryRole(roles: string[] | string): string {
  // Nếu roles là string đơn (do cookie lưu)
  if (typeof roles === 'string') return roles;

  // Nếu là mảng, ưu tiên quyền cao nhất
  if (roles.includes('SuperAdmin')) return 'SuperAdmin'
  if (roles.includes('SystemAdmin')) return 'SystemAdmin'
  if (roles.includes('RestaurantOwner')) return 'RestaurantOwner'
  if (roles.includes('Admin')) return 'RestaurantOwner' // Map Admin thường về Owner
  if (roles.includes('Staff')) return 'Staff'
  return 'Guest'
}

// Kiểm tra xem user có được vào trang này không
export function hasAccess(userRole: string, pathname: string): boolean {
  // 1. Trang Admin: Chỉ dành cho Admin, Owner
  if (pathname.startsWith('/admin')) {
    return [
      'SuperAdmin', 
      'SystemAdmin', 
      'RestaurantOwner', 
      'Admin'
    ].includes(userRole);
  }

  // 2. Trang Staff: Dành cho Staff VÀ Admin (Admin được phép xuống bếp kiểm tra)
  if (pathname.startsWith('/staff')) {
    return [
      'Staff', 
      'Chef', 
      'Waiter',
      'SuperAdmin', 
      'SystemAdmin', 
      'RestaurantOwner', 
      'Admin'
    ].includes(userRole);
  }

  // Các trang khác (public) thì luôn true
  return true;
}

// Kiểm tra xem path có phải public không
export function isPublicPath(pathname: string): boolean {
  return ROUTE_CONFIG.public.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )
}

// --- 5. MOCK LOGIN (Chỉ dùng khi chưa có Backend, giờ có thể bỏ qua) ---
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  admin: {
    password: '123',
    user: { id: '1', email: 'admin@s2o.vn', fullName: 'System Admin', roles: ['SystemAdmin'] },
  },
  staff: {
    password: '123',
    user: { id: '3', email: 'staff@s2o.vn', fullName: 'Đầu Bếp Lâm', roles: ['Staff'] },
  },
}

export async function mockLogin(username: string, password: string): Promise<any> {
  await new Promise((resolve) => setTimeout(resolve, 800))
  const mockUser = MOCK_USERS[username.toLowerCase()]
  
  if (mockUser && mockUser.password === password) {
    return {
      value: { accessToken: `mock_token_${Date.now()}`, user: mockUser.user },
      isSuccess: true
    }
  }
  return { isSuccess: false, error: { message: 'Sai mật khẩu' } }
}