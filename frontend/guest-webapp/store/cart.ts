import { create } from "zustand";
import type { CartItem, Product } from "@/types";

type CartState = {
  scopeKey: string | null;
  items: CartItem[];

  setScope: (scopeKey: string) => void;

  add: (p: Product) => void;
  inc: (productId: string) => void;
  dec: (productId: string) => void;
  setNote: (productId: string, note: string) => void;

  clear: () => void;
  totalQty: () => number;
};

function storageKey(scopeKey: string) {
  return `s2o_guest_cart:${scopeKey}`;
}
function load(scopeKey: string): CartItem[] {
  try {
    const raw = localStorage.getItem(storageKey(scopeKey)) || "[]";
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function save(scopeKey: string, items: CartItem[]) {
  try {
    localStorage.setItem(storageKey(scopeKey), JSON.stringify(items));
  } catch {}
}

export const useCartStore = create<CartState>((set, get) => ({
  scopeKey: null,
  items: [],

  setScope: (scopeKey) => {
    const items = load(scopeKey);
    set({ scopeKey, items });
  },

  add: (p) => {
    const scopeKey = get().scopeKey;
    if (!scopeKey) return;

    const items = [...get().items];
    const idx = items.findIndex((x) => x.productId === p.id);
    if (idx >= 0) items[idx] = { ...items[idx], quantity: items[idx].quantity + 1 };
    else {
      items.unshift({
        productId: p.id,
        name: p.name,
        price: Number(p.price || 0),
        imageUrl: p.imageUrl || null,
        quantity: 1,
        note: null
      });
    }
    save(scopeKey, items);
    set({ items });
  },

  inc: (productId) => {
    const scopeKey = get().scopeKey;
    if (!scopeKey) return;

    const items = get().items.map((it) =>
      it.productId === productId ? { ...it, quantity: it.quantity + 1 } : it
    );
    save(scopeKey, items);
    set({ items });
  },

  dec: (productId) => {
    const scopeKey = get().scopeKey;
    if (!scopeKey) return;

    const items = get()
      .items.map((it) => (it.productId === productId ? { ...it, quantity: it.quantity - 1 } : it))
      .filter((it) => it.quantity > 0);

    save(scopeKey, items);
    set({ items });
  },

  setNote: (productId, note) => {
    const scopeKey = get().scopeKey;
    if (!scopeKey) return;

    const items = get().items.map((it) =>
      it.productId === productId ? { ...it, note } : it
    );
    save(scopeKey, items);
    set({ items });
  },

  clear: () => {
    const scopeKey = get().scopeKey;
    const items: CartItem[] = [];
    if (scopeKey) save(scopeKey, items);
    set({ items });
  },

  totalQty: () => get().items.reduce((s, it) => s + it.quantity, 0)
}));
