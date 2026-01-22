"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clearSession } from "@/lib/session";

export default function Header({
  title,
  subtitle
}: {
  title: string;
  subtitle?: string;
}) {
  const pathname = usePathname();

  return (
    <div className="topbar">
      <div className="topbar-left">
        {pathname !== "/menu" ? (
          <button className="iconbtn" onClick={() => history.back()} title="Quay lại">
            ←
          </button>
        ) : (
          <div className="logo-dot" />
        )}
      </div>

      <div className="topbar-mid">
        <div className="topbar-title">{title}</div>
        {subtitle && <div className="topbar-sub">{subtitle}</div>}
      </div>

      <div className="topbar-right">
        <Link className="iconbtn" href="/menu" title="Menu">
          ☰
        </Link>
        <button
          className="iconbtn danger"
          onClick={() => {
            clearSession();
            location.href = "/";
          }}
          title="Thoát"
        >
          ⎋
        </button>
      </div>
    </div>
  );
}
