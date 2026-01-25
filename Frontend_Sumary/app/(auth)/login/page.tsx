"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";
import { Eye, EyeOff, Loader2, LogIn, ChefHat } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // State form
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Gọi API đăng nhập (Backend Identity Service)
      // POST /auth/login -> Trả về { accessToken, role, fullName, ... }
      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });

      const { accessToken, role, fullName } = response.data;

      // 2. Lưu Token vào Cookie (Hết hạn sau 1 ngày)
      setCookie('access_token', accessToken, { maxAge: 60 * 60 * 24 });
      setCookie('user_role', role);
      setCookie('user_name', fullName);

      toast.success(`Xin chào, ${fullName}!`);

      // 3. Phân luồng điều hướng (Routing Logic)
      switch (role) {
        case "SystemAdmin":
        case "RestaurantOwner":
          // Admin & Chủ quán -> Vào trang quản trị
          router.push('/admin/menu'); 
          break;
        
        case "Staff":
          // Nhân viên -> Vào thẳng Bếp
          router.push('/staff/kitchen');
          break;

        case "Customer":
        default:
          // Khách hàng -> Về trang chủ đặt món
          router.push('/');
          break;
      }

    } catch (error: any) {
      console.error("Login Error:", error);
      const msg = error.response?.data?.message || "Email hoặc mật khẩu không đúng.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-4">
      <Card className="w-full max-w-md shadow-lg border-none">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[var(--g1)] to-[var(--g2)] rounded-xl flex items-center justify-center text-white shadow-brand">
              <ChefHat size={28} strokeWidth={2.5} />
            </div>
          </div>
          <CardTitle className="text-2xl font-black tracking-tight text-[var(--text)]">
            S2O Restaurant
          </CardTitle>
          <CardDescription>
            Đăng nhập để truy cập hệ thống quản lý
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="staff@s2o.vn" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="bg-gray-50 border-gray-200 focus:bg-white transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
                <a href="#" className="text-xs font-medium text-[var(--g1)] hover:underline">Quên mật khẩu?</a>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="bg-gray-50 border-gray-200 focus:bg-white transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-[var(--g1)] to-[var(--g2)] text-white font-bold h-11 shadow-md hover:opacity-90 transition-opacity"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" /> Đăng nhập
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}