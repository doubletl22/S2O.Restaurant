import type { Product, PlaceGuestOrderPayload, ResultLike } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {})
    },
    cache: "no-store"
  });

  const text = await res.text().catch(() => "");
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    const msg = (data && (data.message || data.title)) || text || res.statusText;
    throw new Error(`API ${res.status}: ${msg}`);
  }
  return data as T;
}

function safeJson(t: string) {
  try {
    return JSON.parse(t);
  } catch {
    return { raw: t };
  }
}

function unwrap<T>(data: any): T {
  if (data && typeof data === "object") {
    const r = data as ResultLike<T>;
    const ok = r.isSuccess ?? r.IsSuccess;
    if (typeof ok === "boolean") {
      if (ok) return (r.value ?? r.Value) as T;
      const err = r.error ?? r.Error;
      throw new Error(err?.message || err?.code || "Request failed");
    }
  }
  return data as T;
}

export const api = {
  async getPublicMenu(tenantId: string, categoryId?: string) {
    const q = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : "";
    const data = await http<any>(`/api/public/menu/${tenantId}${q}`, { method: "GET" });
    return unwrap<Product[]>(data).map((p) => ({
      id: String((p as any).id),
      name: String((p as any).name),
      description: (p as any).description || "",
      price: Number((p as any).price || 0),
      imageUrl: (p as any).imageUrl || null,
      isAvailable: (p as any).isAvailable ?? true,
      categoryId: (p as any).categoryId || (p as any).CategoryId,
      category: (p as any).category || null
    }));
  },

  async placeGuestOrder(payload: PlaceGuestOrderPayload) {
    // backend có thể trả: {isSuccess,value} hoặc trả thẳng orderId string
    const data = await http<any>(`/api/orders/guest`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    const orderId = unwrap<string>(data);
    return String(orderId);
  },

  async getGuestOrder(orderId: string) {
    // nếu backend bạn có endpoint này thì tracking sẽ update realtime
    return await http<any>(`/api/orders/guest/${orderId}`, { method: "GET" });
  }
};
