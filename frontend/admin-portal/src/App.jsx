import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import Login from "./pages/Login/Login";
// 1. Import PrivateRoute
import PrivateRoute from "./components/PrivateRoute";

// ... Các import trang Admin giữ nguyên ...
import Dashboard from "./pages/Dashboard/Dashboard";
import Restaurants from "./pages/Restaurants/Restaurants";
import Users from "./pages/Users/Users";
import Revenue from "./pages/Revenue/Revenue";
import AIConfig from "./pages/AI-Config/AIConfig";

function App() {
  return (
    <Router>
      <Routes>
        {/* KHU VỰC 1: Login (Ai cũng vào được) */}
        <Route path="/login" element={<Login />} />

        {/* KHU VỰC 2: Admin (Phải qua chốt bảo vệ) */}
        <Route
          path="/*"
          element={
            // 2. Bọc AdminLayout bên trong PrivateRoute
            <PrivateRoute>
              <AdminLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/restaurants" element={<Restaurants />} />
                  <Route path="/revenue" element={<Revenue />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/ai-config" element={<AIConfig />} />

                  <Route
                    path="*"
                    element={
                      <div style={{ padding: 20 }}>
                        404 - Không tìm thấy trang
                      </div>
                    }
                  />
                </Routes>
              </AdminLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
