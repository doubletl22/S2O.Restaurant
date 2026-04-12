namespace S2O.Tenant.App.Features.Plans;

public static class PlanPolicy
{
    public const string Free = "Free";
    public const string Premium = "Premium";
    public const string Enterprise = "Enterprise";

    public static string Normalize(string? planType)
    {
        if (string.IsNullOrWhiteSpace(planType))
        {
            return Free;
        }

        return planType.Trim().ToLowerInvariant() switch
        {
            "premium" => Premium,
            "enterprise" => Enterprise,
            _ => Free
        };
    }

    public static bool IsUnlimited(string? planType) => Normalize(planType) == Enterprise;

    public static int GetBranchesQuota(string? planType) => Normalize(planType) switch
    {
        Free => 10,
        Premium => 100,
        _ => int.MaxValue
    };

    public static int GetTablesQuota(string? planType) => Normalize(planType) switch
    {
        Free => 10,
        Premium => 100,
        _ => int.MaxValue
    };

    public static decimal GetMonthlyPrice(string? planType) => Normalize(planType) switch
    {
        Premium => 150_000m,
        Enterprise => 500_000m,
        _ => 0m
    };
}
