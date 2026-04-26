using Microsoft.EntityFrameworkCore;
using S2O.Catalog.App.Features.Products.Commands;
using S2O.Catalog.Domain.Entities;

namespace S2O.Catalog.App.Tests;

public class ProductHandlersTests
{
    [Fact]
    public async Task CreateProduct_ShouldFail_WhenCategoryNotFound()
    {
        var tenantId = Guid.NewGuid();
        await using var db = TestDbFactory.CreateContext();

        var handler = new CreateProductHandler(
            db,
            new StubFileStorageService(),
            new StubCurrentUserService { TenantId = tenantId },
            StubTenantSubscriptionReader.ActiveFree());

        var command = new CreateProductCommand(
            Name: "Pho bo",
            Description: "Mo ta",
            Price: 45000,
            CategoryId: Guid.NewGuid(),
            IsActive: true,
            ImageFile: null);

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Category.NotFound", result.Error.Code);
    }

    [Fact]
    public async Task CreateProduct_ShouldSucceed_WithValidInput()
    {
        var tenantId = Guid.NewGuid();
        await using var db = TestDbFactory.CreateContext();
        var category = new Category { Id = Guid.NewGuid(), TenantId = tenantId, Name = "Mon chinh", IsActive = true };
        db.Categories.Add(category);
        await db.SaveChangesAsync(CancellationToken.None);

        var handler = new CreateProductHandler(
            db,
            new StubFileStorageService(),
            new StubCurrentUserService { TenantId = tenantId },
            StubTenantSubscriptionReader.ActiveFree());

        var command = new CreateProductCommand(
            Name: "Pho dac biet",
            Description: "Mo ta",
            Price: 55000,
            CategoryId: category.Id,
            IsActive: true,
            ImageFile: null);

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.True(result.IsSuccess);
        var created = await db.Products.FindAsync(result.Value);
        Assert.NotNull(created);
        Assert.Equal("Pho dac biet", created!.Name);
        Assert.Equal(category.Id, created.CategoryId);
    }

    [Fact]
    public async Task UpdateProduct_ShouldFail_WhenCategoryNotFound()
    {
        var tenantId = Guid.NewGuid();
        await using var db = TestDbFactory.CreateContext();
        var category = new Category { Id = Guid.NewGuid(), TenantId = tenantId, Name = "Do uong", IsActive = true };
        var product = new Product
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Tra dao",
            Price = 30000,
            CategoryId = category.Id,
            IsActive = true,
            IsAvailable = true
        };

        db.Categories.Add(category);
        db.Products.Add(product);
        await db.SaveChangesAsync(CancellationToken.None);

        var handler = new UpdateProductHandler(
            db,
            new StubFileStorageService(),
            new StubCurrentUserService { TenantId = tenantId });

        var command = new UpdateProductCommand
        {
            Id = product.Id,
            Name = "Tra dao moi",
            Description = "Mo ta",
            Price = 35000,
            CategoryId = Guid.NewGuid(),
            IsActive = true,
            ImageFile = null
        };

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Category.NotFound", result.Error.Code);
    }

    [Fact]
    public async Task UpdateProduct_ShouldSucceed_ForSameTenant()
    {
        var tenantId = Guid.NewGuid();
        await using var db = TestDbFactory.CreateContext();
        var category = new Category { Id = Guid.NewGuid(), TenantId = tenantId, Name = "Do uong", IsActive = true };
        var product = new Product
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Tra dao",
            Price = 30000,
            CategoryId = category.Id,
            IsActive = true,
            IsAvailable = true
        };

        db.Categories.Add(category);
        db.Products.Add(product);
        await db.SaveChangesAsync(CancellationToken.None);

        var handler = new UpdateProductHandler(
            db,
            new StubFileStorageService(),
            new StubCurrentUserService { TenantId = tenantId });

        var command = new UpdateProductCommand
        {
            Id = product.Id,
            Name = "Tra dao cam sa",
            Description = "Da cap nhat",
            Price = 39000,
            CategoryId = category.Id,
            IsActive = false,
            ImageFile = null
        };

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.True(result.IsSuccess);
        var updated = await db.Products.FindAsync(product.Id);
        Assert.NotNull(updated);
        Assert.Equal("Tra dao cam sa", updated!.Name);
        Assert.Equal(39000, updated.Price);
        Assert.False(updated.IsActive);
    }

    [Fact]
    public async Task DeleteProduct_ShouldFail_WhenDeletingDifferentTenant()
    {
        var ownerTenant = Guid.NewGuid();
        var anotherTenant = Guid.NewGuid();

        await using var db = TestDbFactory.CreateContext();
        var category = new Category { Id = Guid.NewGuid(), TenantId = anotherTenant, Name = "Mon", IsActive = true };
        var product = new Product
        {
            Id = Guid.NewGuid(),
            TenantId = anotherTenant,
            Name = "Bun bo",
            Price = 40000,
            CategoryId = category.Id,
            IsActive = true,
            IsAvailable = true
        };

        db.Categories.Add(category);
        db.Products.Add(product);
        await db.SaveChangesAsync(CancellationToken.None);

        var handler = new DeleteProductHandler(db, new StubCurrentUserService { TenantId = ownerTenant });

        var result = await handler.Handle(new DeleteProductCommand(product.Id), CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Product.Forbidden", result.Error.Code);
    }

    [Fact]
    public async Task DeleteProduct_ShouldSucceed_WhenSameTenant()
    {
        var tenantId = Guid.NewGuid();

        await using var db = TestDbFactory.CreateContext();
        var category = new Category { Id = Guid.NewGuid(), TenantId = tenantId, Name = "Mon", IsActive = true };
        var product = new Product
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Com tam",
            Price = 45000,
            CategoryId = category.Id,
            IsActive = true,
            IsAvailable = true
        };

        db.Categories.Add(category);
        db.Products.Add(product);
        await db.SaveChangesAsync(CancellationToken.None);

        var handler = new DeleteProductHandler(db, new StubCurrentUserService { TenantId = tenantId });

        var result = await handler.Handle(new DeleteProductCommand(product.Id), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.True(result.Value);
        db.ChangeTracker.Clear();
        var exists = await db.Products.AsNoTracking().AnyAsync(p => p.Id == product.Id);
        Assert.False(exists);
    }
}
