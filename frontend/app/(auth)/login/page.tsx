"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { jwtDecode } from "jwt-decode"; 

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/auth.service";
// [FIX 1] Import LoginRequest từ types
import { LoginRequest } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit } = useForm<LoginRequest>();

  const onSubmit = async (data: LoginRequest) => {
    setIsLoading(true);

    try {
      // 1. Gọi API
      // [FIX 2] AuthController trả về trực tiếp LoginResponse, không có wrapper Result
      const res = await authService.login(data);

      // 2. Kiểm tra kết quả
      if (res && res.accessToken) {
        const { accessToken, user } = res;

        // 3. Lưu LocalStorage
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("user", JSON.stringify(user));

        // 4. Cookie & Decode Token
        let maxAge = 86400; // 1 ngày
        try {
          const decoded: any = jwtDecode(accessToken);
          const currentTime = Math.floor(Date.now() / 1000);
          if (decoded.exp) {
            maxAge = decoded.exp - currentTime;
          }
        } catch (e) {
          console.error("Lỗi decode token:", e);
        }
        
        document.cookie = `token=${accessToken}; path=/; max-age=${maxAge}; SameSite=Lax`;

        toast.success(`Xin chào, ${user.fullName}`);

        // 5. Điều hướng
        const roles = user.roles || [];
        if (roles.includes("SystemAdmin")) {
          router.push("/sysadmin/dashboard");
        } else if (roles.includes("RestaurantOwner")) {
          router.push("/owner/dashboard");
        } else if (roles.includes("RestaurantStaff") || roles.includes("Chef")) {
          router.push("/staff/order-ticket");
        } else {
          router.push("/");
        }
      }
    } catch (error: any) {
      // [FIX 3] Xử lý lỗi
      // Nếu login sai, backend trả về 400 -> http interceptor ném lỗi vào đây
      console.error("Login Error:", error);
      
      let msg = "Đăng nhập thất bại";
      // Backend trả về lỗi dạng { code, description } hoặc { detail }
      if (error?.description) {
        msg = error.description;
      } else if (error?.detail) {
        msg = error.detail;
      } else if (error?.message) {
        msg = error.message;
      }

      toast.error("Lỗi", { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6 bg-white p-6 rounded-lg shadow-md">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Đăng nhập</h1>
          <p className="text-gray-500">Nhập email và mật khẩu hệ thống</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="admin@example.com" 
              required 
              {...register("email")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input 
              id="password" 
              type="password" 
              required 
              {...register("password")}
            />
          </div>
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Đăng nhập"}
          </Button>
        </form>
      </div>
    </div>
  );
}