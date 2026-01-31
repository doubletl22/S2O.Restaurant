"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatMoney, getSession, loadOrders, GuestOrderLocal } from "../../_shared/guestStore";

export default function TrackingPage() {
  const params = useParams();
  const qrToken = String(params.qrToken || "");
  const router = useRouter();

  const session = useMemo(() => getSession(), []);
  const [orders, setOrders] = useState<GuestOrderLocal[]>([]);

  const refresh = () => {
    if (!session) return;
    setOrders(loadOrders(session.tableId));
  };

  useEffect(() => {
    refresh();
    // chỉ refresh local, không gọi backend => hết 404
    const t = setInterval(refresh, 3000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const badge = (s: GuestOrderLocal["status"]) => {
    const map: Record<string, string> = {
      Pending: "bg-gray-100 text-gray-800",
      Preparing: "bg-orange-100 text-orange-700",
      Ready: "bg-green-100 text-green-700",
      Served: "bg-blue-100 text-blue-700",
      Cancelled: "bg-red-100 text-red-700",
      Paid: "bg-emerald-100 text-emerald-700",
    };
    return map[s] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-bold text-gray-900">Đơn của tôi</div>
          <div className="text-sm text-gray-500">Theo dõi trạng thái và lịch sử</div>
        </div>
        <button className="rounded-xl border px-3 py-2 text-sm font-semibold" onClick={refresh}>
          Làm mới
        </button>
      </div>

      <div className="mt-4 rounded-2xl border bg-white p-4">
        {!session ? (
          <div className="text-sm text-gray-600">Chưa có phiên bàn. Vui lòng quét QR lại.</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-gray-900 font-semibold">Chưa có đơn nào</div>
            <div className="text-sm text-gray-500 mt-1">Hãy đặt món để xem trạng thái ở đây.</div>
            <button
              className="mt-4 w-full rounded-xl bg-orange-500 text-white py-3 font-semibold active:scale-[0.99]"
              onClick={() => router.push(`/guest/t/${qrToken}/menu`)}
            >
              Đi tới thực đơn
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.orderId} className="rounded-xl border p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-gray-900">
                    Mã đơn: <span className="font-mono">{o.orderId.slice(0, 8)}...</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${badge(o.status)}`}>
                    {o.status}
                  </span>
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  Tổng: <span className="font-semibold">{formatMoney(o.total)}đ</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(o.createdAt).toLocaleString("vi-VN")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        className="mt-4 w-full rounded-2xl bg-orange-500 text-white py-4 font-bold text-base active:scale-[0.99]"
        onClick={() => alert("Đã gửi yêu cầu thanh toán. Vui lòng chờ nhân viên hỗ trợ!")}
      >
        Yêu cầu thanh toán
      </button>
    </div>
  );
}
