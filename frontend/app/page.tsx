'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { jwtDecode } from 'jwt-decode' // Đảm bảo đã cài: npm install jwt-decode

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    // 1. Kiểm tra Token trong LocalStorage
    const token = localStorage.getItem('token')

    if (!token) {
      // Nếu không có token -> Về trang đăng nhập
      router.push('/login')
      return
    }

    try {
      // 2. Nếu có token -> Giải mã để biết đường chuyển tiếp
      const decoded: any = jwtDecode(token)
      
      // Lấy role (xử lý cả trường hợp key dài của .NET)
      const role = decoded.role || 
                   decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

      switch (role) {
        case 'SysAdmin':
          router.push('/SystemAdmin/restaurants')
          break
        case 'RestaurantOwner':
          router.push('/owner/dashboard')
          break
        case 'RestaurantStaff':
          router.push('/staff/tables')
          break
        default:
          // Nếu role lạ -> Về login cho chắc
          router.push('/login')
      }
    } catch (error) {
      // Token lỗi -> Về login
      router.push('/login')
    }
  }, [router])

  // Return null hoặc loading spinner trong lúc đợi chuyển trang
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
    </div>
  )
}