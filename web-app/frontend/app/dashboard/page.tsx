"use client";
import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { getSocket } from "@/lib/socket";

export default function DashboardPage() {
  const [msg, setMsg] = useState("");
  const [branchId, setBranchId] = useState("demo_branch_id");
  const [orders, setOrders] = useState<any[]>([]);
  const [status, setStatus] = useState<string>("");

  async function load() {
    try {
      const qs = status ? `?status=${status}` : "";
      const data = await apiGet(`/orders/by-branch/${branchId}${qs}`);
      setOrders(data);
    } catch (e: any) {
      setMsg("❌ " + e.message);
    }
  }

  useEffect(() => {
    load();
    const s = getSocket();
    s.emit("join", { branchId });
    const handler = () => load();
    s.on("order:updated", handler);
    return () => {
      s.off("order:updated", handler);
      s.emit("leave", { branchId });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId, status]);

  async function setOrderStatus(orderId: string, st: string) {
    try {
      await apiPost("/orders/status", { orderId, status: st });
      setMsg("✅ Updated " + orderId);
    } catch (e: any) {
      setMsg("❌ " + e.message);
    }
  }

  async function pay(orderId: string) {
    try {
      await apiPost("/orders/pay", { orderId, method: "CASH", amount: 0, note: "Paid" });
      setMsg("✅ Paid " + orderId);
    } catch (e: any) {
      setMsg("❌ " + e.message);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h3>Restaurant Dashboard</h3>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input value={branchId} onChange={(e) => setBranchId(e.target.value)} placeholder="branchId" />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">ALL</option>
          <option>NEW</option>
          <option>CONFIRMED</option>
          <option>COOKING</option>
          <option>READY</option>
          <option>SERVED</option>
          <option>PAID</option>
          <option>CANCELLED</option>
        </select>
        <button onClick={load}>Reload</button>
      </div>

      <div style={{ color: "#555" }}>{msg}</div>

      {orders.map((o) => (
        <div key={o.id} style={{ border: "1px solid #ddd", padding: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <b>Order #{o.id.slice(-6)}</b>
            <span>Status: <b>{o.status}</b> {o.billRequested ? " | 🧾 Bill requested" : ""}</span>
          </div>
          <div>Table: {o.table?.code || "-"}</div>
          <ul>
            {o.items.map((it: any) => (
              <li key={it.id}>
                {it.menuItem.name} x{it.qty} ({it.unitPrice}đ) {it.note ? `- note: ${it.note}` : ""}
              </li>
            ))}
          </ul>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => setOrderStatus(o.id, "CONFIRMED")}>CONFIRM</button>
            <button onClick={() => setOrderStatus(o.id, "COOKING")}>COOKING</button>
            <button onClick={() => setOrderStatus(o.id, "READY")}>READY</button>
            <button onClick={() => setOrderStatus(o.id, "SERVED")}>SERVED</button>
            <button onClick={() => setOrderStatus(o.id, "CANCELLED")}>CANCEL</button>
            <button onClick={() => pay(o.id)}>MARK PAID</button>
          </div>
        </div>
      ))}
    </div>
  );
}
