"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // Thêm useRouter
import { deleteCookie } from "cookies-next"; // Thêm deleteCookie
import { 
  Flame, 
  LayoutGrid, 
  History, 
  LogOut, 
  ChefHat,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner"; // Thêm toast để thông báo

const menuItems = [
  {
    title: "Bếp Trung Tâm",
    href: "/staff/kitchen",
    icon: Flame,
    color: "text-orange-500",
  },
  {
    title: "Sơ Đồ Bàn",
    href: "/staff/tables",
    icon: LayoutGrid,
    color: "text-blue-500",
  },
  {
    title: "Lịch Sử Đơn",
    href: "/staff/history",
    icon: History,
    color: "text-purple-500",
  },
];

export function StaffSidebar() {
  const pathname = usePathname();
  const router = useRouter(); // Hook điều hướng

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    // 1. Xóa toàn bộ cookie liên quan đến phiên đăng nhập
    deleteCookie("access_token");
    deleteCookie("user_role");
    deleteCookie("user_name");

    // 2. Thông báo nhẹ
    toast.info("Đã đăng xuất hệ thống");

    // 3. Chuyển hướng về trang login
    router.push("/login");
  };

  return (
    <div className="h-full w-64 bg-white border-r flex flex-col shadow-sm">
      {/* 1. Header Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-(--g1) to-(--g2) flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
          <ChefHat size={24} strokeWidth={2} />
        </div>
        <div>
          <h1 className="font-black text-xl tracking-tighter text-(--text)">
            S2O<span className="text-(--g1)">.Staff</span>
          </h1>
          <p className="text-xs text-muted-foreground font-medium">Kitchen Display System</p>
        </div>
      </div>

      <Separator />

      {/* 2. Menu Chính */}
      <div className="flex-1 py-6 px-3 space-y-1">
        <p className="px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
          Menu Điều Khiển
        </p>
        
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium text-sm",
                  isActive
                    ? "bg-orange-50 text-orange-700 font-bold shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon
                  size={20}
                  className={cn(
                    "transition-colors",
                    isActive ? "text-orange-600" : "text-gray-400 group-hover:text-gray-600"
                  )}
                />
                {item.title}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-600" />
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* 3. Footer User Info & Logout */}
      <div className="p-4 border-t bg-gray-50/50">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
            <AvatarImage src="/images/chef-avatar.jpg" />
            <AvatarFallback className="bg-orange-100 text-orange-700 font-bold">B</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold truncate">Bếp Trưởng Lâm</p>
            <p className="text-xs text-muted-foreground truncate">Ca sáng: 06:00 - 14:00</p>
          </div>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
            <Settings size={18} />
          </Button>
        </div>
        
        <Button 
          variant="outline" 
          onClick={handleLogout} // Gắn sự kiện onClick vào đây
          className="w-full justify-start text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700 font-bold"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Đăng xuất
        </Button>
      </div>
    </div>
  );
}