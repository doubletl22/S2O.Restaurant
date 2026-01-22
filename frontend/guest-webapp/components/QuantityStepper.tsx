"use client";

export default function QuantityStepper({
  value,
  onChange
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="stepper">
      <button className="stepbtn" onClick={() => onChange(Math.max(1, value - 1))}>
        −
      </button>
      <div className="stepval">{value}</div>
      <button className="stepbtn" onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  );
}
