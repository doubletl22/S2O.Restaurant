namespace S2O.Catalog.App.DTOs;

public class PublicTableInfo
{
    public Guid TableId { get; set; }
    public string TableName { get; set; } = string.Empty;
    public Guid TenantId { get; set; }
    public string TenantName { get; set; } = string.Empty; 
    public Guid BranchId { get; set; }
}