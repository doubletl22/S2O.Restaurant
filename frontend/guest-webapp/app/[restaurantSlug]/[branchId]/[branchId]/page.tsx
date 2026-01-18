"use client";

import { useEffect, useMemo, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { BottomNav, type TabKey } from "@/components/BottomNav";
import { ProductCard } from "@/components/ProductCard";
import { CartSheet } from "@/components/CartSheet";
import { OrdersSheet } from "@/components/OrdersSheet";
import { SessionGuard } from "@/components/SessionGuard";
import { Button, Card, Input } from "@/components/ui";
import type { Product } from "@/types";
import { fetchPublicMenu } from "@/lib/api";
import { useCartStore } from "@/store/cart";

function shortId(id: string) {
  return id.length > 10 ? `${id.slice(0, 8)}…` : id;
}

export default function GuestMenuPage({
  params
}: {
  params: { restaurantSlug: string; branchId: string; tableCode: string };
}) {
  const tenantId = params.restaurantSlug; // thực tế backend cần X-Tenant-Id (GUID)
  const tableId = params.branchId;        // mình dùng branchId như tableId (GUID)
  const tableCode = params.tableCode;

  const scopeKey = `${tenantId}:${tableId}:${tableCode}`;

  const cart = useCartStore();
  const [tab, setTab] = useState<TabKey>("menu");

  const [menu, setMenu] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("ALL");
  const [cartOpen, setCartOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);

  // hydrate cart theo bàn
  useEffect(() => {
    cart.setScope(scopeKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopeKey]);

  // load menu (public)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const products = await fetchPublicMenu(tenantId);
        if (!alive) return;
        setMenu(products);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Không tải được menu");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [tenantId]);

  const categories = useMemo(() => {
    // Backend public menu trả Product có CategoryId nhưng không có CategoryName.
    // => tạo danh mục “Danh mục 1/2/3…” theo unique CategoryId để vẫn filter được.
    const ids = Array.from(new Set(menu.map((p) => p.categoryId).filter(Boolean)));
    return ids.map((id, idx) => ({ id, name: `Danh mục ${idx + 1}` }));
  }, [menu]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return menu
      .filter((p) => (cat === "ALL" ? true : p.categoryId === cat))
      .filter((p) => {
        if (!qq) return true;
        const hay = `${p.name} ${p.description ?? ""}`.toLowerCase();
        return hay.includes(qq);
      })
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [menu, q, cat]);

  return (
    <div className="mx-auto min-h-screen max-w-xl pb-24">
      <SessionGuard
        scopeKey={scopeKey}
        ttlMinutes={90}
        onExpired={() => {
          cart.clear();
          setCartOpen(false);
          setOrdersOpen(false);
          setTab("menu");
        }}
      />

      <TopBar
        title={`Bàn ${tableCode}`}
        subtitle={`Tenant ${shortId(tenantId)} • Table ${shortId(tableId)}`}
        onOpenCart={() => setCartOpen(true)}
        cartCount={cart.totalQty()}
      />

      <main className="p-3">
        {/* App banner */}
        <Card className="p-3">
          <div className="text-sm font-semibold">Không muốn dùng web? Mở bằng App</div>
          <div className="mt-1 text-xs text-[color:var(--muted)]">
            App sẽ giữ lịch sử tốt hơn, thông báo realtime (khi backend hỗ trợ).
          </div>
          <div className="mt-2 flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const deepLink = `s2o://menu/${tenantId}/${tableId}?code=${encodeURIComponent(tableCode)}`;
                // fallback: mở store link / landing tùy bạn
                window.location.href = deepLink;
              }}
            >
              Mở App (deep link)
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
              }}
            >
              Copy link bàn
            </Button>
          </div>
        </Card>

        {/* Tabs */}
        <div className="mt-3">
          {tab === "menu" ? (
            <>
              <Card className="p-3">
                <div className="text-sm font-semibold">Menu</div>
                <div className="mt-2 flex gap-2">
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Tìm món…"
                  />
                  <Button variant="outline" onClick={() => setCartOpen(true)}>
                    Giỏ ({cart.totalQty()})
                  </Button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant={cat === "ALL" ? "primary" : "outline"}
                    onClick={() => setCat("ALL")}
                  >
                    Tất cả
                  </Button>
                  {categories.map((c) => (
                    <Button
                      key={c.id}
                      variant={cat === c.id ? "primary" : "outline"}
                      onClick={() => setCat(c.id)}
                    >
                      {c.name}
                    </Button>
                  ))}
                </div>
              </Card>

              <div className="mt-3">
                {loading ? (
                  <div className="rounded-2xl border border-dashed border-[color:var(--line)] p-6 text-center text-sm text-[color:var(--muted)]">
                    Đang tải menu…
                  </div>
                ) : err ? (
                  <div className="rounded-2xl border border-dashed border-red-500/40 p-6 text-center text-sm text-red-500">
                    {err}
                    <div className="mt-2 text-xs text-[color:var(--muted)]">
                      Kiểm tra backend gateway chạy ở {`http://localhost:5000`} và tenantId có đúng GUID không.
                    </div>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[color:var(--line)] p-6 text-center text-sm text-[color:var(--muted)]">
                    Không có món phù hợp.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filtered.map((p) => (
                      <ProductCard
                        key={p.id}
                        p={p}
                        onAdd={() => cart.add(p)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <Card className="p-3">
              <div className="text-sm text-[color:var(--muted)]">
                Tab này chỉ mở sheet cho nhanh.
              </div>
              <div className="mt-2 flex gap-2">
                <Button onClick={() => setOrdersOpen(true)}>Xem đơn của bạn</Button>
                <Button variant="outline" onClick={() => setCartOpen(true)}>
                  Mở giỏ
                </Button>
              </div>
            </Card>
          )}
        </div>
      </main>

      <BottomNav
        tab={tab}
        onChange={(t) => {
          setTab(t);
          if (t === "cart") setCartOpen(true);
          if (t === "orders") setOrdersOpen(true);
        }}
        cartCount={cart.totalQty()}
      />

      <CartSheet
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        tenantId={tenantId}
        tableId={tableId}
        tableCode={tableCode}
        scopeKey={scopeKey}
      />

      <OrdersSheet
        open={ordersOpen}
        onClose={() => setOrdersOpen(false)}
        scopeKey={scopeKey}
        tableCode={tableCode}
      />
    </div>
  );
}
