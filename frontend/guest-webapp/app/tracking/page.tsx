"use client";

import { useEffect, useMemo, useState } from "react";
import SessionGuard from "@/components/SessionGuard";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { api } from "@/lib/api";
import { getOrders, patchOrder, subscribeOrders } from "@/lib/orders";
import { moneyVND, shortId } from "@/lib/format";
import { touchSession } from "@/lib/session";
import { useToast } from "@/components/ToastProvider";

const label: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  preparing: "Đang chuẩn bị",
  cooking: "Đang nấu",
  served: "Đã phục vụ",
  completed: "Hoàn tất",
  cancelled: "Đã hủy"
};

export default function TrackingPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState(getOrders());

  useEffect(() => {
    const sync = () => setOrders(getOrders());
    sync();
    return subscribeOrders(sync);
  }, []);

  // poll status nếu backend có endpoint GET /api/orders/guest/{orderId}
  useEffect(() => {
    let stop = false;

    async function tick() {
      if (stop) return;
      for (const o of getOrders()) {
        try {
          const data = await api.getGuestOrder(o.orderId);
          // cố gắng đọc status từ response (tùy backend trả về)
          const status =
            data?.status ||
            data?.Status ||
            data?.value?.status ||
            data?.Value?.Status;

          if (status && typeof status === "string") {
            patchOrder(o.orderId, { status: status.toLowerCase() });
          }
        } catch {
          // nếu backend chưa có endpoint thì bỏ qua (UI vẫn chạy)
        }
      }
    }

    const id = setInterval(() => {
      tick();
      touchSession();
    }, 5000);

    tick();

    return () => {
      stop = true;
      clearInterval(id);
    };
  }, []);

  const totalAll = useMemo(() => orders.reduce((s, o) => s + (o.totalAmount || 0), 0), [orders]);

  return (
    <SessionGuard>
      <div className="screen">
        <div className="wrap">
          <Header title="Theo dõi đơn" subtitle="Trạng thái đơn sẽ tự cập nhật nếu backend hỗ trợ" />

          <div className="card" style={{ marginTop: 10 }}>
            {orders.length === 0 ? (
              <div className="muted">Chưa có đơn nào. Hãy đặt món ở Giỏ hàng.</div>
            ) : (
              <div className="list">
                {orders.map((o) => (
                  <div key={o.orderId} className="card">
                    <div className="row" style={{ alignItems: "center" }}>
                      <div className="col">
                        <div className="h2" style={{ margin: 0 }}>
                          Đơn #{shortId(o.orderId)}
                        </div>
                        <div className="muted">
                          Trạng thái: <b>{label[o.status] || o.status}</b>
                        </div>
                      </div>
                      <div className="col" style={{ textAlign: "right" }}>
                        <div className="h2" style={{ margin: 0 }}>{moneyVND(o.totalAmount)}</div>
                        <div className="muted">{new Date(o.createdAt).toLocaleString("vi-VN")}</div>
                      </div>
                    </div>

                    <div style={{ height: 10 }} />
                    <div className="muted">Món đã đặt:</div>
                    <div style={{ height: 6 }} />

                    <div className="list" style={{ gap: 8 }}>
                      {o.items.map((it) => (
                        <div key={it.productId} className="row" style={{ alignItems: "flex-start" }}>
                          <div className="col">
                            <b>{it.quantity}x</b> {it.name}
                            {it.note ? <div className="muted">Ghi chú: {it.note}</div> : null}
                          </div>
                          <div className="col" style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                            <b>{moneyVND(it.price * it.quantity)}</b>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ height: 12 }} />
            <div className="card">
              <div className="muted">Tổng tất cả đơn (theo local history)</div>
              <div className="h2" style={{ margin: 0 }}>{moneyVND(totalAll)}</div>
              <div style={{ height: 8 }} />
              <button className="btn ghost" onClick={() => toast("Nếu status không đổi: backend có thể chưa có GET /api/orders/guest/{id}")}>
                Vì sao trạng thái chưa cập nhật?
              </button>
            </div>
          </div>

          <BottomNav />
        </div>
      </div>
    </SessionGuard>
  );
}
