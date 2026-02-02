"use client";

import { useState, useEffect } from "react";
import { useCategories, useDeleteCategory } from "@/hooks/use-categories";
import { useProducts, useDeleteProduct } from "@/hooks/use-products";
import { CategoryDialog } from "@/components/owner/category-dialog";
import { ProductDialog } from "@/components/owner/product-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, Search, MoreVertical, Edit, Trash2, Utensils, FolderOpen, Loader2 
} from "lucide-react";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { formatCurrency, cn } from "@/lib/utils";

export default function MenuPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");

  const [isCatDialogOpen, setIsCatDialogOpen] = useState(false);
  const [isProdDialogOpen, setIsProdDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  
  const { data: categories, isLoading: isLoadingCats } = useCategories();
  
  const { data: productsData, isLoading: isLoadingProds } = useProducts({ 
    categoryId: selectedCategoryId || undefined,
    keyword 
  });
  
  const deleteCategoryMutation = useDeleteCategory();
  const deleteProductMutation = useDeleteProduct();

  const products = Array.isArray(productsData) ? productsData : (productsData?.items || []);

  useEffect(() => {
    if (!selectedCategoryId && categories && categories.length > 0) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col gap-4 md:flex-row">
      
      {/* CỘT TRÁI: DANH MỤC */}
      <Card className="w-full md:w-1/4 flex flex-col h-full border-r">
        <CardHeader className="p-4 border-b flex flex-row items-center justify-between bg-muted/20">
          <CardTitle className="text-base font-semibold">Danh mục</CardTitle>
          <Button size="sm" variant="outline" onClick={() => { setEditingCategory(null); setIsCatDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Thêm
          </Button>
        </CardHeader>
        
        <CardContent className="p-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="flex flex-col p-2 gap-1">
              {isLoadingCats ? (
                <div className="flex justify-center p-4"><Loader2 className="animate-spin h-5 w-5 text-muted-foreground"/></div>
              ) : categories?.length === 0 ? (
                <div className="text-center p-4 text-sm text-muted-foreground">Chưa có danh mục</div>
              ) : (
                categories?.map((cat: any) => (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={cn(
                      "group flex items-center justify-between p-3 rounded-md cursor-pointer transition-all text-sm font-medium border border-transparent",
                      selectedCategoryId === cat.id 
                        ? "bg-primary/10 text-primary border-primary/20 shadow-sm" 
                        : "hover:bg-muted hover:border-muted-foreground/10"
                    )}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FolderOpen className={cn("h-4 w-4 shrink-0", selectedCategoryId === cat.id ? "fill-primary/20" : "")} />
                      <span className="truncate">{cat.name}</span>
                    </div>
                    
                    <div className={cn("opacity-0 group-hover:opacity-100 transition-opacity", selectedCategoryId === cat.id && "opacity-100")}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditingCategory(cat); setIsCatDialogOpen(true); }}>
                            <Edit className="mr-2 h-4 w-4" /> Đổi tên
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600" 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              if(confirm(`Xóa danh mục "${cat.name}"?`)) {
                                deleteCategoryMutation.mutate(cat.id); 
                                if (selectedCategoryId === cat.id) setSelectedCategoryId(null);
                              }
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* CỘT PHẢI: MÓN ĂN */}
      <Card className="flex-1 flex flex-col h-full overflow-hidden shadow-none border-0 md:border">
        <CardHeader className="p-4 border-b bg-background z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm món ăn theo tên..."
                className="pl-9 bg-muted/50"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <Button onClick={() => setIsProdDialogOpen(true)} disabled={!selectedCategoryId}>
              <Plus className="mr-2 h-4 w-4" /> Thêm món mới
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex-1 bg-muted/5 relative">
          <ScrollArea className="h-full p-4">
            {isLoadingProds ? (
              <div className="flex flex-col items-center justify-center h-full py-20">
                <Loader2 className="animate-spin h-8 w-8 text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Đang tải món ăn...</p>
              </div>
            ) : !selectedCategoryId ? (
               <div className="flex flex-col items-center justify-center h-full py-20 text-muted-foreground">
                <FolderOpen className="h-12 w-12 mb-4 opacity-20" />
                <p>Vui lòng chọn một danh mục bên trái</p>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-20 text-muted-foreground">
                <Utensils className="h-12 w-12 mb-4 opacity-20" />
                <p className="mb-4">Danh mục này chưa có món ăn nào.</p>
                <Button variant="outline" onClick={() => setIsProdDialogOpen(true)}>
                  Thêm món đầu tiên
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
                {products.map((prod: any) => (
                  <Card key={prod.id} className="overflow-hidden group hover:shadow-lg transition-all border-muted">
                    {/* [FIX] Tailwind Warning: aspect-[4/3] -> aspect-4/3 */}
                    <div className="aspect-4/3 relative bg-secondary">
                      {prod.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={prod.imageUrl} 
                          alt={prod.name} 
                          className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
                          <Utensils className="h-10 w-10 opacity-10" />
                        </div>
                      )}
                      
                      {/* [FIX] Tailwind Warning: translate-y-[-10px] -> -translate-y-2.5 */}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all -translate-y-2.5 group-hover:translate-y-0">
                         <Button 
                            size="icon" 
                            variant="destructive" 
                            className="h-8 w-8 shadow-sm" 
                            onClick={(e) => { 
                              e.stopPropagation();
                              if(confirm(`Xóa món "${prod.name}"?`)) deleteProductMutation.mutate(prod.id); 
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                         </Button>
                      </div>
                      
                      <div className="absolute bottom-2 left-2">
                        <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm shadow-sm text-foreground font-bold border-0">
                          {formatCurrency(prod.price)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="p-3">
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <h3 className="font-semibold truncate flex-1" title={prod.name}>{prod.name}</h3>
                        <Badge variant={prod.isActive ? "outline" : "destructive"} className="text-[10px] px-1.5 h-5 shrink-0">
                          {prod.isActive ? "Bán" : "Hết"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 h-8 leading-4">
                        {prod.description || "Không có mô tả chi tiết"}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* ================= DIALOGS ================= */}
      <CategoryDialog 
        open={isCatDialogOpen} 
        onOpenChange={setIsCatDialogOpen} 
        categoryToEdit={editingCategory}
        // [FIX] Error 2741: Thêm prop onSuccess
        onSuccess={() => setIsCatDialogOpen(false)}
      />
      
      <ProductDialog 
        open={isProdDialogOpen} 
        onOpenChange={setIsProdDialogOpen} 
        defaultCategoryId={selectedCategoryId} 
      />
    </div>
  );
}