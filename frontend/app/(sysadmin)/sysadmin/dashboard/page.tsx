"use client";

import { useEffect, useState } from "react";
import { Users, Building2, DollarSign, Activity, Server, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { adminService } from "@/services/admin.service";
import { tenantService } from "@/services/tenant.service";
import { SysAdminStats, Tenant } from "@/lib/types";

function toDateValue(v?: string) {
  if (!v) return 0;
  const t = new Date(v).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function normalizeTenantList(payload: any): Tenant[] {
  if (Array.isArray(payload?.value)) return payload.value;
  if (Array.isArray(payload)) return payload;
  return [];
}

export default function SysAdminDashboard() {
  const [stats, setStats] = useState<SysAdminStats | null>(null);
  const [recentTenants, setRecentTenants] = useState<Tenant[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async (showLoading = false) => {
      try {
        if (showLoading) setLoading(true);

        const [statsRes, tenantsRes, usersRes] = await Promise.allSettled([
          adminService.getStats(),
          tenantService.getAll(),
          adminService.getSystemUsers(),
        ]);

        const apiStats = statsRes.status === "fulfilled" && statsRes.value?.isSuccess
          ? statsRes.value.value
          : null;

        const tenantsRaw = tenantsRes.status === "fulfilled" ? tenantsRes.value : null;
        const tenants = normalizeTenantList(tenantsRaw);

        const usersRaw = usersRes.status === "fulfilled" ? usersRes.value : null;
        const usersCount = Number((usersRaw as any)?.totalCount || (usersRaw as any)?.items?.length || 0);

        const activeTenants = tenants.filter((t) => t.isActive && !t.isLocked).length;
        const computedTotalTenants = tenants.length;
        const computedStats: SysAdminStats = {
          totalTenants: apiStats?.totalTenants ?? computedTotalTenants,
          activeTenants: apiStats?.activeTenants ?? activeTenants,
          totalRevenue: apiStats?.totalRevenue ?? 0,
          totalUsers: apiStats?.totalUsers && apiStats.totalUsers > 0 ? apiStats.totalUsers : usersCount,
          recentTenants: tenants
            .slice()
            .sort((a, b) => toDateValue(b.createdAt || b.createdOn) - toDateValue(a.createdAt || a.createdOn))
            .slice(0, 5),
        };

        setStats(computedStats);
        setRecentTenants((computedStats.recentTenants as Tenant[]) || []);
        setLastUpdated(new Date().toLocaleTimeString("vi-VN"));
      } catch (e) {
        console.error("Lỗi tải dashboard stats:", e);
      } finally {
        if (showLoading) setLoading(false);
      }
    };

    loadStats(true);
    const timer = setInterval(() => loadStats(false), 30000);

    return () => clearInterval(timer);
  }, []);

  const formatMoney = (v: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tổng quan Hệ thống</h1>
        <p className="text-muted-foreground">Theo dõi hoạt động của nền tảng S2O Restaurant SaaS.</p>
        <p className="text-xs text-muted-foreground mt-1">Cập nhật lúc: {lastUpdated || "--:--:--"}</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Nhà hàng</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTenants || 0}</div>
            <p className="text-xs text-muted-foreground">Đối tác đã đăng ký</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang Hoạt động</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeTenants || 0}</div>
             <div className="flex items-center text-xs text-green-600 mt-1">
               <TrendingUp className="h-3 w-3 mr-1" /> 
               Tỉ lệ {(stats && stats.totalTenants > 0 ? (stats.activeTenants / stats.totalTenants * 100).toFixed(1) : 0)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu (Platform)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(stats?.totalRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">Phí thuê bao tháng này</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Bao gồm Owner & Staff</p>
          </CardContent>
        </Card>
      </div>
      {/* ... Phần server status giữ nguyên */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
               <Server className="h-5 w-5" /> Trạng thái Server
            </CardTitle>
            <CardDescription>Giám sát hạ tầng Microservices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
               {['Identity Service', 'Catalog Service', 'Order Service', 'Tenant Service'].map((service, idx) => (
                 <div key={idx} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div className="flex items-center gap-2">
                       <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></div>
                       <span className="font-medium">{service}</span>
                    </div>
                    <span className="text-sm text-green-600 font-medium">Operational</span>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Nhà hàng mới đăng ký</CardTitle>
            <CardDescription>Top 5 tenant gần nhất</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTenants.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có dữ liệu gần đây.</p>
            ) : (
              <div className="space-y-3">
                {recentTenants.map((tenant) => (
                  <div key={tenant.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{tenant.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{tenant.ownerEmail || tenant.email || "--"}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tenant.createdAt || tenant.createdOn || Date.now()).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
       <Skeleton className="h-10 w-75" />
       <div className="grid gap-4 md:grid-cols-4">
         {Array.from({length:4}).map((_,i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
       </div>
    </div>
  );
}