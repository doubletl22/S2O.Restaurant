import { useEffect, useState, useMemo } from 'react';
import { useSignalR } from '../hooks/useSignalR';
import { orderApi } from '../api/orderApi';
import { catalogApi } from '../api/catalogApi';
import { type StaffOrderDto, OrderStatus } from '../types/order';
import { jwtDecode } from "jwt-decode";
import OrderTicket from '../components/OrderTicket';
import { LogOut, Filter, Wifi, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const KitchenBoard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<StaffOrderDto[]>([]);
  const [productMap, setProductMap] = useState<Record<string, string>>({});
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [isConnected, setIsConnected] = useState(false);

  // 1. Lấy Token & BranchId
  const token = localStorage.getItem('accessToken');
  const userPayload = useMemo(() => {
    if (!token) return null;
    try { return jwtDecode<{ branch_id: string; tenant_id: string }>(token); } 
    catch { return null; }
  }, [token]);

  // 2. Setup SignalR
  const connection = useSignalR(userPayload?.branch_id);
  useEffect(() => {
    setIsConnected(!!connection);
  }, [connection]);

  // 3. Load Data (Orders & Menu)
  useEffect(() => {
    if (!userPayload) { navigate('/login'); return; }

    const loadData = async () => {
      try {
        const [ordersData, menuData] = await Promise.all([
          orderApi.getOrders(), // Mặc định lấy các đơn chưa hoàn thành
          catalogApi.getMenu(userPayload.tenant_id)
        ]);
        
        // Map Product Name
        const map: Record<string, string> = {};
        menuData.forEach((p: any) => map[p.id] = p.name);
        setProductMap(map);
        
        setOrders(ordersData);
      } catch (err) { console.error(err); }
    };

    loadData();

    // Lắng nghe real-time update
    const handleUpdate = () => {
        orderApi.getOrders().then(setOrders);
    };
    window.addEventListener('ORDER_UPDATED', handleUpdate);
    return () => window.removeEventListener('ORDER_UPDATED', handleUpdate);
  }, [userPayload, navigate]);

  // Handle Action
  const handleNextStatus = async (orderId: string, currentStatus: OrderStatus) => {
    try {
      const nextStatus = (currentStatus + 1) as OrderStatus;
      await orderApi.updateStatus(orderId, nextStatus);
      // Optimistic update UI
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
    } catch (e) { alert("Lỗi cập nhật!"); }
  };

  // Filter Logic
  const filteredOrders = orders
    .filter(o => filterStatus === 'ALL' || o.status === filterStatus)
    .sort((a, b) => new Date(a.createdAtUtc).getTime() - new Date(b.createdAtUtc).getTime()); // Cũ nhất lên đầu

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-20 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg font-bold">KDS</div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Bếp Trung Tâm</h1>
            <div className="flex items-center text-xs text-gray-500">
              {isConnected ? <Wifi size={12} className="text-green-500 mr-1"/> : <WifiOff size={12} className="text-red-500 mr-1"/>}
              {isConnected ? 'Online' : 'Offline'} • Chi nhánh: {userPayload?.branch_id?.substring(0,8)}...
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: OrderStatus.Pending, label: 'Chờ nhận' },
            { id: OrderStatus.Cooking, label: 'Đang nấu' },
            { id: OrderStatus.Ready, label: 'Trả món' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as any)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                filterStatus === tab.id 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {/* Badge số lượng (Optional) */}
              <span className="ml-2 bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full text-xs">
                {tab.id === 'ALL' ? orders.length : orders.filter(o => o.status === tab.id).length}
              </span>
            </button>
          ))}
        </div>

        <button onClick={() => { localStorage.removeItem('accessToken'); navigate('/login'); }} className="text-gray-400 hover:text-red-600">
          <LogOut size={20} />
        </button>
      </header>

      {/* MAIN BOARD */}
      <main className="flex-1 p-6 overflow-y-auto">
        {filteredOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Filter size={48} className="mb-4 opacity-20" />
            <p>Không có đơn hàng nào ở trạng thái này</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredOrders.map(order => (
              <div key={order.id} className="h-full">
                <OrderTicket 
                  order={order} 
                  productMap={productMap} 
                  onNextStatus={handleNextStatus} 
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default KitchenBoard;