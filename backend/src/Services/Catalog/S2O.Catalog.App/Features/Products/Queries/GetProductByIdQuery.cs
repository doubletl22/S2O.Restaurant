using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Catalog.App.Abstractions;
using S2O.Catalog.App.DTOs;
using S2O.Catalog.Domain.Entities;
using S2O.Shared.Kernel.Results;

namespace S2O.Catalog.App.Features.Products.Queries;

public record GetProductByIdQuery(Guid Id, Guid? TenantId = null) : IRequest<Result<ProductResponse>>;

public class GetProductByIdHandler : IRequestHandler<GetProductByIdQuery, Result<ProductResponse>>
{
    private readonly ICatalogDbContext _context;

    public GetProductByIdHandler(ICatalogDbContext context) => _context = context;

    public async Task<Result<ProductResponse>> Handle(GetProductByIdQuery request, CancellationToken ct)
    {
        IQueryable<Product> query;

        // ✅ Nếu tenantId được cung cấp (từ Order Service), bypass global filter & explicit check tenant
        if (request.TenantId.HasValue)
        {
            query = _context.Products
                .AsNoTracking()
                .IgnoreQueryFilters()  // ✅ Bypass global TenantId filter
                .Where(p => p.TenantId == request.TenantId.Value);
        }
        else
        {
            // Nếu không có tenantId, dùng global filter (sẽ lọc theo HttpContext TenantId)
            query = _context.Products.AsNoTracking();
        }

        var product = await query
            .Where(p => p.Id == request.Id)
            .Select(p => new ProductResponse
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price,
                Description = p.Description,
                ImageUrl = p.ImageUrl
            })
            .FirstOrDefaultAsync(ct);

        if (product == null)
        {
            return Result<ProductResponse>.Failure(new Error("Catalog.NotFound", "Không tìm thấy món ăn này hoặc bạn không có quyền truy cập."));
        }

        return Result<ProductResponse>.Success(product);
    }
}