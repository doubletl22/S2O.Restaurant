"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Armchair } from "lucide-react";

// Dữ liệu giả lập (Sau này gọi API GetTables)
const MOCK_TABLES = [
  { id: "1", name: "Bàn 01", status: "Free", capacity: 4 },
  { id: "2", name: "Bàn 02", status: "Occupied", capacity: 4, activeOrderId: "O-123" },
  { id: "3", name: "Bàn 03", status: "Free", capacity: 2 },
  { id: "4", name: "VIP 01", status: "Free", capacity: 10 },
  { id: "5", name: "Bàn 04", status: "Serving", capacity: 6 },
];

export default function TablesPage() {
  const router = useRouter();

  const handleSelectTable = (tableId: string) => {
    // Chuyển sang trang POS của bàn đó
    router.push(`/staff/pos/${tableId}`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Sơ đồ bàn</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {MOCK_TABLES.map((table) => {
          const isOccupied = table.status !== "Free";
          
          return (
            <Card 
                key={table.id} 
                className={`cursor-pointer hover:shadow-lg transition-all border-2 
                    ${isOccupied 
                        ? "border-red-200 bg-red-50 hover:border-red-400" 
                        : "border-green-200 bg-green-50 hover:border-green-400"
                    }`}
                onClick={() => handleSelectTable(table.id)}
            >
              <CardContent className="p-4 flex flex-col items-center justify-center h-32 relative">
                <div className="absolute top-2 right-2">
                    <Badge variant={isOccupied ? "destructive" : "outline"} className={!isOccupied ? "bg-white text-green-700 border-green-200" : ""}>
                        {isOccupied ? "Có khách" : "Trống"}
                    </Badge>
                </div>
                
                <div className={`p-3 rounded-full mb-2 ${isOccupied ? "bg-red-200 text-red-700" : "bg-green-200 text-green-700"}`}>
                    <Armchair className="h-6 w-6" />
                </div>
                
                <h3 className="font-bold text-lg">{table.name}</h3>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Users className="h-3 w-3 mr-1" /> {table.capacity} chỗ
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}