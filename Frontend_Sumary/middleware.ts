import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Import các hằng số và hàm tiện ích từ file auth.ts bạn vừa tạo
import { 
  AUTH_COOKIE_NAME, 
  ROLE_COOKIE_NAME, 
  ROLE_REDIRECTS,
  isPublicPath,
  hasAccess 
} from '@/lib/auth'

// Tên hàm BẮT BUỘC là 'middleware'
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. BỎ QUA FILE TĨNH & API
  // (Để server không phải xử lý auth cho ảnh, css, icon...)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // file có đuôi mở rộng (ảnh, font...)
  ) {
    return NextResponse.next()
  }

  // 2. CHO PHÉP TRANG PUBLIC
  // (Login, Guest, Quên mật khẩu...)
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // 3. LẤY COOKIE
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
  const role = request.cookies.get(ROLE_COOKIE_NAME)?.value

  // 4. XỬ LÝ TRANG CHỦ (/)
  // Vào trang chủ -> Tự điều hướng về Dashboard tương ứng
  if (pathname === '/') {
    if (token && role) {
      const redirectPath = ROLE_REDIRECTS[role] || '/'
      return NextResponse.redirect(new URL(redirectPath, request.url))
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 5. XỬ LÝ TRANG LOGIN
  // Đã đăng nhập mà cố vào lại Login -> Đá về Dashboard
  if (pathname === '/login') {
    if (token && role) {
      const redirectPath = ROLE_REDIRECTS[role] || '/'
      return NextResponse.redirect(new URL(redirectPath, request.url))
    }
    return NextResponse.next()
  }

  // 6. BẢO VỆ TRANG NỘI BỘ (ADMIN / STAFF)
  if (pathname.startsWith('/admin') || pathname.startsWith('/staff')) {
    
    // A. Chưa đăng nhập -> Đá về Login
    if (!token || !role) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname) // Lưu lại link để quay về sau khi login
      return NextResponse.redirect(loginUrl)
    }

    // B. Check Quyền (Dùng hàm hasAccess logic bên auth.ts)
    if (!hasAccess(role, pathname)) {
      // Ví dụ: Staff cố vào Admin -> Đá về Bếp
      if (role === 'Staff') {
        return NextResponse.redirect(new URL('/staff/kitchen', request.url))
      }
      
      // Admin cố vào trang không được phép -> Về Dashboard chính của họ
      const homeUrl = ROLE_REDIRECTS[role] || '/'
      return NextResponse.redirect(new URL(homeUrl, request.url))
    }
  }

  return NextResponse.next()
}

// Config matcher để tối ưu hiệu suất (Không chạy middleware trên các file không cần thiết)
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}