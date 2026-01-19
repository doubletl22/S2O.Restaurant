// src/pages/KitchenBoard.tsx
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { LogOut, ChefHat, Clock, CheckCircle } from 'lucide-react';

// Import TYPE ONLY để tránh lỗi verbatimModuleSyntax
import { type StaffOrderDto, OrderStatus } from '../types/order'; 
import { type ProductDto } from '../types/catalog';

import { orderApi } from '../api/orderApi';
import { catalogApi } from '../api/catalogApi';
import { useSignalR } from '../hooks/useSignalR';

// Định nghĩa payload của Token JWT
interface TokenPayload {
  tenant_id: string;
  branch_id: string;
  sub: string; // User ID
  exp: number;
}

const KitchenBoard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<StaffOrderDto[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Lấy và giải mã Token
  const token = localStorage.getItem('accessToken');
  const userPayload = useMemo(() => {
    if (!token) return null;
    try {
      return jwtDecode<TokenPayload>(token);
    } catch (e) {
      console.error("Lỗi decode token", e);
      return null;
    }
  }, [token]);

  // Nếu không có user hợp lệ, chuyển về login
  useEffect(() => {
    if (!userPayload) navigate('/login');
  }, [userPayload, navigate]);

  // 2. Kích hoạt SignalR
  useSignalR(userPayload?.branch_id);

  // 3. Hàm tải dữ liệu (dùng useCallback để không bị tạo lại mỗi lần render)
  const fetchData = useCallback(async () => {
    if (!userPayload) return;
    
    setIsLoading(true);
    try {
      // Gọi song song 2 API: Lấy đơn hàng & Lấy Menu để map tên
      const [ordersData, menuData] = await Promise.all([
        orderApi.getOrders(), 
        catalogApi.getMenu(userPayload.tenant_id)
      ]);
      
      // Sắp xếp đơn: Mới nhất lên đầu
      const sortedOrders = ordersData.sort((a, b) => 
        new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime()
      );

      setOrders(sortedOrders);
      setProducts(menuData);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      // Nếu lỗi 401 Unauthorized thì đá ra login
      if ((error as any)?.response?.status === 401) {
          handleLogout();
      }
    } finally {
      setIsLoading(false);
    }
  }, [userPayload]);

  // 4. Map ProductId sang Tên món và Giá
  const productMap = useMemo(() => {
    const map: Record<string, { name: string; price: number }> = {};
    products.forEach(p => {
      map[p.id] = { name: p.name, price: p.price };
    });
    return map;
  }, [products]);

  // 5. Effect chính
  useEffect(() => {
    fetchData();

    // Lắng nghe sự kiện từ useSignalR bắn ra
    const handleSignalRUpdate = () => {
        console.log("♻️ Có đơn mới, đang tải lại...");
        // Chỉ tải lại list order cho nhẹ, không cần tải lại menu
        orderApi.getOrders().then(data => {
            const sorted = data.sort((a, b) => new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime());
            setOrders(sorted);
        });
    };

    window.addEventListener('ORDER_UPDATED', handleSignalRUpdate);
    return () => window.removeEventListener('ORDER_UPDATED', handleSignalRUpdate);
  }, [fetchData]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  // Logic chuyển trạng thái: Pending -> Confirmed -> Cooking -> Ready -> Served
  const handleNextStatus = async (orderId: string, currentStatus: OrderStatus) => {
    // Ép kiểu currentStatus sang number để cộng (vì OrderStatus là const object)
    const nextStatus = (currentStatus as number) + 1;
    
    // Kiểm tra giới hạn (Served = 4)
    if (nextStatus > OrderStatus.Served) return;

    try {
        await orderApi.updateStatus(orderId, nextStatus as OrderStatus);
        // Reload nhẹ danh sách
        const updatedOrders = orders.map(o => 
            o.id === orderId ? { ...o, status: nextStatus as OrderStatus, statusName: getStatusName(nextStatus) } : o
        );
        setOrders(updatedOrders);
    } catch (error) {
        alert("Không thể cập nhật trạng thái!");
    }
  };

  // Helper hiển thị tên trạng thái tiếng Việt
  const getStatusName = (status: number) => {
      switch(status) {
          case OrderStatus.Pending: return "Chờ xác nhận";
          case OrderStatus.Confirmed: return "Đã nhận";
          case OrderStatus.Cooking: return "Đang nấu";
          case OrderStatus.Ready: return "Đã xong";
          case OrderStatus.Served: return "Đã phục vụ";
          case OrderStatus.Cancelled: return "Đã hủy";
          default: return "Không rõ";
      }
  };

  // Helper hiển thị màu sắc badge
  const getStatusColor = (status: number) => {
      switch(status) {
          case OrderStatus.Pending: return "bg-yellow-100 text-yellow-800 border-yellow-300";
          case OrderStatus.Cooking: return "bg-orange-100 text-orange-800 border-orange-300";
          case OrderStatus.Ready: return "bg-green-100 text-green-800 border-green-300";
          default: return "bg-gray-100 text-gray-800 border-gray-300";
      }
  };

  if (!userPayload) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2 text-blue-600">
                <ChefHat size={32} />
                <h1 className="text-2xl font-bold">Bếp Trung Tâm</h1>
            </div>
            <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500 hidden md:inline">
                    Chi nhánh: <span className="font-mono text-gray-700">{userPayload.branch_id.substring(0, 8)}...</span>
                </span>
                <button 
                    onClick={handleLogout} 
                    className="flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition"
                >
                    <LogOut size={18} className="mr-2"/> Đăng xuất
                </button>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {isLoading && orders.length === 0 ? (
            <div className="text-center py-20 text-gray-500">Đang tải dữ liệu...</div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {orders.map((order) => (
                <div key={order.id} className={`bg-white rounded-lg shadow-md overflow-hidden border-t-4 ${order.status === OrderStatus.Pending ? 'border-yellow-400 animate-pulse' : 'border-blue-500'}`}>
                    
                    {/* Card Header */}
                    <div className="p-4 border-b bg-gray-50 flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">Bàn {order.tableId}</h3>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                                <Clock size={12} className="mr-1"/>
                                {new Date(order.createdAtUtc).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                            </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wide rounded border ${getStatusColor(order.status as number)}`}>
                            {getStatusName(order.status as number)}
                        </span>
                    </div>

                    {/* Card Body: Danh sách món */}
                    <div className="p-4 space-y-3">
                        {order.note && (
                            <div className="p-2 bg-yellow-50 text-yellow-800 text-sm italic rounded border border-yellow-200">
                                📝 Note: {order.note}
                            </div>
                        )}

                        <ul className="divide-y divide-gray-100">
                            {order.items.map((item, idx) => {
                                const productInfo = productMap[item.productId];
                                return (
                                    <li key={idx} className="py-2 flex justify-between items-center">
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-800">
                                                {productInfo ? productInfo.name : `Món #${item.productId.substring(0,4)}`}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {/* Nếu có option/topping thì hiện ở đây */}
                                            </div>
                                        </div>
                                        <span className="ml-3 text-lg font-bold text-blue-600 bg-blue-50 px-2 rounded">
                                            x{item.quantity}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Card Footer: Actions */}
                    <div className="p-4 bg-gray-50 border-t">
                        {(order.status as number) < OrderStatus.Served ? (
                            <button 
                                onClick={() => handleNextStatus(order.id, order.status)}
                                className="w-full flex justify-center items-center py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow-sm transition active:scale-95"
                            >
                                <CheckCircle size={18} className="mr-2" />
                                {order.status === OrderStatus.Pending ? "Nhận đơn" : 
                                 order.status === OrderStatus.Cooking ? "Báo xong" : "Phục vụ"}
                            </button>
                        ) : (
                            <div className="text-center text-gray-400 font-medium py-2">
                                Đã hoàn thành
                            </div>
                        )}
                    </div>
                </div>
                ))}
            </div>
        )}
      </main>
    </div>
  );
};

export default KitchenBoard;