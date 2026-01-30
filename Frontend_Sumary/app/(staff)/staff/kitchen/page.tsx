"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@/lib/types";
import { staffService, StaffOrderDto } from "@/services/staff.service";

export default function KitchenPage() {
  const [orders, setOrders] = useState<StaffOrderDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Auto-refresh logic
  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Bếp chỉ quan tâm món: Pending (Mới) hoặc Cooking (Đang nấu)
      // Giả sử API trả về list orders có chứa các item này
      const res = await staffService.getOrders(); 
      if (res.isSuccess) {
        // Lọc Client-side chỉ lấy đơn có món chưa xong (Tùy backend logic)
        const activeOrders = res.value.filter(o => 
          o.items.some(i => i.status === OrderStatus.Pending || i.status === OrderStatus.Cooking)
        );
        setOrders(activeOrders);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => fetchOrders(), 15000); // 15s refresh
    return () => clearInterval(interval);
  }, []);

  // Xử lý chuyển trạng thái: Pending -> Cooking -> Ready
  const handleNextStatus = async (orderId: string, itemId: string, currentStatus: OrderStatus) => {
    let nextStatus = OrderStatus.Cooking;
    if (currentStatus === OrderStatus.Cooking) nextStatus = OrderStatus.Ready;

    try {
      const res = await staffService.updateOrderItemStatus(orderId, itemId, nextStatus);
      if (res.isSuccess) {
        toast.success(nextStatus === OrderStatus.Ready ? "Món đã xong!" : "Đã nhận nấu");
        fetchOrders(); // Refresh ngay
      }
    } catch (e) {
      toast.error("Lỗi cập nhật");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="h-6 w-6 text-primary" />
          Bếp / Bar (KDS)
        </h1>
        <Button variant="outline" size="sm" onClick={() => fetchOrders()}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {orders.length === 0 && !loading && (
          <div className="col-span-full text-center py-20 text-muted-foreground">
            Hiện không có món nào cần chế biến.
          </div>
        )}

        {orders.map((order) => (
          <Card key={order.id} className="border-l-4 border-l-primary shadow-sm flex flex-col">
            <CardHeader className="pb-2 bg-muted/20">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-bold">{order.tableName}</CardTitle>
                <span className="text-xs text-muted-foreground font-mono">
                  {new Date(order.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-4 flex-1 flex flex-col gap-3">
              {order.items
                .filter(i => i.status === OrderStatus.Pending || i.status === OrderStatus.Cooking)
                .map((item) => (
                <div key={item.id} className="border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="font-medium text-base">
                      <span className="font-bold text-primary mr-2">x{item.quantity}</span>
                      {item.productName}
                    </div>
                  </div>
                  
                  {item.note && (
                    <div className="text-sm text-red-600 italic mt-1 bg-red-50 p-1 rounded border border-red-100">
                      Ghi chú: {item.note}
                    </div>
                  )}

                  <div className="mt-3 flex justify-end">
                    {item.status === OrderStatus.Pending ? (
                      <Button 
                        size="sm" 
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleNextStatus(order.id, item.id, item.status)}
                      >
                        Bắt đầu nấu
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => handleNextStatus(order.id, item.id, item.status)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Báo xong
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}