<<<<<<< HEAD
"use client";

import { useCartStore } from "@/store/cartStore";
import { formatMoneyVND } from "@/lib/time";
import QuantityStepper from "./QuantityStepper";
import { api } from "@/lib/api";
import { useState } from "react";

export default function CartDrawer({
  open,
  onClose,
  sessionId,
  onOrdered,
}: {
  open: boolean;
  onClose: () => void;
  sessionId: string;
  onOrdered: (orderId: string) => void;
}) {
  const items = useCartStore((s) => s.items);
  const setQty = useCartStore((s) => s.setQty);
  const setNotes = useCartStore((s) => s.setNotes);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);
  const total = useCartStore((s) => s.total());

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!open) return null;

  async function submitOrder() {
    setErr(null);
    if (items.length === 0) return;

    setSubmitting(true);
    try {
      const payload = items.map((x) => ({ menuItemId: x.menuItemId, qty: x.qty, notes: x.notes }));
      const res = await api.createOrder(sessionId, payload);
      clear();
      onOrdered(res.orderId);
      onClose();
    } catch (e: any) {
      setErr(e?.message || "Đặt món thất bại");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-end">
      <div className="w-full max-w-md bg-white h-full p-4 overflow-auto">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">Giỏ món</div>
          <button className="px-3 py-1 rounded-lg border" onClick={onClose}>
            Đóng
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {items.map((x) => (
            <div key={x.menuItemId} className="rounded-2xl border p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{x.name}</div>
                  <div className="text-sm opacity-80">{formatMoneyVND(x.unitPrice)}</div>
                </div>
                <button className="text-sm underline" onClick={() => remove(x.menuItemId)}>
                  Xóa
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <QuantityStepper value={x.qty} onChange={(v) => setQty(x.menuItemId, v)} />
                <div className="font-semibold">{formatMoneyVND(x.unitPrice * x.qty)}</div>
              </div>

              <div className="mt-2">
                <label className="text-sm font-medium">Ghi chú (ví dụ: không hành, ít đá…)</label>
                <textarea
                  className="w-full mt-1 rounded-xl border p-2 text-sm"
                  rows={2}
                  value={x.notes}
                  onChange={(ev) => setNotes(x.menuItemId, ev.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border p-3 flex items-center justify-between">
          <span className="font-semibold">Tổng</span>
          <span className="font-semibold">{formatMoneyVND(total)}</span>
        </div>

        {err && <div className="mt-3 text-sm text-red-600">{err}</div>}

        <button
          className="mt-3 w-full rounded-2xl bg-black text-white px-4 py-3 disabled:opacity-40"
          disabled={items.length === 0 || submitting}
          onClick={submitOrder}
        >
          {submitting ? "Đang gửi..." : "Xác nhận đặt món"}
        </button>

        <div className="mt-2 text-xs opacity-70">
          * Đơn sẽ được gửi tới bếp. Bạn theo dõi trạng thái ở mục “Theo dõi đơn”.
        </div>
      </div>
    </div>
  );
}
=======
"use client";

import { useCartStore } from "@/store/cartStore";
import { formatMoneyVND } from "@/lib/time";
import QuantityStepper from "./QuantityStepper";
import { api } from "@/lib/api";
import { useState } from "react";

export default function CartDrawer({
  open,
  onClose,
  sessionId,
  onOrdered,
}: {
  open: boolean;
  onClose: () => void;
  sessionId: string;
  onOrdered: (orderId: string) => void;
}) {
  const items = useCartStore((s) => s.items);
  const setQty = useCartStore((s) => s.setQty);
  const setNotes = useCartStore((s) => s.setNotes);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);
  const total = useCartStore((s) => s.total());

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!open) return null;

  async function submitOrder() {
    setErr(null);
    if (items.length === 0) return;

    setSubmitting(true);
    try {
      const payload = items.map((x) => ({ menuItemId: x.menuItemId, qty: x.qty, notes: x.notes }));
      const res = await api.createOrder(sessionId, payload);
      clear();
      onOrdered(res.orderId);
      onClose();
    } catch (e: any) {
      setErr(e?.message || "Đặt món thất bại");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-end">
      <div className="w-full max-w-md bg-white h-full p-4 overflow-auto">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">Giỏ món</div>
          <button className="px-3 py-1 rounded-lg border" onClick={onClose}>
            Đóng
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {items.map((x) => (
            <div key={x.menuItemId} className="rounded-2xl border p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{x.name}</div>
                  <div className="text-sm opacity-80">{formatMoneyVND(x.unitPrice)}</div>
                </div>
                <button className="text-sm underline" onClick={() => remove(x.menuItemId)}>
                  Xóa
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <QuantityStepper value={x.qty} onChange={(v) => setQty(x.menuItemId, v)} />
                <div className="font-semibold">{formatMoneyVND(x.unitPrice * x.qty)}</div>
              </div>

              <div className="mt-2">
                <label className="text-sm font-medium">Ghi chú (ví dụ: không hành, ít đá…)</label>
                <textarea
                  className="w-full mt-1 rounded-xl border p-2 text-sm"
                  rows={2}
                  value={x.notes}
                  onChange={(ev) => setNotes(x.menuItemId, ev.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border p-3 flex items-center justify-between">
          <span className="font-semibold">Tổng</span>
          <span className="font-semibold">{formatMoneyVND(total)}</span>
        </div>

        {err && <div className="mt-3 text-sm text-red-600">{err}</div>}

        <button
          className="mt-3 w-full rounded-2xl bg-black text-white px-4 py-3 disabled:opacity-40"
          disabled={items.length === 0 || submitting}
          onClick={submitOrder}
        >
          {submitting ? "Đang gửi..." : "Xác nhận đặt món"}
        </button>

        <div className="mt-2 text-xs opacity-70">
          * Đơn sẽ được gửi tới bếp. Bạn theo dõi trạng thái ở mục “Theo dõi đơn”.
        </div>
      </div>
    </div>
  );
}
>>>>>>> b6136e036fc676c4b81d4adbb0e4f55082d26efd
