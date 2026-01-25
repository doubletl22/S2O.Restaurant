import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AUTH_COOKIE_NAME, ROLE_COOKIE_NAME, ROLE_REDIRECTS } from '@/lib/auth'

// 👇 ĐỔI TÊN HÀM TỪ 'middleware' THÀNH 'proxy'
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public guest routes (QR menu, etc.)
  if (pathname.startsWith('/guest') || pathname.startsWith('/t/')) {
    return NextResponse.next()
  }

  // Allow static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next()
  }

  // Get auth token and role from cookies
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
  const role = request.cookies.get(ROLE_COOKIE_NAME)?.value

  // If user is on login page and already authenticated, redirect to their dashboard
  if (pathname === '/login') {
    if (token && role) {
      const redirectPath = ROLE_REDIRECTS[role] || '/admin/dashboard'
      return NextResponse.redirect(new URL(redirectPath, request.url))
    }
    return NextResponse.next()
  }

  // Protect admin and staff routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/staff')) {
    // No token - redirect to login
    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check role-based access
    if (pathname.startsWith('/admin')) {
      if (role !== 'SuperAdmin' && role !== 'RestaurantOwner' && role !== 'SystemAdmin') {
        return NextResponse.redirect(new URL('/staff/kitchen', request.url))
      }
    }

    if (pathname.startsWith('/staff')) {
      if (role !== 'Staff' && role !== 'SuperAdmin' && role !== 'RestaurantOwner' && role !== 'SystemAdmin') {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }
  }

  // Root path - redirect based on auth status
  if (pathname === '/') {
    if (token && role) {
      const redirectPath = ROLE_REDIRECTS[role] || '/admin/dashboard'
      return NextResponse.redirect(new URL(redirectPath, request.url))
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

// Config giữ nguyên
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}