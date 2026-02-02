using Microsoft.AspNetCore.Http;
using S2O.Shared.Kernel.Interfaces;
using System.Security.Claims;

namespace S2O.Shared.Infra.Services;

public class TenantContext : ITenantContext
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private Guid? _tenantId;
    private Guid? _branchId;

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

            var tidString = context.User?.FindFirst("tenant_id")?.Value
                         ?? context.User?.FindFirst("tenantId")?.Value
                         ?? context.User?.FindFirst("TenantId")?.Value;

            if (string.IsNullOrEmpty(tidString) && context.Request.Headers.TryGetValue("X-Tenant-ID", out var headerId))
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

    public Guid? BranchId
    {
        get
        {
            if (_branchId.HasValue) return _branchId.Value;

            var context = _httpContextAccessor.HttpContext;
            if (context == null) return null;

            string? bidString = null;

            if (context.Request.Headers.TryGetValue("X-Branch-ID", out var headerId))
            {
                bidString = headerId;
            }
            else
            {
                bidString = context.User?.FindFirst("branch_id")?.Value
                         ?? context.User?.FindFirst("branchId")?.Value
                         ?? context.User?.FindFirst("BranchId")?.Value;
            }

            if (Guid.TryParse(bidString, out var guid))
            {
                _branchId = guid;
                return guid;
            }

            return null;
        }
        set => _branchId = value;
    }

    public string? Email
    {
        get => _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Email)?.Value
                ?? _httpContextAccessor.HttpContext?.User?.FindFirst("email")?.Value;
        set { }
    }
}