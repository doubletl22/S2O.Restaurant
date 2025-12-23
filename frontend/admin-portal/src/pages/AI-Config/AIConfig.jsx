import React from "react";
import "./AIConfig.css";

const AIConfig = () => {
  return (
    <div className="page-container">
      <h2>Cấu hình Thuật toán Gợi ý (AI)</h2>

      <div className="config-card">
        <h3>Trọng số gợi ý</h3>
        <p className="desc">
          Điều chỉnh mức độ ưu tiên của các yếu tố khi gợi ý nhà hàng cho người
          dùng.
        </p>

        <div className="form-group">
          <label>Khoảng cách (Ưu tiên gần nhất)</label>
          <input type="range" min="0" max="100" defaultValue="80" />
          <span>80%</span>
        </div>

        <div className="form-group">
          <label>Đánh giá (Review cao)</label>
          <input type="range" min="0" max="100" defaultValue="60" />
          <span>60%</span>
        </div>

        <div className="form-group">
          <label>Lịch sử đặt hàng</label>
          <input type="range" min="0" max="100" defaultValue="40" />
          <span>40%</span>
        </div>

        <button className="btn-save">Lưu cấu hình</button>
      </div>
    </div>
  );
};
export default AIConfig;
