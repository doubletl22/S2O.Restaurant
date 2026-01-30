"use client";

import { useEffect, useState } from "react";
import { Search, MapPin } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryChips } from "@/components/guest/category-chips";
import { MenuItemCard } from "@/components/guest/menu-item-card"; // Đã tạo ở bước trước

import { guestService } from "@/services/guest.service";
import { Category, Product, TableInfo } from "@/lib/types";

export default function GuestMenuPage({ params }: { params: { qrToken: string } }) {
  // State Data
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null);
  
  // State UI
  const [loading, setLoading] = useState(true);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Fetch Menu Data
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const res = await guestService.getMenuByToken(params.qrToken);
        
        if (res.isSuccess) {
          // Backend trả về: { menu: { categories, products }, table: ... }
          setCategories(res.value.menu.categories);
          setProducts(res.value.menu.products);
          setTableInfo(res.value.table);
        } else {
          toast.error("Không thể tải thực đơn", { description: res.error?.message });
        }
      } catch (error) {
        console.error("Error loading menu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [params.qrToken]);

  // 2. Filter Logic (Client-side)
  const filteredProducts = products.filter((p) => {
    // Lọc theo danh mục
    const matchCategory = selectedCatId ? p.categoryId === selectedCatId : true;
    // Lọc theo từ khóa tìm kiếm
    const matchSearch = searchTerm 
      ? p.name.toLowerCase().includes(searchTerm.toLowerCase()) 
      : true;
    
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-4">
      {/* Thông tin Bàn & Chi nhánh */}
      <div className="bg-card rounded-lg p-4 border shadow-sm">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ) : tableInfo ? (
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-bold text-lg">{tableInfo.branchName}</h2>
              <div className="flex items-center text-muted-foreground text-sm mt-1">
                <MapPin className="h-3.5 w-3.5 mr-1" />
                <span>{tableInfo.name}</span> 
                {/* Ví dụ: Bàn 05 - Tầng 1 */}
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md">
                Đang phục vụ
              </span>
            </div>
          </div>
        ) : (
          <div className="text-red-500 text-sm">Thông tin bàn không hợp lệ</div>
        )}
      </div>

      {/* Thanh Tìm kiếm (Sticky) */}
      <div className="sticky top-14.25 z-40 bg-gray-50/95 backdrop-blur py-2 -mx-4 px-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Tìm món ăn..." 
            className="pl-9 bg-white shadow-sm border-gray-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Danh mục */}
      <div className="-mx-4">
        {loading ? (
          <div className="flex gap-2 px-4 overflow-hidden">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
        ) : (
          <CategoryChips 
            categories={categories}
            selectedId={selectedCatId}
            onSelect={setSelectedCatId}
          />
        )}
      </div>

      {/* Danh sách món ăn Grid */}
      <div className="grid grid-cols-1 gap-4 pb-20">
        {loading ? (
          // Skeletons
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3 p-3 bg-card rounded-xl border">
               <Skeleton className="h-24 w-24 rounded-lg" />
               <div className="flex-1 space-y-2">
                 <Skeleton className="h-4 w-3/4" />
                 <Skeleton className="h-3 w-full" />
                 <Skeleton className="h-8 w-8 rounded-full mt-auto" />
               </div>
            </div>
          ))
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <MenuItemCard key={product.id} product={product} />
          ))
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <p>Không tìm thấy món ăn nào.</p>
          </div>
        )}
      </div>
    </div>
  );
}