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
        if (context.Request.Headers.TryGetValue("X-Tenant-Id", out var tenantIdHeader))
        {
            var tenantIdString = tenantIdHeader.ToString();

            // Thêm logic Parse từ string sang Guid
            if (Guid.TryParse(tenantIdString, out var tenantIdGuid))
            {
                tenantContext.TenantId = tenantIdGuid;
            }
            else
            {
                // Nếu header không phải Guid hợp lệ, có thể để null hoặc xử lý tùy ý
                tenantContext.TenantId = null;
            }
        }

        // Bạn có thể thêm logic chặn request nếu không có TenantId ở các API yêu cầu bắt buộc
        await _next(context);
    }
}