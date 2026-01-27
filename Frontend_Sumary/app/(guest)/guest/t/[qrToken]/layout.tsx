import { GuestCartProvider } from '@/components/guest/guest-cart-context';
import { BottomNavV2 } from '@/components/guest/bottom-nav-v2';

// 1. Định nghĩa params là Promise (theo chuẩn Next.js 15+)
interface GuestLayoutProps {
  children: React.ReactNode;
  params: Promise<{ qrToken: string }>;
}

export default async function GuestLayout({
  children,
  params,
}: GuestLayoutProps) {
  // 2. Phải await params trước khi sử dụng
  const { qrToken } = await params;

  return (
    <GuestCartProvider>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <main className="flex-1 pb-20">
            {children}
        </main>
        
        {/* Truyền qrToken (đã await) xuống */}
        <BottomNavV2 tableId={qrToken} />
      </div>
    </GuestCartProvider>
  );
}