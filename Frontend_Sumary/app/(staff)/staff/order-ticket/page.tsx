"use client";

import React from "react";
import { Clock, CheckCircle2, ChefHat, AlertCircle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// 1. Cập nhật Type khớp hoàn toàn với Backend (PascalCase)
export type TicketStatus = "Pending" | "Cooking" | "Ready" | "Served" | "Cancelled";

export interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  note?: string;
  status: string; 
}

export interface OrderTicketProps {
  order: {
    id: string;
    tableNumber: string;
    startTime: Date;
    status: TicketStatus; // Type mới (Viết hoa)
    items: OrderItem[];
  };
  onStatusChange: (orderId: string, newStatus: string) => void;
}

export function OrderTicket({ order, onStatusChange }: OrderTicketProps) {
  // Tính thời gian đã trôi qua
  const elapsedMinutes = Math.floor((new Date().getTime() - order.startTime.getTime()) / 60000);
  
  const isUrgent = elapsedMinutes > 15;
  const timeColor = isUrgent ? "text-red-600 bg-red-50" : "text-blue-600 bg-blue-50";
  const borderColor = isUrgent ? "border-red-200" : "border-gray-200";

  return (
    <Card className={`w-full shadow-sm hover:shadow-md transition-shadow border-2 ${borderColor}`}>
      {/* Header */}
      <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between bg-gray-50/50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-lg font-black px-2 py-1 bg-white border-black/10">
            Bàn {order.tableNumber}
          </Badge>
          {isUrgent && <AlertCircle size={16} className="text-red-500 animate-pulse" />}
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold ${timeColor}`}>
          <Clock size={12} />
          <span>{elapsedMinutes}p</span>
        </div>
      </CardHeader>

      <Separator />

      {/* Body */}
      <CardContent className="p-0">
        <ScrollArea className="h-[200px] w-full p-3">
          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start text-sm group">
                <div className="flex gap-2">
                  <span className="font-bold text-[var(--g1)] w-5 text-right">{item.quantity}x</span>
                  <div>
                    {/* Kiểm tra status 'Done' (Backend thường trả về Done hoặc Served) */}
                    <span className={`font-medium ${['Done', 'Served', 'Cancelled'].includes(item.status) ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {item.name}
                    </span>
                    {item.note && (
                      <p className="text-xs text-gray-500 italic mt-0.5">Note: {item.note}</p>
                    )}
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center cursor-pointer hover:border-orange-500">
                   {(item.status === 'Done' || item.status === 'Served') && <div className="w-3 h-3 bg-orange-500 rounded-full" />}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>

      <Separator />

      {/* Footer: Cập nhật điều kiện so sánh sang PascalCase */}
      <CardFooter className="p-3 bg-gray-50/50 rounded-b-lg">
        {order.status === "Pending" && (
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
            // Gửi 'Cooking' (Viết hoa)
            onClick={() => onStatusChange(order.id, "Cooking")}
          >
            <ChefHat className="mr-2 h-4 w-4" /> Nhận nấu
          </Button>
        )}
        
        {order.status === "Cooking" && (
          <Button 
            className="w-full bg-gradient-to-r from-[var(--g1)] to-[var(--g2)] text-white font-bold shadow-md hover:opacity-90"
            // Gửi 'Ready' (Viết hoa)
            onClick={() => onStatusChange(order.id, "Ready")}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" /> Hoàn tất
          </Button>
        )}

        {order.status === "Ready" && (
          <Button variant="outline" className="w-full text-green-600 border-green-200 bg-green-50" disabled>
            <CheckCircle2 className="mr-2 h-4 w-4" /> Đã xong
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}