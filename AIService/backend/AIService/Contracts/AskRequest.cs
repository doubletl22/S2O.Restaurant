namespace S2O.AIService.Contracts;

public sealed class AskRequest
{
    public required string TenantId { get; set; }
    public required string RestaurantId { get; set; }
    public string? BranchId { get; set; }
    public string? TableId { get; set; }
    public required string Message { get; set; }
}
