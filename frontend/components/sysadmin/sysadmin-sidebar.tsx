'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Store, Users, Settings, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

const sidebarItems = [
  {
    title: "Tổng quan",
    href: "/sysadmin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Quản lý Nhà hàng",
    href: "/sysadmin/restaurants", // Trang bạn vừa làm xong
    icon: Store,
  },
  {
    title: "Tài khoản hệ thống",
    href: "/sysadmin/users",
    icon: Users,
  },
  {
    title: "Cấu hình AI",
    href: "/sysadmin/ai-config",
    icon: Shield,
  },
  {
    title: "Cài đặt",
    href: "/sysadmin/settings",
    icon: Settings,
  },
]

export function SysAdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 border-gray-200 text-black min-h-screen p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-bold">S</div>
        <span className="text-xl font-bold">S2O System</span>
      </div>
      <nav className="space-y-1">
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname.startsWith(item.href)
                ? "bg-orange-600 text-white"
                : "text-black-400 hover:text-white hover:bg-slate-800"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.title}
          </Link>
        ))}
      </nav>
    </div>
  )
}