import type { User, UserRole, LoginResponse, ApiResponse } from './types'

// Cookie name for storing JWT token
export const AUTH_COOKIE_NAME = 's2o_auth_token'
export const ROLE_COOKIE_NAME = 's2o_user_role'

// Route configurations
export const ROUTE_CONFIG = {
  public: ['/login', '/guest'],
  adminRoutes: ['/admin'],
  staffRoutes: ['/staff'],
  guestRoutes: ['/guest'],
}

// Role-based redirect paths
// 👇 CẬP NHẬT: Thêm SystemAdmin và trỏ đúng vào trang dashboard cụ thể
export const ROLE_REDIRECTS: Record<string, string> = {
  SuperAdmin: '/admin/dashboard',
  SystemAdmin: '/admin/dashboard', // Role từ Backend thường là SystemAdmin
  RestaurantOwner: '/admin/dashboard',
  Staff: '/staff/kitchen',         // Staff nên vào thẳng bếp
}

// Mock user data for development
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  admin: {
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@s2o.restaurant',
      fullName: 'System Admin',
      roles: ['SystemAdmin'], // Cập nhật role cho khớp thực tế
    },
  },
  owner: {
    password: 'owner123',
    user: {
      id: '2',
      email: 'owner@s2o.restaurant',
      fullName: 'Restaurant Owner',
      roles: ['RestaurantOwner'],
    },
  },
  staff: {
    password: 'staff123',
    user: {
      id: '3',
      email: 'staff@s2o.restaurant',
      fullName: 'Kitchen Staff',
      roles: ['Staff'],
    },
  },
}

// Simulated login function
export async function mockLogin(
  username: string,
  password: string
): Promise<ApiResponse<LoginResponse & { user: User }>> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  const mockUser = MOCK_USERS[username.toLowerCase()] || MOCK_USERS['admin']; // Default fallback for testing

  if (mockUser && mockUser.password === password) {
    return {
      value: {
        accessToken: `mock_jwt_token_${username}_${Date.now()}`,
        refreshToken: `mock_refresh_token_${username}`,
        expiresIn: 3600,
        user: mockUser.user,
      },
      isSuccess: true,
      isFailure: false,
      error: null,
    }
  }

  return {
    value: null as any,
    isSuccess: false,
    isFailure: true,
    error: {
      code: 'AUTH_FAILED',
      message: 'Tên đăng nhập hoặc mật khẩu không chính xác',
    },
  }
}

// Get primary role from roles array
export function getPrimaryRole(roles: string[]): string {
  if (roles.includes('SuperAdmin')) return 'SuperAdmin'
  if (roles.includes('SystemAdmin')) return 'SystemAdmin' // 👇 Thêm dòng này
  if (roles.includes('RestaurantOwner')) return 'RestaurantOwner'
  if (roles.includes('Staff')) return 'Staff'
  return 'Guest'
}

// Check if a path is public
export function isPublicPath(pathname: string): boolean {
  return ROUTE_CONFIG.public.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )
}

// Check if a path requires specific role
export function getRequiredRole(pathname: string): string | null {
  if (pathname.startsWith('/admin')) return 'Admin' // SuperAdmin, SystemAdmin or RestaurantOwner
  if (pathname.startsWith('/staff')) return 'Staff'
  return null
}

// Check if user has access to a route
export function hasAccess(userRoles: string[], pathname: string): boolean {
  if (pathname.startsWith('/admin')) {
    // 👇 CẬP NHẬT: Cho phép SystemAdmin truy cập admin
    return (
      userRoles.includes('SuperAdmin') || 
      userRoles.includes('SystemAdmin') || 
      userRoles.includes('RestaurantOwner')
    )
  }
  if (pathname.startsWith('/staff')) {
    // Admin cũng có quyền vào xem trang staff nếu cần
    return userRoles.includes('Staff') || 
           userRoles.includes('SuperAdmin') || 
           userRoles.includes('SystemAdmin') || 
           userRoles.includes('RestaurantOwner');
  }
  return true
}