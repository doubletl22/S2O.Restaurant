using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Catalog.App.Abstractions;
using S2O.Catalog.App.DTOs;
using S2O.Shared.Kernel.Results;

namespace S2O.Catalog.App.Features.Public;

public record GetPublicProductByIdQuery(Guid TenantId, Guid ProductId) : IRequest<Result<ProductResponse>>;

public class GetPublicProductByIdHandler : IRequestHandler<GetPublicProductByIdQuery, Result<ProductResponse>>
{
    private readonly ICatalogDbContext _context;

    public GetPublicProductByIdHandler(ICatalogDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ProductResponse>> Handle(GetPublicProductByIdQuery request, CancellationToken cancellationToken)
    {
        var product = await _context.Products
            .AsNoTracking()
            .IgnoreQueryFilters()
            .Where(p => p.TenantId == request.TenantId && p.IsActive)
            .Where(p => p.Id == request.ProductId)
            .Select(p => new ProductResponse
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price,
                Description = p.Description,
                ImageUrl = p.ImageUrl,
                CategoryId = p.CategoryId,
                IsAvailable = p.IsActive,
                IsActive = p.IsActive,
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (product == null)
        {
            return Result<ProductResponse>.Failure(new Error("Catalog.NotFound", "Không tìm thấy món ăn này."));
        }

        return Result<ProductResponse>.Success(product);
    }
}