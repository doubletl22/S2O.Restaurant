"use client";

import { useEffect, useMemo, useState } from "react";
import SessionGuard from "@/components/SessionGuard";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import QuantityStepper from "@/components/QuantityStepper";
import { clearCart, getCart, removeCartItem, subscribeCart, updateCartItem } from "@/lib/cart";
import { api } from "@/lib/api";
import { moneyVND, now } from "@/lib/format";
import { getSession, touchSession } from "@/lib/session";
import { addOrder } from "@/lib/orders";
import type { PlaceGuestOrderPayload } from "@/lib/types";
import { useToast } from "@/components/ToastProvider";

export default function CartPage() {
  const { toast } = useToast();
  const [cart, setCart] = useState(getCart());

  const [guestName, setGuestName] = useState("Khách");
  const [guestPhone, setGuestPhone] = useState("");

  useEffect(() => {
    // default guest name theo bàn
    const s = getSession();
    if (s) setGuestName(`Khách bàn ${s.tableId.slice(0, 4).toUpperCase()}`);
  }, []);

  useEffect(() => {
    const sync = () => setCart(getCart());
    sync();
    return subscribeCart(sync);
  }, []);

  const total = useMemo(() => cart.reduce((s, x) => s + x.price * x.quantity, 0), [cart]);

  async function placeOrder() {
    const s = getSession();
    if (!s) return;

    if (cart.length === 0) {
      toast("Giỏ hàng đang trống.");
      return;
    }

    const payload: PlaceGuestOrderPayload = {
      tenantId: s.tenantId,
      branchId: s.branchId,
      tableId: s.tableId,
      guestName: guestName.trim() || "Khách",
      guestPhone: guestPhone.trim() || undefined,
      items: cart.map((x) => ({
        productId: x.productId,
        quantity: x.quantity,
        note: x.note?.trim() || undefined
      }))
    };

    try {
      toast("Đang gửi đơn...");
      touchSession();
      const orderId = await api.placeGuestOrder(payload);

      addOrder({
        orderId,
        createdAt: now(),
        status: "pending",
        totalAmount: total,
        items: cart
      });

      clearCart();
      toast("Đặt món thành công ✅");
      location.href = "/tracking";
    } catch (e: any) {
      toast(e?.message || "Đặt món thất bại");
    }
  }

  return (
    <SessionGuard>
      <div className="screen">
        <div className="wrap">
          <Header title="Giỏ hàng" subtitle="Thêm ghi chú cho từng món trước khi đặt" />

          <div className="card" style={{ marginTop: 10 }}>
            <div className="muted">Thông tin khách (tùy chọn):</div>
            <input className="input" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Tên hiển thị" />
            <div style={{ height: 8 }} />
            <input className="input" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="SĐT (nếu có)" />

            <div style={{ height: 12 }} />

            {cart.length === 0 ? (
              <div className="muted">Giỏ đang trống. Hãy quay lại Menu để chọn món.</div>
            ) : (
              <div className="list">
                {cart.map((it) => (
                  <div key={it.productId} className="food">
                    <div className="food-img">
                      {it.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={it.imageUrl} alt={it.name} />
                      ) : (
                        <div className="img-ph">🧁</div>
                      )}
                    </div>

                    <div className="food-body">
                      <div className="food-top">
                        <div className="food-name">{it.name}</div>
                        <div className="food-price">{moneyVND(it.price * it.quantity)}</div>
                      </div>

                      <div className="food-actions">
                        <QuantityStepper
                          value={it.quantity}
                          onChange={(v) => updateCartItem(it.productId, { quantity: v })}
                        />
                        <button className="btn mini ghost" onClick={() => removeCartItem(it.productId)}>
                          Xóa
                        </button>
                      </div>

                      <div style={{ marginTop: 8 }}>
                        <textarea
                          className="textarea"
                          value={it.note || ""}
                          onChange={(e) => updateCartItem(it.productId, { note: e.target.value })}
                          placeholder="Ghi chú (ít cay, không hành, thêm sốt...)"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ height: 12 }} />
            <div className="card">
              <div className="row" style={{ alignItems: "center" }}>
                <div className="col">
                  <div className="muted">Tổng tạm tính</div>
                  <div className="h2" style={{ margin: 0 }}>{moneyVND(total)}</div>
                </div>
                <div className="col">
                  <button className="btn primary" onClick={placeOrder} disabled={cart.length === 0}>
                    ĐẶT MÓN
                  </button>
                  <div style={{ height: 8 }} />
                  <button className="btn ghost" onClick={() => { clearCart(); toast("Đã xóa giỏ"); }}>
                    Xóa giỏ
                  </button>
                </div>
              </div>
            </div>
          </div>

          <BottomNav />
        </div>
      </div>
    </SessionGuard>
  );
}
