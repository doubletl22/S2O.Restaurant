public class TenantIdentificationMiddleware
{
    private const string TenantIdHeader = "X-Tenant-ID";
    private readonly RequestDelegate _next;

    public TenantIdentificationMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ITenantProvider tenantProvider)
    {
        // 1. Kiểm tra Header để lấy Tenant ID
        if (context.Request.Headers.TryGetValue(TenantIdHeader, out var tenantId))
        {
            // 2. Gán Tenant ID vào dịch vụ Scoped
            tenantProvider.SetTenantId(tenantId.ToString());

            // Log hoặc kiểm tra bảo mật ở đây nếu cần
            Console.WriteLine($"[TenantMiddleware] Tenant Identified: {tenantId}");
        }
        else
        {
            // Tùy chọn: Nếu không có TenantId, có thể chặn request hoặc cho phép truy cập
            // Chỉ nên cho phép truy cập nếu là Endpoint public (ví dụ: Đăng ký Tenant)
            // context.Response.StatusCode = 400; // BadRequest
            // await context.Response.WriteAsync("Header X-Tenant-ID bị thiếu.");

            // Trong trường hợp này, chúng ta cho phép đi tiếp và TenantProvider sẽ trả về DEFAULT_ADMIN_TENANT
        }

        // 3. Chuyển giao Request cho Pipeline tiếp theo
        await _next(context);
    }
}