import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Hàm decode token đơn giản để chạy trong Edge Runtime
function getRolesFromToken(token: string): string[] {
  try {
    // Token gồm 3 phần: header.payload.signature
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const payload = JSON.parse(jsonPayload);
    // Lấy role (key ngắn hoặc key dài .NET)
    const rawRoles = payload.role || payload.roles || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    if (!rawRoles) return [];
    if (Array.isArray(rawRoles)) return rawRoles.map((r) => String(r));
    return [String(rawRoles)];
  } catch (e) {
    return [];
  }
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Nếu truy cập các trang cần bảo vệ mà không có token -> Về Login
  if ((pathname.startsWith('/sysadmin') || pathname.startsWith('/owner') || pathname.startsWith('/staff')) && !token) {
     return NextResponse.redirect(new URL('/login', request.url));
  }

  // Nếu có token, kiểm tra quyền cụ thể
  if (token) {
      const roles = getRolesFromToken(token);
      const hasRole = (name: string) => roles.includes(name);

      // 1. Bảo vệ trang SysAdmin
      if (pathname.startsWith('/sysadmin') && !hasRole('SystemAdmin')) {
          // Nếu không phải Admin mà cố vào -> Đẩy về trang chủ (để trang chủ tự điều hướng lại đúng chỗ)
          return NextResponse.redirect(new URL('/', request.url));
      }

      // 2. Bảo vệ trang Owner
      if (pathname.startsWith('/owner') && !hasRole('RestaurantOwner')) {
          return NextResponse.redirect(new URL('/', request.url));
      }

      // 3. Bảo vệ trang Staff
       if (pathname.startsWith('/staff') && !hasRole('RestaurantStaff') && !hasRole('Staff') && !hasRole('Chef') && !hasRole('Manager') && !hasRole('Waiter')) {
           return NextResponse.redirect(new URL('/', request.url));
      }

      // 4. Chặn bếp/waiter vào giao diện quản lý
      const isManagementRoute =
        pathname.startsWith('/staff/order-ticket') ||
        pathname.startsWith('/staff/tables') ||
        pathname.startsWith('/staff/history');

      if (isManagementRoute && !hasRole('Manager')) {
        if (hasRole('Chef')) {
          return NextResponse.redirect(new URL('/staff/kitchen', request.url));
        }
        if (hasRole('Waiter') || hasRole('RestaurantStaff') || hasRole('Staff')) {
          return NextResponse.redirect(new URL('/staff/service', request.url));
        }
        return NextResponse.redirect(new URL('/', request.url));
      }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/sysadmin/:path*', '/owner/:path*', '/staff/:path*'],
}