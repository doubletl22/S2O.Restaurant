"use client";

import { useEffect, useState } from "react";
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  UtensilsCrossed, 
  ArrowUpRight 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import { ownerReportService, DashboardStats } from "@/services/owner-report.service";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await ownerReportService.getDashboardStats();
        if (res.isSuccess) {
          setStats(res.value);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const formatMoney = (amount: number) => 
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Tổng quan</h1>
      
      {/* 4 Cards Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu hôm nay</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(stats?.todayRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">+20.1% so với hôm qua</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đơn hàng mới</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats?.todayOrders}</div>
            <p className="text-xs text-muted-foreground">Trong 24h qua</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng món ăn</CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Đang kinh doanh</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nhân sự</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalStaff}</div>
            <p className="text-xs text-muted-foreground">Đang hoạt động</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Đơn hàng gần đây</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                {stats?.recentOrders?.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Chưa có đơn hàng nào.</p>
                ) : (
                  stats?.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                       <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">{order.tableName}</p>
                          <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleTimeString('vi-VN')}</p>
                       </div>
                       <div className="flex items-center gap-4">
                          <Badge variant={order.status === 'Served' ? 'outline' : 'secondary'}>{order.status}</Badge>
                          <div className="font-bold text-sm">{formatMoney(order.totalAmount)}</div>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </CardContent>
        </Card>
        
        {/* Quick Actions Card (Optional) */}
        <Card className="col-span-3 bg-primary/5 border-primary/20">
           <CardHeader>
             <CardTitle className="text-primary">Thao tác nhanh</CardTitle>
           </CardHeader>
           <CardContent className="grid gap-2">
              <a href="/owner/products" className="flex items-center justify-between p-3 bg-background rounded-lg hover:shadow-sm transition-all cursor-pointer">
                 <span className="font-medium text-sm">Thêm món mới</span>
                 <ArrowUpRight className="h-4 w-4 text-muted-foreground"/>
              </a>
              <a href="/owner/branches" className="flex items-center justify-between p-3 bg-background rounded-lg hover:shadow-sm transition-all cursor-pointer">
                 <span className="font-medium text-sm">Tạo mã QR bàn</span>
                 <ArrowUpRight className="h-4 w-4 text-muted-foreground"/>
              </a>
              <a href="/owner/staff" className="flex items-center justify-between p-3 bg-background rounded-lg hover:shadow-sm transition-all cursor-pointer">
                 <span className="font-medium text-sm">Cấp tài khoản nhân viên</span>
                 <ArrowUpRight className="h-4 w-4 text-muted-foreground"/>
              </a>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
       <Skeleton className="h-8 w-[200px]" />
       <div className="grid gap-4 md:grid-cols-4">
         {Array.from({length:4}).map((_, i) => <Skeleton key={i} className="h-[120px] rounded-xl" />)}
       </div>
       <Skeleton className="h-[300px] rounded-xl" />
    </div>
  );
}