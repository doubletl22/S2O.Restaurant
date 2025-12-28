import React, { useState } from "react";
import { Eye, Edit, Trash2, Search, Plus, Filter } from "lucide-react";
import "./Restaurants.css";

const Restaurants = () => {
  // 1. Dữ liệu giả (Sau này sẽ gọi API lấy từ database thật)
  const [restaurants, setRestaurants] = useState([
    {
      id: 1,
      name: "KFC Nguyễn Văn Cừ",
      address: "Q5, TP.HCM",
      owner: "Nguyen Van A",
      revenue: "$5,000",
      status: "Active",
    },
    {
      id: 2,
      name: "Burger King",
      address: "Q1, TP.HCM",
      owner: "Tran Thi B",
      revenue: "$3,200",
      status: "Active",
    },
    {
      id: 3,
      name: "Phở 24",
      address: "Q3, TP.HCM",
      owner: "Le Van C",
      revenue: "$1,500",
      status: "Blocked",
    },
    {
      id: 4,
      name: "Pizza Hut",
      address: "Q10, TP.HCM",
      owner: "Pham Van D",
      revenue: "$8,900",
      status: "Pending",
    },
    {
      id: 5,
      name: "Highlands Coffee",
      address: "Q7, TP.HCM",
      owner: "Hoang Thi E",
      revenue: "$4,100",
      status: "Active",
    },
  ]);

  // State cho ô tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");

  // Hàm lọc danh sách theo từ khóa tìm kiếm
  const filteredRestaurants = restaurants.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      {/* --- PHẦN TIÊU ĐỀ & CÔNG CỤ --- */}
      <div className="page-header">
        <h2 className="page-title">Quản lý Nhà hàng</h2>
        <button className="btn-add">
          <Plus size={18} /> Thêm nhà hàng
        </button>
      </div>

      {/* --- THANH TÌM KIẾM & BỘ LỌC --- */}
      <div className="toolbar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm nhà hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn-filter">
          <Filter size={18} /> Bộ lọc
        </button>
      </div>

      {/* --- BẢNG DANH SÁCH (TABLE) --- */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên nhà hàng</th>
              <th>Địa chỉ</th>
              <th>Chủ sở hữu</th>
              <th>Doanh thu</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredRestaurants.map((item) => (
              <tr key={item.id}>
                <td>#{item.id}</td>
                <td style={{ fontWeight: "600", color: "#374151" }}>
                  {item.name}
                </td>
                <td>{item.address}</td>
                <td>{item.owner}</td>
                <td style={{ fontWeight: "bold" }}>{item.revenue}</td>
                <td>
                  {/* Hiển thị badge màu sắc dựa theo trạng thái */}
                  <span className={`status-badge ${item.status.toLowerCase()}`}>
                    {item.status === "Active" && "Hoạt động"}
                    {item.status === "Blocked" && "Đã khóa"}
                    {item.status === "Pending" && "Chờ duyệt"}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon view" title="Xem chi tiết">
                      <Eye size={16} />
                    </button>
                    <button className="btn-icon edit" title="Chỉnh sửa">
                      <Edit size={16} />
                    </button>
                    <button className="btn-icon delete" title="Xóa">
                      <Trash2 size={16} />
                    </button>
                  </div>
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
