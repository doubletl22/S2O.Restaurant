import { SysAdminSidebar } from '@/components/sysadmin/sysadmin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header' // Tạm dùng lại header cũ hoặc tạo mới

export default function SysAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <SysAdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}