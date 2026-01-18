"use client";

import { ShoppingCart, SunMoon } from "lucide-react";
import { Button } from "./ui";
import { useEffect, useState } from "react";

function getTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  return (localStorage.getItem("s2o_theme") as any) || "dark";
}
function setTheme(t: "dark" | "light") {
  localStorage.setItem("s2o_theme", t);
  document.documentElement.dataset.theme = t;
}

export function TopBar({
  title,
  subtitle,
  cartCount,
  onOpenCart
}: {
  title: string;
  subtitle?: string;
  cartCount: number;
  onOpenCart: () => void;
}) {
  const [theme, setT] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const t = getTheme();
    setT(t);
    document.documentElement.dataset.theme = t;
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--line)] bg-[color:var(--bg)]/75 backdrop-blur">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-2 px-3 py-3">
        <div className="min-w-0">
          <div className="truncate text-base font-extrabold">{title}</div>
          {subtitle ? <div className="truncate text-xs text-[color:var(--muted)]">{subtitle}</div> : null}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              const nt = theme === "dark" ? "light" : "dark";
              setT(nt);
              setTheme(nt);
            }}
            aria-label="Toggle theme"
          >
            <SunMoon size={18} />
          </Button>

          <Button variant="outline" onClick={onOpenCart}>
            <ShoppingCart size={18} />
            <span className="text-xs">{cartCount}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
