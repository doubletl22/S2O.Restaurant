using MediatR;
using S2O.Catalog.App.Abstractions;
using S2O.Catalog.Domain.Entities;
using S2O.Shared.Kernel.Results;
using Microsoft.EntityFrameworkCore;

public record GetProductsQuery(string? CategoryId) : IRequest<Result<List<Product>>>;
// Handler đơn giản
public class GetProductsHandler : IRequestHandler<GetProductsQuery, Result<List<Product>>>
{
    private readonly ICatalogDbContext _context;
    public GetProductsHandler(ICatalogDbContext context) => _context = context;

    public async Task<Result<List<Product>>> Handle(GetProductsQuery request, CancellationToken ct)
    {
        var query = _context.Products.AsQueryable();

        if (!string.IsNullOrEmpty(request.CategoryId) && Guid.TryParse(request.CategoryId, out var catId))
        {
            query = query.Where(p => p.CategoryId == catId);
        }

        var products = await query.ToListAsync(ct);
        return Result<List<Product>>.Success(products);
    }
}