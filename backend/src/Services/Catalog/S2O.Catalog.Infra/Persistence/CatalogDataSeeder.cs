using S2O.Catalog.Domain.Entities;

namespace S2O.Catalog.Infra.Persistence;

public static class CatalogDataSeeder
{
    public static async Task SeedAsync(CatalogDbContext context)
    {
        // Nếu đã có dữ liệu thì không seed nữa
        if (context.Categories.Any()) return;

        // Giả sử đây là TenantId của nhà hàng đầu tiên bạn đăng ký bên Identity
        var tenantId = Guid.Parse("00000000-0000-0000-0000-000000000001");

        var categories = new List<Category>
        {
            new Category {
                Id = Guid.NewGuid(), Name = "Món Chính", TenantId = tenantId,
                Description = "Các món ăn chính của nhà hàng"
            },
            new Category {
                Id = Guid.NewGuid(), Name = "Đồ Uống", TenantId = tenantId
            }
        };

        context.Categories.AddRange(categories);

        context.Products.Add(new Product
        {
            Id = Guid.NewGuid(),
            Name = "Phở Bò Gia Truyền",
            Price = 55000,
            Description = "Phở bò nấu theo công thức S2O",
            Category = categories[0],
            TenantId = tenantId,
            IsAvailable = true
        });

        await context.SaveChangesAsync();
    }
}