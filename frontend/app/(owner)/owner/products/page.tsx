"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { ProductDialog } from "@/components/owner/product-dialog";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import { Product, Category } from "@/lib/types";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        productService.getAll({ pageIndex: 1, pageSize: 100 }), // [FIX] dùng getAll
        categoryService.getAll()
      ]);

      // [FIX] Xử lý Result<T>
      if (prodRes.isSuccess) setProducts(prodRes.value.items || prodRes.value);
      if (catRes.isSuccess) setCategories(catRes.value);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      const res = await productService.delete(productToDelete); // [FIX] dùng delete
      if (res.isSuccess) {
        toast.success("Đã xóa món ăn");
        loadData();
      } else {
        toast.error("Không thể xóa", { description: res.error?.message });
      }
    } catch (error) { console.error(error); } 
    finally { setProductToDelete(null); }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý Thực đơn</h1>
        <Button onClick={handleCreate}><Plus className="mr-2 h-4 w-4" /> Thêm món mới</Button>
      </div>

      <div className="flex items-center gap-2 bg-card p-2 rounded-md border w-full sm:max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground ml-2" />
        <Input 
          placeholder="Tìm kiếm..." 
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Ảnh</TableHead>
              <TableHead>Tên món</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Giá bán</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? Array.from({length:5}).map((_,i) => <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-10"/></TableCell></TableRow>) : 
             filteredProducts.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center h-24">Không có dữ liệu</TableCell></TableRow> :
             filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="h-10 w-10 rounded bg-muted overflow-hidden">
                       {product.imageUrl ? <img src={product.imageUrl} className="h-full w-full object-cover"/> : null}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{categories.find(c => c.id === product.categoryId)?.name || "---"}</TableCell>
                  <TableCell>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}</TableCell>
                  <TableCell><Badge variant={product.isActive ? "outline" : "destructive"}>{product.isActive ? "Bán" : "Ẩn"}</Badge></TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(product)}><Edit className="mr-2 h-4 w-4"/> Sửa</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setProductToDelete(product.id)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4"/> Xóa</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </div>

      {/* [FIX] Props: setOpen thay vì onOpenChange, product thay vì productToEdit */}
      <ProductDialog 
        open={isDialogOpen} 
        setOpen={setIsDialogOpen} // Component ProductDialog dùng setOpen
        categories={categories}
        product={editingProduct}  // Component ProductDialog dùng product
        onSuccess={loadData}
      />

      <AlertDialog open={!!productToDelete} onOpenChange={(o) => !o && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Xóa món ăn?</AlertDialogTitle><AlertDialogDescription>Hành động này không thể hoàn tác.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Hủy</AlertDialogCancel><AlertDialogAction onClick={confirmDelete} className="bg-red-600">Xóa</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}