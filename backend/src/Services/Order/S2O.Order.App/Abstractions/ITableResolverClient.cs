using S2O.Order.App.DTOs;

namespace S2O.Order.App.Abstractions;

public interface ITableResolverClient
{
    Task<PublicTableInfo?> ResolveAsync(Guid tableId, CancellationToken cancellationToken = default);
}