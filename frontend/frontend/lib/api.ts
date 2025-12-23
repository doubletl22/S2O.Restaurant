import { GuestSession, MenuCategory, MenuItem, OrderView, LoyaltyProfile } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return (await res.json()) as T;
}

export const api = {
  startSession: (qrToken: string) =>
    http<GuestSession>(`/public/session/start`, {
      method: "POST",
      body: JSON.stringify({ qrToken }),
    }),

  getMenu: (qrToken: string) =>
    http<{ categories: MenuCategory[]; items: MenuItem[] }>(`/public/menu?qrToken=${encodeURIComponent(qrToken)}`),

  createOrder: (sessionId: string, items: Array<{ menuItemId: string; qty: number; notes: string }>) =>
    http<{ orderId: string }>(`/public/orders`, {
      method: "POST",
      body: JSON.stringify({ sessionId, items }),
    }),

  getCurrentOrders: (sessionId: string) =>
    http<{ orders: OrderView[] }>(`/public/orders/current?sessionId=${encodeURIComponent(sessionId)}`),

  requestPayment: (sessionId: string) =>
    http<{ ok: true }>(`/public/payment/request`, {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    }),

  loyaltyChallenge: (sessionId: string) =>
    http<{ challengeCode: string; expiresAt: string }>(`/public/loyalty/challenge`, {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    }),

  loyaltyVerify: (sessionId: string, challengeCode: string, proofToken: string) =>
    http<{ profile: LoyaltyProfile }>(`/public/loyalty/verify`, {
      method: "POST",
      body: JSON.stringify({ sessionId, challengeCode, proofToken }),
    }),
};
