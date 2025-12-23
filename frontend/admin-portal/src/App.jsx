import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";

// Import các trang thực tế
import Dashboard from "./pages/Dashboard/Dashboard";
import Restaurants from "./pages/Restaurants/Restaurants";
import Users from "./pages/Users/Users";
import Revenue from "./pages/Revenue/Revenue";
import AIConfig from "./pages/AI-Config/AIConfig";

function App() {
  return (
    <Router>
      <AdminLayout>
        <Routes>
          {/* Định tuyến đến các trang */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/revenue" element={<Revenue />} />
          <Route path="/users" element={<Users />} />
          <Route path="/ai-config" element={<AIConfig />} />

          {/* Trang 404 cho link sai */}
          <Route
            path="*"
            element={
              <div style={{ padding: 20 }}>404 - Không tìm thấy trang</div>
            }
          />
        </Routes>
      </AdminLayout>
    </Router>
  );
}

export default App;
