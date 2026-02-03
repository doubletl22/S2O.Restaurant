"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Minus, Plus, Trash2, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useGuestCart } from "@/components/guest/guest-cart-context";
import { guestService } from "@/services/guest.service";
import { BottomNavV2 } from "@/components/guest/bottom-nav-v2";

export default function CartPage() {
  const params = useParams<{ qrToken: string }>();
  const qrToken = Array.isArray(params?.qrToken)
    ? params.qrToken[0]
    : params?.qrToken;

  const router = useRouter();

  const {
    cart,
    tableInfo,
    setTableInfo,
    totalAmount,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useGuestCart();

  const [submitting, setSubmitting] = useState(false);

  // ✅ normalize qty/quantity để không crash + gửi đúng backend
  const getQty = (item: any) => {
    const q = item?.quantity ?? item?.qty ?? 0;
    return Number.isFinite(Number(q)) ? Number(q) : 0;
  };

  const safeCart = useMemo(() => {
    return (cart || []).map((i: any) => ({
      ...i,
      __qty: getQty(i),
    }));
  }, [cart]);

  useEffect(() => {
    if (!qrToken) return;
    if (tableInfo?.tableId) return;

    guestService
      .resolveTable(qrToken)
      .then((t) => setTableInfo(t))
      .catch(() => toast.error("Không lấy được thông tin bàn, hãy quét lại QR"));
  }, [qrToken, tableInfo?.tableId, setTableInfo]);

  const formatMoney = (v: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
      v
    );

  const placeOrder = async () => {
    if (!tableInfo?.tenantId || !tableInfo?.tableId) {
      toast.error("Thiếu thông tin bàn", { description: "Vui lòng quét lại QR." });
      return;
    }
    if (!safeCart.length) return;

    // ✅ chặn trường hợp qty <= 0
    if (safeCart.some((i) => i.__qty <= 0)) {
      toast.error("Số lượng không hợp lệ", {
        description: "Vui lòng tăng số lượng sản phẩm.",
      });
      return;
    }

    setSubmitting(true);
    try {
      // ✅ Payload chuẩn như yêu cầu backend
      const payload = {
        tenantId: tableInfo.tenantId,
        tableId: tableInfo.tableId,
        items: safeCart.map((i) => ({
          productId: i.id, // menuItemId
          name: i.name,
          quantity: i.__qty, // ✅ luôn có số
          note: i.note || "",
        })),
      };

      const res: any = await guestService.placeOrder(payload);

      if (res?.isSuccess) {
        // ✅ lấy orderId an toàn (tùy backend trả về string / object)
        const orderId =
          res?.value?.orderId ??
          res?.value?.id ??
          res?.value ??
          res?.data?.orderId ??
          res?.data?.id;

        const lastOrder = {
          orderId: orderId || "UNKNOWN",
          createdAt: Date.now(),
          tableName: tableInfo.tableName,
          items: safeCart.map((i) => ({
            id: i.id, // ✅ dùng id món cho ổn định
            productName: i.name,
            quantity: i.__qty,
            note: i.note || "",
            price: i.price,
            status: 0,
            imageUrl: i.imageUrl || "",
          })),
          totalAmount,
        };

        try {
          localStorage.setItem("guest_last_order", JSON.stringify(lastOrder));
        } catch {}

        toast.success("Đặt món thành công!");
        clearCart();
        router.push(`/guest/t/${qrToken}/tracking`);
      } else {
        // ✅ bắt rộng message trong response fail (tùy backend)
        toast.error("Đặt món thất bại", {
          description:
            res?.error?.description ||
            res?.error?.message ||
            res?.message ||
            res?.title ||
            "Vui lòng thử lại",
        });
      }
    } catch (e: any) {
      // ✅ FIX: Hiện đúng lỗi backend thay vì báo chung chung
      console.error("PLACE_ORDER_ERROR:", e);

      const desc =
        e?.response?.data?.error?.description ||
        e?.response?.data?.error?.message ||
        e?.response?.data?.message ||
        e?.response?.data?.title ||
        e?.message ||
        (typeof e === "string" ? e : null) ||
        "Vui lòng thử lại";

      toast.error("Đặt món thất bại", { description: desc });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white p-4 shadow-sm flex items-center gap-2 sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-bold text-lg">Giỏ hàng</h1>
      </div>

      <div className="p-4 space-y-4">
        {safeCart.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            Giỏ hàng trống
            <div>
              <Button variant="link" onClick={() => router.push(`/guest/t/${qrToken}`)}>
                Quay lại Menu
              </Button>
            </div>
          </div>
        ) : (
          safeCart.map((item: any) => (
            <div
              key={item.cartId ?? item.id}
              className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-start"
            >
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{item.name}</h4>
                {item.note && (
                  <p className="text-xs text-gray-500 mt-1">Ghi chú: {item.note}</p>
                )}
                <div className="text-sm font-semibold text-orange-600 mt-1">
                  {formatMoney(item.price)}
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                <button
                  onClick={() => removeFromCart(item.cartId ?? item.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => updateQuantity(item.cartId ?? item.id, -1)}
                    className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm active:scale-95"
                    disabled={submitting}
                  >
                    <Minus className="h-3 w-3" />
                  </button>

                  <span className="text-sm font-medium w-4 text-center">{item.__qty}</span>

                  <button
                    onClick={() => updateQuantity(item.cartId ?? item.id, 1)}
                    className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm active:scale-95"
                    disabled={submitting}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {safeCart.length > 0 && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-[420px] p-4 bg-white border-t shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600">Tổng cộng</span>
            <span className="text-xl font-bold text-orange-600">
              {formatMoney(totalAmount)}
            </span>
          </div>

          <Button
            className="w-full h-12 text-base rounded-xl"
            onClick={placeOrder}
            disabled={submitting}
          >
            {submitting ? "Đang gửi đơn..." : "Xác nhận đặt món"}
          </Button>
        </div>
      )}

      {qrToken && <BottomNavV2 qrToken={qrToken} />}
    </div>
  );
}
