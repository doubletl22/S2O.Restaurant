"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2 } from "lucide-react";

// Dữ liệu giả lập (Sau này sẽ gọi API GetOrders)
const MOCK_TICKETS = [
  {
    id: "T001",
    tableName: "Bàn 01",
    time: "10:30",
    status: "Pending",
    items: [
      { name: "Phở Bò Đặc Biệt", quantity: 2, note: "Không hành" },
      { name: "Trà Đá", quantity: 2 },
    ]
  },
  {
    id: "T002",
    tableName: "Bàn 05",
    time: "10:32",
    status: "Cooking",
    items: [
      { name: "Cơm Rang Dưa Bò", quantity: 1 },
    ]
  }
];

export default function KitchenPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
           <Clock className="h-6 w-6 text-orange-500" /> Bếp - Danh sách món cần làm
        </h1>
        <div className="flex gap-2">
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending: 2</Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Cooking: 1</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {MOCK_TICKETS.map((ticket) => (
          <Card key={ticket.id} className="border-l-4 border-l-orange-500 shadow-md">
            <CardHeader className="pb-2 bg-muted/20">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{ticket.tableName}</CardTitle>
                <span className="text-sm font-mono text-muted-foreground">{ticket.time}</span>
              </div>
              <Badge variant={ticket.status === "Pending" ? "destructive" : "default"}>
                {ticket.status}
              </Badge>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <ul className="space-y-2">
                {ticket.items.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-start text-sm border-b pb-2 last:border-0">
                    <div>
                        <span className="font-bold mr-2">{item.quantity}x</span>
                        <span>{item.name}</span>
                        {item.note && <div className="text-xs text-red-500 italic mt-0.5">Note: {item.note}</div>}
                    </div>
                  </li>
                ))}
              </ul>
              
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="mr-2 h-4 w-4" /> Báo đã xong
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}