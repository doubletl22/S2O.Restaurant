"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import SessionGuard from "@/components/SessionGuard";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import CategoryChips from "@/components/CategoryChips";
import MenuItemCard from "@/components/MenuItemCard";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";
import { saveSessionFromQuery, touchSession, getSession } from "@/lib/session";
import { addToCart } from "@/lib/cart";
import { useToast } from "@/components/ToastProvider";

export default function MenuPage() {
  const sp = useSearchParams();
  const { toast } = useToast();

  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");

  useEffect(() => {
    // nếu đi từ QR URL /menu?tenantId=... thì lưu session
    saveSessionFromQuery(sp);
    touchSession();
  }, [sp]);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      setLoading(false);
      setItems([]);
      return;
    }

    setLoading(true);
    setErr(null);

    api
      .getPublicMenu(s.tenantId)
      .then((data) => setItems(data))
      .catch((e) => setErr(e?.message || "Không tải được menu"))
      .finally(() => setLoading(false));
  }, [sp]);

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of items) {
      const id = p.categoryId || "unknown";
      const name =
        p.category?.name ||
        (id === "unknown" ? "Khác" : `Danh mục ${id.slice(0, 4).toUpperCase()}`);
      if (!map.has(id)) map.set(id, name);
    }
    const arr = [{ id: "all", name: "Tất cả" }, ...Array.from(map.entries()).map(([id, name]) => ({ id, name }))];
    return arr;
  }, [items]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items.filter((p) => {
      const okCat = cat === "all" ? true : (p.categoryId || "unknown") === cat;
      const okQ =
        !query ||
        p.name.toLowerCase().includes(query) ||
        (p.description || "").toLowerCase().includes(query);
      return okCat && okQ;
    });
  }, [items, q, cat]);

  const subtitle = useMemo(() => {
    const s = getSession();
    if (!s) return "Chưa có session";
    return `Bàn: ${s.tableId.slice(0, 8).toUpperCase()} • CN: ${s.branchId.slice(0, 8).toUpperCase()}`;
  }, [sp]);

  return (
    <SessionGuard>
      <div className="screen">
        <div className="wrap">
          <Header title="Thực đơn" subtitle={subtitle} />

          <div className="card" style={{ marginTop: 10 }}>
            <div className="search">
              <input
                className="input"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm món (phở, cơm, trà đá...)"
              />
            </div>

            <CategoryChips items={categories} activeId={cat} onPick={setCat} />

            {err && (
              <div className="card" style={{ marginTop: 10 }}>
                <div className="h2">Lỗi</div>
                <div className="muted">{err}</div>
              </div>
            )}

            <div className="list">
              {loading ? (
                <div className="muted">Đang tải menu...</div>
              ) : filtered.length === 0 ? (
                <div className="muted">Không có món phù hợp.</div>
              ) : (
                filtered.map((p) => (
                  <MenuItemCard
                    key={p.id}
                    p={p}
                    onAdd={(x) => {
                      addToCart(
                        { productId: x.id, name: x.name, price: x.price, imageUrl: x.imageUrl },
                        1
                      );
                      toast("Đã thêm vào giỏ 🛒");
                      touchSession();
                    }}
                  />
                ))
              )}
            </div>
          </div>

          <BottomNav />
        </div>
      </div>
    </SessionGuard>
  );
}
