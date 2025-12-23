import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DollarSign, ShoppingBag, Users } from "lucide-react";
import "./Dashboard.css";

const revenueData = [
  { day: "1", value: 10 },
  { day: "10", value: 35 },
  { day: "20", value: 60 },
  { day: "30", value: 50 },
];

const StatCard = ({ title, value, color, icon: Icon }) => (
  <div className="stat-card" style={{ backgroundColor: color }}>
    <div>
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
    <div className="icon-box">
      <Icon size={24} color="#fff" />
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div>
      <div className="stats-grid">
        <StatCard
          title="Tổng doanh thu"
          value="$68,79"
          color="#EC4899"
          icon={DollarSign}
        />
        <StatCard
          title="Tổng đơn hàng"
          value="125"
          color="#8B5CF6"
          icon={ShoppingBag}
        />
        <StatCard title="Khách hàng" value="84" color="#3B82F6" icon={Users} />
      </div>
      <div className="chart-section">
        <h3>Biểu đồ doanh thu</h3>
        <div
          style={{
            height: "300px",
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#EC4899"
                fill="#fce7f3"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
