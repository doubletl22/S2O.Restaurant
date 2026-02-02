"use client";

import React, { useState } from "react";
import { 
  Bot, 
  MapPin, 
  Star, 
  History, 
  Save, 
  RotateCcw, 
  Sparkles 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function AIConfigPage() {
  // State quản lý 3 tham số (giống file cũ)
  const [distance, setDistance] = useState([80]); // Slider shadcn dùng mảng
  const [rating, setRating] = useState([60]);
  const [history, setHistory] = useState([40]);
  
  // State giả lập loading khi lưu
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Giả lập gọi API lưu cấu hình
    setTimeout(() => {
      setIsSaving(false);
      alert("Đã cập nhật trọng số thuật toán thành công!");
    }, 1000);
  };

  const handleReset = () => {
    setDistance([80]);
    setRating([60]);
    setHistory([40]);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-linear-to-br from-(--g1) to-(--g2) shadow-lg shadow-orange-500/20 text-white">
          <Bot size={32} strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tight text-(--text)">
            Cấu hình AI Suggestion
          </h2>
          <p className="text-muted-foreground">
            Điều chỉnh trọng số thuật toán gợi ý món ăn cho khách hàng.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Config Column */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-(--line) shadow-md">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-orange-500" /> 
                    Tham số thuật toán
                  </CardTitle>
                  <CardDescription>
                    Kéo thanh trượt để thay đổi mức độ ưu tiên của từng yếu tố.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                  v2.4.0 (Stable)
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-8">
              {/* Slider 1: Khoảng cách */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold flex items-center gap-2 text-(--text)">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    Ưu tiên Khoảng cách
                  </label>
                  <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {distance}%
                  </span>
                </div>
                <Slider
                  defaultValue={[80]}
                  value={distance}
                  max={100}
                  step={1}
                  onValueChange={setDistance}
                  className="[&>.absolute]:bg-blue-500" // Custom màu thanh trượt
                />
                <p className="text-xs text-muted-foreground">
                  Trọng số càng cao, hệ thống sẽ ưu tiên gợi ý các chi nhánh gần người dùng nhất.
                </p>
              </div>

              <Separator />

              {/* Slider 2: Đánh giá */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold flex items-center gap-2 text-(--text)">
                    <Star className="w-4 h-4 text-yellow-500" />
                    Ưu tiên Đánh giá (Rating)
                  </label>
                  <span className="font-mono font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                    {rating}%
                  </span>
                </div>
                <Slider
                  defaultValue={[60]}
                  value={rating}
                  max={100}
                  step={1}
                  onValueChange={setRating}
                  className="[&>.absolute]:bg-yellow-500"
                />
                <p className="text-xs text-muted-foreground">
                  Ưu tiên gợi ý các món ăn hoặc nhà hàng có điểm đánh giá cao (4.5+ sao).
                </p>
              </div>

              <Separator />

              {/* Slider 3: Lịch sử */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold flex items-center gap-2 text-(--text)">
                    <History className="w-4 h-4 text-purple-500" />
                    Dựa trên Lịch sử cũ
                  </label>
                  <span className="font-mono font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">
                    {history}%
                  </span>
                </div>
                <Slider
                  defaultValue={[40]}
                  value={history}
                  max={100}
                  step={1}
                  onValueChange={setHistory}
                  className="[&>.absolute]:bg-purple-500"
                />
                <p className="text-xs text-muted-foreground">
                  Gợi ý lại các món khách đã từng gọi. Giảm nếu muốn khách thử món mới.
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between bg-gray-50/50 p-6 rounded-b-xl border-t">
              <Button variant="ghost" onClick={handleReset} className="text-muted-foreground hover:text-black">
                <RotateCcw className="w-4 h-4 mr-2" /> Đặt lại mặc định
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="bg-linear-to-r from-(--g1) to-(--g2) text-white shadow-lg hover:shadow-orange-500/25 transition-all"
              >
                {isSaving ? "Đang lưu..." : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Lưu cấu hình
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Info Column */}
        <div className="space-y-6">
          <Card className="bg-slate-900 text-white border-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="text-green-400" /> AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300">
              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <p className="font-semibold text-white mb-1">Dự đoán hành vi</p>
                Với cấu hình hiện tại, 80% khách hàng sẽ nhìn thấy các quán trong bán kính 2km đầu tiên.
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                <p className="font-semibold text-white mb-1">Tỷ lệ chuyển đổi</p>
                Dự kiến tăng <span className="text-green-400 font-bold">+15%</span> đơn hàng nhờ ưu tiên Rating cao.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}