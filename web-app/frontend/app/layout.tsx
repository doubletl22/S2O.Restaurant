export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body style={{ fontFamily: "system-ui", margin: 0 }}>
        <div style={{ padding: 16 }}>
          <h2>S2O Restaurant</h2>
          {children}
        </div>
      </body>
    </html>
  );
}
