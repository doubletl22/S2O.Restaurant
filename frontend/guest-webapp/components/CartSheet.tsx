"use client";

import { useMemo, useState } from "react";
import { Sheet, Card, Button, Textarea, Badge } from "./ui";
import { useCartStore } from "@/store/cart";
import { placeGuestOrder } from "@/lib/api";
import { addLocalOrder } from "@/lib/storage";

function money(v: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v || 0);
}

export function CartSheet({
  open,
  onClose,
  tenantId,
  tableId,
  tableCode,
  scopeKey
}: {
  open: boolean;
  onClose: () => void;
  tenantId: string;
  tableId: string;
  tableCode: string;
  scopeKey: string;
}) {
  const cart = useCartStore();
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const totals = useMemo(() => {
    const qty = cart.items.reduce((s, it) => s + it.quantity, 0);
    const amount = cart.items.reduce((s, it) => s + it.quantity * Number(it.price || 0), 0);
    return { qty, amount };
  }, [cart.items]);

  async function submit() {
    setMsg(null);
    if (cart.items.length === 0) {
      setMsg("Giỏ đang trống.");
      return;
    }

    try {
      setSending(true);

      const payload = {
        tableId,
        items: cart.items.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
          note: it.note?.trim() ? it.note.trim() : null
        }))
      };

      const orderId = await placeGuestOrder(tenantId, payload);

      // lưu local history để OrdersSheet hiển thị
      addLocalOrder(scopeKey, {
        id: orderId,
        createdAt: new Date().toISOString(),
        tableCode,
        items: cart.items.map((it) => ({
          productId: it.productId,
          name: it.name,
          price: Number(it.price || 0),
          quantity: it.quantity,
          note: it.note || null
        }))
      });

      cart.clear();
      setMsg("✅ Đã gửi order. Nhân viên sẽ xử lý sớm.");
      // giữ mở 1 chút cho user thấy msg
    } catch (e: any) {
      setMsg("❌ Gửi order thất bại: " + (e?.message || "unknown"));
    } finally {
      setSending(false);
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Giỏ hàng"
      footer={
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="text-[color:var(--muted)]">Tổng món</div>
            <div className="font-extrabold">{totals.qty}</div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="text-[color:var(--muted)]">Tạm tính</div>
            <div className="font-extrabold">{money(totals.amount)}</div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => cart.clear()}
              disabled={sending || cart.items.length === 0}
            >
              Xoá giỏ
            </Button>
            <Button onClick={submit} disabled={sending || cart.items.length === 0}>
              {sending ? "Đang gửi…" : "Gửi order"}
            </Button>
          </div>
          {msg ? <div className="text-xs text-[color:var(--muted)]">{msg}</div> : null}
        </div>
      }
    >
      {cart.items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[color:var(--line)] p-6 text-center text-sm text-[color:var(--muted)]">
          Chưa có món nào trong giỏ.
        </div>
      ) : (
        <div className="space-y-3">
          {cart.items.map((it) => (
            <Card key={it.productId} className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-extrabold">{it.name}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge className="border-transparent bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-200">
                      {money(Number(it.price || 0))}
                    </Badge>
                    <span className="text-xs text-[color:var(--muted)]">x {it.quantity}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => cart.dec(it.productId)} disabled={sending}>
                    -
                  </Button>
                  <Button variant="outline" onClick={() => cart.inc(it.productId)} disabled={sending}>
                    +
                  </Button>
                </div>
              </div>

              <div className="mt-3">
                <Textarea
                  value={it.note || ""}
                  onChange={(e) => cart.setNote(it.productId, e.target.value)}
                  placeholder="Ghi chú cho món (ít đá, không hành...)"
                  rows={2}
                  disabled={sending}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </Sheet>
  );
}
