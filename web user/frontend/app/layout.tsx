import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Six Restaurant",
  description: "Food ordering web app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        {/* Mobile-first + safe area (iPhone) */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </head>
      <body>
        <div className="app-shell">
          <div className="phone">{children}</div>
        </div>
      </body>
    </html>
  );
}
