namespace S2O.Order.App.DTOs;

public sealed class PublicTableInfo
{
    public Guid TableId { get; set; }
    public string TableName { get; set; } = string.Empty;
    public Guid TenantId { get; set; }
    public string? TenantName { get; set; }
    public Guid BranchId { get; set; }
}