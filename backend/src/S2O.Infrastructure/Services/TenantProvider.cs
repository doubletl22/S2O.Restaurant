public class TenantProvider : ITenantProvider
{
    private string _tenantId;

    public string GetTenantId()
    {
        // Trả về TenantId, hoặc một giá trị mặc định nếu không tìm thấy (ví dụ: cho Admin Portal)
        return _tenantId ?? "DEFAULT_ADMIN_TENANT";
    }

    public void SetTenantId(string tenantId)
    {
        // Lưu TenantId cho Request hiện tại
        if (string.IsNullOrWhiteSpace(tenantId))
        {
            throw new ArgumentException("TenantId không được rỗng.", nameof(tenantId));
        }
        _tenantId = tenantId.ToUpperInvariant();
    }
}