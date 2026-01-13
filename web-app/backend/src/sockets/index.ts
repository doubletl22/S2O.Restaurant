import { Server } from "socket.io";

export function setupSockets(io: Server) {
  io.on("connection", (socket) => {
    // client join rooms
    socket.on("join", (payload: { restaurantId?: string; branchId?: string; tableCode?: string; orderId?: string }) => {
      if (payload.restaurantId) socket.join(`r:${payload.restaurantId}`);
      if (payload.branchId) socket.join(`b:${payload.branchId}`);
      if (payload.tableCode && payload.branchId) socket.join(`t:${payload.branchId}:${payload.tableCode}`);
      if (payload.orderId) socket.join(`o:${payload.orderId}`);
    });

    socket.on("leave", (payload: any) => {
      if (payload.restaurantId) socket.leave(`r:${payload.restaurantId}`);
      if (payload.branchId) socket.leave(`b:${payload.branchId}`);
      if (payload.tableCode && payload.branchId) socket.leave(`t:${payload.branchId}:${payload.tableCode}`);
      if (payload.orderId) socket.leave(`o:${payload.orderId}`);
    });
  });
}

export function emitOrderUpdated(io: Server, data: { restaurantId: string; branchId: string; tableCode?: string | null; orderId: string }) {
  io.to(`r:${data.restaurantId}`).emit("order:updated", { orderId: data.orderId });
  io.to(`b:${data.branchId}`).emit("order:updated", { orderId: data.orderId });
  if (data.tableCode) io.to(`t:${data.branchId}:${data.tableCode}`).emit("order:updated", { orderId: data.orderId });
  io.to(`o:${data.orderId}`).emit("order:updated", { orderId: data.orderId });
}
