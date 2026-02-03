"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Clock, DollarSign, ChefHat, CheckCircle2, Receipt } from "lucide-react";

// Mock Data: Các đơn hàng đang phục vụ
const MOCK_ACTIVE_ORDERS = [
  {
    id: "ORD-001",
    tableName: "Bàn 01",
    checkIn: "10:30",
    status: "Cooking", // Pending, Cooking, Served, PaymentPending
    total: 350000,
    items: [
      { name: "Lẩu Thái Hải Sản", qty: 1, price: 250000, status: "Cooking" },
      { name: "Pepsi", qty: 2, price: 20000, status: "Served" },
      { name: "Khoai tây chiên", qty: 1, price: 40000, status: "Pending" },
    ]
  },
  {
    id: "ORD-002",
    tableName: "Bàn 05",
    checkIn: "11:00",
    status: "Served",
    total: 120000,
    items: [
      { name: "Cơm chiên dưa bò", qty: 2, price: 60000, status: "Served" },
    ]
  },
  {
    id: "ORD-003",
    tableName: "VIP 02",
    checkIn: "11:15",
    status: "PaymentPending",
    total: 1500000,
    items: [
      { name: "Combo Sashimi", qty: 1, price: 1200000, status: "Served" },
      { name: "Rượu Sake", qty: 1, price: 300000, status: "Served" },
    ]
  }
];

export default function OrderTicketPage() {
  const [orders, setOrders] = useState(MOCK_ACTIVE_ORDERS);

  // Helper hiển thị trạng thái
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending": return <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50">Chờ bếp</Badge>;
      case "Cooking": return <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">Đang nấu</Badge>;
      case "Served": return <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">Đã ra món</Badge>;
      case "PaymentPending": return <Badge variant="default" className="bg-purple-600">Chờ thanh toán</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handlePayment = (orderId: string) => {
    if(confirm("Xác nhận thanh toán cho đơn hàng này?")) {
        // Gọi API thanh toán
        alert("Thanh toán thành công! (Demo)");
        setOrders(prev => prev.filter(o => o.id !== orderId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
           <ClipboardListIcon className="h-6 w-6 text-primary" /> Quản lý đơn hàng (Active)
        </h1>
        <Badge variant="secondary" className="text-lg px-4 py-1">
            Tổng: {orders.length} bàn
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order) => (
          <Card key={order.id} className="flex flex-col h-125 shadow-md border-t-4 border-t-primary">
            {/* Header Card */}
            <CardHeader className="bg-muted/10 pb-3">
              <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-xl font-bold text-primary">{order.tableName}</CardTitle>
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" /> Vào lúc: {order.checkIn}
                    </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-mono text-gray-400">#{order.id}</span>
                    {getStatusBadge(order.status)}
                </div>
              </div>
            </CardHeader>

            <Separator />

            {/* Danh sách món ăn (Scrollable) */}
            <CardContent className="flex-1 p-0">
                <ScrollArea className="h-75 p-4">
                    <div className="space-y-3">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-start text-sm">
                                <div className="flex gap-2">
                                    <span className="font-bold w-6 text-center bg-gray-100 rounded text-xs py-0.5">{item.qty}x</span>
                                    <div>
                                        <div className="font-medium">{item.name}</div>
                                        {/* Status món nhỏ */}
                                        <div className="text-[10px] text-muted-foreground flex items-center mt-0.5">
                                            {item.status === 'Cooking' && <ChefHat className="h-3 w-3 mr-1 text-blue-500"/>}
                                            {item.status === 'Served' && <CheckCircle2 className="h-3 w-3 mr-1 text-green-500"/>}
                                            {item.status}
                                        </div>
                                    </div>
                                </div>
                                <div className="font-mono text-gray-600">
                                    {(item.price * item.qty).toLocaleString()}đ
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>

            <Separator />

            {/* Footer: Tổng tiền & Nút Action */}
            <CardFooter className="flex-col gap-3 pt-4 bg-muted/10">
                <div className="flex justify-between w-full items-center">
                    <span className="text-muted-foreground font-medium">Tổng tiền:</span>
                    <span className="text-xl font-bold text-red-600">
                        {order.total.toLocaleString()}đ
                    </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 w-full">
                    <Button variant="outline" className="w-full">
                        <Receipt className="h-4 w-4 mr-2" /> In tạm tính
                    </Button>
                    <Button className="w-full" onClick={() => handlePayment(order.id)}>
                        <DollarSign className="h-4 w-4 mr-2" /> Thanh toán
                    </Button>
                </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Icon component nhỏ
function ClipboardListIcon(props: any) {
    return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>
    )
}