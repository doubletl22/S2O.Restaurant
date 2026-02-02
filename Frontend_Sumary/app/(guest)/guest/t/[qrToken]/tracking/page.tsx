"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ChevronLeft, 
  RefreshCw, 
  Clock, 
  ChefHat, 
  CheckCircle2, 
  XCircle,
  Utensils
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { guestService } from "@/services/guest.service";
import { GuestOrderItem, OrderStatus } from "@/lib/types";

// Helper render trạng thái
const getStatusConfig = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.Pending:
      return { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock };
    case OrderStatus.Confirmed:
    case OrderStatus.Cooking:
      return { label: "Đang chế biến", color: "bg-blue-100 text-blue-700 border-blue-200", icon: ChefHat };
    case OrderStatus.Ready:
      return { label: "Đã xong", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 };
    case OrderStatus.Served:
      return { label: "Đã phục vụ", color: "bg-gray-100 text-gray-700 border-gray-200", icon: Utensils };
    case OrderStatus.Cancelled:
      return { label: "Đã hủy", color: "bg-red-50 text-red-600 border-red-200", icon: XCircle };
    default:
      return { label: status, color: "bg-gray-100 text-gray-700", icon: Clock };
  }
};

export default function TrackingPage({ params }: { params: { qrToken: string } }) {
  const [items, setItems] = useState<GuestOrderItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await guestService.getOrders(params.qrToken);
      if (res.isSuccess) {
        setItems(res.value.items);
        setTotalAmount(res.value.totalAmount);
      }
    } catch (error) {
      console.error(error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    
    // Tự động refresh mỗi 15s để cập nhật trạng thái
    const interval = setInterval(() => {
      fetchOrders(false);
    }, 15000);

    return () => clearInterval(interval);
  }, [params.qrToken]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

  return (
    <div className="flex flex-col min-h-[calc(100vh-60px)] space-y-4">
      {/* Header Nav */}
      <div className="flex items-center justify-between px-4 py-2 bg-background border-b sticky top-0 z-10">
        <Link 
          href={`/guest/t/${params.qrToken}`} 
          className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Menu
        </Link>
        <span className="font-semibold text-sm">Đơn hàng của bạn</span>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8" 
          onClick={() => {
            fetchOrders(true);
            toast.info("Đã cập nhật trạng thái");
          }}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 px-4 pb-20">
        {loading && items.length === 0 ? (
          <div className="space-y-4 pt-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-16 w-16 rounded-md" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="bg-muted p-4 rounded-full">
               <Utensils className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Bạn chưa gọi món nào.</p>
            <Link href={`/guest/t/${params.qrToken}`}>
              <Button>Xem Menu ngay</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            {/* Group items by logic: Active (Pending/Cooking) first, then Served/Cancelled */}
            <div className="space-y-4">
               {items.map((item) => {
                 const statusInfo = getStatusConfig(item.status);
                 const Icon = statusInfo.icon;

                 return (
                   <div key={item.id} className="bg-card border rounded-lg p-3 shadow-sm flex gap-3">
                     {/* Image */}
                     <div className="h-16 w-16 shrink-0 rounded-md bg-muted overflow-hidden">
                       {item.imageUrl ? (
                         <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
                       ) : (
                         <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground">IMG</div>
                       )}
                     </div>

                     {/* Content */}
                     <div className="flex-1 min-w-0">
                       <div className="flex justify-between items-start">
                          <h4 className="font-medium text-sm truncate pr-2">{item.productName}</h4>
                          <span className="font-semibold text-sm">x{item.quantity}</span>
                       </div>
                       
                       <div className="mt-2 flex justify-between items-end">
                          <Badge variant="outline" className={`${statusInfo.color} gap-1 px-2 py-0.5 h-6`}>
                            <Icon className="h-3 w-3" />
                            {statusInfo.label}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                       </div>
                       
                       {item.note && (
                         <p className="text-xs text-muted-foreground mt-2 italic bg-muted/50 p-1 rounded">
                           Note: {item.note}
                         </p>
                       )}
                     </div>
                   </div>
                 );
               })}
            </div>

            <Separator />
            
            {/* Bill Info */}
            <div className="bg-muted/30 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tổng số món</span>
                <span>{items.reduce((acc, i) => acc + i.quantity, 0)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Tạm tính</span>
                <span className="text-primary">{formatPrice(totalAmount)}</span>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                *Vui lòng thanh toán tại quầy thu ngân khi ra về.
              </p>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
  );
}
