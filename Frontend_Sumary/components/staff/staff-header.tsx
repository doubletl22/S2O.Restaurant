"use client";

import React from "react";
import { useRouter } from "next/navigation"; // 1. Import Hook Router
import { deleteCookie } from "cookies-next"; 
import { Bell, Search, Wifi, WifiOff, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function StaffHeader() {
  // 2. Khởi tạo Router (Thiếu dòng này là lỗi ngay!)
  const router = useRouter(); 
  
  const isOnline = true; 

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      document.cookie = 'role=; path=/; max-age=0'
      document.cookie = 's2o_auth_token=; path=/; max-age=0'
      router.push('/login')
      router.refresh()
    }
  }

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm/50">
      {/* Left: Title */}
      <div className="flex items-center gap-4">
        <h2 className="font-bold text-lg text-gray-800 hidden md:block">
          Chi nhánh: <span className="text-(--g1)">S2O Quận 1</span>
        </h2>
        <Badge variant={isOnline ? "default" : "destructive"} className="gap-1.5 py-1">
          {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
          {isOnline ? "Hệ thống Online" : "Mất kết nối"}
        </Badge>
      </div>

      {/* Middle: Search */}
      <div className="hidden md:flex items-center w-1/3 max-w-sm relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
        <Input 
          placeholder="Tìm nhanh món ăn hoặc số bàn..." 
          className="pl-9 bg-gray-50 border-none focus-visible:ring-1 focus-visible:ring-(--g1)" 
        />
      </div>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-(--g1)]">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </Button>

        <div className="h-6 w-px bg-gray-200 mx-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 pl-0 hover:bg-transparent focus-visible:ring-0">
              <Avatar className="h-9 w-9 border border-gray-100">
                <AvatarImage src="/images/chef-avatar.jpg" />
                <AvatarFallback className="bg-orange-100 text-orange-700 font-bold">B</AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-bold leading-none">Bếp Trưởng Lâm</p>
                <p className="text-xs text-muted-foreground mt-1">Staff ID: #8802</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">Hồ sơ cá nhân</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">Cài đặt ca làm việc</DropdownMenuItem>
            <DropdownMenuSeparator />
            
            {/* Sự kiện onClick gọi handleLogout */}
            <DropdownMenuItem 
              onClick={handleLogout}
              className="text-red-600 font-bold cursor-pointer focus:text-red-600 focus:bg-red-50 w-full"
            >
              <LogOut className="mr-2 h-4 w-4" /> 
              <span>Đăng xuất</span>
            </DropdownMenuItem>

          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}