using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Catalog.App.Abstractions;
using S2O.Catalog.App.DTOs; 
using S2O.Shared.Kernel.Results;

namespace S2O.Catalog.App.Features.Public;

public class GetPublicMenuHandler : IRequestHandler<GetPublicMenuQuery, Result<PublicMenuDto>>
{
    private readonly ICatalogDbContext _context;

    public GetPublicMenuHandler(ICatalogDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PublicMenuDto>> Handle(GetPublicMenuQuery request, CancellationToken ct)
    {
        var categories = await _context.Categories
            .AsNoTracking()
            .Where(c => c.TenantId == request.TenantId && c.IsActive)
            .OrderBy(c => c.Name) 
            .Select(c => new CategoryResponse
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description
            })
            .ToListAsync(ct);

        var productQuery = _context.Products
            .AsNoTracking()
            .Where(p => p.TenantId == request.TenantId && p.IsActive);

        if (!string.IsNullOrEmpty(request.CategoryId) && Guid.TryParse(request.CategoryId, out var catId))
        {
            productQuery = productQuery.Where(p => p.CategoryId == catId);
        }

        var products = await productQuery
            .Select(p => new ProductResponse
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price,
                Description = p.Description,
                ImageUrl = p.ImageUrl,
                CategoryId = p.CategoryId,
                IsAvailable = p.IsAvailable
            })
            .ToListAsync(ct);

        var result = new PublicMenuDto
        {
            TenantId = request.TenantId,
            Categories = categories,
            Products = products
        };

        return Result<PublicMenuDto>.Success(result);
    }
}