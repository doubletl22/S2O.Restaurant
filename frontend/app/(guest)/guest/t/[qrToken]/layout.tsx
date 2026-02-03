"use client";

import Link from "next/link";
import { ShoppingCart, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GuestCartProvider, useGuestCart } from "@/components/guest/guest-cart-context";

// Component con để lấy được state totalItems từ context (vì Layout là server component nếu không tách, nhưng ở đây ta dùng "use client" cho cả layout guest cho tiện)
function GuestHeader({ qrToken }: { qrToken: string }) {
  const { totalItems } = useGuestCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur shadow-sm">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
           <div className="bg-primary/10 p-1.5 rounded-full">
             <Utensils className="h-4 w-4 text-primary" />
           </div>
           <span className="font-bold text-lg">Menu</span>
        </div>
        
        <Link href={`/guest/t/${qrToken}/cart`}>
          <Button variant="ghost" size="icon" className="relative hover:bg-muted/50">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm animate-in zoom-in">
                {totalItems}
              </span>
            )}
          </Button>
        </Link>
      </div>
    </header>
  );
}

export default function GuestLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { qrToken: string };
}) {
  return (
    <GuestCartProvider>
      <div className="flex min-h-screen flex-col bg-gray-50/50">
        <GuestHeader qrToken={params.qrToken} />
        <main className="flex-1 pb-20 px-4 pt-4">
          {children}
        </main>
      </div>
    </GuestCartProvider>
  );
}
