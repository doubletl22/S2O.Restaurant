'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Trash2, Send, Minus, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { guestService } from '@/services/guest.service'
// 1. Import Hook Context
import { useGuestCart } from '@/components/guest/guest-cart-context';

export default function CartPage() {
  const params = useParams();
  const router = useRouter();
  const tableId = params?.qrToken as string;
  const [branchId, setBranchId] = useState<string | null>(null);
  const [tableName, setTableName] = useState("Khách");
  const { cartItems, updateQuantity, removeFromCart, clearCart, totalAmount } = useGuestCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tenantId, setTenantId] = useState<string | null>(null);

  // 3. Lấy thông tin Tenant (để biết gửi đơn cho quán nào)
  useEffect(() => {
    const fetchTenant = async () => {
        if (!tableId) return;
        const info = await guestService.getTableInfo(tableId);
        if(info) {
            setTenantId(info.tenantId);
            setBranchId(info.branchId); 
            setTableName(info.tableName);
        }
    }
    fetchTenant();
  }, [tableId]);

  const handlePlaceOrder = async () => {
    // Kiểm tra đủ thông tin
    if (!tenantId || !branchId) {
        toast.error("Đang tải thông tin bàn...");
        const info = await guestService.getTableInfo(tableId);
        if (info) {
            setTenantId(info.tenantId);
            setBranchId(info.branchId);
        } else {
            return;
        }
    }

    try {
      setIsSubmitting(true);
      
      const payload = {
        tableId: tableId,
        tenantId: tenantId!,
        branchId: branchId!,
        guestName: tableName, 
        guestPhone: "",      
        items: cartItems.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            note: item.note || ''
        }))
      };

      const result = await guestService.placeGuestOrder(payload);
      
      if (result.isSuccess || result) { // Check linh hoạt tùy backend trả về
        toast.success("Đặt món thành công! Bếp đang chuẩn bị.");
        
        // 4. Xóa giỏ hàng trong Context sau khi đặt thành công
        clearCart();
        
        // Chuyển sang trang theo dõi
        router.push(`/guest/t/${tableId}/tracking`); 
      } else {
        toast.error("Đặt món thất bại. Vui lòng thử lại.");
      }

    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi gửi đơn.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <Trash2 className="text-gray-400 w-8 h-8" />
        </div>
        <p className="text-gray-500 mb-4 font-medium">Giỏ hàng của bạn đang trống</p>
        <Button onClick={() => router.back()} variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50">
            Quay lại Menu
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col pb-20">
      {/* Header */}
      <header className="bg-white p-4 sticky top-0 shadow-sm z-10 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="font-bold text-lg">Giỏ hàng ({cartItems.length} món)</h1>
      </header>

      {/* List Items */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {cartItems.map((item) => (
          <div key={item.id} className="bg-white p-3 rounded-xl shadow-sm flex gap-3">
            {/* Ảnh món */}
            <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-100">
               <img 
                 src={item.imageUrl || "/placeholder.jpg"} 
                 alt={item.name}
                 className="w-full h-full object-cover" 
                 onError={(e) => (e.currentTarget.src = '/placeholder.svg')}
               />
            </div>

            {/* Thông tin & Nút bấm */}
            <div className="flex-1 flex flex-col justify-between">
                <div>
                    <h4 className="font-bold text-gray-800 line-clamp-1">{item.name}</h4>
                    <p className="text-orange-600 font-semibold">{item.price.toLocaleString()}đ</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                    {/* Bộ tăng giảm số lượng từ Context */}
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-100">
                        <button 
                            onClick={() => updateQuantity(item.id, -1)} 
                            className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm active:scale-95 transition-all"
                        >
                            <Minus className="w-3 h-3 text-gray-600" />
                        </button>
                        <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                        <button 
                            onClick={() => updateQuantity(item.id, 1)} 
                            className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm active:scale-95 transition-all"
                        >
                            <Plus className="w-3 h-3 text-gray-600" />
                        </button>
                    </div>
                    
                    {/* Nút xóa */}
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8" 
                        onClick={() => removeFromCart(item.id)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Checkout */}
      <div className="bg-white p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] sticky bottom-0 z-20">
        <div className="flex justify-between mb-4 text-sm">
            <span className="text-gray-500">Tạm tính ({cartItems.length} món):</span>
            <span className="font-bold text-lg text-gray-800">{totalAmount.toLocaleString()}đ</span>
        </div>
        <Button 
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-6 rounded-xl text-base flex gap-2 shadow-lg shadow-orange-200"
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
        >
            {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
            {isSubmitting ? 'Đang gửi...' : `Gửi gọi món • ${totalAmount.toLocaleString()}đ`}
        </Button>
      </div>
    </div>
  )
}