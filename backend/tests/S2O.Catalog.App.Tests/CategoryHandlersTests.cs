using S2O.Catalog.App.Features.Categories.Commands;
using S2O.Catalog.Domain.Entities;

namespace S2O.Catalog.App.Tests;

public class CategoryHandlersTests
{
    [Fact]
    public async Task CreateCategory_ShouldFail_WhenTenantMissing()
    {
        await using var db = TestDbFactory.CreateContext();
        var handler = new CreateCategoryHandler(
            db,
            new StubCurrentUserService { TenantId = null },
            StubTenantSubscriptionReader.ActiveFree());

        var result = await handler.Handle(new CreateCategoryCommand("Tra sua", "Mo ta", true), CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Auth.NoTenant", result.Error.Code);
    }

    [Fact]
    public async Task CreateCategory_ShouldFail_WhenDuplicateNameInTenant()
    {
        var tenantId = Guid.NewGuid();
        await using var db = TestDbFactory.CreateContext();
        db.Categories.Add(new Category
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = "Tra sua",
            IsActive = true
        });
        await db.SaveChangesAsync(CancellationToken.None);

        var handler = new CreateCategoryHandler(
            db,
            new StubCurrentUserService { TenantId = tenantId },
            StubTenantSubscriptionReader.ActiveFree());

        var result = await handler.Handle(new CreateCategoryCommand("  tra sua  ", "Mo ta", true), CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Category.DuplicateName", result.Error.Code);
    }

    [Fact]
    public async Task CreateCategory_ShouldSucceed_WithValidInput()
    {
        var tenantId = Guid.NewGuid();
        await using var db = TestDbFactory.CreateContext();

        var handler = new CreateCategoryHandler(
            db,
            new StubCurrentUserService { TenantId = tenantId },
            StubTenantSubscriptionReader.ActiveFree());

        var result = await handler.Handle(new CreateCategoryCommand("Mon chinh", "Mon an", true), CancellationToken.None);

        Assert.True(result.IsSuccess);
        var created = await db.Categories.FindAsync(result.Value);
        Assert.NotNull(created);
        Assert.Equal("Mon chinh", created!.Name);
        Assert.Equal(tenantId, created.TenantId);
    }

    [Fact]
    public async Task UpdateCategory_ShouldFail_WhenNameIsEmpty()
    {
        var tenantId = Guid.NewGuid();
        await using var db = TestDbFactory.CreateContext();
        var category = new Category { Id = Guid.NewGuid(), TenantId = tenantId, Name = "Cu", IsActive = true };
        db.Categories.Add(category);
        await db.SaveChangesAsync(CancellationToken.None);

        var handler = new UpdateCategoryHandler(db, new StubCurrentUserService { TenantId = tenantId });
        var command = new UpdateCategoryCommand { Id = category.Id, Name = "   ", Description = "x", IsActive = true };

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Category.NameRequired", result.Error.Code);
    }

    [Fact]
    public async Task UpdateCategory_ShouldFail_WhenDuplicateNameInTenant()
    {
        var tenantId = Guid.NewGuid();
        await using var db = TestDbFactory.CreateContext();
        var categoryA = new Category { Id = Guid.NewGuid(), TenantId = tenantId, Name = "Do uong", IsActive = true };
        var categoryB = new Category { Id = Guid.NewGuid(), TenantId = tenantId, Name = "Mon chinh", IsActive = true };
        db.Categories.AddRange(categoryA, categoryB);
        await db.SaveChangesAsync(CancellationToken.None);

        var handler = new UpdateCategoryHandler(db, new StubCurrentUserService { TenantId = tenantId });
        var command = new UpdateCategoryCommand { Id = categoryB.Id, Name = " do uong ", Description = "x", IsActive = true };

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Category.DuplicateName", result.Error.Code);
    }

    [Fact]
    public async Task DeleteCategory_ShouldFail_WhenCategoryIsActive()
    {
        await using var db = TestDbFactory.CreateContext();
        var category = new Category { Id = Guid.NewGuid(), Name = "Con su dung", IsActive = true };
        db.Categories.Add(category);
        await db.SaveChangesAsync(CancellationToken.None);

        var handler = new DeleteCategoryHandler(db);
        var result = await handler.Handle(new DeleteCategoryCommand(category.Id), CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Category.ActiveCannotDelete", result.Error.Code);
    }

    [Fact]
    public async Task DeleteCategory_ShouldSucceed_WhenInactiveAndUnused()
    {
        await using var db = TestDbFactory.CreateContext();
        var category = new Category { Id = Guid.NewGuid(), Name = "Khong su dung", IsActive = false };
        db.Categories.Add(category);
        await db.SaveChangesAsync(CancellationToken.None);

        var handler = new DeleteCategoryHandler(db);
        var result = await handler.Handle(new DeleteCategoryCommand(category.Id), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.True(result.Value);
        Assert.Null(await db.Categories.FindAsync(category.Id));
    }
}
