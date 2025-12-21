import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Reset CSS của Ant Design để giao diện không bị lỗi hiển thị
import "antd/dist/reset.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
