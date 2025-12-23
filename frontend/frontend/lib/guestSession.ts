export const SESSION_MINUTES = 30;

function keySession(qrToken: string) {
  return `guest_session_${qrToken}`;
}
function keyCart(qrToken: string) {
  return `guest_cart_${qrToken}`;
}
function keyOrders(qrToken: string) {
  return `guest_orders_${qrToken}`;
}

export type GuestSession = {
  qrToken: string;
  startedAt: number;
  expiresAt: number;
};

export function startOrGetSession(qrToken: string): GuestSession {
  if (typeof window === "undefined") {
    const now = Date.now();
    return { qrToken, startedAt: now, expiresAt: now + SESSION_MINUTES * 60_000 };
  }

  const now = Date.now();
  const raw = localStorage.getItem(keySession(qrToken));
  if (raw) {
    try {
      const s = JSON.parse(raw) as GuestSession;
      if (s.expiresAt && now < s.expiresAt) return s;
    } catch {}
  }

  const startedAt = now;
  const expiresAt = now + SESSION_MINUTES * 60_000;
  const s: GuestSession = { qrToken, startedAt, expiresAt };
  localStorage.setItem(keySession(qrToken), JSON.stringify(s));
  return s;
}

export function clearGuestSession(qrToken: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(keySession(qrToken));
  localStorage.removeItem(keyCart(qrToken));
  localStorage.removeItem(keyOrders(qrToken));
}
