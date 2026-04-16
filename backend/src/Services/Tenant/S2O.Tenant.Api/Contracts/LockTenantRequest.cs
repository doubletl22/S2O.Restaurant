using System.ComponentModel.DataAnnotations;

namespace S2O.Tenant.Api.Contracts;

public sealed class LockTenantRequest
{
    [Required(ErrorMessage = "Lý do khóa là bắt buộc.")]
    [MaxLength(500, ErrorMessage = "Lý do khóa không được vượt quá 500 ký tự.")]
    public string Reason { get; set; } = string.Empty;

    [Range(1, 365, ErrorMessage = "Thời hạn khóa phải trong khoảng từ 1 đến 365 ngày.")]
    public int? LockDurationDays { get; set; }

    public bool IsPermanent { get; set; } = false;
}