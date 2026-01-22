import "./globals.css";
import type { Metadata } from "next";
import ToastProvider from "@/components/ToastProvider";

export const metadata: Metadata = {
  title: "S2O Guest WebApp",
  description: "Scan2Order - Guest Web Application"
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
