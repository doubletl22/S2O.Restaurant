"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useGuestCart } from "@/components/guest/guest-cart-context";
import { guestService } from "@/services/guest.service";
import { Category, Product } from "@/lib/types";
import { GuestHeader } from "@/components/guest/guest-header";
import { CategoryChips } from "@/components/guest/category-chips";
import { MenuItemCard } from "@/components/guest/menu-item-card";
import { BottomNavV2 } from "@/components/guest/bottom-nav-v2";

export default function GuestMenuPage({ params }: { params: { qrToken: string } }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  // [FIX] State selectedCategory cho phép null (đại diện cho "Tất cả")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { setTableInfo } = useGuestCart();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const res = await guestService.getMenuByToken(params.qrToken);
        
        if (res.isSuccess) {
          const validCategories = res.value.menu.categories.map((c: any) => ({
             ...c, isActive: true 
          }));
          setCategories(validCategories);
          setProducts(res.value.menu.products || []);
          setTableInfo(res.value.table); 
        } else {
          toast.error("Lỗi", { description: res.error?.description || "Không thể tải thực đơn" });
        }
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    fetchMenu();
  }, [params.qrToken, setTableInfo]);

  const filteredProducts = selectedCategory === null 
    ? products 
    : products.filter(p => p.categoryId === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <GuestHeader title="Thực đơn" />
      
      <div className="sticky top-16 z-10 bg-gray-50 pt-2 pb-2">
         {/* [FIX] Truyền đúng hàm onSelect nhận (string | null) */}
         <CategoryChips 
            categories={categories} 
            selectedId={selectedCategory}
            onSelect={(id) => setSelectedCategory(id)}
         />
      </div>

      <div className="p-4 space-y-4">
        {loading ? <div className="text-center py-10 text-gray-400">Đang tải...</div> : 
         filteredProducts.length === 0 ? <div className="text-center py-10 text-gray-400">Không có món ăn.</div> : 
         filteredProducts.map((product) => (
            <MenuItemCard key={product.id} product={product} />
         ))
        }
      </div>

      <BottomNavV2 qrToken={params.qrToken} />
    </div>
  );
}