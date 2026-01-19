// src/hooks/useSignalR.ts
import { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';

export const useSignalR = (branchId: string | undefined) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

  useEffect(() => {
    // Chỉ kết nối khi có branchId (đã login xong)
    if (!branchId) return;

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5000/orderHub") // Đổi port nếu backend khác
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    setConnection(newConnection);
  }, [branchId]);

  useEffect(() => {
    if (connection && connection.state === signalR.HubConnectionState.Disconnected) {
      connection.start()
        .then(() => {
          console.log('🟢 Connected to SignalR Hub');
          // Gọi hàm JoinBranch bên backend
          //
          connection.invoke('JoinBranch', branchId);
        })
        .catch(e => console.error('🔴 Connection failed: ', e));

      // Lắng nghe sự kiện
      // Dùng dấu gạch dưới (_) để báo TypeScript là biến này không dùng, tránh lỗi TS6133
      connection.on('ReceiveMessage', (_, message) => {
        console.log('🔔 Notification:', message);
        // Bắn event global để KitchenBoard biết mà reload
        window.dispatchEvent(new Event('ORDER_UPDATED'));
      });
    }

    // Cleanup khi component unmount
    return () => {
      if (connection) {
        connection.off('ReceiveMessage');
      }
    };
  }, [connection, branchId]);

  return connection;
};