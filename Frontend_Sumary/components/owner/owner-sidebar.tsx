'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, UtensilsCrossed, QrCode, 
  BarChart3, Settings, Users, 
  Store
} from "lucide-react"
import { cn } from "@/lib/utils"

const sidebarItems = [
  {
    title: "Tổng quan",
    href: "/owner/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Quản lý Món ăn",
    href: "/owner/products", // Menu cũ
    icon: UtensilsCrossed,
  },
  {
    title: "Bàn & Mã QR",
    href: "/owner/qr-codes", // Qr-codes cũ
    icon: QrCode,
  },
  {
    title: "Quản lý chi nhánh",
    href: "/owner/branches",
    icon: Store,
  },
  {
    title: "Báo cáo Doanh thu",
    href: "/owner/revenue",
    icon: BarChart3,
  },
  {
    title: "Nhân viên",
    href: "/owner/staff",
    icon: Users,
  },
  {
    title: "Thiết lập Quán",
    href: "/owner/settings",
    icon: Settings,
  },
]

export function OwnerSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white border-r min-h-screen p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold">O</div>
        <span className="text-xl font-bold text-gray-800">Chủ Nhà Hàng</span>
      </div>
      <nav className="space-y-1">
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname.startsWith(item.href)
                ? "bg-orange-50 text-orange-600"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
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