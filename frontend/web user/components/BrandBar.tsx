<<<<<<< HEAD
import Image from "next/image";

export default function BrandBar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 py-4">
      <div className="w-10 h-10 relative">
        {/* Bạn đặt logo vào: /public/logo.png */}
        <Image src="/logo.png" alt="The Six Restaurant" fill className="object-contain" />
      </div>
      <div>
        <div className="font-semibold">{title}</div>
        {subtitle && <div className="text-xs opacity-70">{subtitle}</div>}
      </div>
    </div>
  );
}
=======
import Image from "next/image";

export default function BrandBar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 py-4">
      <div className="w-10 h-10 relative">
        {/* Bạn đặt logo vào: /public/logo.png */}
        <Image src="/logo.png" alt="The Six Restaurant" fill className="object-contain" />
      </div>
      <div>
        <div className="font-semibold">{title}</div>
        {subtitle && <div className="text-xs opacity-70">{subtitle}</div>}
      </div>
    </div>
  );
}
>>>>>>> b6136e036fc676c4b81d4adbb0e4f55082d26efd
