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
        if (res.isSuccess) {
            setStats(res.value);
        }
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