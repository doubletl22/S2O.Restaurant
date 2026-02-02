"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChefHat, ListOrdered, History, LogOut, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";

const menuItems = [
  { title: "Bếp (KDS)", href: "/staff/kitchen", icon: ChefHat },
  { title: "Tiếp nhận (Waiter)", href: "/staff/order-ticket", icon: ListOrdered },
  { title: "Lịch sử", href: "/staff/history", icon: History },
];

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen w-full bg-gray-100">
      {/* Sidebar Compact */}
      <aside className="fixed inset-y-0 left-0 z-20 w-16 md:w-64 flex-col bg-white border-r shadow-sm transition-all hidden sm:flex">
        <div className="flex h-14 items-center justify-center md:justify-start md:px-6 border-b">
          <Utensils className="h-6 w-6 text-primary" />
          <span className="ml-2 font-bold text-lg hidden md:block">S2O Staff</span>
        </div>
        
        <nav className="flex-1 flex flex-col gap-2 p-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-center md:justify-start gap-3 rounded-lg px-3 py-2.5 transition-all",
                pathname === item.href 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              title={item.title}
            >
              <item.icon className="h-5 w-5" />
              <span className="hidden md:block font-medium">{item.title}</span>
            </Link>
          ))}
        </nav>

        <div className="p-2 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-center md:justify-start gap-2 text-red-500 hover:bg-red-50 hover:text-red-600"
            onClick={() => authService.logout()}
          >
            <LogOut className="h-5 w-5" />
            <span className="hidden md:block">Đăng xuất</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Header (Hiện khi màn hình nhỏ) */}
      <div className="sm:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b z-30 flex items-center justify-between px-4">
         <span className="font-bold">S2O Staff</span>
         {/* Mobile Menu Trigger có thể thêm sau */}
      </div>

      {/* Main Content */}
      <main className="flex-1 sm:pl-16 md:pl-64 pt-14 sm:pt-0 p-4 overflow-y-auto h-screen">
        {children}
      </main>
    </div>
  );
}