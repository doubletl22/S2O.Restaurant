import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { validateBody } from "../middlewares/validate.js";
import { HttpError } from "../utils/httpError.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireRestaurantScope, requireRole } from "../middlewares/rbac.js";

const r = Router();

// ========== GUEST: tạo order theo restaurantSlug/branchId/tableCode ==========
const GuestCreateOrder = z.object({
  restaurantSlug: z.string(),
  branchId: z.string(),
  tableCode: z.string(),
  guestName: z.string().optional(),
  guestPhone: z.string().optional(),
  guestNote: z.string().optional(),
  items: z.array(z.object({ menuItemId: z.string(), qty: z.number().int().min(1), note: z.string().optional() })).min(1)
});

r.post("/guest", validateBody(GuestCreateOrder), async (req, res, next) => {
  try {
    const { restaurantSlug, branchId, tableCode, guestName, guestPhone, guestNote, items } = req.body;

    const restaurant = await prisma.restaurant.findUnique({ where: { slug: restaurantSlug } });
    if (!restaurant) throw new HttpError(404, "Restaurant not found");

    const table = await prisma.table.findUnique({
      where: { branchId_code: { branchId, code: tableCode } }
    });
    if (!table || !table.isActive) throw new HttpError(400, "Table invalid/inactive");

    // load menu items để chốt giá
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: items.map(i => i.menuItemId) }, restaurantId: restaurant.id, isActive: true }
    });
    if (menuItems.length !== items.length) throw new HttpError(400, "Some menu items invalid/inactive");

    const created = await prisma.order.create({
      data: {
        restaurantId: restaurant.id,
        branchId,
        tableId: table.id,
        guestName,
        guestPhone,
        guestNote,
        items: {
          create: items.map(i => {
            const mi = menuItems.find(m => m.id === i.menuItemId)!;
            return { menuItemId: mi.id, qty: i.qty, unitPrice: mi.price, note: i.note };
          })
        }
      },
      include: { items: { include: { menuItem: true } }, table: true }
    });

    // audit (guest)
    await prisma.auditLog.create({
      data: {
        restaurantId: restaurant.id,
        action: "ORDER_CREATED",
        entity: "Order",
        entityId: created.id,
        metaJson: JSON.stringify({ by: "GUEST", branchId, tableCode })
      }
    });

    res.json(created);
  } catch (e) {
    next(e);
  }
});

// Guest: list orders theo table (history)
r.get("/guest/history", async (req, res, next) => {
  try {
    const { restaurantSlug, branchId, tableCode } = req.query as any;
    const restaurant = await prisma.restaurant.findUnique({ where: { slug: restaurantSlug } });
    if (!restaurant) throw new HttpError(404, "Restaurant not found");

    const table = await prisma.table.findUnique({
      where: { branchId_code: { branchId, code: tableCode } }
    });
    if (!table) throw new HttpError(400, "Table invalid");

    const orders = await prisma.order.findMany({
      where: { restaurantId: restaurant.id, branchId, tableId: table.id },
      orderBy: { createdAt: "desc" },
      include: { items: { include: { menuItem: true } }, payments: true }
    });

    res.json(orders);
  } catch (e) {
    next(e);
  }
});

// Guest: request bill
r.post("/guest/request-bill", validateBody(z.object({
  restaurantSlug: z.string(),
  branchId: z.string(),
  tableCode: z.string()
})), async (req, res, next) => {
  try {
    const { restaurantSlug, branchId, tableCode } = req.body;
    const restaurant = await prisma.restaurant.findUnique({ where: { slug: restaurantSlug } });
    if (!restaurant) throw new HttpError(404, "Restaurant not found");

    const table = await prisma.table.findUnique({ where: { branchId_code: { branchId, code: tableCode } } });
    if (!table) throw new HttpError(400, "Table invalid");

    // đánh dấu billRequested cho các order chưa PAID/CANCELLED
    await prisma.order.updateMany({
      where: { restaurantId: restaurant.id, branchId, tableId: table.id, status: { notIn: ["PAID", "CANCELLED"] } },
      data: { billRequested: true }
    });

    await prisma.auditLog.create({
      data: {
        restaurantId: restaurant.id,
        action: "BILL_REQUESTED",
        entity: "Table",
        entityId: table.id,
        metaJson: JSON.stringify({ branchId, tableCode })
      }
    });

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// ========== STAFF: quản lý orders ==========
r.use(requireAuth, requireRestaurantScope, requireRole(["OWNER", "MANAGER", "STAFF"]));

// list orders theo branch/status
r.get("/by-branch/:branchId", async (req, res) => {
  const restaurantId = req.auth!.restaurantId!;
  const branchId = req.params.branchId;
  const status = (req.query.status as string | undefined) ?? undefined;

  const orders = await prisma.order.findMany({
    where: { restaurantId, branchId, ...(status ? { status: status as any } : {}) },
    orderBy: { createdAt: "desc" },
    include: { table: true, items: { include: { menuItem: true } }, payments: true }
  });

  res.json(orders);
});

// update status
r.post("/status", validateBody(z.object({
  orderId: z.string(),
  status: z.enum(["NEW","CONFIRMED","COOKING","READY","SERVED","CANCELLED","PAID"])
})), async (req, res, next) => {
  try {
    const restaurantId = req.auth!.restaurantId!;
    const { orderId, status } = req.body;

    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { table: true } });
    if (!order || order.restaurantId !== restaurantId) throw new HttpError(404, "Order not found");

    const updated = await prisma.order.update({ where: { id: orderId }, data: { status } });

    await prisma.auditLog.create({
      data: {
        actorId: req.auth!.userId,
        restaurantId,
        action: "ORDER_STATUS_CHANGED",
        entity: "Order",
        entityId: orderId,
        metaJson: JSON.stringify({ from: order.status, to: status })
      }
    });

    // socket emit: server.ts sẽ inject io vào app locals (xem dưới)
    const io = (req.app as any).locals.io;
    if (io) {
      const tableCode = order.table?.code ?? null;
      io.to(`r:${restaurantId}`).emit("order:updated", { orderId });
      io.to(`b:${order.branchId}`).emit("order:updated", { orderId });
      if (tableCode) io.to(`t:${order.branchId}:${tableCode}`).emit("order:updated", { orderId });
      io.to(`o:${orderId}`).emit("order:updated", { orderId });
    }

    res.json(updated);
  } catch (e) {
    next(e);
  }
});

// mark paid (payment)
r.post("/pay", validateBody(z.object({
  orderId: z.string(),
  method: z.enum(["CASH","BANK_TRANSFER","CARD"]),
  amount: z.number().int().min(0),
  note: z.string().optional()
})), async (req, res, next) => {
  try {
    const restaurantId = req.auth!.restaurantId!;
    const { orderId, method, amount, note } = req.body;

    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { table: true } });
    if (!order || order.restaurantId !== restaurantId) throw new HttpError(404, "Order not found");

    await prisma.payment.create({ data: { orderId, method, amount, note } });
    const updated = await prisma.order.update({ where: { id: orderId }, data: { status: "PAID" as any } });

    await prisma.auditLog.create({
      data: {
        actorId: req.auth!.userId,
        restaurantId,
        action: "ORDER_PAID",
        entity: "Order",
        entityId: orderId,
        metaJson: JSON.stringify({ method, amount })
      }
    });

    res.json(updated);
  } catch (e) {
    next(e);
  }
});

export default r;
