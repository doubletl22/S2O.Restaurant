"use client";

import { cn } from "@/lib/utils";
import { Category } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface CategoryChipsProps {
  categories: Category[];
  selectedId: string | null; // null = chọn "Tất cả"
  onSelect: (id: string | null) => void;
}

export function CategoryChips({ categories, selectedId, onSelect }: CategoryChipsProps) {
  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
      <div className="flex gap-2 px-4">
        {/* Nút "Tất cả" */}
        <button
          onClick={() => onSelect(null)}
          className={cn(
            "flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            selectedId === null
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          Tất cả
        </button>

        {/* Các danh mục khác */}
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={cn(
              "flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              selectedId === cat.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}