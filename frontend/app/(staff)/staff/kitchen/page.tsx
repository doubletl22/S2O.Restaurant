"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderStatus, StaffOrderDto } from "@/lib/types";
import { staffService } from "@/services/staff.service";
import { CheckCircle2 } from "lucide-react";

export default function KitchenPage() {
  const [orders, setOrders] = useState<StaffOrderDto[]>([]);

  const fetchOrders = async () => {
    try {
      const res: any = await staffService.getOrders(); 
      if (res.isSuccess && Array.isArray(res.value)) {
        // Lọc đơn có món cần nấu
        const activeOrders = res.value.filter((o: StaffOrderDto) => 
          o.items && o.items.some(i => i.status === OrderStatus.Pending || i.status === OrderStatus.Cooking)
        );
        setOrders(activeOrders);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleNextStatus = async (orderId: string, itemId: string, currentStatus: OrderStatus) => {
    const nextStatus = currentStatus === OrderStatus.Cooking ? OrderStatus.Ready : OrderStatus.Cooking;
    try {
      const res: any = await staffService.updateOrderItemStatus(orderId, itemId, nextStatus);
      if (res.isSuccess) {
        toast.success("Cập nhật thành công");
        fetchOrders();
      }
    } catch (e) { toast.error("Lỗi kết nối"); }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Bếp (KDS)</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {orders.map((order) => (
          <Card key={order.id} className="border-l-4 border-l-primary">
            <CardHeader><CardTitle>{order.tableName}</CardTitle></CardHeader>
            <CardContent>
              {order.items.filter(i => i.status < OrderStatus.Ready).map((item) => (
                <div key={item.id} className="border-b pb-2 mb-2">
                  <div className="flex justify-between">
                    <span>x{item.quantity} {item.productName}</span>
                  </div>
                  <Button size="sm" className="w-full mt-2" onClick={() => handleNextStatus(order.id, item.id, item.status)}>
                    {item.status === OrderStatus.Pending ? "Nấu" : "Xong"}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}