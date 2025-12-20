"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { GuestSession } from "@/lib/types";
import { storage } from "@/lib/storage";
import { msUntil } from "@/lib/time";

const KEY = "S2O_GUEST_SESSION";

export function useGuestSession(qrToken: string) {
  const [session, setSession] = useState<GuestSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);

  const remainingMs = useMemo(() => (session ? msUntil(session.expiresAt) : 0), [session]);

  useEffect(() => {
    let mounted = true;

    async function boot() {
      setLoading(true);

      // 1) lấy từ localStorage nếu đúng qrToken
      const cached = storage.get<GuestSession>(KEY);
      if (cached && cached.qrToken === qrToken) {
        const left = msUntil(cached.expiresAt);
        if (left > 0) {
          if (mounted) {
            setSession(cached);
            setExpired(false);
            setLoading(false);
          }
          return;
        }
        storage.remove(KEY);
      }

      // 2) tạo session mới từ BE
      try {
        const fresh = await api.startSession(qrToken);
        storage.set(KEY, fresh);
        if (mounted) {
          setSession(fresh);
          setExpired(false);
        }
      } catch {
        if (mounted) setSession(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    boot();
    return () => {
      mounted = false;
    };
  }, [qrToken]);

  useEffect(() => {
    if (!session) return;
    const timer = setInterval(() => {
      const left = msUntil(session.expiresAt);
      if (left <= 0) {
        storage.remove(KEY);
        setExpired(true);
        setSession(null);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [session]);

  return { session, loading, expired, remainingMs };
}
