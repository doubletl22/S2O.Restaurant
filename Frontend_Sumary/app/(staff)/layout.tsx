import React from "react";
import { StaffSidebar } from "@/components/staff/staff-sidebar";
import { StaffHeader } from "@/components/staff/staff-header"; // Import Header vừa tạo

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-[var(--bg)] overflow-hidden font-sans text-[var(--text)]">
      {/* 1. Sidebar: Cố định bên trái (Ẩn trên Mobile) */}
      <aside className="hidden md:flex h-full w-64 flex-col z-20">
        <StaffSidebar />
      </aside>

      {/* 2. Main Area: Chứa Header + Nội dung Page */}
      <div className="flex flex-1 flex-col h-full w-full overflow-hidden relative">
        
        {/* A. Header: Cố định trên cùng */}
        <StaffHeader />

        {/* B. Content Scrollable: Nội dung thay đổi (Kitchen Page) sẽ nằm ở đây */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-0 scroll-smooth">
          {/* Wrapper này để tạo khoảng cách đẹp */}
          <div className="mx-auto max-w-[1600px] h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}