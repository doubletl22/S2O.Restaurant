"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { Product, CartItem } from "@/lib/types";

interface GuestCartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, note?: string) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, delta: number) => void;
  clearCart: () => void;
  totalAmount: number;
  totalItems: number;
}

const GuestCartContext = createContext<GuestCartContextType | undefined>(undefined);

export function GuestCartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // 1. Load cart từ LocalStorage khi mount
  useEffect(() => {
    const savedCart = localStorage.getItem("guest_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Lỗi đọc cart cũ", e);
      }
    }
    setIsInitialized(true);
  }, []);

  // 2. Lưu cart mỗi khi thay đổi (chỉ sau khi đã init)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("guest_cart", JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  // Actions
  const addToCart = (product: Product, quantity = 1, note = "") => {
    setCart((prev) => {
      // Tìm xem món này (cùng ID và cùng Note) đã có chưa
      const existingIdx = prev.findIndex(
        (item) => item.id === product.id && item.note === note
      );

      if (existingIdx >= 0) {
        // Cộng dồn số lượng
        const newCart = [...prev];
        newCart[existingIdx].quantity += quantity;
        toast.success(`Đã cập nhật số lượng: ${product.name}`);
        return newCart;
      } else {
        // Thêm mới
        const newItem: CartItem = {
          ...product,
          cartId: `${product.id}-${Date.now()}`, // Tạo ID tạm cho item trong giỏ
          quantity,
          note,
        };
        toast.success(`Đã thêm vào giỏ: ${product.name}`);
        return [...prev, newItem];
      }
    });
  };

  const removeFromCart = (cartId: string) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
    toast.info("Đã xóa món khỏi giỏ");
  };

  const updateQuantity = (cartId: string, delta: number) => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.cartId === cartId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return item; // Không cho giảm dưới 1 (dùng remove để xóa)
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("guest_cart");
  };

  // Derived state
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <GuestCartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalAmount,
        totalItems,
      }}
    >
      {children}
    </GuestCartContext.Provider>
  );
}

export const useGuestCart = () => {
  const context = useContext(GuestCartContext);
  if (!context) {
    throw new Error("useGuestCart must be used within a GuestCartProvider");
  }
  return context;
};