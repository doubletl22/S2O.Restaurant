"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type PublicTableInfo = {
  tableId: string;
  tableName: string;
  tenantId: string;
  tenantName?: string;
  branchId?: string;
};

export type CartItem = {
  cartId: string; // id riêng trong cart
  id: string; // productId/menuItemId
  name: string;
  price: number;
  quantity: number;
  note?: string;
  imageUrl?: string;
};

type GuestCartContextType = {
  cart: CartItem[];
  tableInfo: PublicTableInfo | null;
  setTableInfo: (info: PublicTableInfo) => void;

  addToCart: (
    p: { id: string; name: string; price: number; imageUrl?: string },
    note?: string
  ) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, delta: number) => void;
  updateNote: (cartId: string, note: string) => void;
  clearCart: () => void;

  // ✅ thêm dòng này để layout badge dùng được
  totalItems: number;

  totalAmount: number;
};

const GuestCartContext = createContext<GuestCartContextType | null>(null);

const LS_CART = "guest_cart";
const LS_TABLE = "guest_table";
const LS_LAST_ORDER = "guest_last_order";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const normalizeNote = (s?: string) => (s ?? "").trim();

export function GuestCartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tableInfo, _setTableInfo] = useState<PublicTableInfo | null>(null);

  // load localStorage
  useEffect(() => {
    try {
      const c = localStorage.getItem(LS_CART);
      if (c) setCart(JSON.parse(c));
      const t = localStorage.getItem(LS_TABLE);
      if (t) _setTableInfo(JSON.parse(t));
    } catch {}
  }, []);

  // persist cart
  useEffect(() => {
    try {
      localStorage.setItem(LS_CART, JSON.stringify(cart));
    } catch {}
  }, [cart]);

  // persist tableInfo (null thì xóa)
  useEffect(() => {
    try {
      if (tableInfo) localStorage.setItem(LS_TABLE, JSON.stringify(tableInfo));
      else localStorage.removeItem(LS_TABLE);
    } catch {}
  }, [tableInfo]);

  // ✅ không loop render + đổi bàn thì reset cart + last order
  const setTableInfo = useCallback((info: PublicTableInfo) => {
    _setTableInfo((prev) => {
      const prevTableId = prev?.tableId;
      const nextTableId = info?.tableId;

      if (prevTableId && nextTableId && prevTableId !== nextTableId) {
        // đổi bàn => reset cart
        setCart([]);
        try {
          localStorage.removeItem(LS_CART);
          localStorage.removeItem(LS_LAST_ORDER);
        } catch {}
      }

      return info;
    });
  }, []);

  const addToCart = useCallback(
    (
      p: { id: string; name: string; price: number; imageUrl?: string },
      note?: string
    ) => {
      const n = normalizeNote(note);

      setCart((prev) => {
        // gộp theo productId + note (note khác => item khác)
        const idx = prev.findIndex(
          (x) => x.id === p.id && normalizeNote(x.note) === n
        );

        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], quantity: Number(next[idx].quantity || 0) + 1 };
          return next;
        }

        return [
          ...prev,
          {
            cartId: uid(),
            id: p.id,
            name: p.name,
            price: Number(p.price || 0),
            quantity: 1,
            note: n,
            imageUrl: p.imageUrl || "",
          },
        ];
      });
    },
    []
  );

  const removeFromCart = useCallback((cartId: string) => {
    setCart((prev) => prev.filter((x) => x.cartId !== cartId));
  }, []);

  const updateQuantity = useCallback((cartId: string, delta: number) => {
    setCart((prev) => {
      const next = prev.map((x) =>
        x.cartId === cartId
          ? { ...x, quantity: Number(x.quantity || 0) + Number(delta || 0) }
          : x
      );
      return next.filter((x) => Number(x.quantity || 0) > 0);
    });
  }, []);

  // ✅ update note + merge nếu sau khi sửa note bị trùng productId+note
  const updateNote = useCallback((cartId: string, note: string) => {
    const n = normalizeNote(note);

    setCart((prev) => {
      const current = prev.find((x) => x.cartId === cartId);
      if (!current) return prev;

      // Nếu note không đổi => thôi
      if (normalizeNote(current.note) === n) return prev;

      // Tìm item khác có cùng productId + note mới để merge
      const dupIdx = prev.findIndex(
        (x) =>
          x.cartId !== cartId &&
          x.id === current.id &&
          normalizeNote(x.note) === n
      );

      // Không có trùng => chỉ update note
      if (dupIdx < 0) {
        return prev.map((x) => (x.cartId === cartId ? { ...x, note: n } : x));
      }

      // Có trùng => merge quantity vào item trùng, xóa item hiện tại
      const merged = [...prev];
      merged[dupIdx] = {
        ...merged[dupIdx],
        quantity:
          Number(merged[dupIdx].quantity || 0) + Number(current.quantity || 0),
      };

      return merged.filter((x) => x.cartId !== cartId);
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    try {
      localStorage.removeItem(LS_CART);
    } catch {}
  }, []);

  // ✅ tổng số lượng item (badge 1–2–3…)
  const totalItems = useMemo(
    () => cart.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0),
    [cart]
  );

  // ✅ tổng tiền an toàn
  const totalAmount = useMemo(
    () =>
      cart.reduce(
        (sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 0),
        0
      ),
    [cart]
  );

  const value = useMemo(
    () => ({
      cart,
      tableInfo,
      setTableInfo,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateNote,
      clearCart,

      // ✅ trả về cho context để layout dùng được
      totalItems,

      totalAmount,
    }),
    [
      cart,
      tableInfo,
      setTableInfo,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateNote,
      clearCart,
      totalItems,
      totalAmount,
    ]
  );

  return (
    <GuestCartContext.Provider value={value}>
      {children}
    </GuestCartContext.Provider>
  );
}

export function useGuestCart() {
  const ctx = useContext(GuestCartContext);
  if (!ctx) throw new Error("useGuestCart must be used inside GuestCartProvider");
  return ctx;
}
