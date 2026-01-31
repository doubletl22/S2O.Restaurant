"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { guestService } from "@/services/guest.service";
import { GuestHeader } from "@/components/guest/guest-header";
import { BottomNavV2 } from "@/components/guest/bottom-nav-v2";
import {
  getSession,
  isSessionExpired,
  setSession,
  clearSession,
} from "../_shared/guestStore";

type TableInfo = {
  tableId: string;
  tableName: string;
  tenantId: string;
  tenantName: string;
  branchId?: string;
};

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const qrToken = String(params.qrToken || "");
  const pathname = usePathname();
  const router = useRouter();

  const [table, setTable] = useState<TableInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function boot() {
      try {
        setLoading(true);
        setExpired(false);

        // ✅ 1) Nếu đã có session và còn hạn và đúng qrToken => dùng luôn (khỏi gọi API)
        const s = getSession();
        if (s && !isSessionExpired() && s.qrToken === qrToken) {
          if (mounted) {
            setTable({
              tableId: s.tableId,
              tableName: s.tableName,
              tenantId: s.tenantId,
              tenantName: s.tenantName,
              branchId: s.branchId,
            });
          }
          return;
        }

        // ✅ 2) Nếu chưa có / hết hạn / khác qrToken => resolve lại từ backend
        const info = await guestService.getTableInfo(qrToken);

        const t: TableInfo = {
          tableId: info.tableId || info.TableId,
          tableName: info.tableName || info.TableName,
          tenantId: info.tenantId || info.TenantId,
          tenantName: info.tenantName || info.TenantName,
          branchId: info.branchId || info.BranchId,
        };

        // Nếu thiếu dữ liệu => coi như QR sai/hết hạn
        if (!t.tableId || !t.tenantId) {
          setExpired(true);
          return;
        }

        setSession({
          qrToken,
          tableId: t.tableId,
          tenantId: t.tenantId,
          tableName: t.tableName || "Bàn",
          tenantName: t.tenantName || "S2O Restaurant",
          branchId: t.branchId,
          ttlMinutes: 180,
        });

        if (mounted) setTable(t);
      } catch (e) {
        // Không resolve được => báo quét lại QR
        if (mounted) setExpired(true);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    boot();
    return () => {
      mounted = false;
    };
  }, [qrToken]);

  const headerTitle = useMemo(() => {
    if (table?.tenantName) return table.tenantName;
    return "S2O Restaurant";
  }, [table]);

  const headerSubtitle = useMemo(() => {
    if (table?.tenantName && table?.tableName) return `${table.tenantName} • ${table.tableName}`;
    if (loading) return "Đang tải bàn...";
    return "";
  }, [table, loading]);

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      {/* ✅ Khung mobile (đẹp trên điện thoại) */}
      <div className="w-full max-w-md bg-white min-h-screen shadow-[0_0_0_1px_rgba(0,0,0,0.06)] relative">
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b">
          <GuestHeader title={headerTitle} subtitle={headerSubtitle} />
        </div>

        {/* Body */}
        <div className="pb-20">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Đang đồng bộ dữ liệu bàn...</div>
          ) : expired ? (
            <div className="p-6">
              <div className="rounded-2xl border p-4 bg-orange-50">
                <div className="font-semibold text-gray-900">Phiên đặt món đã hết hạn</div>
                <div className="text-sm text-gray-600 mt-1">
                  Vui lòng quét lại QR trên bàn để tiếp tục đặt món.
                </div>
                <button
                  className="mt-4 w-full rounded-xl bg-orange-500 text-white py-3 font-semibold active:scale-[0.99]"
                  onClick={() => {
                    clearSession();
                    router.refresh();
                  }}
                >
                  Quét lại QR / Tải lại
                </button>
              </div>
            </div>
          ) : (
            children
          )}
        </div>

        {/* Bottom nav */}
        {!loading && !expired && (
          <div className="fixed bottom-0 left-0 right-0 flex justify-center z-30">
            <div className="w-full max-w-md border-t bg-white">
              <BottomNavV2 />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
