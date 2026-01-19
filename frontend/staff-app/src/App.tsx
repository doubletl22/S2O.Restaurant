// src/App.tsx
import React from 'react'; // Import React để tránh lỗi namespace JSX
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import KitchenBoard from './pages/KitchenBoard';

// Component bảo vệ Route: Nếu không có token thì đá về Login
// Sửa type children thành React.ReactNode để nhận mọi kiểu component con
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('accessToken');
  // Nếu có token thì render children, không thì chuyển hướng
  return token ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route Login công khai */}
        <Route path="/login" element={<Login />} />
        
        {/* Route Bếp cần đăng nhập */}
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <KitchenBoard />
            </PrivateRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;