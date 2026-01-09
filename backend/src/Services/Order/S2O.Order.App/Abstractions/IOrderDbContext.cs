using Microsoft.EntityFrameworkCore;
using S2O.Order.Domain.Entities;

namespace S2O.Order.App.Abstractions;

public interface IOrderDbContext
{
    DbSet<S2O.Order.Domain.Entities.Order> Orders { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}