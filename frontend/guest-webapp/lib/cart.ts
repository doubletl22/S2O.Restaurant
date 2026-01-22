"use client";

import { readJSON, writeJSON } from "./storage";
import type { CartItem } from "./types";
import { getSession } from "./session";

const EVT = "s2o:cart";

function emit() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVT));
}

function keyForSession() {
  const s = getSession();
  if (!s) return null;
  return `s2o_cart_${s.tenantId}_${s.branchId}_${s.tableId}`;
}

export function getCart(): CartItem[] {
  const k = keyForSession();
  if (!k) return [];
  return readJSON<CartItem[]>(k, []);
}

export function setCart(items: CartItem[]) {
  const k = keyForSession();
  if (!k) return;
  writeJSON(k, items);
  emit();
}

export function addToCart(item: Omit<CartItem, "quantity">, qty = 1) {
  const cart = getCart();
  const idx = cart.findIndex((x) => x.productId === item.productId);
  if (idx >= 0) cart[idx] = { ...cart[idx], quantity: cart[idx].quantity + qty };
  else cart.push({ ...item, quantity: qty });

  setCart(cart);
}

export function updateCartItem(productId: string, patch: Partial<CartItem>) {
  const cart = getCart().map((x) => (x.productId === productId ? { ...x, ...patch } : x));
  setCart(cart);
}

export function removeCartItem(productId: string) {
  setCart(getCart().filter((x) => x.productId !== productId));
}

export function clearCart() {
  setCart([]);
}

export function subscribeCart(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const on = () => cb();
  window.addEventListener(EVT, on);
  window.addEventListener("storage", on);
  return () => {
    window.removeEventListener(EVT, on);
    window.removeEventListener("storage", on);
  };
}
