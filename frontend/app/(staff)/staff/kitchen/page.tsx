"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { staffService } from "@/services/staff.service";
import { OrderStatus } from "@/lib/types"; 
import { toast } from "sonner";

import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, ChefHat, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

export default function KitchenPage() {
  const queryClient = useQueryClient();
  const branchId = "YOUR_BRANCH_ID_HERE"; // TODO: Thay bằng branchId thực tế từ context

  // 1. Fetch Orders
  const { data: orders = [], isLoading, isFetching } = useQuery({
    queryKey: ["kitchen-orders", branchId],
    queryFn: async () => {
      const res: any = await staffService.getKitchenOrders(branchId);
      return res.items || res || [];
    },
    refetchInterval: 10000, 
  });

  // 2. Mutation: Đổi trạng thái món [FIX: Thêm tham số orderId]
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, itemId, status }: { orderId: string; itemId: string; status: number }) =>
      staffService.updateOrderItemStatus(orderId, itemId, status), // Truyền đủ 3 tham số
    onSuccess: () => {
      toast.success("Đã cập nhật trạng thái món");
      queryClient.invalidateQueries({ queryKey: ["kitchen-orders"] });
    },
    onError: () => toast.error("Lỗi cập nhật. Vui lòng thử lại."),
  });

  // Helper: Lọc món & Gắn thêm orderId vào từng món
  const getItemsByStatus = (statusList: number[]) => {
    const allItems: any[] = [];
    orders.forEach((order: any) => {
      if (order.items) {
        order.items.forEach((item: any) => {
          if (statusList.includes(item.status)) {
            // [QUAN TRỌNG] Flatten orderId vào item để dùng khi gọi API
            allItems.push({ ...item, tableName: order.tableName, orderId: order.id });
          }
        });
      }
    });
    return allItems;
  };

  const pendingItems = getItemsByStatus([OrderStatus.Pending]);
  const cookingItems = getItemsByStatus([OrderStatus.Confirmed, OrderStatus.Cooking]);
  const readyItems = getItemsByStatus([OrderStatus.Ready]);

  // --- RENDER ---
  return (
    <div className="p-4 md:p-6 min-h-screen bg-gray-50/50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ChefHat className="h-8 w-8 text-primary" />
          Bếp & Chế Biến
        </h1>
        <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Làm mới
        </Button>
      </div>

      <Tabs defaultValue="cooking" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 h-12">
          <TabsTrigger value="pending" className="font-bold relative">
            Chờ xác nhận
            {pendingItems.length > 0 && (
              <Badge variant="destructive" className="ml-2 absolute -top-2 -right-2 px-1.5 min-w-[20px] h-5 flex items-center justify-center">
                {pendingItems.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="cooking" className="font-bold">Đang nấu ({cookingItems.length})</TabsTrigger>
          <TabsTrigger value="ready" className="font-bold">Chờ cung ứng ({readyItems.length})</TabsTrigger>
        </TabsList>

        {/* TAB 1: MÓN MỚI (PENDING) */}
        <TabsContent value="pending">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pendingItems.length === 0 ? <EmptyState /> : pendingItems.map((item) => (
              <KitchenItemCard 
                key={item.id} 
                item={item} 
                actionLabel="Nhận nấu"
                actionIcon={<ChefHat className="mr-2 h-4 w-4"/>}
                // [FIX] Truyền thêm orderId
                onAction={() => updateStatusMutation.mutate({ orderId: item.orderId, itemId: item.id, status: OrderStatus.Cooking })}
                variant="blue"
              />
            ))}
          </div>
        </TabsContent>

        {/* TAB 2: ĐANG NẤU (COOKING) */}
        <TabsContent value="cooking">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {cookingItems.length === 0 ? <EmptyState /> : cookingItems.map((item) => (
              <KitchenItemCard 
                key={item.id} 
                item={item} 
                actionLabel="Xong món"
                actionIcon={<CheckCircle2 className="mr-2 h-4 w-4"/>}
                // [FIX] Truyền thêm orderId
                onAction={() => updateStatusMutation.mutate({ orderId: item.orderId, itemId: item.id, status: OrderStatus.Ready })}
                variant="orange"
              />
            ))}
          </div>
        </TabsContent>

        {/* TAB 3: ĐÃ XONG (READY) */}
        <TabsContent value="ready">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {readyItems.length === 0 ? <EmptyState /> : readyItems.map((item) => (
              <KitchenItemCard 
                key={item.id} 
                item={item} 
                actionLabel="Đã bưng ra"
                actionIcon={<CheckCircle2 className="mr-2 h-4 w-4"/>}
                // [FIX] Truyền thêm orderId
                onAction={() => updateStatusMutation.mutate({ orderId: item.orderId, itemId: item.id, status: OrderStatus.Served })}
                variant="green"
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ... (Phần component con giữ nguyên)
function KitchenItemCard({ item, actionLabel, actionIcon, onAction, variant }: any) {
  const colors: any = {
    blue: "border-blue-200 bg-blue-50/50",
    orange: "border-orange-200 bg-orange-50/50",
    green: "border-green-200 bg-green-50/50",
  };

  return (
    <Card className={`shadow-sm border-2 ${colors[variant] || ""}`}>
      <CardHeader className="p-3 pb-0">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className="bg-white font-bold text-base px-3 py-1">
            {item.tableName}
          </Badge>
          <span className="text-xs text-muted-foreground flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {new Date(item.createdAtUtc || new Date()).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-lg leading-tight line-clamp-2">{item.productName}</h3>
          <span className="font-bold text-xl text-primary shrink-0">x{item.quantity}</span>
        </div>
        {item.note && (
          <div className="mt-2 text-sm bg-yellow-100 text-yellow-800 p-2 rounded-md border border-yellow-200 flex gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="font-medium italic">"{item.note}"</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-3 pt-0">
        <Button className="w-full font-bold shadow-md" onClick={onAction}>
          {actionIcon}
          {actionLabel}
        </Button>
      </CardFooter>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed rounded-xl">
      <ChefHat className="h-12 w-12 mb-3 opacity-20" />
      <p>Hiện không có món nào ở trạng thái này</p>
    </div>
  );
}