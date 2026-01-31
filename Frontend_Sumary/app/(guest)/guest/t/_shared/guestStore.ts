export type GuestSession = {
  qrToken: string;       // ✅ thêm để biết session đang thuộc QR nào
  tableId: string;
  tenantId: string;
  tableName: string;
  tenantName: string;
  branchId?: string;
  expiresAt: number;
};

export type CartItem = {
  id: string; // menuItemId
  name: string;
  price: number;
  qty: number;
  note?: string;
};

export type GuestOrderLocal = {
  orderId: string;
  createdAt: number;
  total: number;
  status: "Pending" | "Preparing" | "Ready" | "Served" | "Cancelled" | "Paid";
};

const SESSION_KEY = "S2O_GUEST_SESSION";
const CART_KEY_PREFIX = "S2O_GUEST_CART_";
const ORDERS_KEY_PREFIX = "S2O_GUEST_ORDERS_";

export function formatMoney(v: number) {
  try {
    return new Intl.NumberFormat("vi-VN").format(v);
  } catch {
    return String(v);
  }
}

/**
 * ✅ setSession: thêm qrToken + TTL
 */
export function setSession(
  session: Omit<GuestSession, "expiresAt"> & { ttlMinutes?: number }
) {
  const ttl = session.ttlMinutes ?? 180;
  const expiresAt = Date.now() + ttl * 60 * 1000;
  const payload: GuestSession = { ...session, expiresAt };
  localStorage.setItem(SESSION_KEY, JSON.stringify(payload));
  return payload;
}

export function getSession(): GuestSession | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GuestSession;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function isSessionExpired() {
  const s = getSession();
  if (!s) return true;
  return Date.now() > s.expiresAt;
}

const cartKey = (tableId: string) => `${CART_KEY_PREFIX}${tableId}`;
const ordersKey = (tableId: string) => `${ORDERS_KEY_PREFIX}${tableId}`;

export function loadCart(tableId: string): CartItem[] {
  const raw = localStorage.getItem(cartKey(tableId));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

export function saveCart(tableId: string, items: CartItem[]) {
  localStorage.setItem(cartKey(tableId), JSON.stringify(items));
}

export function clearCart(tableId: string) {
  localStorage.removeItem(cartKey(tableId));
}

export function loadOrders(tableId: string): GuestOrderLocal[] {
  const raw = localStorage.getItem(ordersKey(tableId));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as GuestOrderLocal[];
  } catch {
    return [];
  }
}

export function addOrder(tableId: string, order: GuestOrderLocal) {
  const list = loadOrders(tableId);
  list.unshift(order);
  localStorage.setItem(ordersKey(tableId), JSON.stringify(list));
}

export function clearOrders(tableId: string) {
  localStorage.removeItem(ordersKey(tableId));
}
