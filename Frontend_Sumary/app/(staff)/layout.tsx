import React from "react";
import { StaffSidebar } from "@/components/staff/staff-sidebar"; // Import đúng đường dẫn

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-(--bg)">
      {/* Sidebar cố định bên trái (chỉ hiện trên màn hình to) */}
      <aside className="hidden md:block h-full">
        <StaffSidebar />
      </aside>

      {/* Nội dung chính cuộn được */}
      <main className="flex-1 overflow-auto relative">
        {/* Nút bật menu mobile có thể thêm ở đây nếu cần */}
        {children}
      </main>
    </div>
  );
}