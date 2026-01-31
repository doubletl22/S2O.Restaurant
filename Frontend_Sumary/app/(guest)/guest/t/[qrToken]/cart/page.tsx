'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { formatMoney, isSessionExpired, loadCart, saveCart, setSession, type CartLine } from '../../_shared/guestStore';

const ORANGE = 'bg-orange-500';
const ORANGE_HOVER = 'hover:bg-orange-600';

async function apiCreateOrder(qrToken: string, items: { menuItemId: string; qty: number; note?: string }[]) {
  const res = await api.post(`/guest/t/${qrToken}/orders`, { items });
  return res.data;
}

export default function CartPage() {
  const params = useParams<{ qrToken: string }>();
  const qrToken = params?.qrToken;
  const router = useRouter();

  const [expired, setExpired] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);

  useEffect(() => {
    if (!qrToken) return;
    if (isSessionExpired(qrToken)) {
      setExpired(true);
      return;
    }
    setSession(qrToken);
    setCart(loadCart(qrToken));
  }, [qrToken]);

  const total = useMemo(() => cart.reduce((s, x) => s + x.qty * x.price, 0), [cart]);

  function updateCart(next: CartLine[]) {
    if (!qrToken) return;
    setCart(next);
    saveCart(qrToken, next);
  }

  async function placeOrder() {
    if (!qrToken || cart.length === 0) return;
    try {
      await apiCreateOrder(qrToken, cart.map((c) => ({ menuItemId: c.menuItemId, qty: c.qty, note: c.note })));
      updateCart([]);
      router.push(`/guest/t/${qrToken}/tracking`);
    } catch {
      alert('Đặt món thất bại. Vui lòng thử lại.');
    }
  }

  if (!qrToken) return null;

  if (expired) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <div className="mb-2 text-5xl">🕒</div>
        <div className="text-xl font-bold">Phiên đã hết hạn</div>
        <div className="mt-1 text-sm text-gray-600">Vui lòng quét lại QR tại bàn để tiếp tục.</div>
        <button
          className={`${ORANGE} ${ORANGE_HOVER} mt-4 rounded-xl px-5 py-3 font-semibold text-white`}
          onClick={() => {
            setSession(qrToken);
            setExpired(false);
            setCart(loadCart(qrToken));
          }}
        >
          Tôi đang ở bàn này
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4">
      <div className="text-lg font-bold">Giỏ hàng</div>
      <div className="text-sm text-gray-600">Kiểm tra món trước khi đặt</div>

      {cart.length === 0 ? (
        <div className="mt-6 rounded-2xl border bg-gray-50 p-6 text-center">
          <div className="text-4xl">🧺</div>
          <div className="mt-2 font-semibold">Giỏ hàng trống</div>
          <div className="mt-1 text-sm text-gray-600">Hãy qua “Thực đơn” để chọn món.</div>
          <button
            className="mt-4 rounded-xl border bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50"
            onClick={() => router.push(`/guest/t/${qrToken}/menu`)}
          >
            Đi chọn món
          </button>
        </div>
      ) : (
        <>
          <div className="mt-4 space-y-3">
            {cart.map((c, idx) => (
              <div key={idx} className="rounded-2xl border bg-white p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold">{c.name}</div>
                    {c.note ? <div className="mt-1 text-xs text-gray-600">Ghi chú: {c.note}</div> : null}
                    <div className="mt-1 text-sm font-semibold">{formatMoney(c.price)}</div>
                  </div>
                  <button
                    className="rounded-xl border px-2 py-1 text-sm hover:bg-gray-50"
                    onClick={() => updateCart(cart.filter((_, i) => i !== idx))}
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      className="h-9 w-9 rounded-xl border text-lg font-bold hover:bg-gray-50"
                      onClick={() => updateCart(cart.map((x, i) => (i === idx ? { ...x, qty: Math.max(1, x.qty - 1) } : x)))}
                    >
                      −
                    </button>
                    <div className="w-10 text-center font-semibold">{c.qty}</div>
                    <button
                      className="h-9 w-9 rounded-xl border text-lg font-bold hover:bg-gray-50"
                      onClick={() => updateCart(cart.map((x, i) => (i === idx ? { ...x, qty: x.qty + 1 } : x)))}
                    >
                      +
                    </button>
                  </div>
                  <div className="text-sm font-bold">{formatMoney(c.qty * c.price)}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-2xl bg-gray-50 p-3">
            <div className="text-sm font-semibold text-gray-700">Tạm tính</div>
            <div className="text-base font-bold">{formatMoney(total)}</div>
          </div>

          <button
            className={`${ORANGE} ${ORANGE_HOVER} mt-3 w-full rounded-2xl px-4 py-3 font-bold text-white`}
            onClick={placeOrder}
          >
            Đặt món
          </button>

          <button
            className="mt-2 w-full rounded-2xl border bg-white px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50"
            onClick={() => router.push(`/guest/t/${qrToken}/menu`)}
          >
            Thêm món
          </button>
        </>
      )}
    </div>
  );
}
