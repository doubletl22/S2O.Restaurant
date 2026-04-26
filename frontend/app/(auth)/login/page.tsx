"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { jwtDecode } from "jwt-decode"; 

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/auth.service";
import { LoginRequest } from "@/lib/types"; // Đảm bảo file này tồn tại (xem bước 2)

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit } = useForm<LoginRequest>();

  // Hiển thị thông báo đăng xuất thành công hoặc session hết hạn
  useEffect(() => {
    if (searchParams.get('logged_out') === 'true') {
      toast.success('Đã đăng xuất thành công');
    } else if (searchParams.get('session_expired') === 'true') {
      toast.info('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
    }
  }, [searchParams]);

  const getErrorMessage = (error: any): string => {
    if (!error) return "Đăng nhập thất bại";

    // Trường hợp interceptor trả thẳng payload lỗi từ backend
    if (typeof error === "object") {
      if (typeof error.description === "string") return error.description;
      if (typeof error.detail === "string") return error.detail;
      if (typeof error.title === "string") return error.title;

      // Trường hợp vẫn nhận AxiosError gốc
      const responseData = error.response?.data;
      if (typeof responseData?.description === "string") return responseData.description;
      if (typeof responseData?.detail === "string") return responseData.detail;
      if (typeof responseData?.title === "string") return responseData.title;
    }

    if (typeof error.message === "string") return error.message;
    return "Đăng nhập thất bại";
  };

  const onSubmit = async (data: LoginRequest) => {
    setIsLoading(true);

    try {
      // 1. Gọi API
      const res = await authService.login(data);

      // 2. Kiểm tra kết quả
      if (res && res.accessToken) {
        const { accessToken, user } = res;

        // 3. Lưu LocalStorage (để dùng cho các request API sau này)
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("user", JSON.stringify(user));

        // 4. Set Cookie (để Middleware của Next.js đọc được)
        let maxAge = 86400; // Mặc định 1 ngày
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

        // 5. Điều hướng phân quyền
        // [QUAN TRỌNG] Kiểm tra role kỹ lưỡng
        const roles = user.roles || [];
        
        // Helper function kiểm tra role
        const hasRole = (roleName: string) => roles.includes(roleName);

        if (hasRole("SystemAdmin")) {
          router.push("/sysadmin/dashboard");
        } 
        else if (hasRole("RestaurantOwner") || hasRole("Owner")) {
          router.push("/owner/dashboard");
        } 
        else if (hasRole("Manager")) {
          router.push("/staff/order-ticket");
        }
        else if (hasRole("Chef")) {
          router.push("/staff/kitchen");
        }
        else if (hasRole("Waiter") || hasRole("RestaurantStaff") || hasRole("Staff")) {
          router.push("/staff/service");
        }
        else {
          console.warn("User không có role hợp lệ:", roles);
          router.push("/");
        }
        
        router.refresh();
      }
    } catch (error: any) {
      console.error("Login Error:", error);

      const msg = getErrorMessage(error);

      toast.error("Lỗi đăng nhập", { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6 bg-white p-8 rounded-xl shadow-lg border">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-primary">S2O Restaurant</h1>
          <p className="text-gray-500">Đăng nhập hệ thống quản lý</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="owner@example.com" 
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

        <div className="text-center text-xs text-gray-400">
             Quên mật khẩu? Liên hệ quản trị viên.
        </div>
      </div>
    </div>
  );
}