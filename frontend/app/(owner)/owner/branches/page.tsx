"use client";

import { useState, useEffect } from "react";
// Import hooks (Đảm bảo bạn đã export useDeleteBranch/Table trong file hooks)
import { 
  useBranches, 
  useTables, 
  useDeleteBranch, 
  useDeleteTable   
} from "@/hooks/use-branches";

import { BranchDialog } from "@/components/owner/branch-dialog";
import { TableDialog } from "@/components/owner/table-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Store, MapPin, Phone, Plus, QrCode, Trash2, Edit, Armchair, Loader2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function BranchesPage() {
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [isBranchDialogOpen, setIsBranchDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<any>(null);
  const { data: branches, isLoading: isLoadingBranches } = useBranches();
  const { data: tables, isLoading: isLoadingTables } = useTables(selectedBranchId);
  const deleteBranchMutation = useDeleteBranch(); 
  const deleteTableMutation = useDeleteTable();

  useEffect(() => {
    if (branches && branches.length > 0 && !selectedBranchId) {
      setSelectedBranchId(branches[0].id);
    }
  }, [branches, selectedBranchId]);

  const handleAddBranch = () => {
    setEditingBranch(null);
    setIsBranchDialogOpen(true);
  };

  const handleEditBranch = (e: React.MouseEvent, branch: any) => {
    e.stopPropagation();
    setEditingBranch(branch);
    setIsBranchDialogOpen(true);
  };

  const handleDeleteBranch = (e: React.MouseEvent, branch: any) => {
    e.stopPropagation();
    if (confirm(`Bạn có chắc muốn xóa chi nhánh "${branch.name}"?`)) {
      deleteBranchMutation.mutate(branch.id);
      if (selectedBranchId === branch.id) setSelectedBranchId(null);
    }
  };

  const handleAddTable = () => {
    setEditingTable(null);
    setIsTableDialogOpen(true);
  };

  const handleEditTable = (table: any) => {
    setEditingTable(table);
    setIsTableDialogOpen(true);
  };

  const handleDeleteTable = (table: any) => {
    if (confirm(`Xóa bàn "${table.name}"?`)) {
      deleteTableMutation.mutate(table.id);
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col md:flex-row gap-6 p-4">
      
      {/* --- CỘT TRÁI: DANH SÁCH CHI NHÁNH --- */}
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Store className="h-5 w-5" /> Chi nhánh
          </h2>
          {/* [ACTION] Nút Thêm Chi Nhánh */}
          <Button size="sm" onClick={handleAddBranch}>
            <Plus className="h-4 w-4 mr-1" /> Thêm
          </Button>
        </div>

        <ScrollArea className="flex-1 h-full pr-4">
          <div className="flex flex-col gap-3">
            {isLoadingBranches ? (
                <div className="flex justify-center"><Loader2 className="animate-spin" /></div>
            ) : branches?.map((branch: any) => (
              <Card 
                key={branch.id}
                onClick={() => setSelectedBranchId(branch.id)}
                className={cn(
                  "cursor-pointer transition-all hover:border-primary group",
                  selectedBranchId === branch.id ? "border-primary bg-primary/5 shadow-md" : ""
                )}
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-bold">{branch.name}</CardTitle>
                    {selectedBranchId === branch.id && <Badge variant="default">Đang chọn</Badge>}
                  </div>
                  <CardDescription className="flex items-center gap-1 text-xs mt-1">
                    <MapPin className="h-3 w-3" /> {branch.address || "Chưa cập nhật địa chỉ"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-2 flex justify-between items-center">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {branch.phone || "--"}
                  </div>
                  
                  {/* [ACTION] Nút Sửa/Xóa Chi Nhánh */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => handleEditBranch(e, branch)}>
                        <Edit className="h-4 w-4 text-blue-600"/>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => handleDeleteBranch(e, branch)}>
                        <Trash2 className="h-4 w-4 text-red-600"/>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* --- CỘT PHẢI: DANH SÁCH BÀN --- */}
      <Card className="flex-1 flex flex-col shadow-sm border-dashed">
        <CardHeader className="p-4 border-b flex flex-row justify-between items-center bg-muted/20">
            <div>
                <CardTitle className="text-lg">Sơ đồ bàn</CardTitle>
                <CardDescription>Quản lý bàn cho chi nhánh đang chọn</CardDescription>
            </div>
            {/* [ACTION] Nút Thêm Bàn */}
            <Button size="sm" variant="outline" disabled={!selectedBranchId} onClick={handleAddTable}>
                <Plus className="h-4 w-4 mr-1" /> Thêm bàn
            </Button>
        </CardHeader>

        <CardContent className="p-6 flex-1 overflow-auto bg-muted/10">
            {!selectedBranchId ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Store className="h-10 w-10 mb-2 opacity-20" />
                    <p>Vui lòng chọn chi nhánh bên trái</p>
                </div>
            ) : isLoadingTables ? (
                <div className="flex justify-center h-full items-center"><Loader2 className="animate-spin" /></div>
            ) : tables?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Armchair className="h-10 w-10 mb-2 opacity-20" />
                    <p>Chi nhánh này chưa có bàn nào.</p>
                    <Button variant="link" onClick={handleAddTable}>Thêm ngay</Button>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {tables?.map((table: any) => (
                        <div 
                            key={table.id} 
                            className="group relative flex flex-col items-center justify-center p-4 border rounded-xl bg-background hover:shadow-lg transition-all aspect-square"
                        >
                            <div className="bg-primary/10 p-3 rounded-full mb-2 group-hover:bg-primary group-hover:text-white transition-colors">
                                <Armchair className="h-6 w-6" />
                            </div>
                            
                            <span className="font-bold text-lg">{table.name}</span>
                            <span className="text-xs text-muted-foreground">{table.capacity} ghế</span>
                            
                            <Badge variant="outline" className="mt-2 text-[10px] uppercase">
                                {table.status || "Trống"}
                            </Badge>

                            {/* [ACTION] Overlay Sửa/Xóa Bàn */}
                            <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
                                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" title="Chỉnh sửa" onClick={() => handleEditTable(table)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full" title="Xóa" onClick={() => handleDeleteTable(table)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </CardContent>
      </Card>
      
      {/* --- DIALOGS --- */}
      <BranchDialog 
        open={isBranchDialogOpen} 
        onOpenChange={setIsBranchDialogOpen} 
        branchToEdit={editingBranch} 
      />

      <TableDialog 
        open={isTableDialogOpen} 
        onOpenChange={setIsTableDialogOpen} 
        branchId={selectedBranchId} // Quan trọng: Truyền ID chi nhánh để biết thêm bàn vào đâu
        tableToEdit={editingTable}
      />
    </div>
  );
}