import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { CONFIG } from "./config.js";
import routes from "./routes/index.js";
import { setupSockets } from "./sockets/index.js";
import { HttpError } from "./utils/httpError.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: CONFIG.CORS_ORIGIN, methods: ["GET", "POST"] }
});
setupSockets(io);

// để routes emit socket
(app as any).locals.io = io;

app.use(cors({ origin: CONFIG.CORS_ORIGIN }));
app.use(express.json({ limit: "2mb" }));

app.use("/api", routes);

// error handler chuẩn
app.use((err: any, _req: any, res: any, _next: any) => {
  const status = err instanceof HttpError ? err.status : 500;
  const message = err?.message || "Server error";
  res.status(status).json({ error: message });
});

server.listen(CONFIG.PORT, () => {
  console.log(`✅ Backend running http://localhost:${CONFIG.PORT}`);
});
