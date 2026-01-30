'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react'
import { jwtDecode } from 'jwt-decode'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authService } from '@/services/auth.service'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      toast.error('Vui lòng nhập đầy đủ thông tin')
      return
    }

    try {
      setLoading(true)
      const data = await authService.login(formData.email, formData.password)
      localStorage.setItem('token', data.accessToken)
      document.cookie = `token=${data.accessToken}; path=/; max-age=${data.expiresIn}; SameSite=Lax`
      const decoded: any = jwtDecode(data.accessToken)
      const tenantId = decoded?.tenant_id;
      if (tenantId) {
        document.cookie = `tenant_id=${tenantId}; path=/; SameSite=Lax`;
      }
      console.log("Decoded Token:", decoded) 
      const role = decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      console.log("User Role:", role)
      toast.success('Đăng nhập thành công')

      switch (role) {
        case 'SystemAdmin':
          router.push('/sysadmin/restaurants')
          break
        case 'RestaurantOwner':
          router.push('/owner/dashboard')
          break
        case 'RestaurantStaff':
          router.push('/staff/tables')
          break
        case 'Chef':
           router.push('/staff/kitchen')
           break
        default:
          console.warn("Role không được hỗ trợ:", role)
          router.push('/') 
      }

    } catch (error: any) {
      console.error(error)
      toast.error(error.response?.data?.detail || "Đăng nhập thất bại")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600 mb-2">
            <LogIn className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Đăng nhập
          </h2>
          <p className="text-sm text-gray-500">
            Truy cập vào hệ thống quản lý nhà hàng S2O
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6 mt-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Nhập email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                disabled={loading}
                className="h-11"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
                <Link 
                  href="/forgot-password" 
                  className="text-xs font-medium text-orange-600 hover:text-orange-500"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  disabled={loading}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-base font-medium shadow-lg shadow-orange-200 transition-all hover:scale-[1.01]"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Đăng nhập"
            )}
          </Button>

          {/* Footer Link (Optional) */}
          <p className="text-center text-sm text-gray-500">
            Bạn chưa có tài khoản?{' '}
            <Link href="/register" className="font-semibold text-orange-600 hover:text-orange-500 hover:underline">
              Đăng ký dùng thử
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}