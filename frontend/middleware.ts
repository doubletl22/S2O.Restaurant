import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Hàm decode token đơn giản để chạy trong Edge Runtime
function getRoleFromToken(token: string) {
  try {
    // Token gồm 3 phần: header.payload.signature
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const payload = JSON.parse(jsonPayload);
    // Lấy role (key ngắn hoặc key dài .NET)
    return payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
  } catch (e) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Nếu truy cập các trang cần bảo vệ mà không có token -> Về Login
  if ((pathname.startsWith('/sysadmin') || pathname.startsWith('/owner') || pathname.startsWith('/staff')) && !token) {
     return NextResponse.redirect(new URL('/login', request.url));
  }

  // Nếu có token, kiểm tra quyền cụ thể
  if (token) {
      const role = getRoleFromToken(token);

      // 1. Bảo vệ trang SysAdmin
      if (pathname.startsWith('/sysadmin') && role !== 'SystemAdmin') {
          // Nếu không phải Admin mà cố vào -> Đẩy về trang chủ (để trang chủ tự điều hướng lại đúng chỗ)
          return NextResponse.redirect(new URL('/', request.url));
      }

      // 2. Bảo vệ trang Owner
      if (pathname.startsWith('/owner') && role !== 'RestaurantOwner') {
          return NextResponse.redirect(new URL('/', request.url));
      }

      // 3. Bảo vệ trang Staff
      if (pathname.startsWith('/staff') && role !== 'RestaurantStaff' && role !== 'Chef' && role !== 'Manager') {
           return NextResponse.redirect(new URL('/', request.url));
      }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/sysadmin/:path*', '/owner/:path*', '/staff/:path*'],
}