"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { OrderView } from "@/lib/types";

export function useOrderStream(sessionId: string) {
  const [orders, setOrders] = useState<OrderView[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    let stop = false;
    let ws: WebSocket | null = null;

    async function loadOnce() {
      try {
        const res = await api.getCurrentOrders(sessionId);
        if (!stop) setOrders(res.orders);
      } catch (e: any) {
        if (!stop) setError(e?.message || "Không tải được đơn hàng");
      }
    }

    // 1) thử WebSocket
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || "";
      const wsUrl = base.replace(/^http/, "ws") + `/public/ws/orders?sessionId=${encodeURIComponent(sessionId)}`;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => loadOnce();
      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          // kỳ vọng server bắn { orders: [...] }
          if (data?.orders) setOrders(data.orders);
        } catch {
          // ignore
        }
      };
      ws.onerror = () => {
        // nếu WS lỗi, fallback polling
        ws?.close();
        ws = null;
      };
    } catch {
      ws = null;
    }

    // 2) fallback polling
    const interval = setInterval(() => {
      if (!ws) loadOnce();
    }, 2500);

    loadOnce();

    return () => {
      stop = true;
      clearInterval(interval);
      if (ws) ws.close();
    };
  }, [sessionId]);

  return { orders, error };
}
