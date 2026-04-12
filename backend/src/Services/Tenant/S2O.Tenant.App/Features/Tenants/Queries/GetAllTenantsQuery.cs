using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Tenant.App.Abstractions;
using S2O.Shared.Kernel.Results;
using System.Globalization;
using System.Text;

namespace S2O.Tenant.App.Features.Tenants.Queries;

// DTO trả về
public record TenantDto(
    Guid Id,
    string Name,
    string Plan,
    bool IsLocked,
    DateTime CreatedAt,
    DateTime SubscriptionExpiry,
    bool IsSubscriptionExpired);

public record GetAllTenantsQuery(string? Keyword = null) : IRequest<Result<List<TenantDto>>>;

public class GetAllTenantsHandler : IRequestHandler<GetAllTenantsQuery, Result<List<TenantDto>>>
{
    private readonly ITenantDbContext _context;

    public GetAllTenantsHandler(ITenantDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Chuẩn hóa string: Xóa diacritics (dấu tiếng Việt), chuyển thường, loại khoảng trắng thừa
    /// VD: "Nhà Hàng PHỞ" → "nha hang pho"
    /// </summary>
    private string NormalizeString(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return string.Empty;

        // Normalize Unicode (NFD) + loại bỏ diacritics
        var normalizedString = input.Normalize(NormalizationForm.FormD);
        var stringBuilder = new StringBuilder();

        foreach (var c in normalizedString)
        {
            var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
            if (unicodeCategory != UnicodeCategory.NonSpacingMark)
            {
                stringBuilder.Append(c);
            }
        }

        // Loại bỏ khoảng trắng thừa + chuyển thường
        return stringBuilder.ToString()
            .Normalize(NormalizationForm.FormC)
            .ToLowerInvariant()
            .Trim();
    }

    public async Task<Result<List<TenantDto>>> Handle(GetAllTenantsQuery request, CancellationToken ct)
    {
        var utcNow = DateTime.UtcNow;
        var expiredUnlockedTenants = await _context.Tenants
            .Where(t => !t.IsLocked && t.SubscriptionExpiry != default && t.SubscriptionExpiry < utcNow)
            .ToListAsync(ct);

        if (expiredUnlockedTenants.Count > 0)
        {
            foreach (var tenant in expiredUnlockedTenants)
            {
                tenant.IsLocked = true;
            }

            await _context.SaveChangesAsync(ct);
        }

        // ITC_4.4: Super Admin được quyền xem hết
        var query = _context.Tenants
            .AsNoTracking()
            .AsQueryable();

        // ITC_4.1: Tìm kiếm đa mục tiêu (Name, ID)
        if (!string.IsNullOrWhiteSpace(request.Keyword))
        {
            var normalizedKeyword = NormalizeString(request.Keyword);
            var keywordLower = request.Keyword.Trim().ToLower();
            
            // First 8 chars of GUID (ITC_4.1 test case: 8 ký tự đầu của ID)
            var idStartsWith = keywordLower;

            // Load all tenants and filter in-memory with diacritics normalization
            // (ITC_4.2: Vietnamese diacritics support)
            var allTenants = await query.ToListAsync(ct);
            
            allTenants = allTenants.Where(t =>
                // ITC_4.2: Diacritics-insensitive search (normalize both sides)
                NormalizeString(t.Name).Contains(normalizedKeyword) ||
                // ITC_4.1: Search bằng ID (GUID) - so sánh đầu tiên 8 ký tự hoặc full ID
                t.Id.ToString().ToLower().StartsWith(idStartsWith) ||
                t.Id.ToString().ToLower() == idStartsWith
            ).ToList();

            var tenants = allTenants
                .Select(t => new TenantDto(
                    t.Id,
                    t.Name,
                    t.SubscriptionPlan,
                    t.IsLocked,
                    t.CreatedAt,
                    t.SubscriptionExpiry,
                    t.SubscriptionExpiry != default && t.SubscriptionExpiry < utcNow))
                .ToList();

            /* ITC_4.3: Nếu không tìm thấy, return empty list
               Frontend sẽ hiển thị "Không có dữ liệu" */
            return Result<List<TenantDto>>.Success(tenants);
        }

        var allTenantsNoFilter = await query
            .Select(t => new TenantDto(
                t.Id,
                t.Name,
                t.SubscriptionPlan,
                t.IsLocked,
                t.CreatedAt,
                t.SubscriptionExpiry,
                t.SubscriptionExpiry != default && t.SubscriptionExpiry < utcNow))
            .ToListAsync(ct);

        return Result<List<TenantDto>>.Success(allTenantsNoFilter);
    }
}