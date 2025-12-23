import { OrderView } from "@/lib/types";
import { formatMoneyVND } from "@/lib/time";

const mapLabel: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
  preparing: "Đang chuẩn bị",
  cooking: "Đang nấu",
  served: "Đã phục vụ",
};

export default function OrderStatusTimeline({ orders }: { orders: OrderView[] }) {
  if (orders.length === 0) {
    return <div className="rounded-2xl border p-4 text-sm opacity-80">Chưa có món nào được gọi trong phiên này.</div>;
  }

  return (
    <div className="space-y-4">
      {orders.map((o) => (
        <div key={o.id} className="rounded-2xl border p-4">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Đơn #{o.id.slice(0, 6).toUpperCase()}</div>
            <div className="text-sm">{mapLabel[o.status] || o.status}</div>
          </div>

          <div className="mt-2 text-sm opacity-70">
            {new Date(o.orderedAt).toLocaleString("vi-VN")}
          </div>

          <div className="mt-3 space-y-2">
            {o.items.map((it) => (
              <div key={it.id} className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">
                    {it.qty} x {it.name}
                  </div>
                  {it.notes && <div className="text-xs opacity-70">Ghi chú: {it.notes}</div>}
                  <div className="text-xs opacity-70">Trạng thái: {mapLabel[it.status] || it.status}</div>
                </div>
                <div className="text-sm font-semibold">{formatMoneyVND(it.unitPrice * it.qty)}</div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between border-t pt-3">
            <span className="font-semibold">Tổng</span>
            <span className="font-semibold">{formatMoneyVND(o.totalAmount)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
