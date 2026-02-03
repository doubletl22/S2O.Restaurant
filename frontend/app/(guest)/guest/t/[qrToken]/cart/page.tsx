"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  initGuestStore,
  subscribeGuestStore,
  getCart,
  getSession,
  setQty,
  setNote,
  removeItem,
  cartTotal,
  clearCart,
} from "../../_shared/guestStore";

import { guestService } from "@/services/guest.service";

// Nếu dự án bạn có Button/Textarea (shadcn) thì dùng, không có vẫn chạy
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

function toStr(v: string | string[] | undefined) {
  if (!v) return "";
  return Array.isArray(v) ? v[0] : v;
}

export default function CartPage() {
  const router = useRouter();
  const params = useParams<{ qrToken: string }>();
  const qrToken = toStr(params?.qrToken);

  // trigger render khi store đổi
  const [, force] = useState(0);

  useEffect(() => {
    if (!qrToken) return;
    initGuestStore(qrToken);

    const unsub = subscribeGuestStore(() => force((x) => x + 1));
    return () => unsub();
  }, [qrToken]);

  const session = useMemo(() => getSession(), [qrToken]); // cache theo render
  const cart = useMemo(() => getCart(), [qrToken, force]);

  const total = useMemo(() => cartTotal(), [cart]);

  const onBack = () => {
    router.push(`/guest/t/${qrToken}`);
  };

  const onPlaceOrder = async () => {
    try {
      if (!qrToken) throw new Error("Thiếu qrToken");
      if (!session) throw new Error("Chưa có session bàn (hãy quay lại menu và quét QR lại).");
      if (!session.tenantId || !session.tableId) throw new Error("Thiếu tenantId/tableId trong session.");
      if (!cart || cart.length === 0) throw new Error("Giỏ hàng trống.");

      // payload theo guest.service.ts bạn đang dùng
      const payload = {
        tenantId: session.tenantId,
        tableId: session.tableId,
        items: cart.map((x) => ({
          productId: x.id,
          name: x.name,
          quantity: x.qty,
          note: x.note || "",
        })),
      };

      await guestService.placeOrder(payload);

      toast.success("Đặt món thành công!");
      clearCart();

      // quay về menu hoặc trang orders tuỳ bạn
      router.push(`/guest/t/${qrToken}`);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.description ||
        err?.response?.data?.message ||
        err?.message ||
        "Đặt món thất bại";

      // Nếu là axios lỗi 404 -> in thêm endpoint để bạn biết sai URL nào
      const status = err?.response?.status;
      const url = err?.config?.url;

      if (status) {
        toast.error(`[${status}] ${msg}${url ? ` (${url})` : ""}`);
      } else {
        toast.error(msg);
      }
      console.error("placeOrder error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header kiểu mobile */}
      <div className="mx-auto w-full max-w-[430px] border-x border-gray-200 min-h-screen">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              onClick={onBack}
              className="h-9 w-9 rounded-full border border-gray-200 flex items-center justify-center"
              aria-label="Back"
            >
              ←
            </button>
            <div className="flex-1">
              <div className="text-base font-semibold">Giỏ hàng</div>
              <div className="text-xs text-gray-500">
                {session?.tenantName ? session.tenantName : ""}{" "}
                {session?.tableName ? `• ${session.tableName}` : ""}
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-4 space-y-4">
          {(!cart || cart.length === 0) && (
            <div className="text-center text-gray-500 py-10">
              Giỏ hàng đang trống
            </div>
          )}

          {cart?.map((it) => (
            <div
              key={it.id}
              className="rounded-2xl border border-gray-200 p-4 bg-white shadow-sm"
            >
              <div className="flex gap-3">
                {/* image */}
                <div className="h-16 w-16 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center">
                  {it.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.imageUrl} alt={it.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs text-gray-400">No image</span>
                  )}
                </div>

                <div className="flex-1">
                  <div className="font-semibold leading-tight">{it.name}</div>
                  <div className="text-orange-600 font-bold mt-1">
                    {(Number(it.price) || 0).toLocaleString("vi-VN")} đ
                  </div>

                  {/* qty + remove */}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        className="h-9 w-9 rounded-lg border border-gray-300"
                        onClick={() => setQty(it.id, it.qty - 1)}
                      >
                        −
                      </button>
                      <div className="w-8 text-center font-semibold">{it.qty}</div>
                      <button
                        className="h-9 w-9 rounded-lg border border-gray-300"
                        onClick={() => setQty(it.id, it.qty + 1)}
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="ml-auto text-red-500 font-semibold"
                      onClick={() => removeItem(it.id)}
                    >
                      Xoá
                    </button>
                  </div>
                </div>
              </div>

              {/* note */}
              <div className="mt-3">
                <Textarea
                  value={it.note || ""}
                  onChange={(e) => setNote(it.id, e.target.value)}
                  placeholder="Ghi chú (ít đá, không hành, ...)"
                  className="min-h-[70px]"
                />
              </div>
            </div>
          ))}

          {/* total + submit */}
          {cart && cart.length > 0 && (
            <div className="rounded-2xl border border-gray-200 p-4 bg-white shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Tổng cộng</div>
                <div className="text-orange-600 font-bold text-lg">
                  {total.toLocaleString("vi-VN")} đ
                </div>
              </div>

              <Button
                onClick={onPlaceOrder}
                className="w-full mt-4 rounded-2xl h-12 bg-orange-500 hover:bg-orange-600"
              >
                Đặt món
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
