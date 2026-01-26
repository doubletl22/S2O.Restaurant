"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; 
// Đã xóa import deleteCookie, useRouter và toast vì không dùng nữa
import { 
  Flame, 
  LayoutGrid, 
  History, 
  ChefHat,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

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
  // Không cần hàm handleLogout ở đây nữa

  return (
    <div className="h-full w-64 bg-white border-r flex flex-col shadow-sm">
      {/* 1. Header Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--g1)] to-[var(--g2)] flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
          <ChefHat size={24} strokeWidth={2} />
        </div>
        <div>
          <h1 className="font-black text-xl tracking-tighter text-[var(--text)]">
            S2O<span className="text-[var(--g1)]">.Staff</span>
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
    </div>
  );
}