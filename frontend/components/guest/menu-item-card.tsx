"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGuestCart } from "@/components/guest/guest-cart-context";

type MenuProduct = {
  id?: string;
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;

  // Backend có thể trả về nhiều kiểu field khác nhau
  isAvailable?: boolean | string | number;
  IsAvailable?: boolean | string | number;
};

// ✅ Ép kiểu boolean chắc chắn (chịu cả "true"/"false", 1/0)
function toBool(v: any, fallback: boolean) {
  if (v === undefined || v === null) return fallback;
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "true" || s === "1" || s === "yes") return true;
    if (s === "false" || s === "0" || s === "no") return false;
  }
  return fallback;
}

export function MenuItemCard({ product }: { product: MenuProduct }) {
  const { addToCart } = useGuestCart();

  // ✅ Logic đúng chuẩn nghiệp vụ: chỉ tin isAvailable/IsAvailable
  // mặc định AVAILABLE = true nếu backend không trả
  const available = toBool(product?.isAvailable ?? product?.IsAvailable, true);
  const disabled = !available;

  const priceNumber = typeof product?.price === "number" ? product.price : 0;

  return (
    <div
      className={`relative flex gap-3 p-3 bg-white rounded-xl border shadow-sm ${
        disabled ? "opacity-60" : ""
      }`}
    >
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {product?.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product?.name || "Menu item"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">
            No Image
          </div>
        )}
      </div>

      <div className="flex-1">
        <div className="font-semibold line-clamp-1">{product?.name || "Món"}</div>

        <div className="text-xs text-gray-500 line-clamp-2 mt-1">
          {product?.description || "Không có mô tả"}
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="font-bold text-orange-600">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(priceNumber)}
          </div>

          <Button
            size="icon"
            className="h-9 w-9 rounded-full"
            disabled={disabled}
            onClick={() =>
              addToCart(
                {
                  id: product?.id || "",
                  name: product?.name || "",
                  price: priceNumber,
                  imageUrl: product?.imageUrl,
                },
                ""
              )
            }
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ✅ Badge đúng như ảnh: disabled -> HẾT HÀNG */}
      {disabled && (
        <div className="absolute top-2 right-2">
          <span className="bg-black/75 text-white text-[10px] px-2 py-1 rounded-full font-semibold">
            HẾT HÀNG
          </span>
        </div>
      )}
    </div>
  );
}
