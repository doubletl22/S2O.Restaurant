// contexts/guest-cart-context.tsx
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ProductDto } from '@/lib/types';
import { toast } from 'sonner';

// Định nghĩa kiểu dữ liệu item trong giỏ (kèm số lượng & note)
export interface CartItem extends ProductDto {
  quantity: number;
  note?: string;
}

interface GuestCartContextType {
  cartItems: CartItem[];
  addToCart: (product: ProductDto) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
}

const GuestCartContext = createContext<GuestCartContextType | undefined>(undefined);

export function GuestCartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // 1. Load từ LocalStorage khi khởi động
  useEffect(() => {
    const saved = localStorage.getItem('s2o_guest_cart');
    if (saved) {
      try {
        setCartItems(JSON.parse(saved));
      } catch (e) {
        console.error("Lỗi parse giỏ hàng:", e);
      }
    }
  }, []);

  // 2. Lưu vào LocalStorage mỗi khi giỏ hàng thay đổi
  useEffect(() => {
    if (cartItems.length > 0) {
        localStorage.setItem('s2o_guest_cart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const addToCart = (product: ProductDto) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        // Nếu món đã có, tăng số lượng
        toast.success(`Đã tăng số lượng món ${product.name}`);
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      // Nếu chưa có, thêm mới
      toast.success(`Đã thêm ${product.name} vào giỏ`);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) => prev.map((item) => {
        if (item.id === productId) {
            const newQty = Math.max(1, item.quantity + delta);
            return { ...item, quantity: newQty };
        }
        return item;
    }));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('s2o_guest_cart');
  };

  // Tính tổng số lượng (để hiện badge)
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <GuestCartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalAmount }}>
      {children}
    </GuestCartContext.Provider>
  );
}

export const useGuestCart = () => {
  const context = useContext(GuestCartContext);
  if (!context) throw new Error('useGuestCart must be used within a GuestCartProvider');
  return context;
};