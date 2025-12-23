"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export default function HomePage() {
  const [qr, setQr] = useState("1");

  const href = useMemo(() => `/t/${encodeURIComponent(qr || "1")}`, [qr]);

  return (
    <main style={{ padding: 16, maxWidth: 520, margin: "0 auto" }}>
      <h1 style={{ margin: "12px 0 8px" }}>S2O – Guest Web</h1>
      <p style={{ margin: 0, opacity: 0.7 }}>
        Nhập mã bàn (qrToken) để vào menu demo.
      </p>

      <div style={{ height: 12 }} />

      <input
        value={qr}
        onChange={(e) => setQr(e.target.value)}
        placeholder="Ví dụ: 1"
        style={{
          width: "100%",
          padding: "12px 12px",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          outline: "none",
          fontSize: 14,
        }}
      />

      <div style={{ height: 12 }} />

      <Link
        href={href}
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "12px 14px",
          borderRadius: 12,
          background: "linear-gradient(90deg,#f97316,#ef4444)",
          color: "white",
          fontWeight: 900,
        }}
      >
        Vào Menu bàn {qr || "1"}
      </Link>

      <div style={{ height: 14 }} />
      <div style={{ opacity: 0.7, fontSize: 13 }}>
        Ví dụ nhanh: <Link href="/t/1">/t/1</Link>
      </div>
    </main>
  );
}
