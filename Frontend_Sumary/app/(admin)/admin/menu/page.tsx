"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"; // Dùng UI có sẵn
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Giả lập dữ liệu (Thay bằng gọi API thực tế từ backend của bạn)
const initialMenu = [
  { id: 1, name: "Phở Bò", price: 50000, category: "Món nước", status: "Còn món" },
  { id: 2, name: "Cơm Tấm", price: 45000, category: "Cơm", status: "Hết món" },
];

export default function MenuManagerPage() {
  const [products, setProducts] = useState(initialMenu);
  const [searchTerm, setSearchTerm] = useState("");

  // Logic gọi API (Thay thế cho adminApi.js cũ)
  // useEffect(() => {
  //   const fetchMenu = async () => {
  //      const res = await fetch('http://localhost:5000/api/products');
  //      const data = await res.json();
  //      setProducts(data);
  //   };
  //   fetchMenu();
  // }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý thực đơn</h1>
        <Button className="bg-orange-600 hover:bg-orange-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> Thêm món mới
        </Button>
      </div>

      {/* Thanh tìm kiếm và bộ lọc */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Danh sách món ăn</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm món ăn..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên món</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Giá bán</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.price.toLocaleString()} đ</TableCell>
                    <TableCell>
                      <Badge variant={product.status === "Còn món" ? "default" : "destructive"}>
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}