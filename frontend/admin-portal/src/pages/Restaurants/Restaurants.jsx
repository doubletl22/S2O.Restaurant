import React, { useState } from "react";
import { Eye, Trash2, Edit, Plus, Search, X } from "lucide-react";
import "./Restaurants.css";

const Restaurants = () => {
  // Dự liệu giả lập
  const initialData = [
    {
      id: 1,
      name: "CN Quận 1",
      address: "Q1, TP.HCM",
      revenue: "0,000",
      status: "Active",
    },
    {
      id: 2,
      name: "CN Quận 2",
      address: "Q2, TP.HCM",
      revenue: "0,000",
      status: "Active",
    },
    {
      id: 3,
      name: "CN Quận 3",
      address: "Q3, TP.HCM",
      revenue: "0,000",
      status: "Blocked",
    },
  ];

  // Các STATE quản lý
  const [restaurants, setRestaurants] = useState(initialData); // Danh sách nhà hàng
  const [searchTerm, setSearchTerm] = useState(""); // Từ khóa tìm kiếm

  // State cho Modal (Popup)
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // State lưu dữ liệu form khi nhập
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    address: "",
    revenue: "",
    status: "Active",
  });

  // Tìm kiếm
  const filteredRestaurants = restaurants.filter((res) =>
    res.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Xoá
  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhà hàng này?")) {
      setRestaurants(restaurants.filter((item) => item.id !== id));
    }
  };

  // Mở MODAL (Để Thêm hoặc Sửa)
  const handleOpenModal = (restaurant = null) => {
    if (restaurant) {
      setIsEditMode(true);
      setFormData(restaurant);
    } else {
      setIsEditMode(false);
      setFormData({
        id: "",
        name: "",
        address: "",
        revenue: "",
        status: "Active",
      });
    }
    setShowModal(true); // Hiện Modal
  };

  // Lưu dữ liệu
  const handleSave = () => {
    if (!formData.name || !formData.address) {
      return alert("Vui lòng nhập tên và địa chỉ!");
    }

    if (isEditMode) {
      setRestaurants(
        restaurants.map((item) => (item.id === formData.id ? formData : item)),
      );
    } else {
      // Thêm nhà hàng mới
      const newRestaurant = { ...formData, id: Date.now() };
      setRestaurants([...restaurants, newRestaurant]);
    }

    setShowModal(false);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Quản lý Nhà hàng</h2>

        <div className="actions-group">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Nút thêm mới */}
          <button className="btn-add" onClick={() => handleOpenModal(null)}>
            <Plus size={18} /> Thêm mới
          </button>
        </div>
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
            {filteredRestaurants.length > 0 ? (
              filteredRestaurants.map((res, index) => (
                <tr key={res.id}>
                  <td>#{index + 1}</td>
                  <td>
                    <strong>{res.name}</strong>
                  </td>
                  <td>{res.address}</td>
                  <td>
                    {res.revenue.includes("$")
                      ? res.revenue
                      : `$${res.revenue}`}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${res.status.toLowerCase()}`}
                    >
                      {res.status}
                    </span>
                  </td>
                  <td className="actions">
                    <button className="icon-btn" title="Xem chi tiết">
                      <Eye size={18} />
                    </button>
                    <button
                      className="icon-btn"
                      onClick={() => handleOpenModal(res)}
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      className="icon-btn delete"
                      onClick={() => handleDelete(res.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  Không tìm thấy kết quả nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{isEditMode ? "Chỉnh sửa Nhà hàng" : "Thêm Nhà hàng Mới"}</h3>
              <button onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Tên nhà hàng</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Địa chỉ</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Doanh thu</label>
                <input
                  type="text"
                  value={formData.revenue}
                  onChange={(e) =>
                    setFormData({ ...formData, revenue: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="Active">Active</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Hủy
              </button>
              <button className="btn-primary" onClick={handleSave}>
                {isEditMode ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Restaurants;
