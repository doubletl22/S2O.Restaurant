import React from "react"
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex bg-[#f6f7fb]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-h-screen lg:pl-0 pl-0">
        <AdminHeader />
        <main className="flex-1 p-6 pt-4 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
