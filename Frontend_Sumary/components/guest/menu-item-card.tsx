"use client";

import { Plus } from "lucide-react";
import { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useGuestCart } from "@/components/guest/guest-cart-context";
import { cn } from "@/lib/utils";

interface MenuItemCardProps {
  product: Product;
}

export function MenuItemCard({ product }: MenuItemCardProps) {
  const { addToCart } = useGuestCart();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

  return (
    <div className="flex gap-3 p-3 bg-card rounded-xl shadow-sm border border-border/50">
      {/* Ảnh món */}
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            No Image
          </div>
        )}
      </div>

      {/* Thông tin */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h3 className="font-semibold line-clamp-1">{product.name}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {product.description || "Không có mô tả"}
          </p>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-primary">{formatPrice(product.price)}</span>
          
          <Button
            size="icon"
            className="h-8 w-8 rounded-full shadow-md"
            onClick={() => addToCart(product)}
            disabled={!product.isActive || product.isSoldOut}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Overlay nếu hết hàng */}
      {(product.isSoldOut || !product.isActive) && (
        <div className="absolute inset-0 bg-background/60 flex items-center justify-center rounded-xl z-10">
          <span className="bg-black/70 text-white text-xs px-2 py-1 rounded font-bold uppercase">
            Hết hàng
          </span>
        </div>
      )}
    </div>
  );
}