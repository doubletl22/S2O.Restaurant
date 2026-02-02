"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingCart, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGuestCart } from "@/components/guest/guest-cart-context";

// [FIX] Đổi tên prop từ tableId -> qrToken cho khớp với URL params
interface BottomNavV2Props {
  qrToken: string; 
}

export function BottomNavV2({ qrToken }: BottomNavV2Props) {
  const pathname = usePathname();
  const { totalItems } = useGuestCart();

  // Helper check active link
  const isActive = (path: string) => pathname === path;
  
  const baseUrl = `/guest/t/${qrToken}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t h-16 flex items-center justify-around z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      <Link
        href={baseUrl}
        className={cn(
          "flex flex-col items-center gap-1 text-xs font-medium w-full h-full justify-center active:scale-95 transition-transform",
          isActive(baseUrl) ? "text-orange-600" : "text-gray-400"
        )}
      >
        <Home className="h-6 w-6" />
        <span>Menu</span>
      </Link>

      <Link
        href={`${baseUrl}/cart`}
        className={cn(
          "flex flex-col items-center gap-1 text-xs font-medium w-full h-full justify-center active:scale-95 transition-transform relative",
          isActive(`${baseUrl}/cart`) ? "text-orange-600" : "text-gray-400"
        )}
      >
        <div className="relative">
          <ShoppingCart className="h-6 w-6" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-in zoom-in">
              {totalItems}
            </span>
          )}
        </div>
        <span>Giỏ hàng</span>
      </Link>

      <Link
        href={`${baseUrl}/tracking`}
        className={cn(
          "flex flex-col items-center gap-1 text-xs font-medium w-full h-full justify-center active:scale-95 transition-transform",
          isActive(`${baseUrl}/tracking`) ? "text-orange-600" : "text-gray-400"
        )}
      >
        <Clock className="h-6 w-6" />
        <span>Đơn hàng</span>
      </Link>
    </div>
  );
}