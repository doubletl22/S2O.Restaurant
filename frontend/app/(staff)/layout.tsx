"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, UtensilsCrossed, ChefHat, LayoutGrid, User, ClipboardList, History as HistoryIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";
import Link from "next/link";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Lấy thông tin user từ localStorage để hiển thị
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userStr));
  }, [router]);

  const handleLogout = () => {
    authService.logout();
  };

  if (!user) return null;

  const isChef = user.roles?.includes("Chef");
  const isWaiter = user.roles?.includes("Waiter") || user.roles?.includes("RestaurantStaff");

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* HEADER */}
      <header className="bg-white border-b h-16 px-6 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <UtensilsCrossed className="h-6 w-6" /> S2O POS
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-4">
            {isWaiter && (
              <Link href="/staff/tables">
                <Button variant={pathname.startsWith("/staff/tables") ? "default" : "ghost"} size="sm">
                  <LayoutGrid className="h-4 w-4 mr-2" /> Chọn bàn
                </Button>
              </Link>
            )}

            {/* [NEW] Link: Quản lý Order (Ticket) */}
            {isWaiter && (
              <Link href="/staff/order-ticket">
                <Button variant={pathname.startsWith("/staff/order-ticket") ? "default" : "ghost"} size="sm">
                  <ClipboardList className="h-4 w-4 mr-2" /> Đơn hàng
                </Button>
              </Link>
            )}

            {/* [NEW] Link: Lịch sử */}
            {isWaiter && (
              <Link href="/staff/history">
                <Button variant={pathname.startsWith("/staff/history") ? "default" : "ghost"} size="sm">
                  <HistoryIcon className="h-4 w-4 mr-2" /> Lịch sử
                </Button>
              </Link>
            )}
            
            {isChef && (
              <Link href="/kitchen">
                <Button variant={pathname.startsWith("/kitchen") ? "default" : "ghost"} size="sm">
                  <ChefHat className="h-4 w-4 mr-2" /> Bếp (KDS)
                </Button>
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium">
             <User className="h-4 w-4 text-muted-foreground" />
             {user.fullName}
             <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full border">
                {isChef ? "Bếp" : "Phục vụ"}
             </span>
          </div>
          <Button variant="destructive" size="icon" className="h-8 w-8" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}