import React from 'react';
import { Clock, CheckCircle, ChefHat, ArrowRight } from 'lucide-react';
import { type StaffOrderDto, OrderStatus } from '../types/order';

interface Props {
  order: StaffOrderDto;
  onNextStatus: (orderId: string, currentStatus: OrderStatus) => void;
  productMap: Record<string, string>; // Map ProductId -> Tên món
}

const OrderTicket: React.FC<Props> = ({ order, onNextStatus, productMap }) => {
  // Tính thời gian đã trôi qua
  const elapsedTime = Math.floor((new Date().getTime() - new Date(order.createdAtUtc).getTime()) / 60000); // Phút
  
  // Màu sắc theo trạng thái
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending: return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case OrderStatus.Confirmed: return 'bg-blue-50 border-blue-200 text-blue-800';
      case OrderStatus.Cooking: return 'bg-orange-50 border-orange-200 text-orange-800';
      case OrderStatus.Ready: return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getActionButton = () => {
    switch (order.status) {
      case OrderStatus.Pending:
        return { label: 'Nhận Đơn', icon: <CheckCircle size={18} />, color: 'bg-blue-600 hover:bg-blue-700' };
      case OrderStatus.Confirmed:
        return { label: 'Nấu Ngay', icon: <ChefHat size={18} />, color: 'bg-orange-600 hover:bg-orange-700' };
      case OrderStatus.Cooking:
        return { label: 'Báo Xong', icon: <CheckCircle size={18} />, color: 'bg-green-600 hover:bg-green-700' };
      case OrderStatus.Ready:
        return { label: 'Đã Phục Vụ', icon: <ArrowRight size={18} />, color: 'bg-gray-600 hover:bg-gray-700' };
      default:
        return null;
    }
  };

  const btn = getActionButton();

  return (
    <div className={`relative bg-white rounded-xl shadow-sm border-2 overflow-hidden flex flex-col h-full transition-all hover:shadow-md ${
      order.status === OrderStatus.Pending ? 'border-yellow-400 animate-pulse-slow' : 'border-transparent'
    }`}>
      {/* Header: Bàn & Thời gian */}
      <div className={`px-4 py-3 flex justify-between items-center border-b ${getStatusColor(order.status)}`}>
        <h3 className="text-lg font-bold">Bàn {order.tableId}</h3>
        <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full bg-white/50 ${elapsedTime > 15 ? 'text-red-600' : 'text-gray-700'}`}>
          <Clock size={12} className="mr-1" />
          {elapsedTime} phút
        </div>
      </div>

      {/* Body: Danh sách món */}
      <div className="p-4 flex-1 overflow-y-auto">
        {order.note && (
          <div className="mb-3 p-2 bg-red-50 text-red-600 text-sm italic rounded border border-red-100">
            ⚠️ Note: {order.note}
          </div>
        )}

        <ul className="space-y-3">
          {order.items.map((item, idx) => (
            <li key={idx} className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-semibold text-gray-800 text-base">
                  {productMap[item.productId] || `Món #${item.productId.substring(0, 4)}`}
                </div>
                {item.note && <div className="text-xs text-gray-500 mt-0.5">({item.note})</div>}
              </div>
              <span className="ml-3 font-bold text-lg text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md min-w-[30px] text-center">
                x{item.quantity}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer: Hành động */}
      {btn && (
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={() => onNextStatus(order.id, order.status)}
            className={`w-full py-3 rounded-lg text-white font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm ${btn.color}`}
          >
            {btn.icon} {btn.label}
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderTicket;