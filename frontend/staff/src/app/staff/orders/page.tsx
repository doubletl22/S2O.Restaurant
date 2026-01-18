"use client";

import { useEffect, useState, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import api from "@/lib/api";
import { Order } from "@/types";
import { format } from "date-fns";
import { Bell, CheckCircle, ChefHat, LogOut, Utensils, Wifi, WifiOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function KitchenDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();

  // Hàm tải danh sách đơn
  const fetchOrders = async () => {
    try {
      // Lọc các đơn chưa hoàn thành (tránh load đơn cũ quá nhiều)
      // Backend cần hỗ trợ ?status=... nếu muốn tối ưu
      const res = await api.get("/staff/orders");
      
      // Sắp xếp: Đơn mới nhất lên đầu
      const sorted = res.data.sort((a: Order, b: Order) => 
        new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime()
      );
      setOrders(sorted);
    } catch (err) {
      console.error("Lỗi tải API:", err);
      // Nếu lỗi 401 thì đá về login
      if ((err as any).response?.status === 401) router.push("/staff/login");
    }
  };

  // Setup SignalR & Initial Data
  useEffect(() => {
    // 1. Tải dữ liệu lần đầu
    fetchOrders();

    const branchId = localStorage.getItem("branchId");
    if (!branchId) {
      alert("Thiếu thông tin chi nhánh. Vui lòng đăng nhập lại.");
      router.push("/staff/login");
      return;
    }

    // 2. Cấu hình SignalR
    const hubUrl = process.env.NEXT_PUBLIC_HUB_URL || "http://localhost:5000/hubs/orders";
    
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // 3. Khởi động kết nối
    connection.start()
      .then(() => {
        console.log("✅ SignalR Connected!");
        setIsConnected(true);
        // Join vào nhóm chi nhánh
        connection.invoke("JoinBranch", branchId);
      })
      .catch((err) => console.error("❌ SignalR Connection Error:", err));

    // 4. Lắng nghe sự kiện
    connection.on("NewOrderCreated", (data) => {
      console.log("🔔 CÓ ĐƠN MỚI:", data);
      
      // Phát âm thanh
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log("Trình duyệt chặn autoplay:", e));
      }

      // Reload danh sách
      fetchOrders();
    });

    connection.on("OrderStatusUpdated", (data) => {
      console.log("🔄 Trạng thái đơn thay đổi:", data);
      fetchOrders();
    });

    // Cleanup
    return () => {
      connection.stop();
    };
  }, [router]);

  // Hàm cập nhật trạng thái
  const updateStatus = async (orderId: string, newStatus: number) => {
    try {
      // Gọi API cập nhật
      await api.put(`/staff/orders/${orderId}/status`, newStatus, {
        headers: { "Content-Type": "application/json" } // Axios xử lý số int thành json
      });
      
      // UI sẽ tự cập nhật nhờ SignalR bắn event về, 
      // nhưng để nhanh thì gọi fetch luôn
      setTimeout(fetchOrders, 200); 
    } catch (err) {
      alert("Lỗi cập nhật trạng thái!");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/staff/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      {/* Âm thanh ẩn */}
      <audio ref={audioRef} src="/sounds/ding.mp3" />

      {/* Header Dashboard */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-orange-100 p-2">
            <ChefHat className="h-8 w-8 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Bếp & Bar</h1>
            <p className="text-sm text-gray-500">Monitor theo dõi đơn hàng</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {isConnected ? <Wifi size={18} /> : <WifiOff size={18} />}
            {isConnected ? "LIVE" : "DISCONNECTED"}
          </div>
          
          <button onClick={handleLogout} className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50">
            <LogOut size={18} /> Thoát
          </button>
        </div>
      </div>

      {/* Grid Đơn hàng */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {orders.length === 0 && (
          <div className="col-span-full py-20 text-center text-gray-400">
            <Utensils className="mx-auto mb-4 h-16 w-16 opacity-20" />
            <p className="text-xl">Hiện chưa có đơn hàng nào...</p>
          </div>
        )}

        {orders.map((order) => (
          <div 
            key={order.id} 
            className={`flex flex-col overflow-hidden rounded-xl border-t-4 bg-white shadow-sm transition-all hover:shadow-md
              ${order.status === 0 ? 'border-red-500 ring-2 ring-red-100' : // Mới
                order.status === 1 ? 'border-blue-500' :  // Đã nhận
                order.status === 2 ? 'border-orange-500' : // Đang nấu
                'border-green-500 opacity-70' // Xong
              }`}
          >
            {/* Card Content */}
            <div className="flex-1 p-4">
              <div className="mb-3 flex items-start justify-between">
                <span className="rounded bg-gray-100 px-2 py-1 text-lg font-bold text-gray-800">
                  {order.tableId === "Mang về" ? "🥡 Mang về" : `Bàn ${order.tableId}`}
                </span>
                <span className="text-sm font-mono text-gray-500">
                  {format(new Date(order.createdAtUtc), "HH:mm")}
                </span>
              </div>

              {/* Note đặc biệt */}
              {order.note && (
                <div className="mb-3 rounded-md bg-yellow-50 p-2 text-sm text-yellow-800 border border-yellow-100">
                  📝 <b>Ghi chú:</b> {order.note}
                </div>
              )}

              {/* Danh sách món */}
              <div className="space-y-3 border-t border-dashed pt-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-base">
                    <span className="font-bold text-gray-800 text-lg">{item.quantity}x</span>
                    <span className="flex-1 px-3 text-gray-700">
                      {/* TODO: Join tên món từ Catalog. Tạm thời hiện ID rút gọn */}
                      Món #{item.productId.substring(0, 5)}...
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="bg-gray-50 p-3">
              {order.status === 0 && (
                <button 
                  onClick={() => updateStatus(order.id, 1)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-bold text-white shadow-blue-200 hover:bg-blue-700 active:scale-95"
                >
                  <CheckCircle size={20} /> NHẬN ĐƠN
                </button>
              )}

              {order.status === 1 && (
                <button 
                  onClick={() => updateStatus(order.id, 2)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-3 font-bold text-white hover:bg-orange-600 active:scale-95"
                >
                  <Utensils size={20} /> NẤU NGAY
                </button>
              )}

              {order.status === 2 && (
                <button 
                  onClick={() => updateStatus(order.id, 3)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-3 font-bold text-white hover:bg-green-700 active:scale-95"
                >
                  <Bell size={20} /> BÁO XONG
                </button>
              )}

              {order.status >= 3 && (
                <div className="flex items-center justify-center gap-2 py-2 font-bold text-green-600">
                  <CheckCircle size={20} /> ĐÃ HOÀN THÀNH
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}