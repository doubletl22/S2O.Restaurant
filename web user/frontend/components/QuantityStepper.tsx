"use client";

export default function QuantityStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="inline-flex items-center gap-2">
      <button className="w-8 h-8 rounded-lg border" onClick={() => onChange(Math.max(1, value - 1))}>
        -
      </button>
      <div className="min-w-6 text-center">{value}</div>
      <button className="w-8 h-8 rounded-lg border" onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  );
}
