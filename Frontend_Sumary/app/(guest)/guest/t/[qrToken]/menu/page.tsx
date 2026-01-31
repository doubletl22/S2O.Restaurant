'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { formatMoney, isSessionExpired, loadCart, saveCart, setSession } from "../../_shared/guestStore";

type Category = { id: string; name: string };
type MenuItem = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  description?: string | null;
  isAvailable?: boolean;
  categoryId?: string | null;
};

type TableContext = { restaurantName: string; tableName: string; branchName?: string };

const ORANGE = 'bg-orange-500';
const ORANGE_HOVER = 'hover:bg-orange-600';

async function apiGetContext(qrToken: string): Promise<TableContext> {
  // Nếu backend bạn khác endpoint thì sửa tại đây
  const res = await api.get(`/guest/t/${qrToken}/context`);
  return res.data;
}
async function apiGetCategories(qrToken: string): Promise<Category[]> {
  const res = await api.get(`/guest/t/${qrToken}/categories`);
  return res.data;
}
async function apiGetMenuItems(qrToken: string, categoryId: string | null, q: string): Promise<MenuItem[]> {
  const params: any = {};
  if (categoryId) params.categoryId = categoryId;
  if (q) params.q = q;
  const res = await api.get(`/guest/t/${qrToken}/menu-items`, { params });
  return res.data;
}

