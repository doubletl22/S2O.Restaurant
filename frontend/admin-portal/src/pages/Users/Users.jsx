import React from "react";
import "./Users.css";

const Users = () => {
  const users = [
    { id: 1, name: "John Doe", role: "Admin", email: "admin@example.com" },
    { id: 2, name: "Alice Nguyen", role: "Manager", email: "alice@kfc.com" },
    { id: 3, name: "Tran Van B", role: "Customer", email: "btran@gmail.com" },
  ];

  return (
    <div className="page-container">
      <h2>Quản lý người dùng</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Tên người dùng</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Quyền hạn</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="user-cell">
                    <div className="avatar-small">{user.name.charAt(0)}</div>
                    {user.name}
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span className="role-tag">{user.role}</span>
                </td>
                <td>
                  <button className="text-btn">Chỉnh sửa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Users;
