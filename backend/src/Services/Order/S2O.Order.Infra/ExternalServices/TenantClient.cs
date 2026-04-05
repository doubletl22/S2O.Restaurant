using S2O.Order.App.Abstractions;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace S2O.Order.Infra.ExternalServices;

public class TenantClient : ITenantClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<TenantClient> _logger;

    public TenantClient(HttpClient httpClient, ILogger<TenantClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<bool> IsLockedAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _httpClient.GetAsync($"/api/v1/tenants/{tenantId}/check-lock-status", cancellationToken);
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning($"Failed to check tenant lock status. Status: {response.StatusCode}, TenantId: {tenantId}");
                return false; // If we can't check, don't block the request
            }

            var content = await response.Content.ReadAsStringAsync(cancellationToken);
            using var doc = JsonDocument.Parse(content);
            var root = doc.RootElement;

            // Try to get isLocked from value or data field
            if (root.TryGetProperty("value", out var value) && value.TryGetProperty("isLocked", out var isLocked))
            {
                return isLocked.GetBoolean();
            }

            if (root.TryGetProperty("data", out var data) && data.TryGetProperty("isLocked", out var isLockedData))
            {
                return isLockedData.GetBoolean();
            }

            _logger.LogWarning($"Could not parse lock status from response. TenantId: {tenantId}");
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error checking tenant lock status. TenantId: {tenantId}, Error: {ex.Message}");
            return false; // If we can't check, don't block the request
        }
    }
}
