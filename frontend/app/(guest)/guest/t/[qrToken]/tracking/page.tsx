"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
  productName: string;
  quantity: number;
  note?: string;
  price: number;
  status: number;
  imageUrl?: string;
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
  const qrToken = useMemo(() => {
    const t = params?.qrToken;
    return Array.isArray(t) ? t[0] : t;
  }, [params]);

  const [order, setOrder] = useState<LocalOrder | null>(null);

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

  // ✅ map status -> text
  const statusText = (s: any) => {
    const str = String(s ?? "").toLowerCase();

    // string status
    if (str.includes("pending") || str.includes("new") || str.includes("confirm"))
      return "Chờ xác nhận";
    if (str.includes("prepar") || str.includes("cook") || str.includes("processing"))
      return "Đang chế biến";
    if (str.includes("done") || str.includes("complete") || str.includes("served"))
      return "Hoàn thành";
    if (str.includes("cancel")) return "Đã huỷ";

    // numeric status
    const v = Number(s);
    if (v === 0) return "Chờ xác nhận";
    if (v === 1) return "Đang chế biến";
    if (v === 2) return "Hoàn thành";
    if (v === 3) return "Đã phục vụ";
    if (v === 4) return "Đã huỷ";

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

    // cancelled
    if (text === "Đã huỷ" || str.includes("cancel") || v === 4) {
      return (
        <Badge className="bg-red-50 text-red-700 gap-1">
          <Clock className="h-3 w-3" /> Cancel
        </Badge>
      );
    }

    // processing
    if (text === "Đang chế biến" || str.includes("processing") || v === 1) {
      return (
        <Badge className="bg-blue-50 text-blue-700 gap-1">
          <Clock className="h-3 w-3" /> Processing
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

    // ✅ polling 5s: lấy status thật từ backend theo orderId (nếu có API)
    const timer = setInterval(async () => {
      try {
        const raw = localStorage.getItem("guest_last_order");
        if (!raw) return;

        const o: any = JSON.parse(raw);
        if (!o?.orderId) return;

        const res = await guestService.getOrderStatus(o.orderId);

        if (res?.isSuccess) {
          const statusFromBackend =
            res.value?.status ?? res.value?.orderStatus ?? res.value?.state;

          const next = {
            ...o,
            status: statusFromBackend ?? o.status,
          };

          localStorage.setItem("guest_last_order", JSON.stringify(next));
          setOrder(next);
        }
      } catch {
        // ignore
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
          onClick={() => {
            load();
            toast.info("Đã cập nhật");
          }}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="px-4 pb-20">
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
                    <span>{formatPrice(item.price * item.quantity)}</span>
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
                <span>Tạm tính</span>
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
