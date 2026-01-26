'use client'

import React, { useState } from "react"
import { useRouter } from 'next/navigation'
import { setCookie } from 'cookies-next' // Dùng thư viện này cho chuẩn
import { Mail, Lock, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { toast } from "sonner" // Thêm thông báo đẹp mắt

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
      const response = await api.post('/auth/login', {
        email: email, 
        password: password
      });
      const data = response.data;

      if (data.accessToken) {
        
        setCookie('access_token', data.accessToken, { 
            maxAge: 60 * 60 * 24, // 1 ngày
            path: '/' 
        });

        const branchId = data.user?.branchId;
        if (branchId) {
          setCookie('branch_id', branchId, { maxAge: 60 * 60 * 24, path: '/' });
        }

        const tenantId = data.tenantId || data.user?.tenantId; 
        if (tenantId) {
            setCookie('tenant_id', tenantId, { maxAge: 60 * 60 * 24, path: '/' });
        }

        let role = 'Staff';
        if (data.user?.roles && Array.isArray(data.user.roles)) {
            role = data.user.roles[0];
        } else if (data.user?.role) {
            role = data.user.role;
        }
        setCookie('user_role', role, { maxAge: 60 * 60 * 24, path: '/' });

        // D. Lưu tên người dùng (để hiển thị UI)
        if (data.user?.fullName) {
            setCookie('user_name', data.user.fullName, { maxAge: 60 * 60 * 24, path: '/' });
        }

        toast.success(`Xin chào ${data.user?.fullName || "bạn"}!`);

        // --- 3. CHUYỂN HƯỚNG ---
        // Đợi 1 chút để cookie kịp lưu
        setTimeout(() => {
            if (['SystemAdmin', 'SuperAdmin', 'RestaurantOwner', 'Admin'].includes(role)) {
                // Vào trang Admin nếu là chủ/quản trị
                router.push('/admin/qr-codes'); // Hoặc về dashboard tùy ý
            } else {
                // Vào bếp nếu là nhân viên
                router.push('/staff/kitchen');
            }
            router.refresh(); // Refresh để cập nhật trạng thái auth mới
        }, 500);

      } else {
        setError('Hệ thống không trả về Token. Vui lòng thử lại.');
      }

    } catch (err: any) {
      console.error("Login Error:", err);
      const msg = err.response?.data?.description || err.response?.data?.message || 'Email hoặc mật khẩu không đúng.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-md">
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
              Đăng nhập hệ thống
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-medium" style={{ color: 'var(--text)' }}>Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--muted)' }} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email"
                    className="w-full pl-12 pr-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#f97316]/30 border border-gray-200"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-sm font-medium" style={{ color: 'var(--text)' }}>Mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--muted)' }} />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="w-full pl-12 pr-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#f97316]/30 border border-gray-200"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-xl text-sm bg-red-50 text-red-600 border border-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="bg-(--g1) hover:bg-orange-600 w-full py-3.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all mt-2 shadow-lg shadow-orange-500/30"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Đang xử lý...
                  </>
                ) : (
                  'Đăng nhập ngay'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}