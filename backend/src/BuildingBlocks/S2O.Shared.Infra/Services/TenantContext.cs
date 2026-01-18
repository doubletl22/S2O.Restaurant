// File: backend/src/BuildingBlocks/S2O.Shared.Infra/Services/TenantContext.cs
using Microsoft.AspNetCore.Http;
using S2O.Shared.Kernel.Interfaces;
using System.Security.Claims;

namespace S2O.Shared.Infra.Services;

public class TenantContext : ITenantContext
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private Guid? _tenantId;
    private Guid? _branchId; // Thêm backing field cho Branch

    public TenantContext(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    // Logic lấy TenantId (Giữ nguyên của bạn, chỉ tối ưu nhẹ)
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

    public Guid? BranchId
    {
        get
        {
            if (_branchId.HasValue) return _branchId.Value;

            var context = _httpContextAccessor.HttpContext;
            if (context == null) return null;

            string? bidString = null;

            if (context.Request.Headers.TryGetValue("X-Branch-Id", out var headerId))
            {
                bidString = headerId;
            }
            else
            {
                bidString = context.User?.FindFirst("branchId")?.Value
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