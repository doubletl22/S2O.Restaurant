"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card } from "./ui";

function now() {
  return Date.now();
}

export function SessionGuard({
  scopeKey,
  ttlMinutes,
  onExpired
}: {
  scopeKey: string;
  ttlMinutes: number;
  onExpired?: () => void;
}) {
  const KEY = useMemo(() => `s2o_guest_last_activity:${scopeKey}`, [scopeKey]);
  const ttlMs = ttlMinutes * 60 * 1000;

  const [expired, setExpired] = useState(false);
  const [leftMs, setLeftMs] = useState(ttlMs);

  useEffect(() => {
    // init
    const last = Number(localStorage.getItem(KEY) || "0");
    if (!last) localStorage.setItem(KEY, String(now()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [KEY]);

  useEffect(() => {
    const mark = () => {
      if (expired) return;
      localStorage.setItem(KEY, String(now()));
    };

    const events: Array<keyof WindowEventMap> = ["pointerdown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, mark, { passive: true }));

    const timer = window.setInterval(() => {
      const last = Number(localStorage.getItem(KEY) || "0");
      const left = ttlMs - (now() - last);
      setLeftMs(left);
      if (left <= 0) {
        setExpired(true);
        onExpired?.();
      }
    }, 1000);

    return () => {
      events.forEach((e) => window.removeEventListener(e, mark as any));
      window.clearInterval(timer);
    };
  }, [KEY, ttlMs, expired, onExpired]);

  if (!expired) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur">
      <Card className="w-full max-w-md p-4">
        <div className="text-sm text-[color:var(--muted)]">Session timeout</div>
        <div className="mt-1 text-lg font-extrabold">Phiên đã hết hạn</div>
        <div className="mt-2 text-sm text-[color:var(--muted)]">
          Vì bạn không thao tác trong {ttlMinutes} phút. Vui lòng bắt đầu phiên mới để tiếp tục gọi món.
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            onClick={() => {
              localStorage.setItem(KEY, String(now()));
              setExpired(false);
              setLeftMs(ttlMs);
            }}
          >
            Bắt đầu phiên mới
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reload trang
          </Button>
        </div>

        <div className="mt-3 text-xs text-[color:var(--muted)]">
          (Đếm ngược: {Math.max(0, Math.ceil(leftMs / 1000))}s)
        </div>
      </Card>
    </div>
  );
}
