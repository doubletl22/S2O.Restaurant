using Microsoft.EntityFrameworkCore;
using S2O.Tenant.App.Abstractions;
using S2O.Tenant.App.Features.Plans;
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
        var tenantSubscriptions = await _context.Tenants
            .AsNoTracking()
            .Select(t => new TenantSubscriptionRevenueModel(t.SubscriptionPlan, t.CreatedAt, t.SubscriptionExpiry))
            .ToListAsync(cancellationToken);
        var planTenantCounts = BuildPlanTenantCounts(tenantSubscriptions);
        var usersResult = await GetTotalUsersSafeAsync(authorizationHeader, cancellationToken);

        return new AdminStatsDto
        {
            TotalTenants = totalTenants,
            ActiveTenants = activeTenants,
            TotalRevenue = tenantSubscriptions.Sum(CalculateAccumulatedRevenue),
            PlanTenantCounts = planTenantCounts,
            TotalUsers = usersResult.TotalUsers,
            IsIdentityAvailable = usersResult.IsIdentityAvailable
        };
    }

    private static List<PlanTenantCountDto> BuildPlanTenantCounts(IEnumerable<TenantSubscriptionRevenueModel> tenantSubscriptions)
    {
        var grouped = tenantSubscriptions
            .GroupBy(t => PlanPolicy.Normalize(t.SubscriptionPlan))
            .ToDictionary(g => g.Key, g => g.Count(), StringComparer.OrdinalIgnoreCase);

        return new List<PlanTenantCountDto>
        {
            new(PlanPolicy.Free, grouped.GetValueOrDefault(PlanPolicy.Free, 0)),
            new(PlanPolicy.Premium, grouped.GetValueOrDefault(PlanPolicy.Premium, 0)),
            new(PlanPolicy.Enterprise, grouped.GetValueOrDefault(PlanPolicy.Enterprise, 0)),
        };
    }

    private static decimal CalculateAccumulatedRevenue(TenantSubscriptionRevenueModel tenant)
    {
        var monthlyPrice = PlanPolicy.GetMonthlyPrice(tenant.SubscriptionPlan);
        if (monthlyPrice <= 0)
        {
            return 0;
        }

        var billedMonths = CountBilledMonths(tenant.CreatedAt, tenant.SubscriptionExpiry);

        return billedMonths * monthlyPrice;
    }

    private static int CountBilledMonths(DateTime start, DateTime end)
    {
        if (end <= start)
        {
            return 0;
        }

        var months = 0;
        var cursor = start;
        while (cursor < end)
        {
            months++;
            cursor = cursor.AddMonths(1);
        }

        return months;
    }

    private sealed record TenantSubscriptionRevenueModel(string SubscriptionPlan, DateTime CreatedAt, DateTime SubscriptionExpiry);

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
    public decimal TotalRevenue { get; set; }
    public List<PlanTenantCountDto> PlanTenantCounts { get; set; } = new();
    public int TotalUsers { get; set; }
    public bool IsIdentityAvailable { get; set; }
}

public sealed record PlanTenantCountDto(string Plan, int TenantCount);
