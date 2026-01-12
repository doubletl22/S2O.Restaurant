using Microsoft.AspNetCore.Http;
using S2O.Shared.Kernel.Interfaces;
using System.Security.Claims;

namespace S2O.Shared.Infra.Services;

public class TenantContext : ITenantContext
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private Guid? _tenantId;

    public TenantContext(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? TenantId
    {
        get
        {
            if (_tenantId.HasValue) return _tenantId.Value;

            var context = _httpContextAccessor.HttpContext;
            if (context == null) return null;

            var tidString = context.User?.FindFirst("tenantId")?.Value
                         ?? context.User?.FindFirst("TenantId")?.Value;

            if (string.IsNullOrEmpty(tidString) && context.Request.Headers.TryGetValue("X-Tenant-Id", out var headerId))
            {
                tidString = headerId;
            }

            if (Guid.TryParse(tidString, out var guid))
            {
                _tenantId = guid; 
                return guid;
            }

            return null;
        }
        set => _tenantId = value;
    }

    public string? Email
    {
        get => _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Email)?.Value
                ?? _httpContextAccessor.HttpContext?.User?.FindFirst("email")?.Value;
        set { }
    }
}