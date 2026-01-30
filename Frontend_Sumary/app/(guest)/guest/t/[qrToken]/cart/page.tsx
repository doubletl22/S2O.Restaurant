"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ChevronLeft, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useGuestCart } from "@/components/guest/guest-cart-context";
import { guestService } from "@/services/guest.service";

export default function CartPage({ params }: { params: { qrToken: string } }) {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, clearCart, totalAmount } = useGuestCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNote, setOrderNote] = useState("");

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    setIsSubmitting(true);
    try {
      const res = await guestService.placeOrder({
        qrToken: params.qrToken,
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          note: item.note || "", // Gửi kèm ghi chú món (nếu có)
        })),
        // Nếu API hỗ trợ ghi chú chung cho cả đơn hàng, thêm field note ở đây
      });

      if (res.isSuccess) {
        toast.success("Đặt món thành công!", {
          description: "Nhà bếp đã nhận được đơn của bạn.",
        });
        clearCart();
        // Chuyển hướng sang trang theo dõi đơn (Tracking)
        router.push(`/guest/t/${params.qrToken}/tracking`);
      } else {
        toast.error("Đặt món thất bại", {
          description: res.error?.message || "Vui lòng thử lại hoặc gọi nhân viên.",
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi kết nối", { description: "Vui lòng kiểm tra lại mạng." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center space-y-4">
        <div className="bg-muted p-6 rounded-full">
          <UtensilsCrossed className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold">Giỏ hàng trống</h2>
        <p className="text-muted-foreground">Bạn chưa chọn món ăn nào.</p>
        <Link href={`/guest/t/${params.qrToken}`}>
          <Button>Quay lại Thực đơn</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-60px)]">
      {/* Header Back */}
      <div className="px-4 py-2">
        <Link 
          href={`/guest/t/${params.qrToken}`} 
          className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Thêm món khác
        </Link>
      </div>

      <div className="flex-1 px-4 space-y-4 pb-32">
        <h1 className="text-2xl font-bold">Xác nhận đơn hàng</h1>
        
        {/* Cart List */}
        <div className="space-y-4">
          {cart.map((item) => (
            <div key={item.cartId} className="flex gap-3 bg-card p-3 rounded-lg border shadow-sm">
              {/* Ảnh nhỏ */}
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground">No img</div>
                )}
              </div>

              {/* Info & Controls */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-sm line-clamp-2">{item.name}</h3>
                    <button 
                      onClick={() => removeFromCart(item.cartId)}
                      className="text-muted-foreground hover:text-red-500 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {item.note && (
                    <p className="text-xs text-muted-foreground mt-1 italic">Ghi chú: {item.note}</p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-primary text-sm">{formatPrice(item.price * item.quantity)}</span>
                  
                  {/* Quantity Control */}
                  <div className="flex items-center gap-3 bg-muted/50 rounded-md px-2 py-1">
                    <button 
                      onClick={() => updateQuantity(item.cartId, -1)}
                      className="h-6 w-6 flex items-center justify-center bg-white rounded-sm shadow-sm hover:bg-gray-100 disabled:opacity-50"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm font-medium min-w-6 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.cartId, 1)}
                      className="h-6 w-6 flex items-center justify-center bg-white rounded-sm shadow-sm hover:bg-gray-100"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Note chung (Optional - Nếu Backend hỗ trợ) */}
        <div className="space-y-2">
           <label className="text-sm font-medium">Ghi chú cho nhà bếp (nếu có)</label>
           <Textarea 
             placeholder="Ví dụ: Xin thêm bát con, mang món khai vị lên trước..." 
             className="resize-none text-sm"
             value={orderNote}
             onChange={(e) => setOrderNote(e.target.value)}
           />
        </div>
      </div>

      {/* Footer Fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg z-10 safe-area-bottom">
        <div className="flex justify-between items-center mb-4">
          <span className="text-muted-foreground">Tổng cộng ({cart.length} món)</span>
          <span className="text-xl font-bold text-primary">{formatPrice(totalAmount)}</span>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full h-12 text-lg font-bold shadow-md" disabled={isSubmitting}>
              {isSubmitting ? "Đang gửi..." : "Gửi gọi món"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="w-[90%] rounded-lg">
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận gọi món?</AlertDialogTitle>
              <AlertDialogDescription>
                Các món ăn sẽ được gửi xuống bếp ngay lập tức. Bạn vui lòng kiểm tra kỹ số lượng.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-row gap-2 justify-end">
              <AlertDialogCancel className="mt-0 flex-1">Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={handlePlaceOrder} className="flex-1">
                Đồng ý
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}