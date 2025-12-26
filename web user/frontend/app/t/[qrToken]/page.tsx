<<<<<<< HEAD
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import GuestSessionGate from "../../components/GuestSessionGate";

type Category = "Tất cả" | "Combo" | "Món nhỏ" | "Truyền thống";

type Food = {
  id: string;
  name: string;
  desc: string;
  price: number;
  rating: number;
  category: Exclude<Category, "Tất cả">;
  img: string;
  time?: string;
};

const FOODS: Food[] = [
  {
    id: "1",
    name: "Combo 2 người",
    desc: "Set combo cho 2 người, tiết kiệm và ngon miệng.",
    price: 19.5,
    rating: 4.7,
    category: "Combo",
    img: "https://images.unsplash.com/photo-1604908554162-45f17f9126d8?q=80&w=800&auto=format&fit=crop",
    time: "10-15 phút",
  },
  {
    id: "2",
    name: "Gà rán giòn",
    desc: "Gà rán giòn rụm, thơm ngon, dùng kèm sốt.",
    price: 7.5,
    rating: 4.6,
    category: "Món nhỏ",
    img: "https://images.unsplash.com/photo-1606756790138-261d2b21cd75?q=80&w=800&auto=format&fit=crop",
    time: "10 phút",
  },
  {
    id: "3",
    name: "Combo truyền thống",
    desc: "Set truyền thống, dễ ăn, hợp nhiều người.",
    price: 9.2,
    rating: 4.5,
    category: "Truyền thốn" as any,
    img: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=800&auto=format&fit=crop",
    time: "15-20 phút",
  },
];

// Chuẩn hóa danh mục
const normalizeCategory = (c: any): Exclude<Category, "Tất cả"> => {
  if (c === "Truyền thống" || c === "Truyền thốn") return "Truyền thống";
  if (c === "Combo") return "Combo";
  return "Món nhỏ";
};

export function money(n: number) {
  const vnd = Math.round(n * 10000);
  return vnd.toLocaleString("vi-VN") + "đ";
}

