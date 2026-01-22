"use client";

import type { Product } from "@/lib/types";
import { moneyVND } from "@/lib/format";

export default function MenuItemCard({
  p,
  onAdd
}: {
  p: Product;
  onAdd: (p: Product) => void;
}) {
  const available = p.isAvailable !== false;

  return (
    <div className={`food ${available ? "" : "food-off"}`}>
      <div className="food-img">
        {p.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.imageUrl} alt={p.name} loading="lazy" />
        ) : (
          <div className="img-ph">🍽️</div>
        )}
      </div>

      <div className="food-body">
        <div className="food-top">
          <div className="food-name">{p.name}</div>
          <div className="food-price">{moneyVND(p.price)}</div>
        </div>

        {p.description && <div className="food-desc">{p.description}</div>}

        <div className="food-actions">
          <div className={`pill ${available ? "pill-on" : "pill-off"}`}>
            {available ? "Còn món" : "Hết món"}
          </div>
          <button className="btn mini primary" disabled={!available} onClick={() => onAdd(p)}>
            + Thêm
          </button>
        </div>
      </div>
    </div>
  );
}
