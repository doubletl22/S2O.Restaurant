using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Tenant.App.Abstractions;
using S2O.Shared.Kernel.Results;
using System.Globalization;
using System.Text;

namespace S2O.Tenant.App.Features.Tenants.Queries;

// Response DTO with pagination metadata (reusing TenantDto from GetAllTenantsQuery)
public record PaginatedTenantResult(
    List<TenantDto> Data,
    int PageNumber,
    int PageSize,
    int TotalCount,
    int TotalPages)
{
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;
}

public record SearchTenantsQuery(
    int Page = 1,
    int PageSize = 10,
    string? Keyword = null) : IRequest<Result<PaginatedTenantResult>>;

public class SearchTenantsHandler : IRequestHandler<SearchTenantsQuery, Result<PaginatedTenantResult>>
{
    private readonly ITenantDbContext _context;

    public SearchTenantsHandler(ITenantDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Normalize string: Remove diacritics (Vietnamese marks), convert to lowercase, trim whitespace
    /// Example: "Nhà Hàng PHỞ" → "nha hang pho"
    /// </summary>
    private string NormalizeString(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return string.Empty;

        // Normalize Unicode (NFD) + remove diacritics
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

        return stringBuilder.ToString().ToLower().Trim();
    }

    public async Task<Result<PaginatedTenantResult>> Handle(SearchTenantsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            // Validate pagination parameters
            var page = Math.Max(request.Page, 1);
            var pageSize = Math.Max(Math.Min(request.PageSize, 100), 1); // Clamp between 1-100

            // Query tenants with keyword filter
            var query = _context.Tenants.AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.Keyword))
            {
                var normalizedKeyword = NormalizeString(request.Keyword);
                query = query.Where(t =>
                    EF.Functions.Like(t.Name.ToLower(), $"%{normalizedKeyword}%"));
            }

            // Get total count before pagination
            var totalCount = await query.CountAsync(cancellationToken);
            var totalPages = (totalCount + pageSize - 1) / pageSize;

            // Apply pagination
            var skip = (page - 1) * pageSize;
            var tenants = await query
                .OrderByDescending(t => t.CreatedAt)
                .Skip(skip)
                .Take(pageSize)
                .Select(t => new TenantDto(
                    t.Id,
                    t.Name,
                    t.SubscriptionPlan,
                    t.IsLocked,
                    t.CreatedAt,
                    t.SubscriptionExpiry,
                    t.SubscriptionExpiry < DateTime.UtcNow))
                .ToListAsync(cancellationToken);

            var result = new PaginatedTenantResult(
                tenants,
                page,
                pageSize,
                totalCount,
                totalPages);

            return Result<PaginatedTenantResult>.Success(result);
        }
        catch (Exception ex)
        {
            return Result<PaginatedTenantResult>.Failure(new Error("SearchTenants.Exception", ex.Message));
        }
    }
}
