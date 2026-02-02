"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  UtensilsCrossed, 
  ArrowUpRight // [FIX] Import ArrowUpRight
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton"; // [FIX] Import Skeleton
import { Badge } from "@/components/ui/badge"; // [FIX] Import Badge

import { ownerReportService } from "@/services/owner-report.service";
import { DashboardStats, OrderStatus } from "@/lib/types"; // [FIX] Import OrderStatus để so sánh

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

  // Helper chuyển Enum sang Text hiển thị
  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending: return "Mới";
      case OrderStatus.Confirmed: return "Đã nhận";
      case OrderStatus.Cooking: return "Đang nấu";
      case OrderStatus.Ready: return "Sẵn sàng";
      case OrderStatus.Served: return "Đã phục vụ";
      case OrderStatus.Completed: return "Hoàn tất";
      case OrderStatus.Cancelled: return "Đã hủy";
      default: return "Khác";
    }
  };

  const getStatusVariant = (status: OrderStatus): "default" | "secondary" | "destructive" | "outline" => {
    if (status === OrderStatus.Pending) return "destructive";
    if (status === OrderStatus.Served || status === OrderStatus.Completed) return "outline";
    if (status === OrderStatus.Cooking) return "default"; // blue/primary
    return "secondary";
  };

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
            <p className="text-xs text-muted-foreground">Tổng doanh thu: {formatMoney(stats?.totalRevenue || 0)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đơn hàng mới</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats?.todayOrders || 0}</div>
            <p className="text-xs text-muted-foreground">Tổng số đơn: {stats?.totalOrders || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng món ăn</CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground">Đang kinh doanh</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nhân sự</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalStaff || 0}</div>
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
                {/* [FIX] Kiểm tra optional chaining cho stats?.recentOrders */}
                {!stats?.recentOrders || stats.recentOrders.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Chưa có đơn hàng nào.</p>
                ) : (
                  stats.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                       <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">#{order.orderNumber}</span>
                            <span className="text-sm font-medium leading-none">{order.tableName}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {order.createdOn ? new Date(order.createdOn).toLocaleTimeString('vi-VN') : "N/A"}
                          </p>
                       </div>
                       <div className="flex items-center gap-4">
                          {/* [FIX] So sánh Enum chính xác & dùng Badge đúng cách */}
                          <Badge variant={getStatusVariant(order.status)}>
                            {getStatusLabel(order.status)}
                          </Badge>
                          <div className="font-bold text-sm w-24 text-right">{formatMoney(order.totalAmount)}</div>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </CardContent>
        </Card>
        
        {/* Quick Actions Card */}
        <Card className="col-span-3 bg-primary/5 border-primary/20">
           <CardHeader>
             <CardTitle className="text-primary">Thao tác nhanh</CardTitle>
           </CardHeader>
           <CardContent className="grid gap-2">
              <Link href="/owner/products" className="flex items-center justify-between p-3 bg-background rounded-lg hover:shadow-sm transition-all cursor-pointer">
                 <span className="font-medium text-sm">Thêm món mới</span>
                 <ArrowUpRight className="h-4 w-4 text-muted-foreground"/>
              </Link>
              <Link href="/owner/branches" className="flex items-center justify-between p-3 bg-background rounded-lg hover:shadow-sm transition-all cursor-pointer">
                 <span className="font-medium text-sm">Tạo mã QR bàn</span>
                 <ArrowUpRight className="h-4 w-4 text-muted-foreground"/>
              </Link>
              <Link href="/owner/staff" className="flex items-center justify-between p-3 bg-background rounded-lg hover:shadow-sm transition-all cursor-pointer">
                 <span className="font-medium text-sm">Cấp tài khoản nhân viên</span>
                 <ArrowUpRight className="h-4 w-4 text-muted-foreground"/>
              </Link>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
       <Skeleton className="h-8 w-50" />
       <div className="grid gap-4 md:grid-cols-4">
         {Array.from({length:4}).map((_, i) => <Skeleton key={i} className="h-30 rounded-xl" />)}
       </div>
       <Skeleton className="h-75 rounded-xl" />
    </div>
  );
}