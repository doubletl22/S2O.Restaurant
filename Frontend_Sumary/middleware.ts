import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value; // Hoặc logic lấy token của bạn
  const { pathname } = request.nextUrl;

  // 1. Bảo vệ trang SysAdmin
  if (pathname.startsWith('/sysadmin')) {
    if (!token) return NextResponse.redirect(new URL('/login', request.url));
    
    // Giả sử decode token lấy role (bạn cần implement logic decode thực tế)
    // const role = getRoleFromToken(token);
    // if (role !== 'SysAdmin') return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // 2. Bảo vệ trang Owner
  if (pathname.startsWith('/owner')) {
    if (!token) return NextResponse.redirect(new URL('/login', request.url));
    
    // Check role Owner
    // if (role !== 'RestaurantOwner') ...
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/sysadmin/:path*', '/owner/:path*', '/staff/:path*'],
}