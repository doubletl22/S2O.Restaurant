"use client";

import type { Product } from "@/types";
import { Card, Button, Badge } from "./ui";

function money(v: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v || 0);
}

export function ProductCard({
  p,
  onAdd
}: {
  p: Product;
  onAdd: () => void;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex gap-3 p-3">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-[color:var(--line)] bg-black/5 dark:bg-white/5" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-extrabold">{p.name}</div>
              {p.description ? (
                <div className="mt-1 line-clamp-2 text-xs text-[color:var(--muted)]">
                  {p.description}
                </div>
              ) : null}
            </div>
            <Badge className="border-transparent bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-200">
              {money(Number(p.price))}
            </Badge>
          </div>

          <div className="mt-3 flex justify-end">
            <Button onClick={onAdd}>Thêm</Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
