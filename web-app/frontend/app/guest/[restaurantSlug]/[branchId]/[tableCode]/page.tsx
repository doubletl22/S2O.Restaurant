"use client";
import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { getSocket } from "@/lib/socket";

export default function GuestPage({ params }: { params: { restaurantSlug: string; branchId: string; tableCode: string } }) {
  const { restaurantSlug, branchId, tableCode } = params;

  const [menu, setMenu] = useState<{ restaurantId: string; categories: any[]; items: any[] } | null>(null);
  const [cart, setCart] = useState<{ menuItemId: string; qty: number; note?: string }[]>([]);
  const [msg, setMsg] = useState("");
  const [history, setHistory] = useState<any[]>([]);

  async function loadMenu() {
    const m = await apiGet(`/menu/public/${restaurantSlug}`);
    setMenu(m);
  }

  async function loadHistory() {
    const h = await apiGet(`/orders/guest/history?restaurantSlug=${restaurantSlug}&branchId=${branchId}&tableCode=${tableCode}`);
    setHistory(h);
  }

  useEffect(() => {
    (async () => {
      try {
        await loadMenu();
        await loadHistory();
        const s = getSocket();
        // join room table
        s.emit("join", { branchId, tableCode });
        const handler = () => loadHistory();
        s.on("order:updated", handler);
        return () => {
          s.off("order:updated", handler);
          s.emit("leave", { branchId, tableCode });
        };
      } catch (e: any) {
        setMsg("❌ " + e.message);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const itemsById = useMemo(() => {
    const map = new Map<string, any>();
    menu?.items?.forEach((i) => map.set(i.id, i));
    return map;
  }, [menu]);

  const total = useMemo(() => {
    return cart.reduce((sum, c) => sum + (itemsById.get(c.menuItemId)?.price || 0) * c.qty, 0);
  }, [cart, itemsById]);

  function addItem(id: string) {
    setCart((prev) => {
      const idx = prev.findIndex((p) => p.menuItemId === id);
      if (idx >= 0) {
        const cp = [...prev];
        cp[idx] = { ...cp[idx], qty: cp[idx].qty + 1 };
        return cp;
      }
      return [...prev, { menuItemId: id, qty: 1 }];
    });
  }

  function setNote(id: string, note: string) {
    setCart((prev) => prev.map((p) => (p.menuItemId === id ? { ...p, note } : p)));
  }

  async function placeOrder() {
    try {
      if (cart.length === 0) return setMsg("❌ Cart empty");
      setMsg("Placing order...");
      await apiPost("/orders/guest", {
        restaurantSlug,
        branchId,
        tableCode,
        guestNote: "",
        items: cart
      });
      setCart([]);
      setMsg("✅ Order placed");
      await loadHistory();
    } catch (e: any) {
      setMsg("❌ " + e.message);
    }
  }

  async function requestBill() {
    try {
      await apiPost("/orders/guest/request-bill", { restaurantSlug, branchId, tableCode });
      setMsg("✅ Requested bill");
      await loadHistory();
    } catch (e: any) {
      setMsg("❌ " + e.message);
    }
  }

  if (!menu) return <div>Loading...</div>;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h3>
        Guest Menu — {restaurantSlug} / {tableCode}
      </h3>

      <div style={{ color: "#555" }}>{msg}</div>

      <div style={{ display: "grid", gap: 8 }}>
        <h4>Menu</h4>
        {menu.items.map((it) => (
          <div key={it.id} style={{ border: "1px solid #ddd", padding: 10, display: "flex", justifyContent: "space-between" }}>
            <div>
              <b>{it.name}</b> — {it.price}đ
              <div style={{ color: "#666" }}>{it.description || ""}</div>
            </div>
            <button onClick={() => addItem(it.id)}>Add</button>
          </div>
        ))}
      </div>

      <div style={{ border: "1px solid #ddd", padding: 12 }}>
        <h4>Cart (Total: {total}đ)</h4>
        {cart.length === 0 ? (
          <div>Empty</div>
        ) : (
          cart.map((c) => (
            <div key={c.menuItemId} style={{ marginBottom: 10 }}>
              <b>{itemsById.get(c.menuItemId)?.name}</b> x{c.qty}
              <div>
                <input
                  value={c.note || ""}
                  onChange={(e) => setNote(c.menuItemId, e.target.value)}
                  placeholder="note (ít cay, không hành...)"
                />
              </div>
            </div>
          ))
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={placeOrder}>Place Order</button>
          <button onClick={requestBill}>Request Bill</button>
        </div>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <h4>Order History</h4>
        {history.map((o) => (
          <div key={o.id} style={{ border: "1px solid #ddd", padding: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <b>#{o.id.slice(-6)}</b>
              <span>
                Status: <b>{o.status}</b> {o.billRequested ? " | 🧾 bill requested" : ""}
              </span>
            </div>
            <ul>
              {o.items.map((it: any) => (
                <li key={it.id}>
                  {it.menuItem.name} x{it.qty} ({it.unitPrice}đ) {it.note ? `- ${it.note}` : ""}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
