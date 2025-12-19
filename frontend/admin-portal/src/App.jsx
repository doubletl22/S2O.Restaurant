import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./components/Layout/MainLayout";

import Dashboard from "./pages/Dashboard";
import Restaurant from "./pages/Restaurant";
import AIConfig from "./pages/AIConfig";
import Revenue from "./pages/Revenue";

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/restaurants" element={<Restaurant />} />
          <Route path="/ai-config" element={<AIConfig />} />
          <Route path="/revenue" element={<Revenue />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
