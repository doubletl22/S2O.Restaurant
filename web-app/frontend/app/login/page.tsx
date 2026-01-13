"use client";
import { useState } from "react";
import { apiPost } from "@/lib/api";
import { setTokens } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("manager@demo.local");
  const [password, setPassword] = useState("manager123");
  const [msg, setMsg] = useState("");

  async function onLogin() {
    try {
      setMsg("Logging in...");
      const data = await apiPost("/auth/login", { email, password });
      setTokens(data.accessToken, data.refreshToken);
      setMsg(`✅ Logged in as ${data.user.role}`);
      // route theo role
      if (data.user.role === "ADMIN") location.href = "/admin";
      else location.href = "/dashboard";
    } catch (e: any) {
      setMsg("❌ " + e.message);
    }
  }

  return (
    <div style={{ maxWidth: 420 }}>
      <h3>Login</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" />
        <button onClick={onLogin}>Login</button>
        <div>{msg}</div>
      </div>
    </div>
  );
}
