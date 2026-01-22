"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { useToast } from "@/components/ToastProvider";

export default function HomePage() {
  const router = useRouter();
  const { toast } = useToast();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [scanning, setScanning] = useState(false);
  const [tenantId, setTenantId] = useState("11111111-1111-1111-1111-111111111111");
  const [branchId, setBranchId] = useState("00000000-0000-0000-0000-000000000001");
  const [tableId, setTableId] = useState("00000000-0000-0000-0000-000000000005");

  const reader = useMemo(() => new BrowserMultiFormatReader(), []);

  useEffect(() => {
    if (!scanning) return;

    const video = videoRef.current;
    if (!video) return;

    let stopped = false;

    reader
      .decodeFromVideoDevice(undefined, video, (result, err) => {
        if (stopped) return;
        if (result) {
          const text = result.getText();
          toast("Đã quét QR ✅");
          setScanning(false);
          stopped = true;
          reader.reset();

          // QR của bạn đang tạo URL kiểu: http://localhost:3000/menu?tenantId=...&branchId=...&tableId=...
          try {
            const u = new URL(text);
            router.push(u.pathname + u.search);
          } catch {
            // nếu QR chỉ là query hoặc token, bạn có thể xử lý thêm ở đây
            toast("QR không phải URL hợp lệ. Hãy dùng nhập tay.");
          }
        }
      })
      .catch(() => toast("Không mở được camera. Dùng nhập tay nhé."));

    return () => {
      stopped = true;
      reader.reset();
    };
  }, [scanning, reader, router, toast]);

  return (
    <div className="screen">
      <div className="wrap">
        <div className="card">
          <div className="h2">S2O • Guest WebApp</div>
          <p className="muted">
            Quét QR trên bàn để vào menu. Hoặc nhập Tenant/Branch/Table để test nhanh trên máy.
          </p>

          <div className="row">
            <button className="btn primary" onClick={() => setScanning((v) => !v)}>
              {scanning ? "TẮT CAMERA" : "BẬT CAMERA QUÉT QR"}
            </button>
          </div>

          {scanning && (
            <div style={{ marginTop: 12 }}>
              <div className="card" style={{ padding: 10 }}>
                <video ref={videoRef} style={{ width: "100%", borderRadius: 16 }} />
                <div className="muted" style={{ marginTop: 8 }}>
                  Nếu trình duyệt chặn camera → cho phép quyền Camera.
                </div>
              </div>
            </div>
          )}

          <div style={{ height: 12 }} />

          <div className="muted">Test nhanh (nhập tay):</div>
          <div style={{ height: 8 }} />

          <input className="input" value={tenantId} onChange={(e) => setTenantId(e.target.value)} placeholder="tenantId" />
          <div style={{ height: 8 }} />
          <input className="input" value={branchId} onChange={(e) => setBranchId(e.target.value)} placeholder="branchId" />
          <div style={{ height: 8 }} />
          <input className="input" value={tableId} onChange={(e) => setTableId(e.target.value)} placeholder="tableId" />

          <div style={{ height: 10 }} />
          <button
            className="btn ghost"
            onClick={() => router.push(`/menu?tenantId=${encodeURIComponent(tenantId)}&branchId=${encodeURIComponent(branchId)}&tableId=${encodeURIComponent(tableId)}`)}
          >
            VÀO MENU
          </button>

          <div style={{ height: 10 }} />
          <p className="muted" style={{ margin: 0 }}>
            Gợi ý: tenantId seed sẵn trong Catalog của bạn là <b>11111111-1111-1111-1111-111111111111</b>.
          </p>
        </div>
      </div>
    </div>
  );
}
