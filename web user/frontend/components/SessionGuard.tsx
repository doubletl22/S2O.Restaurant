"use client";

import Link from "next/link";

export default function SessionGuard({ expired, children }: { expired: boolean; children: React.ReactNode }) {
  if (!expired) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border p-5">
        <h1 className="text-xl font-semibold">Phiên đã hết hạn</h1>
        <p className="text-sm opacity-80 mt-2">
          Vì lý do bảo mật, phiên gọi món đã kết thúc. Bạn vui lòng quét lại QR để bắt đầu phiên mới.
        </p>
        <Link className="inline-block mt-4 rounded-xl bg-black text-white px-4 py-2" href="/">
          Về trang đầu
        </Link>
      </div>
    </div>
  );
}
