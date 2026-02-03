"use client";

import { useState, useRef, useMemo } from "react";
import { useReactToPrint } from "react-to-print";
import { useBranches, useTables } from "@/hooks/use-branches"; // Tận dụng hook cũ
import { QRCodeTemplate } from "@/components/owner/qr-code-template";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Printer, CheckSquare, Square, Loader2, QrCode } from "lucide-react";

// [CẤU HÌNH] Thay đổi URL này thành domain thật của Customer App
const CUSTOMER_APP_URL = "http://localhost:3000"; 

export default function QrCodesPage() {
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [selectedTableIds, setSelectedTableIds] = useState<string[]>([]);
  const { data: branches, isLoading: isLoadingBranches } = useBranches();
  const { data: tables, isLoading: isLoadingTables } = useTables(selectedBranchId);
  const printComponentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printComponentRef, 
    documentTitle: `QR_Codes_${selectedBranchId || "All"}`,
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked && tables) {
      setSelectedTableIds(tables.map((t: any) => t.id));
    } else {
      setSelectedTableIds([]);
    }
  };

  const handleSelectTable = (tableId: string, checked: boolean) => {
    if (checked) {
      setSelectedTableIds(prev => [...prev, tableId]);
    } else {
      setSelectedTableIds(prev => prev.filter(id => id !== tableId));
    }
  };

  const tablesToPrint = useMemo(() => {
    if (!tables) return [];
    return tables.filter((t: any) => selectedTableIds.includes(t.id));
  }, [tables, selectedTableIds]);

  const currentBranchName = branches?.find((b: any) => b.id === selectedBranchId)?.name || "Nhà hàng";

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col md:flex-row gap-6 p-4">
      
      {/* --- CỘT TRÁI: CẤU HÌNH --- */}
      <Card className="w-full md:w-1/3 flex flex-col h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5"/> Tạo mã QR
          </CardTitle>
          <CardDescription>Chọn chi nhánh và bàn để in</CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col gap-4 flex-1 overflow-hidden">
          {/* Chọn Chi Nhánh */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Chi nhánh</label>
            <Select 
                onValueChange={(val) => {
                    setSelectedBranchId(val);
                    setSelectedTableIds([]); // Reset chọn bàn khi đổi chi nhánh
                }} 
                value={selectedBranchId || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn chi nhánh..." />
              </SelectTrigger>
              <SelectContent>
                {branches?.map((b: any) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Chọn Bàn */}
          {selectedBranchId && (
            <div className="flex flex-col flex-1 overflow-hidden border rounded-md">
              <div className="p-3 border-b bg-muted/30 flex items-center gap-2">
                <Checkbox 
                  id="select-all"
                  checked={tables?.length > 0 && selectedTableIds.length === tables?.length}
                  onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                />
                <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                  Chọn tất cả ({tables?.length || 0})
                </label>
              </div>
              
              <ScrollArea className="flex-1 p-3">
                {isLoadingTables ? (
                   <div className="flex justify-center p-4"><Loader2 className="animate-spin h-4 w-4"/></div>
                ) : tables?.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground">Chưa có bàn nào.</div>
                ) : (
                  <div className="space-y-3">
                    {tables?.map((table: any) => (
                      <div key={table.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={table.id} 
                          checked={selectedTableIds.includes(table.id)}
                          onCheckedChange={(checked) => handleSelectTable(table.id, checked as boolean)}
                        />
                        <label
                          htmlFor={table.id}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {table.name} <span className="text-muted-foreground text-xs">({table.capacity} ghế)</span>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}

          <Button 
            className="w-full mt-auto" 
            size="lg" 
            disabled={tablesToPrint.length === 0}
            onClick={handlePrint}
          >
            <Printer className="mr-2 h-4 w-4" /> 
            In {tablesToPrint.length} mã QR
          </Button>
        </CardContent>
      </Card>

      {/* --- CỘT PHẢI: PREVIEW --- */}
      <div className="flex-1 bg-muted/20 border rounded-lg overflow-auto flex flex-col items-center p-8">
        {tablesToPrint.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                <QrCode className="h-20 w-20 mb-4" />
                <p>Vui lòng chọn bàn để xem trước</p>
            </div>
        ) : (
            <div className="shadow-lg">
                {/* Component này sẽ được in, nhưng ta cũng hiển thị nó để Preview */}
                <QRCodeTemplate 
                    ref={printComponentRef} 
                    tables={tablesToPrint}
                    branchName={currentBranchName}
                    baseUrl={CUSTOMER_APP_URL}
                />
            </div>
        )}
      </div>

    </div>
  );
}