using S2O.Catalog.Domain.Entities;

namespace S2O.Catalog.Infra.Persistence;

public static class CatalogDataSeeder
{
    public static async Task SeedAsync(CatalogDbContext context)
    {
        // 1. Kiểm tra xem đã có dữ liệu chưa
        if (context.Products.Any()) return;

        // 2. Tenant ID (PHẢI KHỚP VỚI BÊN IDENTITY)
        var tenantId = Guid.Parse("11111111-1111-1111-1111-111111111111");

        // 3. Tạo Danh mục
        var catPho = new Category { Id = Guid.NewGuid(), Name = "Món Phở", TenantId = tenantId, IsActive = true };
        var catCom = new Category { Id = Guid.NewGuid(), Name = "Món Cơm", TenantId = tenantId, IsActive = true };
        var catNuoc = new Category { Id = Guid.NewGuid(), Name = "Đồ Uống", TenantId = tenantId, IsActive = true };

        context.Categories.AddRange(new[] { catPho, catCom, catNuoc });

        // 4. Tạo 10 Món ăn
        var products = new List<Product>
        {
            // Phở
            new Product { Id = Guid.NewGuid(), Name = "Phở Bò Tái", Price = 55000, Description = "Bò tái mềm ngọt", Category = catPho, TenantId = tenantId, IsActive = true },
            new Product { Id = Guid.NewGuid(), Name = "Phở Bò Chín", Price = 50000, Description = "Nạm gầu giòn sần sật", Category = catPho, TenantId = tenantId, IsActive = true },
            new Product { Id = Guid.NewGuid(), Name = "Phở Gà Ta", Price = 45000, Description = "Gà đồi xịn", Category = catPho, TenantId = tenantId, IsActive = true },
            new Product { Id = Guid.NewGuid(), Name = "Phở Đặc Biệt", Price = 80000, Description = "Full topping bò gà trứng", Category = catPho, TenantId = tenantId, IsActive = true },
            
            // Cơm
            new Product { Id = Guid.NewGuid(), Name = "Cơm Rang Dưa Bò", Price = 60000, Description = "Dưa chua bò mềm", Category = catCom, TenantId = tenantId, IsActive = true },
            new Product { Id = Guid.NewGuid(), Name = "Cơm Đùi Gà Nướng", Price = 55000, Description = "Gà nướng mật ong", Category = catCom, TenantId = tenantId, IsActive = true },
            new Product { Id = Guid.NewGuid(), Name = "Cơm Thịt Kho Tàu", Price = 45000, Description = "Chuẩn vị nhà làm", Category = catCom, TenantId = tenantId, IsActive = true },

            // Đồ uống
            new Product { Id = Guid.NewGuid(), Name = "Trà Đá", Price = 5000, Description = "Full đá ít trà", Category = catNuoc, TenantId = tenantId, IsActive = true },
            new Product { Id = Guid.NewGuid(), Name = "Nhân Trần", Price = 5000, Description = "Mát gan giải độc", Category = catNuoc, TenantId = tenantId, IsActive = true },
            new Product { Id = Guid.NewGuid(), Name = "Coca Cola", Price = 15000, Description = "Lon 330ml ướp lạnh", Category = catNuoc, TenantId = tenantId, IsActive = true }
        };

        context.Products.AddRange(products);
        await context.SaveChangesAsync();
    }
}