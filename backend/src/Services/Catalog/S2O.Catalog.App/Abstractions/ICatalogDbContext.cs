using Microsoft.EntityFrameworkCore;
using S2O.Catalog.Domain.Entities;

namespace S2O.Catalog.App.Abstractions;

public interface ICatalogDbContext
{
    DbSet<Product> Products { get; }
    DbSet<Category> Categories { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}