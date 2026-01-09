using MediatR;
using S2O.Catalog.App.Abstractions;
using S2O.Catalog.Domain.Entities;
using S2O.Shared.Kernel.Results;
using Microsoft.EntityFrameworkCore;

public record GetProductsQuery() : IRequest<Result<List<Product>>>;

// Handler đơn giản
public class GetProductsHandler : IRequestHandler<GetProductsQuery, Result<List<Product>>>
{
    private readonly ICatalogDbContext _context;
    public GetProductsHandler(ICatalogDbContext context) => _context = context;

    public async Task<Result<List<Product>>> Handle(GetProductsQuery request, CancellationToken ct)
    {
        // Filter sẽ tự động được áp dụng nhờ CatalogDbContext
        var products = await _context.Products.ToListAsync(ct);
        return Result<List<Product>>.Success(products);
    }
}