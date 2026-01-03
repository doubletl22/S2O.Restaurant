using System.Security.Claims;
namespace S2O.GateWay.Middlewares
{
    public class UserContextForwardingMiddleware
    {
        private readonly RequestDelegate _next;

        public UserContextForwardingMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (context.User.Identity?.IsAuthenticated == true)
            {
                var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? context.User.FindFirst("sub")?.Value;

                var role = context.User.FindFirst(ClaimTypes.Role)?.Value;
                var tenantId = context.User.FindFirst("tenant-id")?.Value;

                if (userId != null)
                {
                    context.Request.Headers["x-user-id"] = userId;
                }
                    if (role != null)
                        context.Request.Headers["x-role"] = role;

                    if (tenantId != null)
                        context.Request.Headers["x-tenant-id"] = tenantId;

                }
            await _next(context);
            }
    }
}
