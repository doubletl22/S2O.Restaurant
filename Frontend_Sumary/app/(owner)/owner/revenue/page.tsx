"use client";

import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button"; // Thêm nút Download
import { Download } from "lucide-react"; // Icon download

import { RevenueChart } from "@/components/admin/revenue-chart";
import { CalendarDateRangePicker } from "@/components/date-range-picker"; // Đã có file
import { ownerReportService, RevenueChartData } from "@/services/owner-report.service";

export default function RevenuePage() {
  const [data, setData] = useState<RevenueChartData[]>([]);
  
  // State quản lý ngày tháng (Mặc định 7 ngày qua)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });

  // Load data khi component mount hoặc dateRange thay đổi (Logic filter thực tế sẽ cần backend hỗ trợ params from/to)
  useEffect(() => {
    const fetchData = async () => {
      // Demo logic: Nếu chọn range > 7 ngày thì load data 30 ngày, ngược lại 7 ngày
      // Thực tế bạn sẽ gửi dateRange?.from và dateRange?.to xuống API
      const days = (dateRange?.to && dateRange?.from && 
        (dateRange.to.getTime() - dateRange.from.getTime()) > 7 * 24 * 60 * 60 * 1000) 
        ? 30 : 7;
        
      const res = await ownerReportService.getRevenueData(days);
      if (res.isSuccess) setData(res.value);
    };
    fetchData();
  }, [dateRange]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Báo cáo Doanh thu</h2>
        
        <div className="flex items-center gap-2">
          <CalendarDateRangePicker 
            date={dateRange}
            onDateChange={setDateRange}
          />
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="analytics">Phân tích</TabsTrigger>
          <TabsTrigger value="reports">Xuất báo cáo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Biểu đồ doanh thu</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <RevenueChart data={data} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}