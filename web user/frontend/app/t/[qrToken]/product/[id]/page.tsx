"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import GuestSessionGate from "../../../../components/GuestSessionGate";
import { FOODS_DATA, money } from "../../page";

type Topping = { id: string; name: string; price: number; icon: string };

const TOPPINGS: Topping[] = [
  { id: "t1", name: "Thêm phô mai", price: 1.2, icon: "🧀" },
  { id: "t2", name: "Thêm trứng", price: 0.8, icon: "🥚" },
  { id: "t3", name: "Thêm sốt cay", price: 0.5, icon: "🌶️" },
];

export default function ProductPage({
  params,
}: {
  params: { qrToken: string; id: string };
}) {
  const qrToken = params.qrToken;
  const id = params.id;

  const food = useMemo(() => FOODS_DATA.find((x: any) => String(x.id) === String(id)), [id]);

  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [picked, setPicked] = useState<Record<string, boolean>>({});

  const toppingsPrice = useMemo(() => {
    return TOPPINGS.reduce((sum, t) => sum + (picked[t.id] ? t.price : 0), 0) * qty;
  }, [picked, qty]);

  const total = useMemo(() => {
    if (!food) return 0;
    return food.price * qty + toppingsPrice;
  }, [food, qty, toppingsPrice]);

  if (!food) {
    return (
      <GuestSessionGate>
        <div className="safe">
          <div className="m-header">
            <div className="m-header-top">
              <div className="m-back" onClick={() => history.back()} title="Quay lại">
                ←
              </div>
              <div className="m-title">
                <b>The Six</b>
                <span>Bàn số {qrToken}</span>
              </div>
              <div className="m-spacer" />
              <div className="m-icon">🖼️</div>
            </div>
          </div>

          <div className="panel">
            <b>Không tìm thấy món ăn.</b>
            <div style={{ height: 10 }} />
            <Link className="btn btn-ghost" href={`/t/${qrToken}`}>
              Quay lại thực đơn
            </Link>
          </div>
        </div>
      </GuestSessionGate>
    );
  }

  return (
    <GuestSessionGate>
      <div className="safe">
        <div className="m-header">
          <div className="m-header-top">
            <div className="m-back" onClick={() => history.back()} title="Quay lại">
              ←
            </div>
            <div className="m-title">
              <b>{food.name}</b>
              <span>Bàn số {qrToken}</span>
            </div>
            <div className="m-spacer" />
            <div className="m-icon" title="Hình ảnh">
              🖼️
            </div>
          </div>
        </div>

        <div className="product-wrap">
          <div className="product-hero">
            <div className="product-img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={food.img} alt={food.name} />
            </div>

            <div className="product-body">
              <h2 className="product-name">{food.name}</h2>

              <div className="rating-line">
                <span>
                  ⭐ {food.rating}
                  {food.time ? ` · ${food.time}` : ""}
                </span>

                <div className="stepper">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="giảm">
                    −
                  </button>
                  <b>{qty}</b>
                  <button onClick={() => setQty((q) => q + 1)} aria-label="tăng">
                    +
                  </button>
                </div>
              </div>

              <p className="product-sub">{food.desc}</p>

              <div className="panel" style={{ margin: "12px 0 0" }}>
                <div className="k" style={{ fontWeight: 800, marginBottom: 8 }}>
                  Ghi chú cho món (ví dụ: không hành, ít đá, dị ứng…)
                </div>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Nhập ghi chú..."
                  style={{
                    width: "100%",
                    borderRadius: 12,
                    border: "1px solid var(--line)",
                    padding: "12px 12px",
                    outline: "none",
                    fontSize: 14,
                  }}
                />
              </div>

              <div className="k" style={{ marginTop: 14, fontWeight: 900 }}>
                Topping
              </div>
              <div className="toppings">
                {TOPPINGS.map((t) => {
                  const active = !!picked[t.id];
                  return (
                    <button
                      key={t.id}
                      className={"topping " + (active ? "active" : "")}
                      onClick={() => setPicked((p) => ({ ...p, [t.id]: !p[t.id] }))}
                      title={t.price ? `+${money(t.price)}` : "Miễn phí"}
                    >
                      <div className="t-dot">{t.icon}</div>
                      <div>
                        <div style={{ fontWeight: 900 }}>{t.name}</div>
                        <div className="k" style={{ fontSize: 12 }}>
                          {t.price ? `+${money(t.price)}` : "Miễn phí"}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="panel" style={{ marginTop: 12 }}>
                <div className="row">
                  <span className="k">Giá gốc</span>
                  <b>{money(food.price)}</b>
                </div>
                <div className="row">
                  <span className="k">Số lượng</span>
                  <b>x{qty}</b>
                </div>
                <div className="row">
                  <span className="k">Topping</span>
                  <b>{money(toppingsPrice)}</b>
                </div>
                <div className="row">
                  <span style={{ fontWeight: 900 }}>Tổng cộng</span>
                  <span style={{ fontWeight: 900, fontSize: 18 }}>{money(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order bar */}
        <div className="order-bar">
          <div className="price-pill">{money(total)}</div>
          <button
            className="order-btn"
            onClick={() => {
              // Bạn có thể lưu note/topping vào state global sau, hiện tại giữ flow cũ
              location.href = `/t/${qrToken}/cart`;
            }}
          >
            THÊM VÀO GIỎ
          </button>
        </div>

        {/* bottom nav */}
        <div className="bottom-nav">
          <Link className="nav-item" href={`/t/${qrToken}`} title="Menu">
            🏠
          </Link>
          <Link className="nav-item" href={`/t/${qrToken}/tracking`} title="Theo dõi">
            🧾
          </Link>
          <Link className="nav-center" href={`/t/${qrToken}/cart`} title="Giỏ hàng">
            🛒
          </Link>
          <Link className="nav-item" href={`/t/${qrToken}/payment`} title="Thanh toán">
            💳
          </Link>
          <span className="nav-item" style={{ opacity: 0.0 }} aria-hidden>
            .
          </span>
        </div>
      </div>
    </GuestSessionGate>
  );
}
