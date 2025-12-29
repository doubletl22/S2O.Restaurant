import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  // Kiểm tra xem đã lưu token đăng nhập chưa (Token này được tạo lúc bấm nút Đăng nhập)
  const token = localStorage.getItem("accessToken");

  // Nếu có token -> Cho phép hiển thị nội dung bên trong (children)
  // Nếu KHÔNG có -> Đá về trang Login
  return token ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
