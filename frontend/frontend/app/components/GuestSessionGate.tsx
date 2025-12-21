"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * GuestSessionGate - tự quản lý session cho khách vãng lai
 * - Tạo session theo qrToken (path /t/[qrToken])
 * - Timeout -> xóa session + quay về / (hoặc trang bạn muốn)
 *
 * Không dùng "@/hooks/useGuestSession" để tránh lỗi module not found.
 */

const DEFAULT_TTL_MINUTES = 30;

function nowMs() {
  return Date.now();
}

function parseQrTokenFromPath(path: string): string | null {
  // path example: /t/1 , /t/1/product/2 ...
  const m = path.match(/^\/t\/([^\/\?#]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

function keyFor(qrToken: string) {
  return `guest_session:${qrToken}`;
}

type GuestSession = {
  qrToken: string;
  createdAt: number;
  expiresAt: number;
};

export default function GuestSessionGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const qrToken = useMemo(() => parseQrTokenFromPath(pathname || ""), [pathname]);

  const [ready, setReady] = useState(false);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    // Không có qrToken => coi như không cần gate
    if (!qrToken) {
      setReady(true);
      return;
    }

    const ttlMs = DEFAULT_TTL_MINUTES * 60 * 1000;
    const k = keyFor(qrToken);

    const loadOrCreate = () => {
      const raw = sessionStorage.getItem(k);
      const t = nowMs();

      if (raw) {
        try {
          const sess: GuestSession = JSON.parse(raw);
          if (sess.expiresAt > t) {
            setExpired(false);
            return sess;
          }
        } catch (_) {
          // ignore parse error -> tạo mới
        }
      }

      // tạo session mới
      const sess: GuestSession = {
        qrToken,
        createdAt: t,
        expiresAt: t + ttlMs,
      };
      sessionStorage.setItem(k, JSON.stringify(sess));
      setExpired(false);
      return sess;
    };

    const sess = loadOrCreate();

    // tick kiểm tra hết hạn
    const timer = window.setInterval(() => {
      const t = nowMs();
      const raw = sessionStorage.getItem(k);
      if (!raw) return;

      try {
        const s: GuestSession = JSON.parse(raw);
        if (s.expiresAt <= t) {
          setExpired(true);
          sessionStorage.removeItem(k);
          // về trang chủ (hoặc bạn muốn về /t/[qrToken] cũng được)
          router.replace("/");
        }
      } catch (_) {}
    }, 1000);

    setReady(true);
    return () => window.clearInterval(timer);
  }, [qrToken, router]);

  if (!ready) return null;

  // nếu đang expired (trước khi replace) thì show màn hình nhẹ
  if (expired) {
    return (
      <div style={{ padding: 16 }}>
        <b>Phiên đã hết hạn.</b>
        <div style={{ opacity: 0.7, marginTop: 8 }}>
          Đang quay về trang chủ...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
