using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Catalog.App.Abstractions;
using S2O.Catalog.App.DTOs;
using S2O.Shared.Kernel.Results;

namespace S2O.Catalog.App.Features.Products;

public record GetProductByIdQuery(Guid Id) : IRequest<Result<ProductResponse>>;

public class GetProductByIdHandler : IRequestHandler<GetProductByIdQuery, Result<ProductResponse>>
{
    private readonly ICatalogDbContext _context;

    public GetProductByIdHandler(ICatalogDbContext context) => _context = context;

    public async Task<Result<ProductResponse>> Handle(GetProductByIdQuery request, CancellationToken ct)
    {
        // Global Query Filter (TenantId) sẽ tự động được áp dụng ở đây
        var product = await _context.Products
            .AsNoTracking()
            .Where(p => p.Id == request.Id)
            .Select(p => new ProductResponse(p.Id, p.Name, p.Price, p.Description))
            .FirstOrDefaultAsync(ct);

        if (product == null)
        {
            return Result<ProductResponse>.Failure(new Error("Catalog.NotFound", "Không tìm thấy món ăn này hoặc bạn không có quyền truy cập."));
        }

        return Result<ProductResponse>.Success(product);
    }
}