function Pill({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={[
        'shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition',
        active ? `${ORANGE} text-white` : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function BottomSheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-md rounded-t-2xl bg-white shadow-2xl">
        {children}
      </div>
    </div>
  );
}

export default function GuestMenuPage() {
  const params = useParams<{ qrToken: string }>();
  const qrToken = params?.qrToken;
  const router = useRouter();

  const [expired, setExpired] = useState(false);

  const [ctx, setCtx] = useState<TableContext | null>(null);
  const [cats, setCats] = useState<Category[]>([]);
  const [activeCat, setActiveCat] = useState<string | null>(null);

  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MenuItem[]>([]);

  const [openItem, setOpenItem] = useState<MenuItem | null>(null);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState('');

  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);

  useEffect(() => {
    if (!qrToken) return;
    if (isSessionExpired(qrToken)) {
      setExpired(true);
      return;
    }
    setSession(qrToken);

    // preload context + categories
    (async () => {
      try {
        const c = await apiGetContext(qrToken);
        setCtx(c);
      } catch {
        setCtx(null);
      }
      try {
        const c = await apiGetCategories(qrToken);
        setCats(c || []);
      } catch {
        setCats([]);
      }
    })();
  }, [qrToken]);

  // load items (debounce)
  useEffect(() => {
    if (!qrToken || expired) return;
    const t = setTimeout(() => {
      (async () => {
        try {
          setLoading(true);
          const data = await apiGetMenuItems(qrToken, activeCat, q.trim());
          setItems(data || []);
        } catch {
          setItems([]);
        } finally {
          setLoading(false);
        }
      })();
    }, 200);
    return () => clearTimeout(t);
  }, [qrToken, activeCat, q, expired]);

  // update cart summary
  useEffect(() => {
    if (!qrToken) return;
    const cart = loadCart(qrToken);
    const count = cart.reduce((s, x) => s + x.qty, 0);
    const total = cart.reduce((s, x) => s + x.qty * x.price, 0);
    setCartCount(count);
    setCartTotal(total);
  }, [qrToken, openItem]);

  function addToCart(mi: MenuItem, addQty: number, addNote?: string) {
    if (!qrToken) return;
    const cart = loadCart(qrToken);
    const idx = cart.findIndex((x) => x.menuItemId === mi.id && (x.note || '') === (addNote || ''));
    if (idx >= 0) cart[idx].qty += addQty;
    else cart.push({ menuItemId: mi.id, name: mi.name, price: mi.price, qty: addQty, note: addNote });
    saveCart(qrToken, cart);
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
          }}
        >
          Tôi đang ở bàn này
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur">
        <div className="px-4 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-lg font-bold">Thực đơn</div>
              <div className="text-sm text-gray-600">
                {ctx ? `${ctx.restaurantName} • ${ctx.tableName}` : 'Tại bàn của bạn'}
              </div>
            </div>
            <button
              onClick={() => router.push(`/guest/t/${qrToken}/tracking`)}
              className="rounded-xl border px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Đơn của tôi
            </button>
          </div>

          <div className="mt-3 pb-3">
            <div className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm món..."
                className="w-full rounded-xl border px-4 py-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-orange-200"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">🔎</div>
            </div>
          </div>
        </div>

        {/* Category chips */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3">
          <Pill active={activeCat === null} onClick={() => setActiveCat(null)}>Tất cả</Pill>
          {cats.map((c) => (
            <Pill key={c.id} active={activeCat === c.id} onClick={() => setActiveCat(c.id)}>
              {c.name}
            </Pill>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="mt-10 rounded-2xl border bg-gray-50 p-6 text-center">
            <div className="text-4xl">🍽️</div>
            <div className="mt-2 font-semibold">Chưa có món trong danh mục này</div>
            <div className="mt-1 text-sm text-gray-600">Chọn “Tất cả” hoặc thử tìm món khác.</div>
            <button
              className="mt-4 rounded-xl border bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50"
              onClick={() => {
                setActiveCat(null);
                setQ('');
              }}
            >
              Xem tất cả
            </button>
          </div>
        ) : (
          <div className="space-y-3 pb-24">
            {items.map((mi) => {
              const available = mi.isAvailable !== false;
              return (
                <div
                  key={mi.id}
                  className="flex gap-3 rounded-2xl border bg-white p-3 shadow-sm"
                  role="button"
                  onClick={() => {
                    setOpenItem(mi);
                    setQty(1);
                    setNote('');
                  }}
                >
                  <div className="h-20 w-20 overflow-hidden rounded-xl bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mi.imageUrl || '/images/placeholder-food.jpg'}
                      alt={mi.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/placeholder-food.jpg';
                      }}
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold leading-snug">{mi.name}</div>
                        <div className="text-sm font-bold">{formatMoney(mi.price)}</div>
                      </div>
                      {mi.description ? <div className="mt-1 line-clamp-2 text-xs text-gray-600">{mi.description}</div> : null}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <span className={[
                        'rounded-full px-2 py-1 text-xs font-semibold',
                        available ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600',
                      ].join(' ')}>
                        {available ? 'Còn món' : 'Hết món'}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!available) return;
                          addToCart(mi, 1);
                          // refresh summary
                          const cart = loadCart(qrToken);
                          setCartCount(cart.reduce((s, x) => s + x.qty, 0));
                          setCartTotal(cart.reduce((s, x) => s + x.qty * x.price, 0));
                        }}
                        disabled={!available}
                        className={[
                          'rounded-xl px-3 py-2 text-sm font-semibold transition',
                          available ? `${ORANGE} ${ORANGE_HOVER} text-white` : 'bg-gray-200 text-gray-500',
                        ].join(' ')}
                      >
                        + Thêm
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom cart bar */}
      <div className="fixed inset-x-0 bottom-16 z-30 mx-auto max-w-md px-3">
        <button
          onClick={() => router.push(`/guest/t/${qrToken}/cart`)}
          className={[
            'flex w-full items-center justify-between rounded-2xl px-4 py-3 font-semibold shadow-sm',
            cartCount > 0 ? `${ORANGE} ${ORANGE_HOVER} text-white` : 'bg-gray-200 text-gray-600',
          ].join(' ')}
          disabled={cartCount === 0}
        >
          <span>🛒 Xem giỏ hàng</span>
          <span className="text-sm">{cartCount} món • {formatMoney(cartTotal)}</span>
        </button>
      </div>

      {/* Product bottom sheet */}
      <BottomSheet open={!!openItem} onClose={() => setOpenItem(null)}>
        {openItem ? (
          <div className="px-4 pb-4 pt-3">
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-gray-200" />

            <div className="flex gap-3">
              <div className="h-24 w-24 overflow-hidden rounded-2xl bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={openItem.imageUrl || '/images/placeholder-food.jpg'}
                  alt={openItem.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/images/placeholder-food.jpg';
                  }}
                />
              </div>
              <div className="flex-1">
                <div className="text-lg font-bold">{openItem.name}</div>
                <div className="mt-1 text-sm font-semibold">{formatMoney(openItem.price)}</div>
                {openItem.description ? <div className="mt-2 text-sm text-gray-600">{openItem.description}</div> : null}
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm font-semibold">Ghi chú (tuỳ chọn)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="VD: ít cay, không hành..."
                className="mt-2 w-full rounded-2xl border p-3 text-sm outline-none focus:ring-2 focus:ring-orange-200"
                rows={3}
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button className="h-10 w-10 rounded-xl border text-lg font-bold hover:bg-gray-50" onClick={() => setQty((v) => Math.max(1, v - 1))}>−</button>
                <div className="w-10 text-center font-semibold">{qty}</div>
                <button className="h-10 w-10 rounded-xl border text-lg font-bold hover:bg-gray-50" onClick={() => setQty((v) => v + 1)}>+</button>
              </div>

              <button
                className={`${ORANGE} ${ORANGE_HOVER} rounded-2xl px-4 py-3 font-semibold text-white`}
                onClick={() => {
                  addToCart(openItem, qty, note.trim() || undefined);
                  setOpenItem(null);
                }}
              >
                Thêm • {formatMoney(openItem.price * qty)}
              </button>
            </div>
          </div>
        ) : null}
      </BottomSheet>
    </div>
  );
}
