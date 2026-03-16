using System.Net.Http.Json;
using S2O.Order.App.Abstractions;
using S2O.Order.App.DTOs;

namespace S2O.Order.Infra.ExternalServices;

public class TableResolverClient : ITableResolverClient
{
    private readonly HttpClient _httpClient;

    public TableResolverClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<PublicTableInfo?> ResolveAsync(Guid tableId, CancellationToken cancellationToken = default)
    {
        try
        {
            return await _httpClient.GetFromJsonAsync<PublicTableInfo>($"api/v1/storefront/tenants/resolve-table/{tableId}", cancellationToken);
        }
        catch
        {
            return null;
        }
    }
}