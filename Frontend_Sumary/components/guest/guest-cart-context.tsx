"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { Product, CartItem, PublicTableInfo } from "@/lib/types";

interface GuestCartContextType {
  cart: CartItem[];
  tableInfo: PublicTableInfo | null;
  setTableInfo: (info: PublicTableInfo) => void;
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
  const [tableInfo, setTableInfo] = useState<PublicTableInfo | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("guest_cart");
    const savedTable = localStorage.getItem("guest_table_info");
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedTable) setTableInfo(JSON.parse(savedTable));
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("guest_cart", JSON.stringify(cart));
      if (tableInfo) localStorage.setItem("guest_table_info", JSON.stringify(tableInfo));
    }
  }, [cart, tableInfo, isInitialized]);

  const addToCart = (product: Product, quantity = 1, note = "") => {
    setCart((prev) => {
      const existing = prev.find(item => item.id === product.id && item.note === note);
      if (existing) {
        return prev.map(item => item === existing ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { ...product, cartId: `${product.id}-${Date.now()}`, quantity, note }];
    });
    toast.success(`Đã thêm ${product.name}`);
  };

  const removeFromCart = (cartId: string) => setCart(p => p.filter(i => i.cartId !== cartId));
  
  const updateQuantity = (cartId: string, delta: number) => {
    setCart(p => p.map(i => (i.cartId === cartId && i.quantity + delta > 0) ? { ...i, quantity: i.quantity + delta } : i));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("guest_cart");
  };

  const totalAmount = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <GuestCartContext.Provider value={{ cart, tableInfo, setTableInfo, addToCart, removeFromCart, updateQuantity, clearCart, totalAmount, totalItems }}>
      {children}
    </GuestCartContext.Provider>
  );
}

export const useGuestCart = () => {
  const context = useContext(GuestCartContext);
  if (!context) throw new Error("useGuestCart must be used within a GuestCartProvider");
  return context;
};