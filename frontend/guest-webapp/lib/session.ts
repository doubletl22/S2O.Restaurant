"use client";

import { readJSON, writeJSON, removeKey } from "./storage";
import type { GuestSession } from "./types";
import { now } from "./format";

const KEY = "s2o_guest_session_v1";
const EVT = "s2o:session";

const INACTIVITY_MS = 60 * 60 * 1000; // 1 giờ không thao tác -> hết hạn
const EXTEND_MS = 2 * 60 * 60 * 1000; // mỗi lần thao tác gia hạn 2 giờ

function emit() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVT));
}

export function getSession(): GuestSession | null {
  const s = readJSON<GuestSession | null>(KEY, null);
  if (!s) return null;

  // hết hạn
  if (now() > s.expiresAt) {
    removeKey(KEY);
    return null;
  }
  return s;
}

export function clearSession() {
  removeKey(KEY);
  emit();
}

export function saveSessionFromQuery(params: URLSearchParams) {
  const tenantId = params.get("tenantId") || "";
  const branchId = params.get("branchId") || "";
  const tableId = params.get("tableId") || "";
  if (!tenantId || !branchId || !tableId) return;

  const t = now();
  const session: GuestSession = {
    tenantId,
    branchId,
    tableId,
    lastActiveAt: t,
    expiresAt: t + EXTEND_MS
  };
  writeJSON(KEY, session);
  emit();
}

export function touchSession() {
  const s = getSession();
  if (!s) return;

  const t = now();
  // nếu quá lâu không thao tác -> cho hết hạn luôn
  if (t - s.lastActiveAt > INACTIVITY_MS) {
    clearSession();
    return;
  }

  const next: GuestSession = {
    ...s,
    lastActiveAt: t,
    expiresAt: t + EXTEND_MS
  };
  writeJSON(KEY, next);
  emit();
}
