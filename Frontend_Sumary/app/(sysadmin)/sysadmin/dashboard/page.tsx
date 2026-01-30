"use client";

import { useEffect, useState } from "react";
import { Users, Building2, DollarSign, Activity, Server, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { adminService } from "@/services/admin.service";
import { SysAdminStats } from "@/lib/types";

export default function SysAdminDashboard() {
  const [stats, setStats] = useState<SysAdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await adminService.getStats();
        if (res.isSuccess) setStats(res.value);
      } catch (e) {
        console.error("Lỗi tải dashboard stats:", e);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const formatMoney = (v: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tổng quan Hệ thống</h1>
        <p className="text-muted-foreground">Theo dõi hoạt động của nền tảng S2O Restaurant SaaS.</p>
      </div>
      
      {/* 4 Cards Chỉ số chính */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Tenant Stats */}
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

        {/* Active Stats */}
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

        {/* Revenue Stats */}
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

        {/* User Stats */}
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

      {/* Phần mở rộng: Server Status & Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Card Server Status */}
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

        {/* Card Recent Tenants */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Tenant mới nhất</CardTitle>
            <CardDescription>Các nhà hàng vừa gia nhập hệ thống</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
               {stats?.recentTenants && stats.recentTenants.length > 0 ? (
                 stats.recentTenants.map((tenant) => (
                   <div key={tenant.id} className="flex items-center justify-between border-b last:border-0 pb-2">
                      <div className="flex items-center gap-3">
                         <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs shrink-0">
                            {tenant.name ? tenant.name.substring(0,2).toUpperCase() : "NA"}
                         </div>
                         <div className="space-y-0.5">
                            <p className="text-sm font-medium leading-none truncate max-w-30" title={tenant.name}>{tenant.name}</p>
                            <p className="text-xs text-muted-foreground">{tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</p>
                         </div>
                      </div>
                      <div className="text-xs font-medium border px-2 py-1 rounded-md bg-muted">{tenant.subscriptionPlan}</div>
                   </div>
                 ))
               ) : (
                 <div className="text-center py-4 text-muted-foreground text-sm">Chưa có dữ liệu gần đây</div>
               )}
            </div>
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
         {Array.from({length:4}).map((_,i) => <Skeleton key={i} className="h-30 rounded-xl" />)}
       </div>
       <div className="grid gap-4 md:grid-cols-7">
         <Skeleton className="col-span-4 h-75 rounded-xl" />
         <Skeleton className="col-span-3 h-75 rounded-xl" />
       </div>
    </div>
  );
}