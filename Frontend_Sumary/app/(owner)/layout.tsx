import { OwnerSidebar } from "@/components/owner/owner-sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      {/* Sidebar cố định bên trái */}
      <aside className="hidden md:block fixed inset-y-0 left-0 z-10 w-64 bg-background">
        <OwnerSidebar />
      </aside>

      {/* Nội dung chính bên phải */}
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64 w-full">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
           {/* Mobile Menu Trigger có thể đặt ở đây (Sheet) */}
           <div className="flex-1">
             <h1 className="text-lg font-semibold">Trang quản trị</h1>
           </div>
           <div className="flex items-center gap-2">
             {/* User Avatar hoặc Info */}
             <span className="text-sm text-muted-foreground">Admin</span>
           </div>
        </header>
        
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0">
           {children}
        </main>
      </div>
    </div>
  );
}