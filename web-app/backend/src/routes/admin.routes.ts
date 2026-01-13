import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireRole } from "../middlewares/rbac.js";
import { validateBody } from "../middlewares/validate.js";
import { hashPassword } from "../utils/hash.js";

const r = Router();

r.use(requireAuth, requireRole(["ADMIN"]));

const CreateRestaurant = z.object({
  name: z.string().min(2),
  slug: z.string().min(2)
});

r.post("/restaurants", validateBody(CreateRestaurant), async (req, res) => {
  const { name, slug } = req.body;
  const restaurant = await prisma.restaurant.create({ data: { name, slug } });
  res.json(restaurant);
});

const CreateUser = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  role: z.enum(["ADMIN", "OWNER", "MANAGER", "STAFF"]),
  restaurantId: z.string().optional().nullable()
});

r.post("/users", validateBody(CreateUser), async (req, res) => {
  const { email, password, name, role, restaurantId } = req.body;
  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: { email, passwordHash, name, role, restaurantId: restaurantId ?? null }
  });

  res.json({ id: user.id, email: user.email, name: user.name, role: user.role, restaurantId: user.restaurantId });
});

export default r;
