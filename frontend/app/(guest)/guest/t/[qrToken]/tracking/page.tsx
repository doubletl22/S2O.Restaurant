"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, RefreshCw, Utensils, Clock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { BottomNavV2 } from "@/components/guest/bottom-nav-v2";
import { guestService } from "@/services/guest.service";

type LocalOrderItem = {
  id: string;
  productId?: string;
  productName: string;
  quantity: number;
  note?: string;
  price: number;
  status: number;
  imageUrl?: string;
  unitPrice?: number;
};

type LocalOrder = {
  orderId: string;
  createdAt: number;
  tableName?: string;
  items: LocalOrderItem[];
  totalAmount: number;
  status?: any; // ✅ thêm status tổng (backend có thể trả number/string)
};

export default function TrackingPage() {
  const params = useParams<{ qrToken?: string | string[] }>();
  const router = useRouter();
  const qrToken = useMemo(() => {
    const t = params?.qrToken;
    return Array.isArray(t) ? t[0] : t;
  }, [params]);

  const [order, setOrder] = useState<LocalOrder | null>(null);
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);
  const redirectTimerRef = useRef<number | null>(null);

  const clearLocalOrder = () => {
    try {
      localStorage.removeItem("guest_last_order");
    } catch {}
    setOrder(null);
  };

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        window.clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  const load = () => {
    try {
      const raw = localStorage.getItem("guest_last_order");
      if (!raw) return setOrder(null);
      setOrder(JSON.parse(raw));
    } catch {
      setOrder(null);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

  const toNumericStatus = (s: any): number => {
    const str = String(s ?? "").toLowerCase();
    if (str.includes("pending") || str.includes("new")) return 0;
    if (str.includes("confirm")) return 1;
    if (str.includes("prepar") || str.includes("cook") || str.includes("processing")) return 2;
    if (str.includes("done") || str.includes("complete")) return 3;
    if (str.includes("paid")) return 6;
    if (str.includes("served")) return 6;
    if (str.includes("cancel")) return 5;

    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  };

  const mapBackendOrder = (current: any, backend: any) => {
    const currentItems: LocalOrderItem[] = Array.isArray(current?.items) ? current.items : [];

    // Build lookup: productId -> local item (local snapshot stores id = productId)
    const localByProductId = new Map<string, LocalOrderItem>();
    currentItems.forEach((item) => {
      const pid = String(item?.productId || item?.id || "");
      if (pid) localByProductId.set(pid, item);
    });

    const backendItems = Array.isArray(backend?.items)
      ? backend.items.map((item: any, index: number) => {
          const quantity = Number(item?.quantity || 0);
          const unitPrice = Number(item?.unitPrice ?? item?.price ?? 0);
          const productId = String(item?.productId || "");

          // Try to find matching local item for name/image recovery
          const localItem = (productId && localByProductId.get(productId)) || currentItems[index];

          // Prefer backend name (now fixed), fallback to local
          const productName = String(
            item?.productName || item?.name || localItem?.productName || "Món ăn"
          );

          // Backend DTO has no imageUrl - always recover from local snapshot
          const imageUrl = localItem?.imageUrl || "";

          return {
            id: String(item?.id || item?.productId || localItem?.id || `${index}`),
            productId,
            productName,
            quantity,
            note: item?.note || localItem?.note || "",
            price: unitPrice,
            unitPrice,
            status: toNumericStatus(item?.status),
            imageUrl,
          } as LocalOrderItem;
        })
      : [];

    const totalAmount =
      Number(backend?.totalAmount) ||
      backendItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0) ||
      Number(current?.totalAmount || 0);

    return {
      ...current,
      status: backend?.status ?? backend?.orderStatus ?? backend?.state ?? current?.status,
      tableName: backend?.tableName || current?.tableName,
      items: backendItems.length > 0 ? backendItems : currentItems,
      totalAmount,
    } as LocalOrder;
  };

  const syncOrderStatus = async () => {
    const raw = localStorage.getItem("guest_last_order");
    if (!raw) {
      setOrder(null);
      return false;
    }

    const o: any = JSON.parse(raw);
    if (!o?.orderId) {
      clearLocalOrder();
      return false;
    }

    const res = await guestService.getOrderStatus(o.orderId);
    if (!res?.isSuccess) {
      const errCode = String(res?.error?.code || "").toLowerCase();
      if (errCode === "404" || errCode.includes("notfound")) {
        clearLocalOrder();
        return true;
      }
      return false;
    }

    const next = mapBackendOrder(o, res.value || {});

    const nextStatus = toNumericStatus(next.status);
    if (nextStatus === 4 || nextStatus === 5 || nextStatus === 6) {
      if (nextStatus === 6) {
        setPaymentNotice("Đã thanh toán thành công. Bàn đã sẵn sàng cho khách tiếp theo.");
        toast.success("Đã thanh toán thành công");
        if (redirectTimerRef.current) {
          window.clearTimeout(redirectTimerRef.current);
        }
        redirectTimerRef.current = window.setTimeout(() => {
          router.replace(qrToken ? `/guest/t/${qrToken}` : "/");
        }, 2500);
      }
      clearLocalOrder();
      return true;
    }

    localStorage.setItem("guest_last_order", JSON.stringify(next));
    setOrder(next);
    return true;
  };

  // ✅ map status -> text
  const statusText = (s: any) => {
    const str = String(s ?? "").toLowerCase();

    // string status
    if (str.includes("pending") || str.includes("new"))
      return "Chờ xác nhận";
    if (str.includes("confirm"))
      return "Đã xác nhận";
    if (str.includes("prepar") || str.includes("cook") || str.includes("processing"))
      return "Đang chế biến";
    if (str.includes("paid")) return "Đã thanh toán";
    if (str.includes("done") || str.includes("complete") || str.includes("served"))
      return "Hoàn thành";
    if (str.includes("cancel")) return "Đã huỷ";

    // numeric status
    const v = Number(s);
    if (v === 0) return "Chờ xác nhận";
    if (v === 1) return "Đã xác nhận";
    if (v === 2) return "Đang chế biến";
    if (v === 3) return "Hoàn thành";
    if (v === 4) return "Hoàn tất phục vụ";
    if (v === 5) return "Đã huỷ";
    if (v === 6) return "Đã thanh toán";

    return "Đang xử lý";
  };

  // ✅ map status -> badge UI
  const statusBadge = (s: any) => {
    const text = statusText(s);
    const str = String(s ?? "").toLowerCase();
    const v = Number(s);

    // done
    if (text === "Hoàn thành" || str.includes("done") || str.includes("complete") || v === 2) {
      return (
        <Badge className="bg-green-50 text-green-700 gap-1">
          <Clock className="h-3 w-3" /> Done
        </Badge>
      );
    }

    if (text === "Đã thanh toán" || str.includes("paid") || v === 6) {
      return (
        <Badge className="bg-emerald-50 text-emerald-700 gap-1">
          <Clock className="h-3 w-3" /> Paid
        </Badge>
      );
    }

    // cancelled
    if (text === "Đã huỷ" || str.includes("cancel") || v === 4) {
      return (
        <Badge className="bg-red-50 text-red-700 gap-1">
          <Clock className="h-3 w-3" /> Cancel
        </Badge>
      );
    }

    // confirmed / processing
    if (
      text === "Đã xác nhận" ||
      text === "Đang chế biến" ||
      str.includes("confirm") ||
      str.includes("processing") ||
      str.includes("cook") ||
      v === 1 ||
      v === 2
    ) {
      return (
        <Badge className="bg-blue-50 text-blue-700 gap-1">
          <Clock className="h-3 w-3" /> {text === "Đã xác nhận" ? "Đã xác nhận" : "Đang chế biến"}
        </Badge>
      );
    }

    // default pending
    return (
      <Badge className="bg-yellow-50 text-yellow-700 gap-1">
        <Clock className="h-3 w-3" /> Pending
      </Badge>
    );
  };

  useEffect(() => {
    load();

    // Sync ngay khi mở trang để dọn local cache nếu đơn đã bị xóa khỏi DB.
    void syncOrderStatus();

    // Polling 5s: lấy status từ backend, dừng sau 3 lần thất bại liên tiếp
    let failCount = 0;
    const MAX_FAILS = 3;

    const timer = setInterval(async () => {
      try {
        if (await syncOrderStatus()) {
          failCount = 0; // reset khi thành công
        } else {
          failCount++;
          if (failCount >= MAX_FAILS) {
            clearInterval(timer);
          }
        }
      } catch {
        failCount++;
        if (failCount >= MAX_FAILS) {
          clearInterval(timer);
        }
      }
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="flex justify-between px-4 py-2 bg-white border-b sticky top-0">
        <Link
          href={qrToken ? `/guest/t/${qrToken}` : "#"}
          className="flex items-center text-sm text-gray-500"
          onClick={(e) => {
            if (!qrToken) e.preventDefault();
          }}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Menu
        </Link>

        <span className="font-semibold text-sm">Đơn hàng</span>

        <Button
          variant="ghost"
          size="icon"
          onClick={async () => {
            const synced = await syncOrderStatus();
            if (!synced) {
              load();
            }
            toast.info("Đã cập nhật");
          }}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="px-4 pb-20">
        {paymentNotice && !order ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
            <div className="rounded-full bg-emerald-50 text-emerald-600 p-4">
              <Clock className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-lg">{paymentNotice}</p>
              <p className="text-sm text-gray-500">
                Hệ thống đã xóa đơn trước đó để khách tiếp theo có thể đặt món mới.
              </p>
            </div>
            <Link href={qrToken ? `/guest/t/${qrToken}` : "/"}>
              <Button>Xem Menu</Button>
            </Link>
          </div>
        ) : null}

        {!qrToken ? (
          <div className="flex flex-col items-center py-20 space-y-4 text-gray-500">
            Thiếu QR Token. Vui lòng quét lại mã QR.
          </div>
        ) : !order ? (
          <div className="flex flex-col items-center py-20 space-y-4">
            <Utensils className="h-8 w-8 text-gray-400" />
            <p>Bạn chưa gọi món nào</p>
            <Link href={`/guest/t/${qrToken}`}>
              <Button>Xem Menu</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6 pt-4">
            <div className="bg-white p-4 rounded-xl border">
              <div className="flex justify-between">
                <div>
                  <div className="font-semibold">Mã đơn: {order.orderId}</div>
                  <div className="text-xs text-gray-500">
                    {order.tableName ? `Bàn: ${order.tableName} • ` : ""}
                    {statusText(order.status)}
                  </div>
                </div>

                {statusBadge(order.status)}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border">
              <div className="font-semibold">Xem trước đơn hàng</div>
              <div className="text-xs text-gray-500 mt-1">
                Danh sách món và giá được xác nhận từ hệ thống.
              </div>
            </div>

            {order.items.map((item) => (
              <div key={item.id} className="bg-white p-3 rounded-xl border flex gap-3">
                <div className="h-16 w-16 bg-gray-100 rounded-md overflow-hidden">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-gray-400">
                      IMG
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium">{item.productName}</h4>
                    <span>x{item.quantity}</span>
                  </div>

                  <div className="flex justify-between mt-2 text-sm text-gray-500">
                    <span>{item.note || ""}</span>
                    <span>{formatPrice((item.unitPrice ?? item.price) * item.quantity)}</span>
                  </div>
                </div>
              </div>
            ))}

            <Separator />

            <div className="bg-white p-4 rounded-xl border">
              <div className="flex justify-between text-sm">
                <span>Tổng món</span>
                <span>{order.items.reduce((a, i) => a + i.quantity, 0)}</span>
              </div>

              <div className="flex justify-between text-lg font-bold">
                <span>{statusText(order.status) === "Đã xác nhận" || statusText(order.status) === "Đang chế biến" || statusText(order.status) === "Hoàn thành" ? "Tổng giá đã xác nhận" : "Tạm tính"}</span>
                <span className="text-orange-600">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        )}
      </ScrollArea>

      {!!qrToken && <BottomNavV2 qrToken={qrToken} />}
    </div>
  );
}
