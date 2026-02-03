"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { useGuestCart } from "@/components/guest/guest-cart-context";
import { guestService } from "@/services/guest.service";
import { Category, Product } from "@/lib/types";
import { CategoryChips } from "@/components/guest/category-chips";
import { MenuItemCard } from "@/components/guest/menu-item-card";
import { BottomNavV2 } from "@/components/guest/bottom-nav-v2";

export default function GuestMenuPage() {
  const params = useParams<{ qrToken?: string | string[] }>();

  const qrToken = useMemo(() => {
    const t = params?.qrToken;
    return Array.isArray(t) ? t[0] : t;
  }, [params]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { setTableInfo } = useGuestCart();

  useEffect(() => {
    if (!qrToken) return;

    const fetchMenu = async () => {
      try {
        setLoading(true);

        const res = await guestService.getMenuByToken(qrToken);

        if (!res?.isSuccess) {
          toast.error("Không thể tải thực đơn", {
            description: res?.error?.description || "Vui lòng thử lại",
          });
          return;
        }

        setTableInfo(res.value.table);
        setCategories(res.value.menu?.categories || []);
        setProducts(res.value.menu?.products || []);
      } catch (e) {
        console.error(e);
        toast.error("Lỗi kết nối máy chủ");
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [qrToken, setTableInfo]);

  const filteredProducts =
    selectedCategory === null
      ? products
      : products.filter((p) => p.categoryId === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
        <div className="font-bold text-lg">Thực đơn</div>
      </div>

      <div className="sticky top-[56px] z-10 bg-gray-50 pt-2 pb-2">
        <CategoryChips
          categories={categories}
          selectedId={selectedCategory}
          onSelect={(id) => setSelectedCategory(id)}
        />
      </div>

      <div className="p-4 space-y-4">
        {!qrToken ? (
          <div className="text-center py-10 text-gray-400">
            Thiếu QR Token. Vui lòng quét lại mã QR.
          </div>
        ) : loading ? (
          <div className="text-center py-10 text-gray-400">Đang tải...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-10 text-gray-400">Không có món ăn.</div>
        ) : (
          filteredProducts.map((product) => (
            <MenuItemCard key={product.id} product={product} />
          ))
        )}
      </div>

      {!!qrToken && <BottomNavV2 qrToken={qrToken} />}
    </div>
  );
}
