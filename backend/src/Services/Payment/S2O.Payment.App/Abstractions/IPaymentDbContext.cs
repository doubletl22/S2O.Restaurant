using Microsoft.EntityFrameworkCore;
using S2O.Payment.Domain.Entities;

namespace S2O.Payment.App.Abstractions;

public interface IPaymentDbContext
{
    DbSet<PaymentTransaction> Transactions { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}