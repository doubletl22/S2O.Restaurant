"use client";

import { useEffect, useState } from "react";
import { Users, Building2, DollarSign, Activity, Server, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminService } from "@/services/admin.service";
import { tenantService } from "@/services/tenant.service";
import { SysAdminStats, Tenant } from "@/lib/types";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

function normalizeTenantList(payload: any): Tenant[] {
  if (Array.isArray(payload?.value)) return payload.value;
  if (Array.isArray(payload)) return payload;
  return [];
}

function normalizePlan(raw?: string) {
  const plan = String(raw || "").trim().toLowerCase();
  if (plan === "premium") return "Premium";
  if (plan === "enterprise") return "Enterprise";
  return "Free";
}

function buildPlanCountsFromTenants(tenants: Tenant[]) {
  const counts = new Map<string, number>([
    ["Free", 0],
    ["Premium", 0],
    ["Enterprise", 0],
  ]);

  for (const tenant of tenants) {
    const plan = normalizePlan(tenant.planType || tenant.subscriptionPlan || tenant.plan);
    counts.set(plan, (counts.get(plan) || 0) + 1);
  }

  return Array.from(counts, ([plan, tenantCount]) => ({ plan, tenantCount }));
}

function normalizePlanTenantCounts(payload: any) {
  const source = payload?.planTenantCounts || payload?.PlanTenantCounts;
  if (!Array.isArray(source)) {
    return [];
  }

  return source.map((item: any) => ({
    plan: normalizePlan(item?.plan || item?.Plan),
    tenantCount: Number(item?.tenantCount ?? item?.TenantCount ?? 0),
  }));
}

function normalizeRevenueTrend(payload: any) {
  const source = payload?.revenueTrend || payload?.RevenueTrend;
  if (!Array.isArray(source)) {
    return [];
  }

  return source.map((item: any) => ({
    month: String(item?.month ?? item?.Month ?? ""),
    revenue: Number(item?.revenue ?? item?.Revenue ?? 0),
  }));
}

export default function SysAdminDashboard() {
  const [stats, setStats] = useState<SysAdminStats | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [appliedFilter, setAppliedFilter] = useState<{ from?: string; to?: string }>({});
  const [filterError, setFilterError] = useState<string>("");

  useEffect(() => {
    const loadStats = async (showLoading = false) => {
      try {
        if (showLoading) setLoading(true);

        const [statsRes, tenantsRes, usersRes] = await Promise.allSettled([
          adminService.getStats(appliedFilter),
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
        const apiPlanCounts = normalizePlanTenantCounts(apiStats);
        const apiRevenueTrend = normalizeRevenueTrend(apiStats);
        const fallbackPlanCounts = buildPlanCountsFromTenants(tenants);
        const hasFilter = Boolean(appliedFilter.from || appliedFilter.to);
        const computedStats: SysAdminStats = {
          totalTenants: apiStats?.totalTenants ?? (hasFilter ? 0 : computedTotalTenants),
          activeTenants: apiStats?.activeTenants ?? (hasFilter ? 0 : activeTenants),
          totalRevenue: apiStats?.totalRevenue ?? 0,
          totalUsers: apiStats?.totalUsers && apiStats.totalUsers > 0 ? apiStats.totalUsers : usersCount,
          planTenantCounts: apiPlanCounts.length > 0 ? apiPlanCounts : (hasFilter ? [] : fallbackPlanCounts),
          revenueTrend: apiRevenueTrend,
        };

        setStats(computedStats);
        setLastUpdated(new Date().toLocaleTimeString("vi-VN"));
      } catch (e) {
        console.error("Lỗi tải dashboard stats:", e);
        toast.error("Không tải được dữ liệu thống kê. Vui lòng thử lại.");
      } finally {
        if (showLoading) setLoading(false);
      }
    };

    loadStats(true);
    const timer = setInterval(() => loadStats(false), 30000);

    return () => clearInterval(timer);
  }, [appliedFilter]);

  const handleApplyFilter = () => {
    if (fromDate && toDate && fromDate > toDate) {
      const message = "Ngày bắt đầu không được lớn hơn ngày kết thúc.";
      setFilterError(message);
      toast.warning(message);
      return;
    }

    setFilterError("");
    setAppliedFilter({
      from: fromDate || undefined,
      to: toDate || undefined,
    });
  };

  const handleResetFilter = () => {
    setFromDate("");
    setToDate("");
    setFilterError("");
    setAppliedFilter({});
  };

  const formatMoney = (v: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tổng quan Hệ thống</h1>
        <p className="text-muted-foreground">Theo dõi hoạt động của nền tảng S2O Restaurant SaaS.</p>
        <p className="text-xs text-muted-foreground mt-1">
          Khoảng lọc: {appliedFilter.from || "--/--/----"} đến {appliedFilter.to || "--/--/----"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">Cập nhật lúc: {lastUpdated || "--:--:--"}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lọc thống kê theo thời gian</CardTitle>
          <CardDescription>Chọn khoảng ngày và áp dụng để cập nhật số liệu, biểu đồ.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Từ ngày</p>
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Đến ngày</p>
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button onClick={handleApplyFilter} className="w-full">Áp dụng lọc</Button>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={handleResetFilter} className="w-full">Xóa lọc</Button>
            </div>
          </div>
          {filterError ? <p className="mt-2 text-sm text-red-600">{filterError}</p> : null}
        </CardContent>
      </Card>
      
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
            <CardTitle className="text-sm font-medium">Doanh thu (Platform lũy kế)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(stats?.totalRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">Tổng phí thuê bao đã thu</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Biểu đồ doanh thu nền tảng</CardTitle>
          <CardDescription>Doanh thu thuê bao theo 6 tháng gần nhất</CardDescription>
        </CardHeader>
        <CardContent>
          {(stats?.revenueTrend?.length || 0) === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có dữ liệu doanh thu theo thời gian.</p>
          ) : (
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.revenueTrend} margin={{ left: 12, right: 12, top: 12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="platformRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
                  />
                  <Tooltip
                    formatter={(value) => formatMoney(Number(value || 0))}
                    labelFormatter={(label) => `Tháng ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#16a34a"
                    fill="url(#platformRevenue)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

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
            <CardTitle>Số cửa hàng theo gói</CardTitle>
            <CardDescription>Phân bổ tenant theo từng gói dịch vụ</CardDescription>
          </CardHeader>
          <CardContent>
            {(stats?.planTenantCounts?.length || 0) === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có dữ liệu gói dịch vụ.</p>
            ) : (
              <div className="space-y-3">
                {stats?.planTenantCounts?.map((planItem) => (
                  <div key={planItem.plan} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <p className="text-sm font-medium">Gói {planItem.plan}</p>
                    <p className="text-sm text-muted-foreground">{planItem.tenantCount} cửa hàng</p>
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