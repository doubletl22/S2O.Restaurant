import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "S2O Restaurant",
  description: "Scan2Order",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
