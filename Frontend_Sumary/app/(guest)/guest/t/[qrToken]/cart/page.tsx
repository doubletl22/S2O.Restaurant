"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Minus, Plus, Trash2, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useGuestCart } from "@/components/guest/guest-cart-context";
import { guestService } from "@/services/guest.service";
// import { GuestHeader } from "@/components/guest/guest-header"; // Tạm bỏ nếu GuestHeader chưa fix props
import { BottomNavV2 } from "@/components/guest/bottom-nav-v2";

export default function CartPage({ params }: { params: { qrToken: string } }) {
  const router = useRouter();
  const { cart, tableInfo, setTableInfo, clearCart, totalAmount, removeFromCart, updateQuantity } = useGuestCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Nếu chưa có thông tin bàn trong context (do reload), fetch lại từ API
    if (!tableInfo && params.qrToken) {
       guestService.resolveTable(params.qrToken).then((data) => {
         if (data) setTableInfo(data);
       });
    }
  }, [tableInfo, params.qrToken, setTableInfo]);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    
    if (!tableInfo) {
      toast.error("Thiếu thông tin bàn", { description: "Vui lòng quét lại mã QR." });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        tenantId: tableInfo.tenantId,
        branchId: tableInfo.branchId,
        tableId: tableInfo.tableId,
        items: cart.map((item) => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          note: item.note || "", 
        })),
      };

      const res: any = await guestService.placeOrder(payload);

      if (res.isSuccess) {
        toast.success("Đặt món thành công!");
        clearCart();
        router.push(`/guest/t/${params.qrToken}/tracking`);
      } else {
        toast.error("Đặt món thất bại", {
          description: res?.error?.message || "Vui lòng thử lại.",
        });
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatMoney = (v: number) => 
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header thay thế */}
      <div className="bg-white p-4 shadow-sm flex items-center gap-2 sticky top-0 z-10">
         <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5"/>
         </Button>
         <h1 className="font-bold text-lg">Giỏ hàng</h1>
      </div>

      <div className="p-4 space-y-4">
        {cart.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p>Giỏ hàng trống</p>
            <Button variant="link" onClick={() => router.push(`/guest/t/${params.qrToken}`)}>
              Quay lại thực đơn
            </Button>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.cartId} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{item.name}</h4>
                {item.note && <p className="text-xs text-gray-500 mt-1">Ghi chú: {item.note}</p>}
                <div className="text-sm font-semibold text-orange-600 mt-1">{formatMoney(item.price)}</div>
              </div>

              <div className="flex flex-col items-end gap-3">
                <button onClick={() => removeFromCart(item.cartId)} className="text-gray-400 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
                
                <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                  <button 
                    onClick={() => updateQuantity(item.cartId, -1)}
                    className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm active:scale-95"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.cartId, 1)}
                    className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm active:scale-95"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600">Tổng cộng</span>
            <span className="text-xl font-bold text-orange-600">{formatMoney(totalAmount)}</span>
          </div>
          <Button className="w-full h-12 text-base rounded-xl shadow-orange-200 shadow-lg" onClick={handlePlaceOrder} disabled={isSubmitting}>
            {isSubmitting ? "Đang gửi đơn..." : "Xác nhận đặt món"}
          </Button>
        </div>
      )}

      {/* [FIX] Props qrToken đã hợp lệ */}
      <BottomNavV2 qrToken={params.qrToken} />
    </div>
  );
  );
}
