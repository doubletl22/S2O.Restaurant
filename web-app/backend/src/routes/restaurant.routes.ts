import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireRestaurantScope, requireRole } from "../middlewares/rbac.js";
import { validateBody } from "../middlewares/validate.js";
import { HttpError } from "../utils/httpError.js";

const r = Router();

r.get("/by-slug/:slug", async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
      include: { branches: true }
    });
    if (!restaurant) throw new HttpError(404, "Restaurant not found");
    res.json(restaurant);
  } catch (e) {
    next(e);
  }
});

// Staff creates branch
r.post(
  "/branches",
  requireAuth,
  requireRestaurantScope,
  requireRole(["OWNER", "MANAGER"]),
  validateBody(z.object({ name: z.string().min(2), address: z.string().optional() })),
  async (req, res) => {
    const restaurantId = req.auth!.restaurantId!;
    const branch = await prisma.branch.create({
      data: { restaurantId, name: req.body.name, address: req.body.address }
    });
    res.json(branch);
  }
);

export default r;
