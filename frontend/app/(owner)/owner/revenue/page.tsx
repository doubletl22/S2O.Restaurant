"use client";

import { useEffect, useRef, useState } from "react";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button"; // Thêm nút Download
import { Download } from "lucide-react"; // Icon download
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import { CalendarDateRangePicker } from "@/components/date-range-picker"; // Đã có file
import { ownerReportService, BranchRevenueData, RevenueChartData } from "@/services/owner-report.service";
import { useBranches } from "@/hooks/use-branches";

const PIE_COLORS = ["#1d4ed8", "#059669", "#ea580c", "#db2777", "#7c3aed", "#0891b2", "#65a30d"];
const PIE_DOT_CLASSES = ["bg-blue-700", "bg-emerald-600", "bg-orange-600", "bg-pink-600", "bg-violet-600", "bg-cyan-600", "bg-lime-600"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

function formatDateLabel(value?: Date) {
  if (!value) return "";
  const day = String(value.getDate()).padStart(2, "0");
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const year = value.getFullYear();
  return `${day}/${month}/${year}`;
}

function toCsvCell(value: string | number) {
  const safe = String(value ?? "").replaceAll('"', '""');
  return `"${safe}"`;
}

function downloadCsvFile(fileName: string, rows: Array<Array<string | number>>) {
  const csvContent = rows.map((row) => row.map(toCsvCell).join(",")).join("\r\n");
  const blob = new Blob([`\uFEFF${csvContent}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function downloadTextFile(fileName: string, content: string, mimeType = "text/plain;charset=utf-8;") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function getSvgMarkup(container: HTMLDivElement | null): string {
  if (!container) return "";
  const svg = container.querySelector("svg");
  if (!svg) return "";

  const clone = svg.cloneNode(true) as SVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  if (!clone.getAttribute("viewBox")) {
    const width = clone.getAttribute("width") || "900";
    const height = clone.getAttribute("height") || "360";
    clone.setAttribute("viewBox", `0 0 ${width} ${height}`);
  }

  return clone.outerHTML;
}

export default function RevenuePage() {
  const [branchRevenue, setBranchRevenue] = useState<BranchRevenueData[]>([]);
  const [selectedBranchSeries, setSelectedBranchSeries] = useState<RevenueChartData[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("all");
  const [timeMode, setTimeMode] = useState<"range" | "all">("range");
  const [mounted, setMounted] = useState(false);
  const overviewChartRef = useRef<HTMLDivElement | null>(null);
  const analyticsChartRef = useRef<HTMLDivElement | null>(null);
  const { data: branches } = useBranches();
  
  // State quản lý ngày tháng (Mặc định 7 ngày qua)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  useEffect(() => {
    const now = new Date();
    setDateRange({
      from: addDays(now, -7),
      to: now,
    });
    setMounted(true);
  }, []);

  // Load data khi component mount hoặc dateRange thay đổi (Logic filter thực tế sẽ cần backend hỗ trợ params from/to)
  useEffect(() => {
    const fetchData = async () => {
      const allTime = timeMode === "all";

      const branchRes = await ownerReportService.getBranchRevenueComparison({
        from: dateRange?.from,
        to: dateRange?.to,
        allTime,
      });
      if (branchRes.isSuccess) setBranchRevenue(branchRes.value);

      if (selectedBranchId !== "all") {
        const revenueRes = await ownerReportService.getRevenueData({
          from: dateRange?.from,
          to: dateRange?.to,
          allTime,
          branchId: selectedBranchId,
        });

        if (revenueRes.isSuccess) {
          setSelectedBranchSeries(revenueRes.value);
        }
      } else {
        setSelectedBranchSeries([]);
      }
    };

    if (!mounted) return;
    if (timeMode === "range" && !dateRange?.from) return;

    fetchData();
  }, [dateRange, selectedBranchId, timeMode, mounted]);

  const positiveBranchRevenue = branchRevenue.filter((item) => item.revenue > 0);
  const totalBranchRevenue = positiveBranchRevenue.reduce((sum, item) => sum + item.revenue, 0);
  const selectedBranch = branchRevenue.find((item) => item.branchId === selectedBranchId) || null;
  const periodLabel = timeMode === "all"
    ? "Từ lúc mở"
    : `${formatDateLabel(dateRange?.from)} - ${formatDateLabel(dateRange?.to)}`;

  const pieData = (() => {
    if (selectedBranchId === "all") return positiveBranchRevenue;

    const selected = positiveBranchRevenue.find((x) => x.branchId === selectedBranchId);
    if (!selected) return [];

    const othersRevenue = positiveBranchRevenue
      .filter((x) => x.branchId !== selectedBranchId)
      .reduce((sum, x) => sum + x.revenue, 0);

    if (othersRevenue <= 0) return [selected];

    return [
      selected,
      {
        branchId: "others",
        branchName: "Các chi nhánh còn lại",
        revenue: othersRevenue,
        orderCount: positiveBranchRevenue
          .filter((x) => x.branchId !== selectedBranchId)
          .reduce((sum, x) => sum + x.orderCount, 0),
        percentage: 0,
      },
    ];
  })();

  const branchOptions = Array.isArray(branches) ? branches : [];

  const handleExportReportCsv = () => {
    const reportName = selectedBranchId === "all" ? "bao-cao-doanh-thu-chi-nhanh" : `bao-cao-doanh-thu-${selectedBranch?.branchName || "chi-nhanh"}`;
    const fileName = `${reportName}-${new Date().toISOString().slice(0, 10)}.csv`;

    const summaryRows: Array<Array<string | number>> = [
      ["Bao cao doanh thu"],
      ["Thoi gian", periodLabel],
      ["Che do", timeMode === "all" ? "Tu luc mo" : "Theo ngay chon"],
      ["Chi nhanh", selectedBranchId === "all" ? "Tat ca chi nhanh" : (selectedBranch?.branchName || "Khong xac dinh")],
      [],
    ];

    const detailRows = selectedBranchId === "all"
      ? [
          ["So sanh doanh thu tat ca chi nhanh"],
          ["Chi nhanh", "Doanh thu", "Hoa don", "Ty trong (%)"],
          ...positiveBranchRevenue.map((item) => [
            item.branchName,
            item.revenue,
            item.orderCount,
            item.percentage.toFixed(2),
          ]),
          [],
          ["Tong doanh thu", totalBranchRevenue],
        ]
      : [
          ["Doanh thu theo thoi gian cua chi nhanh"],
          ["Chi nhanh", selectedBranch?.branchName || ""],
          ["Tong doanh thu", selectedBranch?.revenue || 0],
          ["Tong hoa don", selectedBranch?.orderCount || 0],
          [],
          ["Ngay", "Doanh thu"],
          ...selectedBranchSeries.map((item) => [item.date, item.revenue]),
        ];

    const rows = [...summaryRows, ...detailRows];

    if (rows.length <= 6) {
      toast.error("Chưa có dữ liệu để xuất báo cáo.");
      return;
    }

    downloadCsvFile(fileName, rows);
    toast.success("Đã xuất báo cáo CSV.");
  };

  const handleExportReportHtml = () => {
    const reportName = selectedBranchId === "all" ? "bao-cao-doanh-thu-chi-nhanh" : `bao-cao-doanh-thu-${selectedBranch?.branchName || "chi-nhanh"}`;
    const fileName = `${reportName}-${new Date().toISOString().slice(0, 10)}.html`;

    const overviewSvg = getSvgMarkup(overviewChartRef.current);
    const analyticsSvg = getSvgMarkup(analyticsChartRef.current);

    const branchRows = positiveBranchRevenue
      .map((item) => `
        <tr>
          <td>${item.branchName}</td>
          <td>${formatCurrency(item.revenue)}</td>
          <td>${item.orderCount}</td>
          <td>${item.percentage.toFixed(2)}%</td>
        </tr>`)
      .join("");

    const seriesRows = selectedBranchSeries
      .map((item) => `
        <tr>
          <td>${item.date}</td>
          <td>${formatCurrency(item.revenue)}</td>
        </tr>`)
      .join("");

    const html = `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Báo cáo doanh thu</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
    h1 { margin: 0 0 8px 0; }
    .muted { color: #64748b; margin-bottom: 4px; }
    .section { margin-top: 24px; }
    .chart { border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; background: #fff; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
    th { background: #f8fafc; }
  </style>
</head>
<body>
  <h1>Báo cáo Doanh thu</h1>
  <div class="muted">Thời gian: ${periodLabel}</div>
  <div class="muted">Chế độ: ${timeMode === "all" ? "Từ lúc mở" : "Theo ngày chọn"}</div>
  <div class="muted">Chi nhánh: ${selectedBranchId === "all" ? "Tất cả chi nhánh" : (selectedBranch?.branchName || "Không xác định")}</div>

  <div class="section">
    <h2>Tổng quan - Doanh thu toàn bộ chi nhánh</h2>
    <div class="chart">${overviewSvg || "<p>Không lấy được biểu đồ tổng quan.</p>"}</div>
  </div>

  <div class="section">
    <h2>Phân tích</h2>
    <div class="chart">${analyticsSvg || "<p>Không lấy được biểu đồ phân tích.</p>"}</div>
  </div>

  <div class="section">
    <h2>Bảng so sánh chi nhánh</h2>
    <table>
      <thead>
        <tr><th>Chi nhánh</th><th>Doanh thu</th><th>Hóa đơn</th><th>Tỷ trọng</th></tr>
      </thead>
      <tbody>
        ${branchRows || "<tr><td colspan='4'>Không có dữ liệu</td></tr>"}
      </tbody>
    </table>
  </div>

  ${selectedBranchId !== "all" ? `
  <div class="section">
    <h2>Doanh thu theo thời gian - ${selectedBranch?.branchName || "Chi nhánh"}</h2>
    <table>
      <thead>
        <tr><th>Ngày</th><th>Doanh thu</th></tr>
      </thead>
      <tbody>
        ${seriesRows || "<tr><td colspan='2'>Không có dữ liệu</td></tr>"}
      </tbody>
    </table>
  </div>` : ""}
</body>
</html>`;

    downloadTextFile(fileName, html, "text/html;charset=utf-8;");
    toast.success("Đã xuất báo cáo HTML kèm biểu đồ.");
  };

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Báo cáo Doanh thu</h2>
          <div className="h-10 w-[440px] max-w-full rounded-md border bg-muted/30" />
        </div>
        <div className="h-10 w-[320px] rounded-md bg-muted/30" />
        <Card>
          <CardHeader>
            <CardTitle>Doanh thu toàn bộ chi nhánh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[360px] rounded-xl border border-dashed bg-muted/20" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Báo cáo Doanh thu</h2>
        
        <div className="flex items-center gap-2">
          <Select value={timeMode} onValueChange={(value: "range" | "all") => setTimeMode(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chọn mốc thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="range">Theo ngày chọn</SelectItem>
              <SelectItem value="all">Từ lúc mở</SelectItem>
            </SelectContent>
          </Select>

          {timeMode === "range" && (
            <CalendarDateRangePicker
              date={dateRange}
              onDateChange={setDateRange}
            />
          )}

          <Button variant="outline" size="icon" onClick={handleExportReportHtml} title="Xuất báo cáo HTML kèm biểu đồ">
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
              <CardTitle>Doanh thu toàn bộ chi nhánh</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              {branchRevenue.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Chưa có dữ liệu doanh thu của các chi nhánh trong khoảng thời gian này.
                </div>
              ) : (
                <div className="h-[360px]" ref={overviewChartRef}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={branchRevenue} margin={{ top: 8, right: 12, left: 12, bottom: 12 }}>
                      <XAxis
                        dataKey="branchName"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
                      />
                      <Tooltip formatter={(value: number) => [formatCurrency(value), "Doanh thu"]} />
                      <Bar dataKey="revenue" radius={[10, 10, 0, 0]}>
                        {branchRevenue.map((entry, index) => (
                          <Cell key={entry.branchId} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>{selectedBranchId === "all" ? "So sánh doanh thu theo chi nhánh" : `Doanh thu của ${selectedBranch?.branchName || "chi nhánh"}`}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedBranchId === "all"
                    ? "Biểu đồ tròn thể hiện tỷ trọng doanh thu của tất cả chi nhánh trong khoảng thời gian đã chọn."
                    : "Sơ đồ cột thể hiện doanh thu theo mốc thời gian của chi nhánh đang chọn."}
                </p>
              </div>

              <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                <SelectTrigger className="w-full sm:w-[260px]">
                  <SelectValue placeholder="Lọc theo chi nhánh" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả chi nhánh</SelectItem>
                  {branchOptions.map((branch: any) => (
                    <SelectItem key={branch.id} value={String(branch.id)}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>

            <CardContent>
              {selectedBranchId === "all" ? (
                pieData.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                    Chưa có dữ liệu doanh thu theo chi nhánh trong khoảng thời gian này.
                  </div>
                ) : (
                  <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
                    <div className="h-[320px]" ref={analyticsChartRef}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            dataKey="revenue"
                            nameKey="branchName"
                            cx="50%"
                            cy="50%"
                            outerRadius={110}
                            innerRadius={60}
                            paddingAngle={2}
                            label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                            labelLine={false}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={entry.branchId} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => [formatCurrency(value), "Doanh thu"]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-3">
                      {pieData.map((item, index) => {
                        const percentage = totalBranchRevenue > 0
                          ? (item.revenue / totalBranchRevenue) * 100
                          : 0;

                        return (
                          <div key={item.branchId} className="rounded-lg border p-3 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className={`h-3 w-3 rounded-full ${PIE_DOT_CLASSES[index % PIE_DOT_CLASSES.length]}`}
                                />
                                <p className="text-sm font-medium truncate">{item.branchName}</p>
                              </div>
                              <Badge variant="secondary">{percentage.toFixed(1)}%</Badge>
                            </div>

                            <p className="text-lg font-semibold">{formatCurrency(item.revenue)}</p>
                            <p className="text-xs text-muted-foreground">{item.orderCount} hóa đơn đã thanh toán</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              ) : selectedBranchSeries.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Chưa có dữ liệu doanh thu cho chi nhánh này trong khoảng thời gian đã chọn.
                </div>
              ) : (
                <div className="grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
                  <div className="h-[320px]" ref={analyticsChartRef}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={selectedBranchSeries} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                        <XAxis
                          dataKey="date"
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
                        />
                        <Tooltip formatter={(value: number) => [formatCurrency(value), "Doanh thu"]} />
                        <Bar dataKey="revenue" fill={PIE_COLORS[0]} radius={[10, 10, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-lg border p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`h-3 w-3 rounded-full ${PIE_DOT_CLASSES[0]}`} />
                          <p className="text-sm font-medium truncate">{selectedBranch?.branchName || "Chi nhánh"}</p>
                        </div>
                        <Badge variant="secondary">{selectedBranch?.orderCount || 0} hóa đơn</Badge>
                      </div>

                      <p className="text-2xl font-semibold">{formatCurrency(selectedBranch?.revenue || 0)}</p>
                      <p className="text-xs text-muted-foreground">
                        Tổng doanh thu của chi nhánh trong bộ lọc hiện tại.
                      </p>
                    </div>

                    <div className="rounded-lg border p-4 space-y-2">
                      <p className="text-sm font-medium">Số mốc dữ liệu</p>
                      <p className="text-2xl font-semibold">{selectedBranchSeries.length}</p>
                      <p className="text-xs text-muted-foreground">
                        {timeMode === "all" ? "Số ngày có phát sinh doanh thu từ lúc mở." : "Số ngày trong khoảng lọc có ghi nhận doanh thu."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Xuất báo cáo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="rounded-lg border p-4 space-y-2 bg-muted/20">
                <p className="font-medium text-foreground">Bộ lọc hiện tại</p>
                <p>Thời gian: {periodLabel}</p>
                <p>Chi nhánh: {selectedBranchId === "all" ? "Tất cả chi nhánh" : (selectedBranch?.branchName || "Không xác định")}</p>
                <p>Định dạng: CSV hoặc HTML (kèm biểu đồ)</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleExportReportCsv} className="sm:w-fit" variant="outline">
                  <Download className="h-4 w-4 mr-2" /> Xuất báo cáo CSV
                </Button>
                <Button onClick={handleExportReportHtml} className="sm:w-fit">
                  <Download className="h-4 w-4 mr-2" /> Xuất báo cáo HTML kèm biểu đồ
                </Button>
                <p className="text-xs self-center text-muted-foreground">
                  File xuất sẽ bám đúng tab phân tích, bộ lọc hiện tại và có ảnh biểu đồ.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}