"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getCart, subscribeCart } from "@/lib/cart";

export default function BottomNav() {
  const pathname = usePathname();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const calc = () => setCount(getCart().reduce((s, x) => s + x.quantity, 0));
    calc();
    return subscribeCart(calc);
  }, []);

  const active = (p: string) => (pathname === p ? "active" : "");

  return (
    <div className="bottomnav">
      <Link className={`navitem ${active("/menu")}`} href="/menu" title="Menu">
        <div className="navicon">🏠</div>
        <div className="navtext">Menu</div>
      </Link>

      <Link className={`navitem ${active("/tracking")}`} href="/tracking" title="Theo dõi">
        <div className="navicon">🧾</div>
        <div className="navtext">Đơn</div>
      </Link>

      <Link className={`navitem cart ${active("/cart")}`} href="/cart" title="Giỏ hàng">
        <div className="cartbubble">
          🛒
          {count > 0 && <span className="badge">{count}</span>}
        </div>
        <div className="navtext">Giỏ</div>
      </Link>

      <Link className={`navitem ${active("/payment")}`} href="/payment" title="Thanh toán">
        <div className="navicon">💳</div>
        <div className="navtext">Tính tiền</div>
      </Link>
    </div>
  );
}
