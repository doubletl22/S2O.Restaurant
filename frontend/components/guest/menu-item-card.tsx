"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGuestCart } from "@/components/guest/guest-cart-context";

export function MenuItemCard({ product }: any) {
  const { addToCart } = useGuestCart();

  // ✅ SỬA ĐÚNG THEO ẢNH – KHÔNG DÙNG !product.isActive
  const disabled =
    product.isActive === false || product.isSoldOut === true;

  return (
    <div
      className={`relative flex gap-3 p-3 bg-white rounded-xl border shadow-sm ${
        disabled ? "opacity-60" : ""
      }`}
    >
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">
            No Image
          </div>
        )}
      </div>

      <div className="flex-1">
        <div className="font-semibold line-clamp-1">
          {product.name}
        </div>

        <div className="text-xs text-gray-500 line-clamp-2 mt-1">
          {product.description || "Không có mô tả"}
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="font-bold text-orange-600">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(product.price)}
          </div>

          {/* ✅ ADD TO CART ĐÚNG CHUẨN */}
          <Button
            size="icon"
            className="h-9 w-9 rounded-full"
            disabled={disabled}
            onClick={() =>
              addToCart(
                {
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  imageUrl: product.imageUrl,
                },
                ""
              )
            }
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ✅ BADGE TRẠNG THÁI */}
      {disabled && (
        <div className="absolute top-2 right-2">
          <span className="bg-black/75 text-white text-[10px] px-2 py-1 rounded-full font-semibold">
            {product.isSoldOut === true ? "HẾT HÀNG" : "TẠM NGƯNG"}
          </span>
        </div>
      )}
    </div>
  );
}
