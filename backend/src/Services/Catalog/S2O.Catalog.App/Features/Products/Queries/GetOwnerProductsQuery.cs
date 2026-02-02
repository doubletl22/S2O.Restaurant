using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Catalog.App.Abstractions;
using S2O.Catalog.App.DTOs; 
using S2O.Shared.Kernel.Results;

namespace S2O.Catalog.App.Features.Products.Queries;

public record GetOwnerProductsQuery(int PageIndex = 1, int PageSize = 10, string? Keyword = null, Guid? CategoryId = null)
    : IRequest<Result<PagedResult<ProductResponse>>>;

public class GetOwnerProductsHandler : IRequestHandler<GetOwnerProductsQuery, Result<PagedResult<ProductResponse>>>
{
    private readonly ICatalogDbContext _context;
    // private readonly ICurrentUserService _currentUser; 

    public GetOwnerProductsHandler(ICatalogDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PagedResult<ProductResponse>>> Handle(GetOwnerProductsQuery request, CancellationToken ct)
    {
        var query = _context.Products.AsNoTracking();

        if (!string.IsNullOrEmpty(request.Keyword))
        {
            query = query.Where(p => p.Name.Contains(request.Keyword));
        }

        if (request.CategoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == request.CategoryId);
        }

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(p => p.CreatedAtUtc)
            .Skip((request.PageIndex - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(p => new ProductResponse
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price,
                ImageUrl = p.ImageUrl,
                Description = p.Description,
                CategoryId = p.CategoryId,
                IsActive = p.IsActive
            })
            .ToListAsync(ct);

        return Result<PagedResult<ProductResponse>>.Success(new PagedResult<ProductResponse>(items, totalCount, request.PageIndex, request.PageSize));
    }
}