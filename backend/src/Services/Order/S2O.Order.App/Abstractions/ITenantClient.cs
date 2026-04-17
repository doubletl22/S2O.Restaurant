namespace S2O.Order.App.Abstractions;

public interface ITenantClient
{
    /// <summary>
    /// Check if a tenant is locked
    /// </summary>
    /// <param name="tenantId">Tenant ID to check</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if tenant is locked, false otherwise. Returns false if tenant not found.</returns>
    Task<bool> IsLockedAsync(Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Sync table occupancy state to Tenant service.
    /// </summary>
    Task UpdateTableOccupancyAsync(Guid tableId, bool isOccupied, CancellationToken cancellationToken = default);
}
