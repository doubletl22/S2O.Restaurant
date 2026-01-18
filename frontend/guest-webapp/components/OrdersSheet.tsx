"use client";

import { useMemo, useState } from "react";
import { Sheet, Card, Button, Badge } from "./ui";
import { getLocalOrders, clearLocalOrders, setBillRequested, getBillRequested } from "@/lib/storage";

function money(v: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v || 0);
}

export function OrdersSheet({
  open,
  onClose,
  scopeKey,
  tableCode
}: {
  open: boolean;
  onClose: () => void;
  scopeKey: string;
  tableCode: string;
}) {
  const [tick, setTick] = useState(0);

  const orders = useMemo(() => getLocalOrders(scopeKey), [scopeKey, tick]);
  const bill = useMemo(() => getBillRequested(scopeKey), [scopeKey, tick]);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={`Đơn của bạn • Bàn ${tableCode}`}
      footer={
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setTick((x) => x + 1);
              }}
            >
              Tải lại
            </Button>

            <Button
              variant="danger"
              onClick={() => {
                clearLocalOrders(scopeKey);
                setTick((x) => x + 1);
              }}
            >
              Xoá lịch sử
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-[color:var(--line)] p-3 text-sm">
            <div>
              <div className="font-bold">Gọi thanh toán</div>
              <div className="text-xs text-[color:var(--muted)]">
                Backend hiện chưa có public endpoint “request bill”, nên mình lưu trạng thái trên thiết bị.
              </div>
            </div>
            <Button
              variant={bill ? "outline" : "primary"}
              onClick={() => {
                setBillRequested(scopeKey, !bill);
                setTick((x) => x + 1);
              }}
            >
              {bill ? "Đã gọi" : "Gọi"}
            </Button>
          </div>
        </div>
      }
    >
      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[color:var(--line)] p-6 text-center text-sm text-[color:var(--muted)]">
          Chưa có đơn nào (trên thiết bị này).
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o, idx) => {
            const totalQty = o.items.reduce((s, it) => s + it.quantity, 0);
            const totalMoney = o.items.reduce((s, it) => s + it.quantity * it.price, 0);

            return (
              <Card key={`${o.createdAt}-${idx}`} className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-extrabold">Đơn #{idx + 1}</div>
                    <div className="mt-1 text-xs text-[color:var(--muted)]">
                      {new Date(o.createdAt).toLocaleString("vi-VN")}
                    </div>
                    {o.id ? (
                      <div className="mt-1 text-xs text-[color:var(--muted)]">OrderId: {String(o.id)}</div>
                    ) : null}
                  </div>

                  <Badge className="border-transparent bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-200">
                    Đã gửi
                  </Badge>
                </div>

                <div className="mt-3 space-y-2 text-sm">
                  {o.items.map((it, i) => (
                    <div key={i} className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-semibold">{it.name}</div>
                        {it.note ? <div className="text-xs text-[color:var(--muted)]">Ghi chú: {it.note}</div> : null}
                      </div>
                      <div className="shrink-0 text-right text-xs text-[color:var(--muted)]">
                        x{it.quantity} • {money(it.price)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 hr" />

                <div className="mt-3 flex items-center justify-between text-sm">
                  <div className="text-[color:var(--muted)]">Tổng món</div>
                  <div className="font-extrabold">{totalQty}</div>
                </div>
                <div className="mt-1 flex items-center justify-between text-sm">
                  <div className="text-[color:var(--muted)]">Tạm tính</div>
                  <div className="font-extrabold">{money(totalMoney)}</div>
                </div>

                <div className="mt-3 text-xs text-[color:var(--muted)]">
                  Khi backend bổ sung “order history/status realtime”, badge sẽ đổi: Đã nhận → Đang làm → Sẵn sàng → Hoàn tất.
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Sheet>
  );
}
