"use client";

import { useEffect, useState } from "react";
import { BellRing, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@/lib/types";
import { staffService, StaffOrderDto } from "@/services/staff.service";

export default function OrderTicketPage() {
  const [readyItems, setReadyItems] = useState<{order: StaffOrderDto, item: any}[]>([]);

  const fetchReadyItems = async () => {
    try {
      const res = await staffService.getOrders();
      if (res.isSuccess) {
        // Flatten list: Lấy tất cả item có status = Ready
        const items: {order: StaffOrderDto, item: any}[] = [];
        res.value.forEach(order => {
          order.items.forEach(item => {
            if (item.status === OrderStatus.Ready) {
              items.push({ order, item });
            }
          });
        });
        setReadyItems(items);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchReadyItems();
    const interval = setInterval(fetchReadyItems, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleServe = async (orderId: string, itemId: string) => {
    try {
      const res = await staffService.updateOrderItemStatus(orderId, itemId, OrderStatus.Served);
      if (res.isSuccess) {
        toast.success("Đã phục vụ khách");
        fetchReadyItems();
      }
    } catch (e) {
      toast.error("Có lỗi xảy ra");
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <BellRing className="h-6 w-6 text-orange-500" />
        Món chờ phục vụ (Ready)
      </h1>

      {readyItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-dashed">
          <p className="text-muted-foreground">Tất cả món đã được phục vụ.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {readyItems.map(({ order, item }) => (
            <Card key={`${order.id}-${item.id}`} className="p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                 <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-700">
                    {order.tableName}
                 </div>
                 <div>
                   <h3 className="font-bold text-lg">{item.productName}</h3>
                   <div className="flex gap-2 text-sm text-muted-foreground">
                     <Badge variant="outline">x{item.quantity}</Badge>
                     {item.note && <span className="text-red-500">Note: {item.note}</span>}
                   </div>
                 </div>
              </div>

              <Button onClick={() => handleServe(order.id, item.id)}>
                <Check className="mr-2 h-4 w-4" />
                Đã bưng
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}