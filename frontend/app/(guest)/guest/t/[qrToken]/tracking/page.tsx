"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { guestService } from "@/services/guest.service";
import { loadSession } from "../../_shared/guestStore";
function statusLabel(s: any) {
  const v = String(s ?? "").toLowerCase();
  if (v.includes("served")) return "Đã phục vụ";
  if (v.includes("cooking")) return "Đang nấu";
  if (v.includes("pending")) return "Mới";
  if (v.includes("cancel")) return "Đã hủy";
  return s ?? "Mới";
}

export default function GuestTrackingPage() {
  const params = useParams<{ qrToken: string }>();
  const router = useRouter();
  const qrToken = params.qrToken;

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const value: any = await guestService.getOrdersByQrToken(qrToken);

      const list = value?.items ?? value?.Items ?? [];
      const amount = value?.totalAmount ?? value?.TotalAmount ?? 0;

      setItems(Array.isArray(list) ? list : []);
      setTotal(Number(amount || 0));
    } catch (e: any) {
      toast.error(e?.message || "Không thể tải đơn hàng");
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrToken]);

  const requestBill = async () => {
    try {
      await guestService.requestBill(qrToken);
      toast.success("Đã gửi yêu cầu thanh toán");
    } catch (e: any) {
      toast.error(e?.message || "Gửi yêu cầu thất bại");
    }
  };

  const session = loadSession(qrToken);

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center justify-between">
        <button className="p-2 rounded-full hover:bg-muted" onClick={() => router.push(`/guest/t/${qrToken}`)}>
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="text-center">
          <div className="font-bold">Đơn hàng</div>
          <div className="text-xs text-muted-foreground">
            {session?.tableName ? `Bàn: ${session.tableName}` : ""}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={requestBill}>
            Yêu cầu thanh toán
          </Button>
          <Button variant="ghost" size="icon" onClick={fetchOrders} title="Tải lại">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-14 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Đang tải đơn hàng...
          </div>
        ) : items.length === 0 ? (
          <div className="text-center text-muted-foreground py-14">
            Chưa có đơn hàng nào. Hãy đặt món trước.
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {items.map((x: any) => {
                const name = x.productName ?? x.ProductName ?? x.name ?? x.Name;
                const qty = x.quantity ?? x.Quantity ?? 1;
                const note = x.note ?? x.Note ?? "";
                const st = x.status ?? x.Status;

                return (
                  <div key={x.id ?? x.Id ?? `${name}-${qty}`} className="border rounded-2xl p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold">{name}</div>
                        <div className="text-sm text-muted-foreground">SL: {qty}</div>
                        {note ? <div className="text-xs text-muted-foreground mt-1">Note: {note}</div> : null}
                      </div>
                      <Badge className="bg-orange-500">{statusLabel(st)}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 border rounded-2xl p-4 flex items-center justify-between">
              <div className="text-muted-foreground">Tổng tạm tính</div>
              <div className="text-lg font-bold text-orange-600">
                {new Intl.NumberFormat("vi-VN").format(total)} đ
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
