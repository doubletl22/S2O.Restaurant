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
import { authService, LoginRequest } from "@/services/auth.service";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit } = useForm<LoginRequest>();

  const onSubmit = async (data: LoginRequest) => {
    setIsLoading(true);
    console.log("Đang gửi request login...", data); // DEBUG

    try {
      // 1. Gọi API
      const res = await authService.login(data);
      console.log("Kết quả trả về từ API:", res); // DEBUG

      // 2. Kiểm tra kết quả
      if (res.isSuccess && res.value) {
        const { accessToken, user } = res.value;

        if (!accessToken) {
          throw new Error("Không nhận được Access Token từ Server");
        }

        // 3. Lưu LocalStorage
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("user", JSON.stringify(user));

        // 4. Giải mã JWT để lấy thời gian hết hạn (exp)
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
        
        // 5. Lưu Cookie
        document.cookie = `token=${accessToken}; path=/; max-age=${maxAge}; SameSite=Lax`;

        toast.success(`Xin chào, ${user.fullName}`);

        // 6. Điều hướng
        const roles = user.roles || [];
        console.log("User Roles:", roles); // DEBUG

        if (roles.includes("SystemAdmin")) {
          router.push("/sysadmin/dashboard");
        } else if (roles.includes("RestaurantOwner")) {
          router.push("/owner/dashboard");
        } else if (roles.includes("RestaurantStaff") || roles.includes("Chef")) {
          router.push("/staff/order-ticket");
        } else {
          router.push("/");
        }
      } else {
        // Xử lý lỗi nghiệp vụ (Sai pass, user not found...)
        console.error("Login thất bại:", res.error); // DEBUG
        toast.error("Đăng nhập thất bại", {
          description: res.error?.message || "Thông tin không chính xác.",
        });
      }
    } catch (error: any) {
      // Xử lý lỗi mạng / server crash
      console.error("Lỗi hệ thống:", error); // DEBUG
      
      let msg = "Không thể kết nối đến máy chủ.";
      if (error?.message) msg = error.message;
      // Nếu backend trả về validation error 400
      if (error?.response?.data?.detail) msg = error.response.data.detail;

      toast.error("Lỗi đăng nhập", { description: msg });
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