using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace S2O.Shared.Middleware
{
    // Middleware này chặn mọi request để lấy TenantId từ Header
    public class TenantMiddleware
    {
        private readonly RequestDelegate _next;

        public TenantMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Lấy TenantId từ header (ví dụ: "X-Tenant-ID") hoặc Subdomain
            // Trong thực tế, bạn sẽ lấy từ JWT Token của User
            if (context.Request.Headers.TryGetValue("X-Tenant-ID", out var tenantId))
            {
                // Lưu TenantId vào Items để Controller có thể dùng
                context.Items["TenantId"] = tenantId.ToString();
            }
            else
            {
                // Nếu không có TenantId (với API public), có thể xử lý lỗi hoặc bỏ qua tùy logic
            }

            await _next(context);
        }
    }
}