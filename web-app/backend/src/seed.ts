import { prisma } from "./prisma.js";
import { hashPassword } from "./utils/hash.js";

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@s2o.local";
  const adminPass = process.env.SEED_ADMIN_PASS || "admin123";

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: await hashPassword(adminPass),
      name: "System Admin",
      role: "ADMIN"
    }
  });

  const restaurant = await prisma.restaurant.upsert({
    where: { slug: "demo-restaurant" },
    update: {},
    create: { name: "Demo Restaurant", slug: "demo-restaurant" }
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@demo.local" },
    update: {},
    create: {
      email: "manager@demo.local",
      passwordHash: await hashPassword("manager123"),
      name: "Demo Manager",
      role: "MANAGER",
      restaurantId: restaurant.id
    }
  });

  const branch = await prisma.branch.upsert({
    where: { id: "demo_branch_id" },
    update: {},
    create: { id: "demo_branch_id", restaurantId: restaurant.id, name: "CN1 - Main", address: "HCM City" }
  });

  // tables
  const tableCodes = ["A01", "A02", "A03"];
  for (const code of tableCodes) {
    await prisma.table.upsert({
      where: { branchId_code: { branchId: branch.id, code } },
      update: {},
      create: { branchId: branch.id, code, name: `Table ${code}` }
    });
  }

  const catFood = await prisma.category.upsert({
    where: { id: "cat_food" },
    update: {},
    create: { id: "cat_food", restaurantId: restaurant.id, name: "Món chính", sortOrder: 1 }
  });

  const catDrink = await prisma.category.upsert({
    where: { id: "cat_drink" },
    update: {},
    create: { id: "cat_drink", restaurantId: restaurant.id, name: "Nước uống", sortOrder: 2 }
  });

  // items
  const items = [
    { id: "mi_1", name: "Cơm gà", price: 45000, categoryId: catFood.id },
    { id: "mi_2", name: "Bún bò", price: 50000, categoryId: catFood.id },
    { id: "mi_3", name: "Trà đào", price: 30000, categoryId: catDrink.id },
    { id: "mi_4", name: "Cà phê sữa", price: 28000, categoryId: catDrink.id }
  ];

  for (const it of items) {
    await prisma.menuItem.upsert({
      where: { id: it.id },
      update: {},
      create: {
        id: it.id,
        restaurantId: restaurant.id,
        categoryId: it.categoryId,
        name: it.name,
        price: it.price,
        isActive: true
      }
    });
  }

  console.log("✅ Seed done");
  console.log("Admin:", admin.email, "pass:", adminPass);
  console.log("Manager:", manager.email, "pass: manager123");
  console.log("Guest URL sample:");
  console.log(`http://localhost:3000/guest/${restaurant.slug}/${branch.id}/A01`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
