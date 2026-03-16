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
            var url = tenantId.HasValue
                ? $"api/v1/storefront/menus/{tenantId.Value}/products/{productId}"
                : $"api/v1/products/{productId}";
            
            var response = await _httpClient.GetFromJsonAsync<ProductResponse>(url, ct);
            return response;
        }
        catch (Exception)
        {
            return null;
        }
    }
}