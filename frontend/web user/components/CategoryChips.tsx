<<<<<<< HEAD
"use client";

import { MenuCategory } from "@/lib/types";

export default function CategoryChips({
  categories,
  activeId,
  onChange,
}: {
  categories: MenuCategory[];
  activeId: string | "all";
  onChange: (id: string | "all") => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <button
        className={`px-3 py-1 rounded-full border text-sm whitespace-nowrap ${
          activeId === "all" ? "bg-black text-white" : ""
        }`}
        onClick={() => onChange("all")}
      >
        Tất cả
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          className={`px-3 py-1 rounded-full border text-sm whitespace-nowrap ${
            activeId === c.id ? "bg-black text-white" : ""
          }`}
          onClick={() => onChange(c.id)}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
=======
"use client";

import { MenuCategory } from "@/lib/types";

export default function CategoryChips({
  categories,
  activeId,
  onChange,
}: {
  categories: MenuCategory[];
  activeId: string | "all";
  onChange: (id: string | "all") => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <button
        className={`px-3 py-1 rounded-full border text-sm whitespace-nowrap ${
          activeId === "all" ? "bg-black text-white" : ""
        }`}
        onClick={() => onChange("all")}
      >
        Tất cả
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          className={`px-3 py-1 rounded-full border text-sm whitespace-nowrap ${
            activeId === c.id ? "bg-black text-white" : ""
          }`}
          onClick={() => onChange(c.id)}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
>>>>>>> b6136e036fc676c4b81d4adbb0e4f55082d26efd
