namespace S2O.Tenant.App.Features.Tables; 
public class TableResponse
{
    public Guid Id { get; set; }           // ID của bàn
    public required string Name { get; set; }
    public int Capacity { get; set; }

    public Guid TenantId { get; set; }
    public Guid BranchId { get; set; }
    public required string QrCodeGuid { get; set; } // Chính là cái GUID bạn lưu trong QrCodeUrl
}