export default function MenuPage({ params }: { params: { qrToken: string } }) {
  const qrToken = params.qrToken;

  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<Category>("Tất cả");

  const foods = useMemo(() => {
    const s = search.trim().toLowerCase();
    return FOODS.map((f) => ({
      ...f,
      category: normalizeCategory((f as any).category),
    }))
      .filter((f) => (cat === "Tất cả" ? true : f.category === cat))
      .filter((f) => {
        if (!s) return true;
        return (
          f.name.toLowerCase().includes(s) ||
          f.desc.toLowerCase().includes(s) ||
          f.category.toLowerCase().includes(s)
        );
      });
  }, [search, cat]);

  const grouped = useMemo(() => {
    const map = new Map<string, Food[]>();
    for (const f of foods) {
      const key = f.category;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(f);
    }
    return Array.from(map.entries());
  }, [foods]);

  return (
    <GuestSessionGate>
      <div className="safe">
        {/* ===== HEADER (LOGO THAY NÚT BACK) ===== */}
        <div className="m-header">
          <div className="m-header-top">
            {/* LOGO */}
            <div className="m-logo">
              <img src="/the-six-logo.png" alt="The Six" />
            </div>

            <div className="m-title">
              <b>The Six</b>
              <span>Bàn số {qrToken}</span>
            </div>

            <div className="m-spacer" />

            <div className="m-icon" title="Thông báo">
              🔔
            </div>
          </div>

          {/* SEARCH */}
          <div className="m-search-wrap">
            <span className="m-search-ico">🔎</span>
            <input
              className="m-search"
              placeholder="Tìm kiếm món ăn..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type="button"
              className="m-filter"
              title="Bộ lọc"
              onClick={() => setCat((prev) => (prev === "Tất cả" ? "Combo" : "Tất cả"))}
            >
              ☰
            </button>
          </div>
        </div>

        {/* CHIPS */}
        <div className="chips">
          {(["Tất cả", "Combo", "Món nhỏ", "Truyền thống"] as Category[]).map((c) => (
            <button
              key={c}
              type="button"
              className={"chip " + (cat === c ? "active" : "")}
              onClick={() => setCat(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {/* MENU LIST */}
        {grouped.length === 0 ? (
          <div className="panel">
            <b>Không tìm thấy món phù hợp.</b>
            <div style={{ height: 10 }} />
            <button type="button" className="btn btn-ghost" onClick={() => setSearch("")}>
              Xóa tìm kiếm
            </button>
          </div>
        ) : (
          grouped.map(([section, items]) => (
            <div key={section} className="section">
              <h3>{section}</h3>
              <div className="menu-list">
                {items.map((f) => (
                  <div key={f.id} className="food-card">
                    <Link
                      href={`/t/${qrToken}/product/${f.id}`}
                      style={{ display: "flex", gap: 12, alignItems: "center", flex: 1 }}
                    >
                      <div className="food-img">
                        <img src={f.img} alt={f.name} />
                      </div>

                      <div className="food-mid">
                        <p className="food-name">{f.name}</p>
                        <p className="food-desc">{f.desc}</p>
                        <div className="food-price">{money(f.price)}</div>
                      </div>
                    </Link>

                    <button
                      type="button"
                      className="food-plus"
                      onClick={() =>
                        (window.location.href = `/t/${qrToken}/product/${f.id}`)
                      }
                    >
                      +
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        {/* BOTTOM NAV */}
        <div className="bottom-nav">
          <Link className="nav-item active" href={`/t/${qrToken}`}>
            🏠
          </Link>
          <Link className="nav-item" href={`/t/${qrToken}/tracking`}>
            🧾
          </Link>
          <Link className="nav-center" href={`/t/${qrToken}/cart`}>
            🛒
          </Link>
          <Link className="nav-item" href={`/t/${qrToken}/payment`}>
            💳
          </Link>
          <span className="nav-item" style={{ opacity: 0 }} />
        </div>
      </div>
    </GuestSessionGate>
  );
}

export const FOODS_DATA = FOODS;
=======
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import GuestSessionGate from "../../components/GuestSessionGate";

type Category = "Tất cả" | "Combo" | "Món nhỏ" | "Truyền thống";

type Food = {
  id: string;
  name: string;
  desc: string;
  price: number;
  rating: number;
  category: Exclude<Category, "Tất cả">;
  img: string;
  time?: string;
};

const FOODS: Food[] = [
  {
    id: "1",
    name: "Combo 2 người",
    desc: "Set combo cho 2 người, tiết kiệm và ngon miệng.",
    price: 19.5,
    rating: 4.7,
    category: "Combo",
    img: "https://images.unsplash.com/photo-1604908554162-45f17f9126d8?q=80&w=800&auto=format&fit=crop",
    time: "10-15 phút",
  },
  {
    id: "2",
    name: "Gà rán giòn",
    desc: "Gà rán giòn rụm, thơm ngon, dùng kèm sốt.",
    price: 7.5,
    rating: 4.6,
    category: "Món nhỏ",
    img: "https://images.unsplash.com/photo-1606756790138-261d2b21cd75?q=80&w=800&auto=format&fit=crop",
    time: "10 phút",
  },
  {
    id: "3",
    name: "Combo truyền thống",
    desc: "Set truyền thống, dễ ăn, hợp nhiều người.",
    price: 9.2,
    rating: 4.5,
    category: "Truyền thốn" as any,
    img: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=800&auto=format&fit=crop",
    time: "15-20 phút",
  },
];

// Chuẩn hóa danh mục
const normalizeCategory = (c: any): Exclude<Category, "Tất cả"> => {
  if (c === "Truyền thống" || c === "Truyền thốn") return "Truyền thống";
  if (c === "Combo") return "Combo";
  return "Món nhỏ";
};

export function money(n: number) {
  const vnd = Math.round(n * 10000);
  return vnd.toLocaleString("vi-VN") + "đ";
}

export default function MenuPage({ params }: { params: { qrToken: string } }) {
  const qrToken = params.qrToken;

  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<Category>("Tất cả");

  const foods = useMemo(() => {
    const s = search.trim().toLowerCase();
    return FOODS.map((f) => ({
      ...f,
      category: normalizeCategory((f as any).category),
    }))
      .filter((f) => (cat === "Tất cả" ? true : f.category === cat))
      .filter((f) => {
        if (!s) return true;
        return (
          f.name.toLowerCase().includes(s) ||
          f.desc.toLowerCase().includes(s) ||
          f.category.toLowerCase().includes(s)
        );
      });
  }, [search, cat]);

  const grouped = useMemo(() => {
    const map = new Map<string, Food[]>();
    for (const f of foods) {
      const key = f.category;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(f);
    }
    return Array.from(map.entries());
  }, [foods]);

  return (
    <GuestSessionGate>
      <div className="safe">
        {/* ===== HEADER (LOGO THAY NÚT BACK) ===== */}
        <div className="m-header">
          <div className="m-header-top">
            {/* LOGO */}
            <div className="m-logo">
              <img src="/the-six-logo.png" alt="The Six" />
            </div>

            <div className="m-title">
              <b>The Six</b>
              <span>Bàn số {qrToken}</span>
            </div>

            <div className="m-spacer" />

            <div className="m-icon" title="Thông báo">
              🔔
            </div>
          </div>

          {/* SEARCH */}
          <div className="m-search-wrap">
            <span className="m-search-ico">🔎</span>
            <input
              className="m-search"
              placeholder="Tìm kiếm món ăn..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type="button"
              className="m-filter"
              title="Bộ lọc"
              onClick={() => setCat((prev) => (prev === "Tất cả" ? "Combo" : "Tất cả"))}
            >
              ☰
            </button>
          </div>
        </div>

        {/* CHIPS */}
        <div className="chips">
          {(["Tất cả", "Combo", "Món nhỏ", "Truyền thống"] as Category[]).map((c) => (
            <button
              key={c}
              type="button"
              className={"chip " + (cat === c ? "active" : "")}
              onClick={() => setCat(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {/* MENU LIST */}
        {grouped.length === 0 ? (
          <div className="panel">
            <b>Không tìm thấy món phù hợp.</b>
            <div style={{ height: 10 }} />
            <button type="button" className="btn btn-ghost" onClick={() => setSearch("")}>
              Xóa tìm kiếm
            </button>
          </div>
        ) : (
          grouped.map(([section, items]) => (
            <div key={section} className="section">
              <h3>{section}</h3>
              <div className="menu-list">
                {items.map((f) => (
                  <div key={f.id} className="food-card">
                    <Link
                      href={`/t/${qrToken}/product/${f.id}`}
                      style={{ display: "flex", gap: 12, alignItems: "center", flex: 1 }}
                    >
                      <div className="food-img">
                        <img src={f.img} alt={f.name} />
                      </div>

                      <div className="food-mid">
                        <p className="food-name">{f.name}</p>
                        <p className="food-desc">{f.desc}</p>
                        <div className="food-price">{money(f.price)}</div>
                      </div>
                    </Link>

                    <button
                      type="button"
                      className="food-plus"
                      onClick={() =>
                        (window.location.href = `/t/${qrToken}/product/${f.id}`)
                      }
                    >
                      +
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        {/* BOTTOM NAV */}
        <div className="bottom-nav">
          <Link className="nav-item active" href={`/t/${qrToken}`}>
            🏠
          </Link>
          <Link className="nav-item" href={`/t/${qrToken}/tracking`}>
            🧾
          </Link>
          <Link className="nav-center" href={`/t/${qrToken}/cart`}>
            🛒
          </Link>
          <Link className="nav-item" href={`/t/${qrToken}/payment`}>
            💳
          </Link>
          <span className="nav-item" style={{ opacity: 0 }} />
        </div>
      </div>
    </GuestSessionGate>
  );
}

export const FOODS_DATA = FOODS;
>>>>>>> b6136e036fc676c4b81d4adbb0e4f55082d26efd
