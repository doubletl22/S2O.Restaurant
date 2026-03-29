using Microsoft.EntityFrameworkCore;
using S2O.Tenant.App.Abstractions;
using System.Net.Http.Headers;
using System.Text.Json;

namespace S2O.Tenant.Api.Services;

public interface IAdminStatsService
{
    Task<AdminStatsDto> GetStatsAsync(string authorizationHeader, CancellationToken cancellationToken = default);
}

public sealed class AdminStatsService : IAdminStatsService
{
    private readonly ITenantDbContext _context;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AdminStatsService> _logger;

    public AdminStatsService(
        ITenantDbContext context,
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<AdminStatsService> logger)
    {
        _context = context;
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<AdminStatsDto> GetStatsAsync(string authorizationHeader, CancellationToken cancellationToken = default)
    {
        var totalTenants = await _context.Tenants.CountAsync(cancellationToken);
        var activeTenants = await _context.Tenants.CountAsync(t => t.IsActive && !t.IsLocked, cancellationToken);
        var usersResult = await GetTotalUsersSafeAsync(authorizationHeader, cancellationToken);

        return new AdminStatsDto
        {
            TotalTenants = totalTenants,
            ActiveTenants = activeTenants,
            TotalRevenue = 0,
            TotalUsers = usersResult.TotalUsers,
            IsIdentityAvailable = usersResult.IsIdentityAvailable
        };
    }

    private async Task<TotalUsersResult> GetTotalUsersSafeAsync(string authorizationHeader, CancellationToken cancellationToken)
    {
        try
        {
            var identityApiBaseUrl = _configuration["ExternalServices:IdentityApiBaseUrl"];
            if (string.IsNullOrWhiteSpace(identityApiBaseUrl))
            {
                _logger.LogWarning("Missing configuration for ExternalServices:IdentityApiBaseUrl. Falling back total users to 0.");
                return TotalUsersResult.Unavailable();
            }

            if (string.IsNullOrWhiteSpace(authorizationHeader))
            {
                _logger.LogWarning("Missing Authorization header when fetching admin stats. Falling back total users to 0.");
                return TotalUsersResult.Unavailable();
            }

            var client = _httpClientFactory.CreateClient();
            client.BaseAddress = new Uri(identityApiBaseUrl);
            client.DefaultRequestHeaders.Authorization = AuthenticationHeaderValue.Parse(authorizationHeader);

            using var response = await client.GetAsync("/api/users?page=1&size=1", cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Identity API returned status code {StatusCode} for users summary. Falling back total users to 0.",
                    (int)response.StatusCode);
                return TotalUsersResult.Unavailable();
            }

            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            var payload = await JsonSerializer.DeserializeAsync<UsersSummaryResponse>(
                stream,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true },
                cancellationToken);

            return new TotalUsersResult(payload?.TotalCount ?? 0, true);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to fetch users summary from Identity API. Falling back total users to 0.");
            return TotalUsersResult.Unavailable();
        }
    }

    private sealed record TotalUsersResult(int TotalUsers, bool IsIdentityAvailable)
    {
        public static TotalUsersResult Unavailable() => new(0, false);
    }

    private sealed class UsersSummaryResponse
    {
        public int TotalCount { get; set; }
    }
}

public sealed class AdminStatsDto
{
    public int TotalTenants { get; set; }
    public int ActiveTenants { get; set; }
    public int TotalRevenue { get; set; }
    public int TotalUsers { get; set; }
    public bool IsIdentityAvailable { get; set; }
}
