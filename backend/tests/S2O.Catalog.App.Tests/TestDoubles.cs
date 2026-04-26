using Microsoft.EntityFrameworkCore;
using Microsoft.Data.Sqlite;
using S2O.Catalog.App.Abstractions;
using S2O.Catalog.App.Features.Plans;
using S2O.Catalog.Domain.Entities;
using S2O.Shared.Kernel.Interfaces;
using S2O.Shared.Kernel.Results;

namespace S2O.Catalog.App.Tests;

internal sealed class TestCatalogDbContext : DbContext, ICatalogDbContext
{
    public TestCatalogDbContext(DbContextOptions<TestCatalogDbContext> options) : base(options)
    {
    }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();
    // Removed SaveChangesAsync implementation
}

internal sealed class StubCurrentUserService : ICurrentUserService
{
    public Guid? UserId { get; init; }
    public Guid? TenantId { get; init; }
    public string? Email { get; init; }
    public bool IsAuthenticated { get; init; } = true;
}

internal sealed class StubFileStorageService : IFileStorageService
{
    public Task<string> UploadFileAsync(Stream stream, string fileName)
    {
        return Task.FromResult("https://example.test/uploads/" + fileName);
    }

    public Task DeleteFileAsync(string publicId)
    {
        return Task.CompletedTask;
    }
}

internal sealed class StubTenantSubscriptionReader : ITenantSubscriptionReader
{
    private readonly Result<TenantSubscriptionSnapshot> _result;

    public StubTenantSubscriptionReader(Result<TenantSubscriptionSnapshot> result)
    {
        _result = result;
    }

    public Task<Result<TenantSubscriptionSnapshot>> GetTenantSubscriptionAsync(Guid tenantId, CancellationToken cancellationToken)
    {
        return Task.FromResult(_result);
    }

    public static StubTenantSubscriptionReader ActiveFree()
    {
        return new StubTenantSubscriptionReader(
            Result<TenantSubscriptionSnapshot>.Success(
                new TenantSubscriptionSnapshot(
                    PlanType: "Free",
                    IsLocked: false,
                    IsActive: true,
                    IsSubscriptionExpired: false,
                    SubscriptionExpiry: DateTime.UtcNow.AddDays(30))));
    }
}

internal static class TestDbFactory
{
    public static TestCatalogDbContext CreateContext()
    {
        var connection = new SqliteConnection("DataSource=:memory:");
        connection.Open();

        var options = new DbContextOptionsBuilder<TestCatalogDbContext>()
            .UseSqlite(connection)
            .Options;

        var context = new TestCatalogDbContext(options);
        context.Database.EnsureCreated();

        return context;
    }
}
