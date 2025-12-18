import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import khung giao diện chính
import MainLayout from "./components/Layout/MainLayout";

// Import các trang chức năng
import Dashboard from "./pages/Dashboard";
import RestaurantManagement from "./pages/Restaurant";
import AIConfig from "./pages/AIConfig";
import RevenueManagement from "./pages/Revenue";

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          {/* Trang mặc định là Dashboard */}
          <Route path="/" element={<Dashboard />} />

          {/* Trang quản lý nhà hàng & Duyệt đối tác */}
          <Route path="/restaurants" element={<RestaurantManagement />} />

          {/* Trang cấu hình thuật toán AI */}
          <Route path="/ai-config" element={<AIConfig />} />

          {/* Trang báo cáo doanh thu SaaS */}
          <Route path="/revenue" element={<RevenueManagement />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
