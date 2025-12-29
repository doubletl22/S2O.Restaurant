import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Store,
  User,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import "./AddRestaurant.css"; // Lát nữa sẽ tạo file này

const AddRestaurant = () => {
  const navigate = useNavigate();

  // State lưu dữ liệu form
  const [formData, setFormData] = useState({
    name: "",
    owner: "",
    email: "",
    phone: "",
    address: "",
    package: "Gold", // Gói dịch vụ mặc định
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Giả lập gửi API thành công
    alert("Đã thêm nhà hàng thành công!");
    console.log("Dữ liệu gửi đi:", formData);

    // Quay lại trang danh sách
    navigate("/restaurants");
  };

  return (
    <div className="add-page-container">
      {/* Nút Quay lại */}
      <button className="btn-back" onClick={() => navigate("/restaurants")}>
        <ArrowLeft size={18} /> Quay lại danh sách
      </button>

      <div className="form-card">
        <h2 className="form-title">Thêm Đối Tác Nhà Hàng Mới</h2>
        <p className="form-desc">
          Vui lòng điền đầy đủ thông tin để kích hoạt tài khoản nhà hàng mới.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Tên nhà hàng */}
            <div className="form-group">
              <label>
                <Store size={14} /> Tên nhà hàng
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="Ví dụ: KFC Nguyễn Văn Cừ"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            {/* Chủ sở hữu */}
            <div className="form-group">
              <label>
                <User size={14} /> Chủ sở hữu
              </label>
              <input
                type="text"
                name="owner"
                required
                placeholder="Họ và tên chủ quán"
                value={formData.owner}
                onChange={handleChange}
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label>
                <Mail size={14} /> Email đăng nhập
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="admin@restaurant.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Số điện thoại */}
            <div className="form-group">
              <label>
                <Phone size={14} /> Số điện thoại
              </label>
              <input
                type="tel"
                name="phone"
                required
                placeholder="0901234567"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            {/* Địa chỉ (chiếm hết dòng) */}
            <div className="form-group full-width">
              <label>
                <MapPin size={14} /> Địa chỉ kinh doanh
              </label>
              <input
                type="text"
                name="address"
                required
                placeholder="Số nhà, đường, phường, quận..."
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            {/* Chọn gói dịch vụ */}
            <div className="form-group">
              <label>Gói dịch vụ đăng ký</label>
              <select
                name="package"
                value={formData.package}
                onChange={handleChange}
              >
                <option value="Silver">Gói Bạc (Cơ bản)</option>
                <option value="Gold">Gói Vàng (Đề xuất)</option>
                <option value="Diamond">Gói Kim Cương (VIP)</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate("/restaurants")}
            >
              Hủy bỏ
            </button>
            <button type="submit" className="btn-submit">
              <Save size={18} /> Lưu & Kích hoạt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRestaurant;
