"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Search, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock Data: Lịch sử đơn hàng
const MOCK_HISTORY = [
  { id: "ORD-009", date: "03/02/2026 12:30", table: "Bàn 01", items: "Lẩu Thái, Pepsi...", total: 450000, payment: "Tiền mặt", staff: "Nguyễn Văn A" },
  { id: "ORD-008", date: "03/02/2026 12:15", table: "Bàn 03", items: "Cà phê đen, Bạc xỉu", total: 65000, payment: "Chuyển khoản", staff: "Nguyễn Văn A" },
  { id: "ORD-007", date: "03/02/2026 11:45", table: "VIP 01", items: "Combo Sashimi VIP...", total: 2500000, payment: "Thẻ tín dụng", staff: "Trần Thị B" },
  { id: "ORD-006", date: "02/02/2026 19:30", table: "Bàn 02", items: "Cơm chiên, Canh chua", total: 120000, payment: "Tiền mặt", staff: "Nguyễn Văn A" },
];

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter đơn giản
  const filteredData = MOCK_HISTORY.filter(
    (item) =>
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.table.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Tính tổng doanh thu hiển thị
  const totalRevenue = filteredData.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
           <CalendarIcon className="h-6 w-6 text-primary" /> Lịch sử đơn hàng
        </h1>
        
        {/* Thanh tìm kiếm */}
        <div className="relative w-full md:w-75">
             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input 
                placeholder="Tìm mã đơn, tên bàn..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
        </div>
      </div>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Tổng đơn hàng</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{filteredData.length}</div></CardContent>
          </Card>
          <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Doanh thu (Hiển thị)</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold text-green-600">{totalRevenue.toLocaleString()}đ</div></CardContent>
          </Card>
      </div>

      {/* Bảng dữ liệu */}
      <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-25">Mã đơn</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Bàn</TableHead>
              <TableHead className="hidden md:table-cell">Tóm tắt món</TableHead>
              <TableHead>Nhân viên</TableHead>
              <TableHead>Thanh toán</TableHead>
              <TableHead className="text-right">Tổng tiền</TableHead>
              <TableHead className="w-12.5"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                        Không tìm thấy đơn hàng nào.
                    </TableCell>
                </TableRow>
            ) : (
                filteredData.map((order) => (
                <TableRow key={order.id} className="hover:bg-muted/20">
                    <TableCell className="font-mono font-medium">{order.id}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{order.date}</TableCell>
                    <TableCell><Badge variant="outline">{order.table}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell text-sm truncate max-w-50" title={order.items}>
                        {order.items}
                    </TableCell>
                    <TableCell className="text-sm">{order.staff}</TableCell>
                    <TableCell className="text-sm">{order.payment}</TableCell>
                    <TableCell className="text-right font-bold text-green-700">
                        {order.total.toLocaleString()}đ
                    </TableCell>
                    <TableCell>
                        <Button variant="ghost" size="icon" title="Xem chi tiết">
                            <Eye className="h-4 w-4 text-gray-500" />
                        </Button>
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}