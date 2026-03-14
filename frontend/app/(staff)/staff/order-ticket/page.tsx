"use client";

import { useEffect, useState } from "react";
import { BellRing, CheckCircle2, Clock, Minus, Trash2, Utensils, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OrderStatus, StaffOrderDto } from "@/lib/types"; 
import { getBranchId } from "@/lib/jwt";
import { staffService } from "@/services/staff.service";
import { tableService } from "@/services/table.service";

export default function OrderTicketPage() {
  const [pendingOrders, setPendingOrders] = useState<StaffOrderDto[]>([]);
  const [confirmedOrders, setConfirmedOrders] = useState<StaffOrderDto[]>([]);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [processingItemKey, setProcessingItemKey] = useState<string | null>(null);
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);
  const [tableNames, setTableNames] = useState<Record<string, string>>({});
  const [selectedInvoice, setSelectedInvoice] = useState<StaffOrderDto | null>(null);

  const fetchTables = async () => {
    const branchId = getBranchId();
    if (!branchId) return;

    try {
      const res: any = await tableService.getByBranch(branchId);
      const tables = Array.isArray(res?.value)
        ? res.value
        : Array.isArray(res?.items)
          ? res.items
          : Array.isArray(res)
            ? res
            : [];

      setTableNames(
        Object.fromEntries(
          tables
            .filter((table: any) => table?.id && table?.name)
            .map((table: any) => [String(table.id), String(table.name)])
        )
      );
    } catch {
      setTableNames({});
    }
  };

  const fetchOrders = async (): Promise<StaffOrderDto[]> => {
    try {
      const res: any = await staffService.getOrders();
      if (res.isSuccess && Array.isArray(res.value)) {
        const pending = res.value.filter((o: StaffOrderDto) => o.status === OrderStatus.Pending);
        const confirmed = res.value.filter((o: StaffOrderDto) => 
          o.status === OrderStatus.Confirmed || o.status === OrderStatus.Cooking
        );
        setPendingOrders(pending);
        setConfirmedOrders(confirmed);
        return res.value;
      }
      return [];
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  useEffect(() => {
    fetchTables();
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Poll mỗi 5s
    return () => clearInterval(interval);
  }, []);

  const resolveTableName = (order: StaffOrderDto) => {
    const rawTableName = String(order.tableName || "").trim();
    if (rawTableName && rawTableName.toLowerCase() !== "mang về") {
      return rawTableName;
    }

    if (order.tableId && tableNames[order.tableId]) {
      return tableNames[order.tableId];
    }

    if (order.tableId) {
      return `Bàn ${order.tableId.substring(0, 8)}`;
    }

    return "Mang về";
  };

  const resolveOrderLabel = (order: StaffOrderDto, isInvoice = false) => {
    const orderNumber = String(order.orderNumber || "").trim();
    if (orderNumber) {
      return isInvoice ? `Hóa đơn #${orderNumber}` : `Đơn #${orderNumber}`;
    }

    return isInvoice ? `Hóa đơn #${order.id.substring(0, 8)}` : `Đơn #${order.id.substring(0, 8)}`;
  };

  const formatOrderTime = (value: string) => {
    const time = new Date(value);
    if (Number.isNaN(time.getTime())) {
      return "Không rõ thời gian";
    }

    return time.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatMoney = (value: number) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;

  const handleConfirmOrder = async (orderId: string) => {
    setProcessingOrderId(orderId);
    try {
      const res: any = await staffService.updateOrderStatus(orderId, OrderStatus.Confirmed);
      if (res.isSuccess) {
        toast.success("Đã xác nhận đơn → Chuyển bếp");
        await fetchOrders();
      } else {
        toast.error("Lỗi: " + (res.error?.message || "Không xác nhận được"));
      }
    } catch (e: any) {
      toast.error("Có lỗi xảy ra: " + e.message);
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    setProcessingOrderId(orderId);
    try {
      const res: any = await staffService.updateOrderStatus(orderId, OrderStatus.Cancelled);
      if (res.isSuccess) {
        toast.success("Đã từ chối đơn hàng");
        await fetchOrders();
      } else {
        toast.error("Lỗi: " + (res.error?.message || "Không từ chối được"));
      }
    } catch (e: any) {
      toast.error("Có lỗi xảy ra: " + e.message);
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleMarkInvoicePaid = async (orderId: string) => {
    setPayingOrderId(orderId);
    try {
      // Frontend enum Served(6) maps to backend Paid(6)
      const res: any = await staffService.updateOrderStatus(orderId, OrderStatus.Served);
      if (!res?.isSuccess) {
        const desc = res?.error?.description || res?.error?.message || "Không cập nhật được trạng thái thanh toán";
        toast.error(String(desc));
        return;
      }

      toast.success("Đã thanh toán. Hóa đơn đã chuyển vào Lịch sử");
      setSelectedInvoice(null);
      await fetchOrders();
    } catch (e: any) {
      toast.error(e?.message || "Có lỗi xảy ra khi thanh toán hóa đơn");
    } finally {
      setPayingOrderId(null);
    }
  };

  const handlePrintInvoice = (order: StaffOrderDto) => {
    const createdAt = (order as any).createdAtUtc || order.createdAt || order.createdOn;
    const invoiceCode = resolveOrderLabel(order, true);
    const tableName = resolveTableName(order);
    const rows = (order.items || [])
      .map((item) => {
        const lineTotal = Number(item.unitPrice || 0) * Number(item.quantity || 0);
        return `
          <tr>
            <td>${item.productName || ""}</td>
            <td style="text-align:right">${item.quantity || 0}</td>
            <td style="text-align:right">${formatMoney(Number(item.unitPrice || 0))}</td>
            <td style="text-align:right">${formatMoney(lineTotal)}</td>
          </tr>
        `;
      })
      .join("");

    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>In hóa đơn</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; color: #111; }
            h1 { margin: 0 0 12px; font-size: 24px; }
            .meta { margin: 4px 0; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #d1d5db; padding: 8px; font-size: 14px; }
            th { background: #f3f4f6; text-align: left; }
            .total { margin-top: 16px; text-align: right; font-size: 20px; font-weight: 700; }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <h1>Hóa đơn</h1>
          <div class="meta"><strong>Mã hóa đơn:</strong> ${invoiceCode}</div>
          <div class="meta"><strong>Bàn:</strong> ${tableName}</div>
          <div class="meta"><strong>Thời điểm:</strong> ${formatOrderTime(createdAt)}</div>

          <table>
            <thead>
              <tr>
                <th>Món</th>
                <th style="text-align:right">SL</th>
                <th style="text-align:right">Đơn giá</th>
                <th style="text-align:right">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>

          <div class="total">Tổng hóa đơn: ${formatMoney(Number(order.totalAmount || 0))}</div>

          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            }
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      toast.error("Không mở được cửa sổ in. Vui lòng kiểm tra trình duyệt có chặn popup.");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const openInvoiceDetail = (order: StaffOrderDto) => {
    setSelectedInvoice(order);
  };

  const handleAdjustInvoiceItem = async (
    order: StaffOrderDto,
    item: any,
    newQuantity: number
  ) => {
    const itemId = String(item?.id || "");
    if (!itemId) {
      toast.error("Không tìm thấy mã món để cập nhật");
      return;
    }

    const key = `${order.id}-${itemId}`;
    setProcessingItemKey(key);
    try {
      const res: any = await staffService.updateOrderItemQuantity(order.id, itemId, newQuantity);
      if (!res?.isSuccess) {
        const desc = res?.error?.description || res?.error?.message || "Không cập nhật được món";
        toast.error(String(desc));
        return;
      }

      const allOrders = await fetchOrders();
      const updated = allOrders.find((o) => o.id === order.id) || null;

      // Nếu order đã bị hủy do xóa hết món thì đóng modal.
      setSelectedInvoice(updated);
      if (!updated) {
        toast.success("Đã cập nhật món. Đơn có thể đã đóng.");
      } else {
        toast.success("Đã cập nhật món theo yêu cầu khách");
      }
    } catch (e: any) {
      toast.error(e?.message || "Có lỗi xảy ra khi cập nhật món");
    } finally {
      setProcessingItemKey(null);
    }
  };

  const renderOrderCard = (order: StaffOrderDto, showConfirmButton: boolean) => {
    const createdAt = (order as any).createdAtUtc || order.createdAt || order.createdOn;
    const elapsed = Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000));
    const isUrgent = elapsed > 10;
    const isProcessing = processingOrderId === order.id;
    const tableName = resolveTableName(order);
    const tableChip = tableName.replace(/^Bàn\s*/i, "").substring(0, 6) || "Bàn";

    return (
      <Card key={order.id} className={`shadow-sm hover:shadow-md transition-shadow ${isUrgent ? 'border-red-300 border-2' : ''}`}>
        <CardHeader className="p-4 pb-2 bg-gray-50/70">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-700 text-lg">
                {tableChip}
              </div>
              <div>
                <h3 className="font-bold text-lg">{resolveOrderLabel(order, !showConfirmButton)}</h3>
                <p className="text-sm font-medium text-foreground">{tableName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatOrderTime(createdAt)}
                </p>
                <p className="text-xs text-muted-foreground">
                  <Clock className="inline h-3 w-3 mr-1" />
                  {elapsed} phút trước
                  {isUrgent && <span className="ml-2 text-red-600 font-semibold animate-pulse">⚠️ Lâu rồi!</span>}
                </p>
              </div>
            </div>
            <Badge variant={showConfirmButton ? "destructive" : "secondary"} className="text-xs">
              {showConfirmButton ? "MỚI" : "HÓA ĐƠN"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-3">
          <ScrollArea className="max-h-40">
            <div className="space-y-2">
              {order.items?.map((item, idx) => (
                <div key={`${item.id || item.productId || "item"}-${idx}`} className="flex justify-between items-start text-sm border-b pb-2 last:border-0">
                  <div className="flex gap-2">
                    <Badge variant="outline" className="h-6 min-w-[2rem] justify-center">
                      {item.quantity}
                    </Badge>
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      {item.note && (
                        <p className="text-xs text-red-600 italic mt-0.5">📝 {item.note}</p>
                      )}
                    </div>
                  </div>
                  {!showConfirmButton && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {formatMoney(Number(item.unitPrice || 0))} x {item.quantity}
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {formatMoney(Number(item.unitPrice || 0) * Number(item.quantity || 0))}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="mt-3 pt-3 border-t flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {showConfirmButton ? "Tổng:" : "Tổng hóa đơn:"}{" "}
              <span className="font-bold text-lg text-foreground">{formatMoney(Number(order.totalAmount || 0))}</span>
            </p>
            
            {showConfirmButton && (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleRejectOrder(order.id)}
                  disabled={isProcessing}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Từ chối
                </Button>
                <Button 
                  type="button"
                  onClick={() => handleConfirmOrder(order.id)}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Xác nhận
                </Button>
              </div>
            )}

            {!showConfirmButton && (
              <Button
                type="button"
                variant="outline"
                onClick={() => openInvoiceDetail(order)}
              >
                Xem chi tiết hóa đơn
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BellRing className="h-6 w-6 text-orange-500" />
          Tiếp nhận đơn hàng
        </h1>
        {pendingOrders.length > 0 && (
          <Badge variant="destructive" className="text-lg px-3 py-1 animate-pulse">
            {pendingOrders.length} đơn mới
          </Badge>
        )}
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="relative">
            Đơn mới ({pendingOrders.length})
            {pendingOrders.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="confirmed">
            <Utensils className="mr-2 h-4 w-4" />
            Hóa đơn ({confirmedOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-4">
          {pendingOrders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-lg border border-dashed">
              <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-3" />
              <p className="text-muted-foreground">Không có đơn mới. Tuyệt vời! 🎉</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingOrders.map(order => renderOrderCard(order, true))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="confirmed" className="space-y-4 mt-4">
          {confirmedOrders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-lg border border-dashed">
              <p className="text-muted-foreground">Chưa có hóa đơn nào.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {confirmedOrders.map(order => renderOrderCard(order, false))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết hóa đơn</DialogTitle>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-4">
              <div className="rounded-lg border p-3 text-sm">
                <p>
                  <span className="font-semibold">Mã hóa đơn:</span>{" "}
                  {resolveOrderLabel(selectedInvoice, true)}
                </p>
                <p>
                  <span className="font-semibold">Bàn:</span> {resolveTableName(selectedInvoice)}
                </p>
                <p>
                  <span className="font-semibold">Thời điểm:</span>{" "}
                  {formatOrderTime((selectedInvoice as any).createdAtUtc || selectedInvoice.createdAt || selectedInvoice.createdOn)}
                </p>
              </div>

              <div className="max-h-72 overflow-y-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60">
                    <tr>
                      <th className="px-3 py-2 text-left">Món</th>
                      <th className="px-3 py-2 text-right">SL</th>
                      <th className="px-3 py-2 text-right">Đơn giá</th>
                      <th className="px-3 py-2 text-right">Thành tiền</th>
                      <th className="px-3 py-2 text-right">Điều chỉnh</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items?.map((item, idx) => {
                      const lineTotal = Number(item.unitPrice || 0) * Number(item.quantity || 0);
                      const actionKey = `${selectedInvoice.id}-${item.id}`;
                      const actionDisabled = processingItemKey === actionKey;
                      return (
                        <tr key={`${item.id || item.productId}-${idx}`} className="border-t">
                          <td className="px-3 py-2">
                            <div className="font-medium">{item.productName}</div>
                            {item.note && <div className="text-xs text-muted-foreground">Ghi chú: {item.note}</div>}
                          </td>
                          <td className="px-3 py-2 text-right">{item.quantity}</td>
                          <td className="px-3 py-2 text-right">{formatMoney(Number(item.unitPrice || 0))}</td>
                          <td className="px-3 py-2 text-right font-semibold">{formatMoney(lineTotal)}</td>
                          <td className="px-3 py-2">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                                disabled={actionDisabled || Number(item.quantity || 0) <= 1}
                                onClick={() =>
                                  handleAdjustInvoiceItem(
                                    selectedInvoice,
                                    item,
                                    Number(item.quantity || 0) - 1
                                  )
                                }
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="destructive"
                                className="h-8 w-8"
                                disabled={actionDisabled}
                                onClick={() => handleAdjustInvoiceItem(selectedInvoice, item, 0)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="text-right text-base">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handlePrintInvoice(selectedInvoice)}
                    >
                      In hóa đơn
                    </Button>
                    <Button
                      type="button"
                      className="bg-green-600 hover:bg-green-700"
                      disabled={payingOrderId === selectedInvoice.id}
                      onClick={() => handleMarkInvoicePaid(selectedInvoice.id)}
                    >
                      {payingOrderId === selectedInvoice.id ? "Đang xử lý..." : "Đã thanh toán"}
                    </Button>
                  </div>

                  <div>
                    <span className="font-semibold">Tổng hóa đơn: </span>
                    <span className="font-bold">{formatMoney(Number(selectedInvoice.totalAmount || 0))}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}