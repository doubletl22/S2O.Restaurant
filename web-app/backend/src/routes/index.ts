import { Router } from "express";
import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin.routes.js";
import restaurantRoutes from "./restaurant.routes.js";
import menuRoutes from "./menu.routes.js";
import tableRoutes from "./table.routes.js";
import orderRoutes from "./order.routes.js";

const r = Router();

r.get("/health", (_req, res) => res.json({ ok: true }));

r.use("/auth", authRoutes);
r.use("/admin", adminRoutes);
r.use("/restaurants", restaurantRoutes);
r.use("/menu", menuRoutes);
r.use("/tables", tableRoutes);
r.use("/orders", orderRoutes);

export default r;
