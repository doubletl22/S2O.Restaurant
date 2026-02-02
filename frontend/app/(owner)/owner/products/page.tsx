"use client";

import { useState } from "react";
import { useProducts, useDeleteProduct } from "@/hooks/use-products";
import { ProductDialog } from "@/components/owner/product-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Search, Trash2, Utensils } from "lucide-react";
import { formatCurrency } from "@/lib/utils"; // Hàm format tiền tệ (cần tạo thêm)

export default function ProductsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  
  // Fetch data (có thể thêm debounce cho keyword nếu muốn xịn hơn)
  const { data: products, isLoading } = useProducts({ keyword });
  const deleteMutation = useDeleteProduct();

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa món này?")) {
      deleteMutation.mutate(id);
    }
  };

  // Helper xử lý data trả về (vì API có thể trả PagedResult hoặc List)
  const items = Array.isArray(products) ? products : products?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý Món ăn</h1>
        <Button onClick={() => setIsOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Thêm món mới
        </Button>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm món ăn..."
            className="pl-9"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Ảnh</TableHead>
              <TableHead>Tên món</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Giá bán</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10">Đang tải dữ liệu...</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Chưa có món ăn nào</TableCell></TableRow>
            ) : (
              items.map((product: any) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Avatar className="h-10 w-10 rounded-md">
                      <AvatarImage src={product.imageUrl} className="object-cover" />
                      <AvatarFallback className="rounded-md"><Utensils className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  {/* Nếu API trả về tên category thì hiển thị, ko thì hiện ID tạm */}
                  <TableCell>{product.categoryName || "---"}</TableCell> 
                  <TableCell>{formatCurrency(product.price)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ProductDialog open={isOpen} onOpenChange={setIsOpen} />
    </div>
  );
}