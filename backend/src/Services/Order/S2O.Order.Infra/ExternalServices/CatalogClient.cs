namespace S2O.Order.Infra.ExternalServices;
using S2O.Order.App.Abstractions;
using S2O.Order.App.DTOs;
using System.Net.Http.Json;

public class CatalogClient : ICatalogClient
{
    private readonly HttpClient _httpClient;

    public CatalogClient(HttpClient httpClient) => _httpClient = httpClient;

    public async Task<ProductResponse?> GetProductAsync(Guid productId, Guid? tenantId = null, CancellationToken ct = default)
    {
        try
        {
            // ✅ Pass tenantId as query parameter để bypass global TenantId filter
            var url = $"api/v1/products/{productId}";
            if (tenantId.HasValue)
            {
                url += $"?tenantId={tenantId.Value}";
            }
            
            var response = await _httpClient.GetFromJsonAsync<ProductResponse>(url, ct);
            return response;
        }
        catch (Exception)
        {
            return null;
        }
    }
}