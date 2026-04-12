using System.Text.Json;
using Microsoft.Extensions.Configuration;
using S2O.Shared.Kernel.Results;

namespace S2O.Catalog.App.Features.Plans;

public sealed record TenantSubscriptionSnapshot(
    string PlanType,
    bool IsLocked,
    bool IsActive,
    bool IsSubscriptionExpired,
    DateTime SubscriptionExpiry);

public interface ITenantSubscriptionReader
{
    Task<Result<TenantSubscriptionSnapshot>> GetTenantSubscriptionAsync(Guid tenantId, CancellationToken cancellationToken);
}

public sealed class TenantSubscriptionReader : ITenantSubscriptionReader
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;

    public TenantSubscriptionReader(IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
    }

    public async Task<Result<TenantSubscriptionSnapshot>> GetTenantSubscriptionAsync(Guid tenantId, CancellationToken cancellationToken)
    {
        try
        {
            var baseUrl = _configuration["ExternalServices:TenantApiBaseUrl"];
            if (string.IsNullOrWhiteSpace(baseUrl))
            {
                baseUrl = "http://tenant-api:8080";
            }

            var client = _httpClientFactory.CreateClient();
            var url = $"{baseUrl.TrimEnd('/')}/api/v1/tenants/{tenantId}/check-lock-status";
            using var response = await client.GetAsync(url, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                return Result<TenantSubscriptionSnapshot>.Failure(new Error(
                    "Tenant.SubscriptionUnavailable",
                    "Không thể kiểm tra gói dịch vụ của nhà hàng."));
            }

            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            using var document = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);

            if (!document.RootElement.TryGetProperty("value", out var valueElement)
                && !document.RootElement.TryGetProperty("Value", out valueElement))
            {
                return Result<TenantSubscriptionSnapshot>.Failure(new Error(
                    "Tenant.InvalidSubscriptionPayload",
                    "Dữ liệu gói dịch vụ không hợp lệ."));
            }

            var planType = ReadString(valueElement, "subscriptionPlan", "SubscriptionPlan") ?? "Free";
            var isLocked = ReadBool(valueElement, "isLocked", "IsLocked");
            var isActive = ReadBool(valueElement, "isActive", "IsActive", true);
            var isExpired = ReadBool(valueElement, "isSubscriptionExpired", "IsSubscriptionExpired");
            var expiry = ReadDateTime(valueElement, "subscriptionExpiry", "SubscriptionExpiry");

            return Result<TenantSubscriptionSnapshot>.Success(new TenantSubscriptionSnapshot(
                NormalizePlan(planType),
                isLocked,
                isActive,
                isExpired,
                expiry));
        }
        catch
        {
            return Result<TenantSubscriptionSnapshot>.Failure(new Error(
                "Tenant.SubscriptionUnavailable",
                "Không thể kiểm tra gói dịch vụ của nhà hàng."));
        }
    }

    private static string NormalizePlan(string? planType)
    {
        if (string.IsNullOrWhiteSpace(planType)) return "Free";

        return planType.Trim().ToLowerInvariant() switch
        {
            "premium" => "Premium",
            "enterprise" => "Enterprise",
            _ => "Free"
        };
    }

    private static bool ReadBool(JsonElement element, string camelName, string pascalName, bool defaultValue = false)
    {
        if (element.TryGetProperty(camelName, out var camelValue)
            && (camelValue.ValueKind == JsonValueKind.True || camelValue.ValueKind == JsonValueKind.False))
        {
            return camelValue.GetBoolean();
        }

        if (element.TryGetProperty(pascalName, out var pascalValue)
            && (pascalValue.ValueKind == JsonValueKind.True || pascalValue.ValueKind == JsonValueKind.False))
        {
            return pascalValue.GetBoolean();
        }

        return defaultValue;
    }

    private static string? ReadString(JsonElement element, string camelName, string pascalName)
    {
        if (element.TryGetProperty(camelName, out var camelValue) && camelValue.ValueKind == JsonValueKind.String)
        {
            return camelValue.GetString();
        }

        if (element.TryGetProperty(pascalName, out var pascalValue) && pascalValue.ValueKind == JsonValueKind.String)
        {
            return pascalValue.GetString();
        }

        return null;
    }

    private static DateTime ReadDateTime(JsonElement element, string camelName, string pascalName)
    {
        var value = ReadString(element, camelName, pascalName);
        return DateTime.TryParse(value, out var parsed) ? parsed : DateTime.MinValue;
    }
}
