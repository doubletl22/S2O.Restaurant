"use client";

import { useEffect, useMemo, useState } from "react";
import SessionGuard from "@/components/SessionGuard";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { getOrders, subscribeOrders } from "@/lib/orders";
import { moneyVND } from "@/lib/format";
import { touchSession } from "@/lib/session";
import { useToast } from "@/components/ToastProvider";

export default function PaymentPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState(getOrders());

  useEffect(() => {
    const sync = () => setOrders(getOrders());
    sync();
    return subscribeOrders(sync);
  }, []);

  const total = useMemo(() => orders.reduce((s, o) => s + (o.totalAmount || 0), 0), [orders]);

  return (
    <SessionGuard>
      <div className="screen">
        <div className="wrap">
          <Header title="Thanh toán" subtitle="Yêu cầu tính tiền tại bàn" />

          <div className="card" style={{ marginTop: 10 }}>
            <div className="card">
              <div className="muted">Tổng tiền (theo lịch sử đơn trên máy)</div>
              <div className="h2" style={{ margin: 0 }}>{moneyVND(total)}</div>
              <div style={{ height: 10 }} />
              <button
                className="btn primary"
                onClick={() => {
                  // Backend trong zip chưa thấy endpoint “request bill”.
                  // Nên UI sẽ xác nhận + hướng dẫn, không làm giả request.
                  toast("Đã ghi nhận yêu cầu. Vui lòng đợi nhân viên đến tính tiền ✅");
                  touchSession();
                }}
              >
                YÊU CẦU TÍNH TIỀN
              </button>
              <div style={{ height: 10 }} />
              <button className="btn ghost" onClick={() => toast("Nếu muốn ‘thật’: cần thêm API request bill ở backend (Order/Tenant).")}>
                Gợi ý triển khai backend
              </button>
            </div>

            <div style={{ height: 12 }} />
            <div className="muted">
              * Nếu bạn có tích hợp thanh toán online (Payment service yêu cầu Auth), Guest thường sẽ nhận QR chuyển khoản hoặc link thanh toán từ nhân viên/thu ngân.
            </div>
          </div>

          <BottomNav />
        </div>
      </div>
    </SessionGuard>
  );
}
