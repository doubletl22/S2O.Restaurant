"use client";

import { MenuItem } from "@/lib/types";
import { formatMoneyVND } from "@/lib/time";
import QuantityStepper from "./QuantityStepper";
import { useState } from "react";
import { useCartStore } from "@/store/cartStore";

export default function MenuItemCard({ item }: { item: MenuItem }) {
  const add = useCartStore((s) => s.add);
  const [qty, setQty] = useState(1);

  return (
    <div className="rounded-2xl border p-4 flex gap-3">
      <div className="flex-1">
        <div className="font-semibold">{item.name}</div>
        {item.description && <div className="text-sm opacity-80 mt-1">{item.description}</div>}
        <div className="mt-2 font-semibold">{formatMoneyVND(item.price)}</div>

        <div className="mt-3 flex items-center gap-3">
          <QuantityStepper value={qty} onChange={setQty} />
          <button
            className="rounded-xl bg-black text-white px-4 py-2 text-sm disabled:opacity-40"
            disabled={item.isAvailable === false}
            onClick={() =>
              add(
                { menuItemId: item.id, name: item.name, unitPrice: item.price, notes: "" },
                qty
              )
            }
          >
            Thêm món
          </button>
        </div>

        {item.isAvailable === false && <div className="text-xs text-red-600 mt-2">Tạm hết món</div>}
      </div>
    </div>
  );
}
