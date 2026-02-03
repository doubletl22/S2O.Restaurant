"use client";

import { useEffect, useState } from "react";

export type GuestSession = {
  qrToken: string;
  tableId: string;
  tenantId: string;
  tableName?: string;
  tenantName?: string;
  branchId?: string;
  expiresAt: number;
};

export type CartItem = {
  id: string; // productId/menuItemId
  name: string;
  price: number;
  qty: number;
  note?: string;
  imageUrl?: string;
};

type State = {
  session: GuestSession | null;
  cart: CartItem[];
};

const STORAGE_KEY = (qrToken: string) => `guest_store_${qrToken}`;

let _qrToken = "";
let _state: State = { session: null, cart: [] };
const _subs = new Set<() => void>();

function notify() {
  _subs.forEach((fn) => fn());
}

function load(qrToken: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(qrToken));
    if (!raw) return { session: null, cart: [] } as State;
    const data = JSON.parse(raw) as State;

    // hết hạn thì reset
    if (data?.session?.expiresAt && Date.now() > data.session.expiresAt) {
      return { session: null, cart: [] };
    }

    return {
      session: data?.session ?? null,
      cart: Array.isArray(data?.cart) ? data.cart : [],
    };
  } catch {
    return { session: null, cart: [] };
  }
}

function persist() {
  if (!_qrToken) return;
  try {
    localStorage.setItem(STORAGE_KEY(_qrToken), JSON.stringify(_state));
  } catch {}
}

export function initGuestStore(qrToken: string) {
  if (!qrToken) return;
  if (_qrToken === qrToken) return;
  _qrToken = qrToken;
  _state = load(qrToken);
  notify();
}

export function subscribeGuestStore(cb: () => void) {
  _subs.add(cb);
  return () => _subs.delete(cb);
}

export function getSession() {
  return _state.session;
}

export function saveSession(session: GuestSession) {
  _state.session = session;
  persist();
  notify();
}

export function clearSession() {
  _state.session = null;
  _state.cart = [];
  persist();
  notify();
}

export function getCart() {
  return _state.cart;
}

export function cartCount() {
  return _state.cart.reduce((sum, x) => sum + (x.qty || 0), 0);
}

export function cartTotal() {
  return _state.cart.reduce(
    (sum, x) => sum + (Number(x.price) || 0) * (x.qty || 0),
    0
  );
}

export function addToCart(
  item: { id: string; name: string; price: number; imageUrl?: string },
  qty = 1
) {
  const i = _state.cart.find((x) => x.id === item.id);
  if (i) {
    i.qty += qty;
  } else {
    _state.cart.push({
      id: item.id,
      name: item.name,
      price: Number(item.price) || 0,
      qty: qty,
      note: "",
      imageUrl: item.imageUrl,
    });
  }
  persist();
  notify();
}

export function setQty(id: string, qty: number) {
  const i = _state.cart.find((x) => x.id === id);
  if (!i) return;

  if (qty <= 0) {
    _state.cart = _state.cart.filter((x) => x.id !== id);
  } else {
    i.qty = qty;
  }
  persist();
  notify();
}

export function setNote(id: string, note: string) {
  const i = _state.cart.find((x) => x.id === id);
  if (!i) return;
  i.note = note;
  persist();
  notify();
}

export function removeItem(id: string) {
  _state.cart = _state.cart.filter((x) => x.id !== id);
  persist();
  notify();
}

export function clearCart() {
  _state.cart = [];
  persist();
  notify();
}

/** Hook: component nào gọi hook này sẽ re-render khi cart/session đổi */
export function useGuestStoreVersion() {
  const [v, setV] = useState(0);

  useEffect(() => {
    const unsub = subscribeGuestStore(() => setV((x) => x + 1));
    return () => unsub();
  }, []);

  return v;
}
