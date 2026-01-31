"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { UtensilsCrossed, ShoppingCart, ClipboardList } from "lucide-react";
import { getSession, loadCart } from "@/app/(guest)/guest/t/_shared/guestStore";

type TabKey = "menu" | "cart" | "tracking";

function TabItem({
  href,
  active,
  label,
  icon,
  badge,
}: {
  href: string;
  active: boolean;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className={[
        "flex-1 py-2 flex flex-col items-center justify-center gap-1",
        "active:scale-[0.99]",
        active ? "text-orange-600" : "text-gray-600",
      ].join(" ")}
    >
      <div className="relative">
        {icon}
        {!!badge && badge > 0 && (
          <span
            className={[
              "absolute -top-2 -right-3",
              "min-w-[18px] h-[18px] px-1",
              "rounded-full bg-orange-500 text-white",
              "text-[11px] leading-[18px] text-center font-semibold",
            ].join(" ")}
          >
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </div>
      <div className={["text-[11px] font-medium", active ? "text-orange-600" : ""].join(" ")}>
        {label}
      </div>
    </Link>
  );
}

export function BottomNavV2() {
  const params = useParams();
  const pathname = usePathname();
  const qrToken = String(params.qrToken || "");

  const activeTab: TabKey = useMemo(() => {
    if (pathname.includes("/cart")) return "cart";
    if (pathname.includes("/tracking")) return "tracking";
    return "menu";
  }, [pathname]);

  const [cartCount, setCartCount] = useState(0);

  // ✅ Lấy số lượng món trong cart theo tableId trong session
  useEffect(() => {
    const tick = () => {
      const s = getSession();
      if (!s?.tableId) {
        setCartCount(0);
        return;
      }
      const items = loadCart(s.tableId);
      const count = items.reduce((sum, it) => sum + (it.qty || 0), 0);
      setCartCount(count);
    };

    tick();

    // cập nhật khi thay đổi localStorage (tab khác) + polling nhẹ
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key.startsWith("S2O_GUEST_CART_") || e.key === "S2O_GUEST_SESSION") tick();
    };
    window.addEventListener("storage", onStorage);

    const id = window.setInterval(tick, 800);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.clearInterval(id);
    };
  }, []);

  const base = `/guest/t/${qrToken}`;

  return (
    <nav className="w-full">
      <div className="px-3 py-2">
        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="flex items-center">
            <TabItem
              href={`${base}/menu`}
              active={activeTab === "menu"}
              label="Thực đơn"
              icon={<UtensilsCrossed className="h-5 w-5" />}
            />
            <div className="h-8 w-[1px] bg-gray-200" />
            <TabItem
              href={`${base}/cart`}
              active={activeTab === "cart"}
              label="Giỏ hàng"
              icon={<ShoppingCart className="h-5 w-5" />}
              badge={cartCount}
            />
            <div className="h-8 w-[1px] bg-gray-200" />
            <TabItem
              href={`${base}/tracking`}
              active={activeTab === "tracking"}
              label="Đơn của tôi"
              icon={<ClipboardList className="h-5 w-5" />}
            />
          </div>
        </div>
      </div>
      {/* safe area cho iPhone */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
