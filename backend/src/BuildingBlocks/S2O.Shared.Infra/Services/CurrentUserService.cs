using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using S2O.Shared.Kernel.Interfaces;

namespace S2O.Infra.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? UserId
    {
        get
        {
            var id = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(id, out var guid) ? guid : null;
        }
    }

    public Guid? TenantId
    {
        get
        {
            var user = _httpContextAccessor.HttpContext?.User;

            if (user == null)
            {
                Console.WriteLine("[AUTH ERROR] User is NULL (HttpContext is null or user not authenticated)");
                return Guid.Empty;
            }

            // --- ĐOẠN DEBUG QUAN TRỌNG: IN RA HẾT MỌI THỨ ---
            // Khi chạy xong nhớ xóa hoặc comment lại
            Console.WriteLine("=== [START] DUMPING ALL CLAIMS ===");
            foreach (var claim in user.Claims)
            {
                Console.WriteLine($"Type: {claim.Type} | Value: {claim.Value}");
            }
            Console.WriteLine("=== [END] DUMPING ALL CLAIMS ===");
            // -------------------------------------------------

            // Tìm kiếm Claim theo nhiều chuẩn khác nhau
            var tenantClaim = user.FindFirst("tenant_id")       // Chuẩn IdentityServer / OpenID
                           ?? user.FindFirst("tenantId")        // Chuẩn camelCase
                           ?? user.FindFirst("TenantId")        // Chuẩn PascalCase
                           ?? user.FindFirst("branch_id")       // Đôi khi bạn nhầm Branch với Tenant?
                           ?? user.FindFirst(ClaimTypes.GroupSid); // Một số hệ thống map vào đây

            if (tenantClaim != null && Guid.TryParse(tenantClaim.Value, out var tenantId))
            {
                return tenantId;
            }

            Console.WriteLine("[AUTH ERROR] Could not find any TenantId claim!");
            return Guid.Empty;
        }
    }

    public string? Email => _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Email)?.Value;
    public bool IsAuthenticated => _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;
}