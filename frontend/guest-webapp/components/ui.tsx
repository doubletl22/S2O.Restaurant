"use client";

import { useEffect } from "react";
import { cn } from "@/lib/cn";

export function Card({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-3xl border border-[color:var(--line)] bg-[color:var(--card)] shadow-soft", className)}>
      {children}
    </div>
  );
}

export function Badge({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={cn("inline-flex items-center rounded-full border border-[color:var(--line)] px-2 py-0.5 text-xs", className)}>
      {children}
    </span>
  );
}

type BtnVariant = "primary" | "outline" | "ghost" | "danger";

export function Button({
  className,
  variant = "primary",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition active:scale-[.99] disabled:opacity-60";
  const styles: Record<BtnVariant, string> = {
    primary: "bg-sky-500 text-white hover:bg-sky-600",
    outline: "border border-[color:var(--line)] bg-transparent hover:bg-black/5 dark:hover:bg-white/5",
    ghost: "bg-transparent hover:bg-black/5 dark:hover:bg-white/5",
    danger: "bg-red-500 text-white hover:bg-red-600"
  };
  return (
    <button className={cn(base, styles[variant], className)} {...props}>
      {children}
    </button>
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border border-[color:var(--line)] bg-transparent px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-sky-400/40",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-2xl border border-[color:var(--line)] bg-transparent px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-sky-400/40",
        className
      )}
      {...props}
    />
  );
}

export function Sheet({
  open,
  title,
  onClose,
  children,
  footer
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="sheet" role="dialog" aria-modal="true">
        <div className="sheet-handle" />
        <div className="sheet-header">
          <div className="font-extrabold">{title}</div>
          <Button variant="outline" onClick={onClose}>
            Đóng <span className="kbd">Esc</span>
          </Button>
        </div>
        <div className="sheet-body">{children}</div>
        {footer ? <div className="sheet-footer safe-bottom">{footer}</div> : null}
      </div>
    </>
  );
}
