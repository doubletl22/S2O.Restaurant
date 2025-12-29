import React, { useState } from "react"; // 1. Nhớ import useState
import "./AIConfig.css";

const AIConfig = () => {
  // 2. Khởi tạo biến State cho 3 thanh trượt
  const [distance, setDistance] = useState(80);
  const [rating, setRating] = useState(60);
  const [history, setHistory] = useState(40);

  return (
    <div className="page-container">
      <h2>Cấu hình Thuật toán Gợi ý (AI)</h2>

      <div className="config-card">
        <h3>Trọng số gợi ý</h3>
        <p className="desc">
          Điều chỉnh mức độ ưu tiên của các yếu tố khi gợi ý nhà hàng cho người
          dùng.
        </p>

        {/* --- Thanh 1: Khoảng cách --- */}
        <div className="form-group">
          <label>Khoảng cách (Ưu tiên gần nhất)</label>
          <input
            type="range"
            min="0"
            max="100"
            value={distance} // 3. Dùng value thay vì defaultValue
            onChange={(e) => setDistance(e.target.value)} // 4. Cập nhật state khi kéo
          />
          {/* 5. Hiển thị giá trị thay đổi */}
          <span>{distance}%</span>
        </div>

        {/* --- Thanh 2: Đánh giá --- */}
        <div className="form-group">
          <label>Đánh giá (Review cao)</label>
          <input
            type="range"
            min="0"
            max="100"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          />
          <span>{rating}%</span>
        </div>

        {/* --- Thanh 3: Lịch sử --- */}
        <div className="form-group">
          <label>Lịch sử đặt hàng</label>
          <input
            type="range"
            min="0"
            max="100"
            value={history}
            onChange={(e) => setHistory(e.target.value)}
          />
          <span>{history}%</span>
        </div>

        <button className="btn-save">Lưu cấu hình</button>
      </div>
    </div>
  );
};

export default AIConfig;
