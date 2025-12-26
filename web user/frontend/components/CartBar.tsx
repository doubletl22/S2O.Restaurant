<<<<<<< HEAD
"use client";

import { useCartStore } from "@/store/cartStore";
import { formatMoneyVND } from "@/lib/time";

export default function CartBar({ onOpen }: { onOpen: () => void }) {
  const count = useCartStore((s) => s.count());
  const total = useCartStore((s) => s.total());

  if (count === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t">
      <button
        className="w-full rounded-2xl bg-black text-white px-4 py-3 flex items-center justify-between"
        onClick={onOpen}
      >
        <span>{count} món</span>
        <span>{formatMoneyVND(total)}</span>
        <span>Xem giỏ</span>
      </button>
    </div>
  );
}
=======
"use client";

import { useCartStore } from "@/store/cartStore";
import { formatMoneyVND } from "@/lib/time";

export default function CartBar({ onOpen }: { onOpen: () => void }) {
  const count = useCartStore((s) => s.count());
  const total = useCartStore((s) => s.total());

  if (count === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t">
      <button
        className="w-full rounded-2xl bg-black text-white px-4 py-3 flex items-center justify-between"
        onClick={onOpen}
      >
        <span>{count} món</span>
        <span>{formatMoneyVND(total)}</span>
        <span>Xem giỏ</span>
      </button>
    </div>
  );
}
>>>>>>> b6136e036fc676c4b81d4adbb0e4f55082d26efd
