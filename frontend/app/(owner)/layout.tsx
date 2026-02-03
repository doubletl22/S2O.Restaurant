import { OwnerSidebar } from "@/components/owner/owner-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // [FIX] Bọc toàn bộ layout trong SidebarProvider
    <SidebarProvider>
      <OwnerSidebar />
      
      {/* SidebarInset giúp nội dung tự động co giãn khi sidebar mở/đóng */}
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[-collapsible=icon]/sidebar-wrapper:h-12">
          {/* Nút đóng mở Sidebar */}
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          
          {/* Breadcrumb đơn giản */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/owner/dashboard">
                  S2O Restaurant
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Owner Portal</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        {/* Nội dung chính */}
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <main className="flex-1 py-4">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}