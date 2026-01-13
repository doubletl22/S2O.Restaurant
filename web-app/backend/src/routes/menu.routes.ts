import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireRestaurantScope, requireRole } from "../middlewares/rbac.js";
import { validateBody } from "../middlewares/validate.js";
import { HttpError } from "../utils/httpError.js";

const r = Router();

// Guest/public: lấy menu theo restaurantSlug
r.get("/public/:restaurantSlug", async (req, res, next) => {
  try {
    const slug = req.params.restaurantSlug;
    const restaurant = await prisma.restaurant.findUnique({ where: { slug } });
    if (!restaurant) throw new HttpError(404, "Restaurant not found");

    const categories = await prisma.category.findMany({
      where: { restaurantId: restaurant.id, isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
    });

    const items = await prisma.menuItem.findMany({
      where: { restaurantId: restaurant.id, isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
    });

    res.json({ restaurantId: restaurant.id, categories, items });
  } catch (e) {
    next(e);
  }
});

// Staff: CRUD categories/items
r.use(requireAuth, requireRestaurantScope, requireRole(["OWNER", "MANAGER", "STAFF"]));

r.post(
  "/categories",
  validateBody(z.object({ name: z.string().min(2), sortOrder: z.number().int().optional() })),
  async (req, res) => {
    const restaurantId = req.auth!.restaurantId!;
    const c = await prisma.category.create({
      data: { restaurantId, name: req.body.name, sortOrder: req.body.sortOrder ?? 0 }
    });
    res.json(c);
  }
);

r.post(
  "/items",
  validateBody(
    z.object({
      name: z.string().min(2),
      price: z.number().int().min(0),
      description: z.string().optional(),
      imageUrl: z.string().url().optional(),
      categoryId: z.string().optional().nullable(),
      sortOrder: z.number().int().optional()
    })
  ),
  async (req, res) => {
    const restaurantId = req.auth!.restaurantId!;
    const item = await prisma.menuItem.create({
      data: {
        restaurantId,
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        imageUrl: req.body.imageUrl,
        categoryId: req.body.categoryId ?? null,
        sortOrder: req.body.sortOrder ?? 0
      }
    });
    res.json(item);
  }
);

export default r;
