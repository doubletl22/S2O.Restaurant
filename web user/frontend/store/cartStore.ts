"use client";

import { create } from "zustand";
import { CartItem } from "@/lib/types";

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (menuItemId: string) => void;
  setQty: (menuItemId: string, qty: number) => void;
  setNotes: (menuItemId: string, notes: string) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  add: (item, qty = 1) =>
    set((s) => {
      const found = s.items.find((x) => x.menuItemId === item.menuItemId);
      if (found) {
        return {
          items: s.items.map((x) =>
            x.menuItemId === item.menuItemId ? { ...x, qty: x.qty + qty } : x
          ),
        };
      }
      return { items: [...s.items, { ...item, qty, notes: item.notes ?? "" }] };
    }),
  remove: (menuItemId) => set((s) => ({ items: s.items.filter((x) => x.menuItemId !== menuItemId) })),
  setQty: (menuItemId, qty) =>
    set((s) => ({
      items: s.items
        .map((x) => (x.menuItemId === menuItemId ? { ...x, qty: Math.max(1, qty) } : x))
        .filter((x) => x.qty > 0),
    })),
  setNotes: (menuItemId, notes) =>
    set((s) => ({ items: s.items.map((x) => (x.menuItemId === menuItemId ? { ...x, notes } : x)) })),
  clear: () => set({ items: [] }),
  total: () => get().items.reduce((sum, x) => sum + x.unitPrice * x.qty, 0),
  count: () => get().items.reduce((sum, x) => sum + x.qty, 0),
}));
