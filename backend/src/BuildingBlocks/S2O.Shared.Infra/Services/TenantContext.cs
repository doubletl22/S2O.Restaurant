using Microsoft.AspNetCore.Http;
using S2O.Shared.Kernel.Interfaces;
using System.Security.Claims;

namespace S2O.Shared.Infra.Services;

public class TenantContext : ITenantContext
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public TenantContext(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? TenantId
    {
        get
        {
            var tid = _httpContextAccessor.HttpContext?.User?.FindFirst("tenantId")?.Value
                   ?? _httpContextAccessor.HttpContext?.User?.FindFirst("TenantId")?.Value;

            return Guid.TryParse(tid, out var guid) ? guid : null;
        }
        set { }
    }

    public string? Email
    {
        get => _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Email)?.Value
                ?? _httpContextAccessor.HttpContext?.User?.FindFirst("email")?.Value;
        set { }
    }
}