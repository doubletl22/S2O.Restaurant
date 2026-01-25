"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // 1. Import chuẩn từ next/navigation
import { getCookie } from "cookies-next";    // 2. Import để kiểm tra đăng nhập
import { OrderTicket } from "@/components/staff/order-ticket";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flame, Utensils, CheckCircle, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";

// --- Types ---
export type OrderStatus = "Pending" | "Cooking" | "Ready" | "Served" | "Cancelled";

export interface OrderItem {
  id: number;
  productId: number;
  name: string;
  quantity: number;
  note?: string;
  status: string;
}

export interface Order {
  id: string;
  tableNumber: string;
  startTime: string;
  status: OrderStatus;
  items: OrderItem[];
}

export default function KitchenPage() {
  // 3. Khởi tạo router (viết thường)
  const router = useRouter();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  // 4. Kiểm tra đăng nhập ngay khi vào trang
  useEffect(() => {
    const token = getCookie("access_token");
    if (!token) {
      // Nếu không có token, đá về trang login
      router.push("/login"); // Dùng router viết thường
    }
  }, [router]);

  const fetchOrders = async () => {
    // Chỉ fetch nếu đã có token (tránh gọi API khi chưa login)
    if (!getCookie("access_token")) return;

    setIsLoading(true);
    try {
      const response = await api.get<Order[]>('/orders/branch-orders', {
        params: { statuses: ['Pending', 'Cooking', 'Ready'] }
      });
      setOrders(response.data);
    } catch (error) {
      console.error("Lỗi tải đơn:", error);
      // Không cần toast lỗi 401 vì interceptor đã lo rồi
    } finally {
      setIsLoading(false);
    }
  };

  // Setup Polling (Gọi lại mỗi 30s)
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const previousOrders = [...orders];
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as OrderStatus } : o))
    );

    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Cập nhật trạng thái: ${newStatus}`);
      if (newStatus === 'Ready') setTimeout(fetchOrders, 500);
    } catch (error) {
      setOrders(previousOrders);
      toast.error("Lỗi cập nhật. Thử lại sau.");
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return order.status !== "Ready" && order.status !== "Served";
    return order.status === activeTab;
  });

  return (
    <div className="h-full flex flex-col space-y-4 p-4 md:p-6 bg-(--bg) min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2 text-(--text)">
            <Flame className="text-orange-500 fill-orange-500" /> Bếp Trung Tâm
          </h1>
          <p className="text-muted-foreground text-sm">
            Hiện có <span className="font-bold text-orange-600">{orders.filter(o => o.status !== "Ready").length}</span> đơn hàng chờ.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="icon" onClick={fetchOrders}>
             <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 sm:w-100">
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="Pending" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                <Utensils className="w-4 h-4 mr-2" /> Chờ nấu
              </TabsTrigger>
              <TabsTrigger value="Cooking" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">
                <Flame className="w-4 h-4 mr-2" /> Đang nấu
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {isLoading && orders.length === 0 ? (
         <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div></div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4 pb-20">
          {filteredOrders.map((order) => (
            <div key={order.id} className="break-inside-avoid mb-4">
              <OrderTicket 
                order={{ ...order, startTime: new Date(order.startTime) }} 
                onStatusChange={handleStatusChange} 
              />
            </div>
          ))}
        </div>
      )}
      
      {!isLoading && filteredOrders.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <CheckCircle className="w-12 h-12 mb-2 opacity-20" />
          <p>Không có đơn hàng nào.</p>
        </div>
      )}
    </div>
  );
}