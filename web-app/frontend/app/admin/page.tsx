"use client";
import { useState } from "react";
import { apiPost } from "@/lib/api";

export default function AdminPage() {
  const [msg, setMsg] = useState("");

  const [rName, setRName] = useState("New Restaurant");
  const [rSlug, setRSlug] = useState("new-restaurant");

  const [uEmail, setUEmail] = useState("staff@new.local");
  const [uPass, setUPass] = useState("staff123");
  const [uName, setUName] = useState("Staff");
  const [uRole, setURole] = useState("STAFF");
  const [uRestaurantId, setURestaurantId] = useState("");

  async function createRestaurant() {
    try {
      const r = await apiPost("/admin/restaurants", { name: rName, slug: rSlug });
      setURestaurantId(r.id);
      setMsg("✅ Created restaurant: " + r.id);
    } catch (e: any) {
      setMsg("❌ " + e.message);
    }
  }

  async function createUser() {
    try {
      const u = await apiPost("/admin/users", {
        email: uEmail,
        password: uPass,
        name: uName,
        role: uRole,
        restaurantId: uRestaurantId || null
      });
      setMsg("✅ Created user: " + u.email);
    } catch (e: any) {
      setMsg("❌ " + e.message);
    }
  }

  return (
    <div style={{ display: "grid", gap: 20, maxWidth: 650 }}>
      <h3>Admin</h3>

      <div style={{ border: "1px solid #ddd", padding: 12 }}>
        <h4>Create Restaurant</h4>
        <input value={rName} onChange={(e) => setRName(e.target.value)} placeholder="name" />
        <input value={rSlug} onChange={(e) => setRSlug(e.target.value)} placeholder="slug" />
        <button onClick={createRestaurant}>Create</button>
      </div>

      <div style={{ border: "1px solid #ddd", padding: 12 }}>
        <h4>Create User</h4>
        <input value={uEmail} onChange={(e) => setUEmail(e.target.value)} placeholder="email" />
        <input value={uPass} onChange={(e) => setUPass(e.target.value)} placeholder="password" />
        <input value={uName} onChange={(e) => setUName(e.target.value)} placeholder="name" />
        <select value={uRole} onChange={(e) => setURole(e.target.value)}>
          <option>ADMIN</option>
          <option>OWNER</option>
          <option>MANAGER</option>
          <option>STAFF</option>
        </select>
        <input value={uRestaurantId} onChange={(e) => setURestaurantId(e.target.value)} placeholder="restaurantId (optional)" />
        <button onClick={createUser}>Create</button>
      </div>

      <div>{msg}</div>
    </div>
  );
}
