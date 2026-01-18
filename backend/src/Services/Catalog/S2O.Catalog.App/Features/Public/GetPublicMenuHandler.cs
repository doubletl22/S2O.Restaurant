using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Catalog.App.Abstractions;
using S2O.Catalog.Domain.Entities; // Sử dụng Entity Product
using S2O.Shared.Kernel.Results;

namespace S2O.Catalog.App.Features.Public;

public class GetPublicMenuHandler : IRequestHandler<GetPublicMenuQuery, Result<List<Product>>>
{
    private readonly ICatalogDbContext _context;

    public GetPublicMenuHandler(ICatalogDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<Product>>> Handle(GetPublicMenuQuery request, CancellationToken ct)
    {
        var query = _context.Products
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(p => p.TenantId == request.TenantId); 

        if (!string.IsNullOrEmpty(request.CategoryId) && Guid.TryParse(request.CategoryId, out var catId))
        {
            query = query.Where(p => p.CategoryId == catId);
        }

        var products = await query.ToListAsync(ct);

        return Result<List<Product>>.Success(products);
    }
}