"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ListOrdered, 
  Store, 
  Settings, 
  LogOut,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";

const menuItems = [
  { title: "Tổng quan", href: "/owner/dashboard", icon: LayoutDashboard },
  { title: "Quản lý Món", href: "/owner/products", icon: UtensilsCrossed },
  { title: "Danh mục", href: "/owner/categories", icon: Menu },
  { title: "Chi nhánh", href: "/owner/branches", icon: Store },
  { title: "Doanh thu", href: "/owner/revenue", icon: ListOrdered },
  { title: "Cài đặt", href: "/owner/settings", icon: Settings },
];

export function OwnerSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-14 items-center border-b px-4">
        <span className="text-lg font-bold text-primary">S2O.Restaurant</span>
      </div>
      
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid items-start px-2 text-sm font-medium">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                pathname === item.href 
                  ? "bg-accent text-accent-foreground" 
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t p-4">
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 text-destructive hover:text-destructive"
          onClick={() => authService.logout()}
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </Button>
      </div>
    </div>
  );
}