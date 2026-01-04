namespace S2O.Services.Customer.Domain.Common.Interfaces
{
    public interface IAuditableEntity
    {
        DateTimeOffset CreatedAt { get; set; }
        string? CreatedBy { get; set; }
        DateTimeOffset LastModifiedAt { get; set; }
        string? LastModifiedBy { get; set; }
    }
}