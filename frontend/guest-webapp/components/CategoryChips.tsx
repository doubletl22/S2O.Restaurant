"use client";

export type Chip = { id: string; name: string };

export default function CategoryChips({
  items,
  activeId,
  onPick
}: {
  items: Chip[];
  activeId: string;
  onPick: (id: string) => void;
}) {
  return (
    <div className="chips">
      {items.map((c) => (
        <button
          key={c.id}
          className={`chip ${activeId === c.id ? "chip-active" : ""}`}
          onClick={() => onPick(c.id)}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
