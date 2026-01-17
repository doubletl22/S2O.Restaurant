using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Catalog.App.Abstractions;
using S2O.Catalog.App.DTOs;
using S2O.Shared.Kernel.Results;

namespace S2O.Catalog.App.Features.Public;

public class GetPublicMenuHandler : IRequestHandler<GetPublicMenuQuery, Result<IEnumerable<CategoryResponse>>>
{
    private readonly ICatalogDbContext _context;

    public GetPublicMenuHandler(ICatalogDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IEnumerable<CategoryResponse>>> Handle(GetPublicMenuQuery request, CancellationToken cancellationToken)
    {
        // 1. Lấy danh mục + Sản phẩm thuộc Tenant đó
        // Lưu ý: Dùng IgnoreQueryFilters vì Guest không có Token đăng nhập để tự lọc
        var categories = await _context.Categories
            .AsNoTracking()
            .IgnoreQueryFilters() // <-- Quan trọng: Bỏ qua bộ lọc Tenant tự động
            .Include(c => c.Products)
            .Where(c => c.TenantId == request.TenantId && c.IsActive) // Lọc thủ công
            .Select(c => new CategoryResponse
            {
                Id = c.Id,
                Name = c.Name,
                Products = c.Products
                    .Where(p => p.IsActive)
                    .Select(p => new ProductResponse
                    {
                        Id = p.Id,
                        Name = p.Name,
                        Price = p.Price,
                        Description = p.Description,
                        ImageUrl = p.ImageUrl
                    }).ToList()
            })
            .ToListAsync(cancellationToken);

        return Result<IEnumerable<CategoryResponse>>.Success(categories);
    }
}