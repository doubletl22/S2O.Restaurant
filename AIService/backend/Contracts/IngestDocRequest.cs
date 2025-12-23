namespace S2O.AIService.Contracts;

public sealed class IngestDocRequest
{
    public required string TenantId { get; set; }
    public required string RestaurantId { get; set; }
    public required string Title { get; set; }
    public required string Content { get; set; }
}
