export default function Home() {
  return (
    <main className="mx-auto max-w-xl p-4">
      <div className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--card)] p-4 shadow-soft">
        <div className="text-sm text-[color:var(--muted)]">S2O • Guest WebApp</div>
        <h1 className="mt-1 text-xl font-extrabold">QR Menu (Guest)</h1>

        <div className="mt-3 text-sm text-[color:var(--muted)]">
          Bạn phải truy cập theo QR URL dạng:
          <div className="mt-2 rounded-2xl border border-[color:var(--line)] bg-black/5 p-3 font-mono text-xs text-[color:var(--text)] dark:bg-white/5">
            /{"{tenantId}"}/{"{tableId}"}/{"{tableCode}"}
          </div>
          <div className="mt-2">
            *Lưu ý:* Trong backend của bạn, các API public cần header <b>X-Tenant-Id</b> nên URL phải có
            <b> tenantId</b> (GUID).
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-dashed border-[color:var(--line)] p-3 text-sm text-[color:var(--muted)]">
          Ví dụ demo (bạn tự thay GUID thật):
          <div className="mt-2 font-mono text-xs">
            /11111111-1111-1111-1111-111111111111/22222222-2222-2222-2222-222222222222/A01
          </div>
        </div>

        <div className="mt-4 text-xs text-[color:var(--muted)]">
          Staff/Admin portal là app khác (frontend/admin-portal). Trang này chỉ dành cho Guest.
        </div>
      </div>
    </main>
  );
}
