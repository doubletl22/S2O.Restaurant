'use client'

import React, { useState } from "react"
import { useRouter } from 'next/navigation'
import { Mail, Lock, Loader2 } from 'lucide-react'
import api from '@/lib/api'
// 👇 Import các hằng số quan trọng từ file cấu hình auth
import { AUTH_COOKIE_NAME, ROLE_COOKIE_NAME } from '@/lib/auth' 

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // 1. Gọi API Login thật
      const response = await api.post('/api/auth/login', {
        email: email, 
        password: password
      });

      const data = response.data;

      // 2. Lưu Token và Role vào Cookie với tên chuẩn (để Middleware đọc được)
      if (data.accessToken) {
        // Cookie token
        document.cookie = `${AUTH_COOKIE_NAME}=${data.accessToken}; path=/; max-age=86400`;
        
        // Xử lý Role: Lấy role đầu tiên hoặc role chính
        // Backend có thể trả về array "roles": ["SystemAdmin"] hoặc string "role": "SystemAdmin"
        let role = 'Staff';
        if (data.user?.roles && Array.isArray(data.user.roles)) {
            role = data.user.roles[0];
        } else if (data.user?.role) {
            role = data.user.role;
        }

        // Lưu Cookie role
        document.cookie = `${ROLE_COOKIE_NAME}=${role}; path=/; max-age=86400`;

        // 3. Logic chuyển hướng
        // Kiểm tra kỹ các tên Role mà Backend trả về
        if (['SystemAdmin', 'SuperAdmin', 'RestaurantOwner', 'Admin'].includes(role)) {
            router.push('/admin/dashboard');
        } else {
            // Mặc định cho Staff hoặc các role khác
            router.push('/staff/kitchen');
        }
        
        // Refresh để Middleware chạy lại và xác nhận cookie mới
        router.refresh();
      } else {
        setError('Không nhận được token từ hệ thống.');
      }

    } catch (err: any) {
      console.error(err);

      if (err.response && err.response.data) {
        // Backend trả về object Error: { code: "...", description: "..." }
        // Chúng ta ưu tiên hiển thị 'description'
        const serverError = err.response.data;
        setError(serverError.description || serverError.message || 'Thông tin đăng nhập không chính xác.');
      } else {
        setError('Có lỗi xảy ra khi kết nối tới server.');
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div 
          className="overflow-hidden"
          style={{ 
            background: 'var(--card)',
            boxShadow: 'var(--shadow)',
            borderRadius: 'var(--r20)'
          }}
        >
          {/* Header */}
          <div 
            className="px-6 py-8 text-center text-white"
            style={{ 
              background: 'linear-gradient(135deg, var(--g1), var(--g2))'
            }}
          >
            <h1 className="text-2xl font-bold">S2O.Restaurant</h1>
            <p className="text-sm mt-1 opacity-90">Hệ thống quản lý nhà hàng</p>
          </div>

          {/* Form */}
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--text)' }}>
              Đăng nhập
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Email Input */}
              <div className="flex flex-col gap-2">
                <label 
                  htmlFor="email" 
                  className="text-sm font-medium"
                  style={{ color: 'var(--text)' }}
                >
                  Email
                </label>
                <div className="relative">
                  <Mail 
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" 
                    style={{ color: 'var(--muted)' }} 
                  />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-12 pr-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#f97316]/30"
                    style={{ 
                      background: 'var(--bg)',
                      border: '1px solid var(--line)',
                      color: 'var(--text)'
                    }}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-2">
                <label 
                  htmlFor="password" 
                  className="text-sm font-medium"
                  style={{ color: 'var(--text)' }}
                >
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock 
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" 
                    style={{ color: 'var(--muted)' }} 
                  />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="w-full pl-12 pr-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#f97316]/30"
                    style={{ 
                      background: 'var(--bg)',
                      border: '1px solid var(--line)',
                      color: 'var(--text)'
                    }}
                    required
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div 
                  className="px-4 py-3 rounded-xl text-sm"
                  style={{ 
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444'
                  }}
                >
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="bg-brand w-full py-3.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-70 mt-2"
                style={{ boxShadow: '0 8px 20px rgba(249, 115, 22, 0.25)' }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  'Đăng nhập'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}