namespace S2O.Order.Infra.ExternalServices;
using S2O.Order.App.Abstractions;
using S2O.Order.App.DTOs;
using System.Net.Http.Json;

public class CatalogClient : ICatalogClient
{
    private readonly HttpClient _httpClient;

    public CatalogClient(HttpClient httpClient) => _httpClient = httpClient;

    public async Task<ProductResponse?> GetProductAsync(Guid productId, CancellationToken ct = default)
    {
        try
        {
            var response = await _httpClient.GetFromJsonAsync<ProductResponse>($"api/products/{productId}", ct);
            return response;
        }
        catch (Exception)
        {
            return null;
        }
    }
}