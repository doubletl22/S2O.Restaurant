"use client";

import { ShoppingCart, UtensilsCrossed, ClipboardList } from "lucide-react";
import { cn } from "@/lib/cn";

export type TabKey = "menu" | "cart" | "orders";

export function BottomNav({
  tab,
  onChange,
  cartCount
}: {
  tab: TabKey;
  onChange: (t: TabKey) => void;
  cartCount: number;
}) {
  const item = (key: TabKey, label: string, Icon: any, badge?: number) => (
    <button
      onClick={() => onChange(key)}
      className={cn(
        "relative flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2 text-xs font-semibold",
        tab === key ? "bg-sky-500 text-white" : "text-[color:var(--muted)] hover:bg-black/5 dark:hover:bg-white/5"
      )}
    >
      <Icon size={18} />
      <div>{label}</div>
      {badge && badge > 0 ? (
        <span className="absolute right-4 top-1 rounded-full bg-red-500 px-2 py-0.5 text-[10px] text-white">
          {badge}
        </span>
      ) : null}
    </button>
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[color:var(--line)] bg-[color:var(--bg)]/80 backdrop-blur">
      <div className="mx-auto flex max-w-xl gap-2 p-2 safe-bottom">
        {item("menu", "Menu", UtensilsCrossed)}
        {item("orders", "Đơn", ClipboardList)}
        {item("cart", "Giỏ", ShoppingCart, cartCount)}
      </div>
    </nav>
  );
}
