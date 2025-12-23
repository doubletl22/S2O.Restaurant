import React, { useState } from "react";
import { Eye, Trash2, Edit } from "lucide-react";
import "./Restaurants.css";

const Restaurants = () => {
  // Dữ liệu giả lập
  const [restaurants] = useState([
    {
      id: 1,
      name: "KFC Nguyễn Văn Cừ",
      address: "Q5, TP.HCM",
      revenue: "$5,000",
      status: "Active",
    },
    {
      id: 2,
      name: "Burger King",
      address: "Q1, TP.HCM",
      revenue: "$3,200",
      status: "Active",
    },
    {
      id: 3,
      name: "Phở 24",
      address: "Q3, TP.HCM",
      revenue: "$1,500",
      status: "Blocked",
    },
  ]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Quản lý Nhà hàng</h2>
        <button className="btn-primary">+ Thêm nhà hàng</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên nhà hàng</th>
              <th>Địa chỉ</th>
              <th>Doanh thu</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {restaurants.map((res) => (
              <tr key={res.id}>
                <td>#{res.id}</td>
                <td>
                  <strong>{res.name}</strong>
                </td>
                <td>{res.address}</td>
                <td>{res.revenue}</td>
                <td>
                  <span className={`status-badge ${res.status.toLowerCase()}`}>
                    {res.status}
                  </span>
                </td>
                <td className="actions">
                  <button className="icon-btn">
                    <Eye size={18} />
                  </button>
                  <button className="icon-btn">
                    <Edit size={18} />
                  </button>
                  <button className="icon-btn delete">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Restaurants;
