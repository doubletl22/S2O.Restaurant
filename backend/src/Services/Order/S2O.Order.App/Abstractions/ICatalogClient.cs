using S2O.Order.App.DTOs;

namespace S2O.Order.App.Abstractions;

public interface ICatalogClient
{
    Task<ProductResponse?> GetProductAsync(Guid productId, CancellationToken ct = default);
}