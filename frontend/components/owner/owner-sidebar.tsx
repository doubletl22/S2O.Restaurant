"use client";

import {
  LayoutDashboard,
  Utensils,
  ListTree,
  QrCode,
  Store,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChefHat,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Định nghĩa cấu trúc menu theo nhóm
const menuGroups = [
  {
    label: "Tổng quan",
    items: [
      {
        title: "Dashboard",
        url: "/owner/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Quản lý Thực đơn",
    items: [
      {
        title: "Thực đơn", 
        url: "/owner/menu",
        icon: Utensils,
      },
      {
        title: "Mã QR",
        url: "/owner/qr-codes",
        icon: QrCode,
      }
    ],
  },
  {
    label: "Vận hành",
    items: [
      {
        title: "Chi nhánh",
        url: "/owner/branches",
        icon: Store,
      },
      {
        title: "Nhân viên",
        url: "/owner/staff",
        icon: Users,
      },
    ],
  },
  {
    label: "Báo cáo",
    items: [
      {
        title: "Doanh thu",
        url: "/owner/revenue",
        icon: BarChart3,
      },
    ],
  },
];

export function OwnerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile } = useSidebar();

  const handleLogout = () => {
    authService.logout();
    router.push("/login");
  };

  return (
    <Sidebar collapsible="icon">
      {/* Header: Logo Brand */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-2">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ChefHat className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">S2O Restaurant</span>
                <span className="truncate text-xs">Owner Portal</span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Content: Menu Items */}
      <SidebarContent>
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label}>
            {/* Ẩn label nếu sidebar bị thu nhỏ (collapsible='icon') nhưng shadcn thường tự xử lý */}
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer: User Profile & Settings */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {/* [FIX] Thêm suppressHydrationWarning để React bỏ qua lỗi lệch ID */}
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  suppressHydrationWarning 
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src="/placeholder-user.jpg" alt="Owner" />
                    <AvatarFallback className="rounded-lg">O</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Owner Admin</span>
                    <span className="truncate text-xs">owner@s2o.com</span>
                  </div>
                  <Settings className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem onClick={() => router.push("/owner/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Cài đặt tài khoản
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}