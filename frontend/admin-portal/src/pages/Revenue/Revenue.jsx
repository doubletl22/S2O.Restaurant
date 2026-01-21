import React from "react";
import { 
  Download, Calendar, DollarSign, ShoppingBag, 
  TrendingUp, CreditCard, Store 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from "recharts";
import "./Revenue.css";

const Revenue = () => {
  // DỮ LIỆU GIẢ LẬP

  const revenueData = [
    { name: "T2", revenue: 4000, profit: 2400 },
    { name: "T3", revenue: 3000, profit: 1398 },
    { name: "T4", revenue: 2000, profit: 9800 },
    { name: "T5", revenue: 2780, profit: 3908 },
    { name: "T6", revenue: 1890, profit: 4800 },
    { name: "T7", revenue: 2390, profit: 3800 },
    { name: "CN", revenue: 3490, profit: 4300 },
  ];

  const sourceData = [
    { name: "Tại chỗ", value: 45, color: "#3b82f6" },
    { name: "Mang về", value: 30, color: "#10b981" }, 
    { name: "App Food", value: 25, color: "#f59e0b" } 
  ];

  // Dữ liệu bảng các giao dịch gần nhất
  const transactions = [
    { id: "#ORD-001", time: "10:30", customer: "Nguyễn Văn A", total: "$45.00", method: "Thẻ Visa", status: "Success" },
    { id: "#ORD-002", time: "11:15", customer: "Trần Thị B", total: "$120.50", method: "Tiền mặt", status: "Success" },
    { id: "#ORD-003", time: "11:45", customer: "Lê Văn C", total: "$34.00", method: "Ví MoMo", status: "Pending" },
    { id: "#ORD-004", time: "12:20", customer: "Phạm Thị D", total: "$89.00", method: "MasterCard", status: "Success" },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Báo cáo Doanh thu</h2>
          <p className="page-subtitle">Tổng quan tài chính hôm nay</p>
        </div>
        
        <div className="header-actions">
          <div className="branch-filter">
            <Store size={16} />
            <select>
              <option value="all">Toàn bộ hệ thống</option>
              <option value="cn1">CN Quận 1</option>
              <option value="cn5">CN Quận 2</option>
              <option value="cn7">CN Quận 3</option>
            </select>
          </div>

          <div className="date-filter">
            <Calendar size={16} />
            <select>
              <option>7 ngày qua</option>
              <option>Tháng này</option>
              <option>Tháng trước</option>
            </select>
          </div>
          
          <button className="btn-export">
            <Download size={16} /> Xuất
          </button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon blue"><DollarSign size={24} /></div>
          <div className="kpi-info">
            <span className="kpi-label">Tổng doanh thu</span>
            <h3 className="kpi-value">$12,450</h3>
            <span className="kpi-trend up">+15% tuần trước</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon green"><TrendingUp size={24} /></div>
          <div className="kpi-info">
            <span className="kpi-label">Lợi nhuận ròng</span>
            <h3 className="kpi-value">$8,200</h3>
            <span className="kpi-trend up">+8% tuần trước</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon purple"><ShoppingBag size={24} /></div>
          <div className="kpi-info">
            <span className="kpi-label">Tổng đơn hàng</span>
            <h3 className="kpi-value">1,240</h3>
            <span className="kpi-trend down">-3% tuần trước</span>
          </div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-icon orange"><CreditCard size={24} /></div>
          <div className="kpi-info">
            <span className="kpi-label">Giá trị TB/Đơn</span>
            <h3 className="kpi-value">$32.5</h3>
            <span className="kpi-trend up">+2% ổn định</span>
          </div>
        </div>
      </div>

      <div className="charts-section">
        
        <div className="chart-card main-chart">
          <h3>Phân tích Doanh thu & Lợi nhuận</h3>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} prefix="$" />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  cursor={{fill: 'transparent'}}
                />
                <Legend verticalAlign="top" height={36}/>
                <Bar dataKey="revenue" name="Doanh thu" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="profit" name="Lợi nhuận" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card side-chart">
          <h3>Nguồn thu</h3>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="transactions-section">
        <h3>Giao dịch gần nhất</h3>
        <div className="table-wrapper">
          <table className="revenue-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Thời gian</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Thanh toán</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tr, index) => (
                <tr key={index}>
                  <td className="font-bold">{tr.id}</td>
                  <td>{tr.time}</td>
                  <td>{tr.customer}</td>
                  <td className="font-bold" style={{color: '#10b981'}}>{tr.total}</td>
                  <td>{tr.method}</td>
                  <td>
                    <span className={`status-dot ${tr.status.toLowerCase()}`}></span> 
                    {tr.status === "Success" ? "Thành công" : "Đang chờ"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Revenue;