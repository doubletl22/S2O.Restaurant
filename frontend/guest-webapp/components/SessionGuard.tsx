"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSession, touchSession } from "@/lib/session";

export default function SessionGuard({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    const s = getSession();
    setOk(!!s);
    if (s) touchSession();
  }, []);

  if (ok === null) return <div className="screen"><div className="card">Đang tải...</div></div>;

  if (!ok) {
    return (
      <div className="screen">
        <div className="card">
          <div className="h2">Phiên đã hết hạn</div>
          <p className="muted">Bạn vui lòng quét lại QR trên bàn để vào lại.</p>
          <Link className="btn primary" href="/">
            Về trang quét QR
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
