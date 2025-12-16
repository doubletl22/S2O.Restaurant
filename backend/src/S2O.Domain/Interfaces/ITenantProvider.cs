public interface ITenantProvider
{
    string GetTenantId();
    void SetTenantId(string tenantId);
}