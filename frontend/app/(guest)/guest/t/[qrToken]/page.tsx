"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { guestService } from "@/services/guest.service";
import {
  initGuestStore,
  saveSession,
  getSession,
  addToCart,
  cartCount,
  useGuestStoreVersion,
} from "../_shared/guestStore";

function toStr(v: any) {
  return Array.isArray(v) ? v[0] : v || "";
}

export default function GuestMenuPage() {
  const router = useRouter();
  const params = useParams();
  const qrToken = toStr((params as any)?.qrToken);

  // ✅ init store theo qrToken (1 lần / token)
  useEffect(() => {
    if (!qrToken) return;
    initGuestStore(qrToken);
  }, [qrToken]);

  // ✅ re-render khi cart đổi
  const _v = useGuestStoreVersion();
  const count = cartCount();

  // load session + menu
  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState<any>(null);

  // session sẽ cập nhật khi _v đổi (vì getSession() đọc từ store)
  const session = useMemo(() => getSession(), [_v]);

  useEffect(() => {
    if (!qrToken) return;

    (async () => {
      try {
        setLoading(true);
        const r = await guestService.getMenuByToken(qrToken);
        if (!r.isSuccess) throw r.error;

        const table = r.value.table;
        const m = r.value.menu;

        // lưu session để cart page dùng tenantId/tableId
        saveSession({
          qrToken,
          tableId: table.tableId,
          tenantId: table.tenantId,
          tableName: table.tableName,
          tenantName: table.tenantName,
          branchId: table.branchId,
          expiresAt: Date.now() + 1000 * 60 * 60 * 6, // 6h
        });

        setMenu(m);
      } catch (e: any) {
        toast.error(e?.message || "Không tải được menu");
      } finally {
        setLoading(false);
      }
    })();
  }, [qrToken]);

  // tùy data menu của bạn: mình assume menu.products
  const products = menu?.products ?? [];

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-[430px] border-x border-gray-200 min-h-screen">
        {/* Header của MENU (cái ở trong khung điện thoại) */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              onClick={() => router.back()}
              className="h-9 w-9 rounded-full border border-gray-200 flex items-center justify-center"
            >
              ←
            </button>

            <div className="flex-1 font-semibold">
              {session?.tenantName || "Menu"}
            </div>

            {/* ✅ icon giỏ + badge */}
            <button
              onClick={() => router.push(`/guest/t/${qrToken}/cart`)}
              className="relative h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center"
            >
              🛒
              {count > 0 && (
                <span className="absolute -top-2 -right-2 h-6 min-w-[24px] px-2 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ...phần render menu bên dưới giữ nguyên của bạn... */}
        <div className="px-4 py-4">
          {loading && <div className="text-gray-500">Đang tải...</div>}

          {!loading && (
            <div className="grid grid-cols-2 gap-3">
              {products.map((p: any) => (
                <div
                  key={p.id || p.productId}
                  className="rounded-2xl border border-gray-200 overflow-hidden bg-white"
                >
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.imageUrl || p.image || p.thumbnail || ""}
                      alt={p.name}
                      className="w-full h-full object-cover"
                      onError={(e) =>
                        (((e.target as HTMLImageElement).style.display = "none") as any)
                      }
                    />
                  </div>

                  <div className="p-3">
                    <div className="font-semibold text-sm line-clamp-2">
                      {p.name}
                    </div>
                    <div className="text-orange-600 font-bold mt-1">
                      {(Number(p.price) || 0).toLocaleString("vi-VN")} đ
                    </div>

                    <button
                      className="mt-2 w-full h-10 rounded-xl bg-orange-500 text-white font-semibold"
                      onClick={() => {
                        addToCart(
                          {
                            id: p.id || p.productId,
                            name: p.name,
                            price: Number(p.price) || 0,
                            imageUrl: p.imageUrl || p.image || p.thumbnail,
                          },
                          1
                        );
                        toast.success(`Đã thêm: ${p.name}`);
                      }}
                    >
                      Thêm vào giỏ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
