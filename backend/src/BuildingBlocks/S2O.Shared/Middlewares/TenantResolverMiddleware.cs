using Microsoft.AspNetCore.Http;
using S2O.Shared.Multitenancy;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace S2O.Shared.Middlewares
{
    public class TenantResolverMiddleware
    {
        private readonly RequestDelegate _next;

        public TenantResolverMiddleware(RequestDelegate next) => _next = next;

        public async Task InvokeAsync(HttpContext context, ITenantContext tenantContext)
        {
            // Thực tế: TenantId có thể lấy từ Header 'x-tenant-id' hoặc từ Domain/Subdomain
            if (context.Request.Headers.TryGetValue("x-tenant-id", out var tenantId))
            {
                tenantContext.TenantId = tenantId.ToString();
            }
            else
            {
                // Đối với dự án thật, bạn có thể ném lỗi 400 nếu không có TenantId cho các API yêu cầu định danh
                // context.Response.StatusCode = 400;
                // await context.Response.WriteAsync("Tenant-ID is missing.");
                // return;
            }

            await _next(context);
        }
    }
}
