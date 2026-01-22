"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

type Toast = { id: string; message: string };
type Ctx = { toast: (msg: string) => void };

const ToastCtx = createContext<Ctx | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("ToastProvider missing");
  return ctx;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const toast = (message: string) => {
    const id = Math.random().toString(16).slice(2);
    setItems((s) => [...s, { id, message }]);
    setTimeout(() => setItems((s) => s.filter((x) => x.id !== id)), 2600);
  };

  const value = useMemo(() => ({ toast }), []);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="toast-wrap">
        {items.map((t) => (
          <div key={t.id} className="toast">
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
