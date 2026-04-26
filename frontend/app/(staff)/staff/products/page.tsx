"use client";

import { useMemo, useState } from "react";
import { ProductDialog } from "@/components/owner/product-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProducts } from "@/hooks/use-products";
import { formatCurrency } from "@/lib/utils";
import { Search, Pencil, Utensils } from "lucide-react";

export default function StaffProductsPage() {
  const [keyword, setKeyword] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const { data: products, isLoading } = useProducts({ keyword });

  const items = useMemo(() => {
    if (Array.isArray(products)) return products;
    return products?.items || [];
  }, [products]);

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setIsOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setEditingProduct(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Chinh Sua Mon An</h1>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tim kiem mon an..."
            className="pl-9"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Anh</TableHead>
              <TableHead>Ten mon</TableHead>
              <TableHead>Danh muc</TableHead>
              <TableHead>Gia ban</TableHead>
              <TableHead className="text-right">Hanh dong</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  Dang tai du lieu...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  Chua co mon an nao
                </TableCell>
              </TableRow>
            ) : (
              items.map((product: any) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Avatar className="h-10 w-10 rounded-md">
                      <AvatarImage src={product.imageUrl} className="object-cover" />
                      <AvatarFallback className="rounded-md">
                        <Utensils className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.categoryName || "---"}</TableCell>
                  <TableCell>{formatCurrency(product.price)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ProductDialog open={isOpen} onOpenChange={handleOpenChange} productToEdit={editingProduct} />
    </div>
  );
}
