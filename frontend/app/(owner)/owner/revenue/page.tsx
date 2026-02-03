"use client";

import { useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

import { RevenueChart } from "@/components/admin/revenue-chart";
import { CalendarDateRangePicker } from "@/components/date-range-picker";
import { ownerReportService, RevenueChartData } from "@/services/owner-report.service";

function formatMoney(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function RevenuePage() {
  const [data, setData] = useState<RevenueChartData[]>([]);
  const [loading, setLoading] = useState(true);

  // Mặc định 7 ngày qua
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });

  const from = dateRange?.from || addDays(new Date(), -7);
  const to = dateRange?.to || new Date();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await ownerReportService.getRevenueByRange(from, to);
        if (res.isSuccess) setData(res.value);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [from, to]);

  const summary = useMemo(() => {
    const total = data.reduce((s, x) => s + (x.revenue || 0), 0);
    const days = data.length || 1;
    const avg = total / days;

    let best = data[0];
    let worst = data[0];
    for (const x of data) {
      if (!best || x.revenue > best.revenue) best = x;
      if (!worst || x.revenue < worst.revenue) worst = x;
    }
    return { total, avg, best, worst, days };
  }, [data]);

  const handleDownloadCsv = async () => {
    const res = await ownerReportService.exportRevenueCsv(from, to);
    if (res.isSuccess) {
      const name = `revenue_${from.toLocaleDateString("vi-VN").replaceAll("/", "-")}_${to
        .toLocaleDateString("vi-VN")
        .replaceAll("/", "-")}.csv`;
      downloadText(name, res.value);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Báo cáo Doanh thu</h2>

        <div className="flex items-center gap-2">
          <CalendarDateRangePicker date={dateRange} onDateChange={setDateRange} />
          <Button variant="outline" size="icon" onClick={handleDownloadCsv} title="Tải CSV">
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

        {/* ===== TAB: OVERVIEW ===== */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Tổng doanh thu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatMoney(summary.total)}</div>
                <div className="text-xs text-muted-foreground">{summary.days} ngày</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Trung bình / ngày</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatMoney(summary.avg)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Cao nhất</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatMoney(summary.best?.revenue || 0)}</div>
                <div className="text-xs text-muted-foreground">{summary.best?.date || "-"}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Thấp nhất</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatMoney(summary.worst?.revenue || 0)}</div>
                <div className="text-xs text-muted-foreground">{summary.worst?.date || "-"}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Biểu đồ doanh thu</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <RevenueChart data={data} />
              {loading && <div className="text-sm text-muted-foreground mt-2">Đang tải...</div>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== TAB: ANALYTICS ===== */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Chi tiết theo ngày</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4">Ngày</th>
                      <th className="text-right py-2">Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((x) => (
                      <tr key={x.date} className="border-b last:border-b-0">
                        <td className="py-2 pr-4">{x.date}</td>
                        <td className="py-2 text-right font-medium">{formatMoney(x.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 text-sm text-muted-foreground">
                * Doanh thu được tính từ các đơn hàng trạng thái <b>Completed</b> trong khoảng ngày đã chọn.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== TAB: EXPORT ===== */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Xuất báo cáo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Bạn có thể tải file CSV để mở bằng Excel/Google Sheets.
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleDownloadCsv}>
                  <Download className="h-4 w-4 mr-2" /> Tải doanh thu (CSV)
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                Gợi ý: Nếu bạn muốn file PDF hoặc thống kê nâng cao (theo món/chi nhánh/khung giờ), mình sẽ bổ sung thêm API backend để xuất trực tiếp.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
