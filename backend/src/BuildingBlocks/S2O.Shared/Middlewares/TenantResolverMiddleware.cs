using Microsoft.AspNetCore.Http;
using S2O.Shared.Interfaces;
using System.Security.Claims;

namespace S2O.Shared.Middlewares;

public class TenantResolverMiddleware
{
    private readonly RequestDelegate _next;
    private const string TenantHeaderKey = "x-tenant-id";

    public TenantResolverMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ITenantContext tenantContext)
    {
        // 1. Thử lấy TenantId từ Header (Ưu tiên cho khách quét QR)
        if (context.Request.Headers.TryGetValue(TenantHeaderKey, out var headerTenantId))
        {
            tenantContext.TenantId = headerTenantId;
        }
        // 2. Nếu không có Header, thử lấy từ JWT Claims (Dành cho user đã login)
        else if (context.User.Identity?.IsAuthenticated == true)
        {
            var tenantClaim = context.User.FindFirst("tenant_id")?.Value;
            if (!string.IsNullOrEmpty(tenantClaim))
            {
                tenantContext.TenantId = tenantClaim;
            }
        }

        // Bạn có thể thêm logic chặn request nếu không có TenantId ở các API yêu cầu bắt buộc
        await _next(context);
    }
}