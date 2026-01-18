using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Catalog.App.Abstractions;
using S2O.Shared.Kernel.Results;

// Dùng Alias cho chắc ăn, tránh nhầm lẫn namespace
using ProductEntity = S2O.Catalog.Domain.Entities.Product;

namespace S2O.Catalog.App.Features.Products.Commands;

public class UpdateProductHandler : IRequestHandler<UpdateProductCommand, Result>
{
    private readonly ICatalogDbContext _context;

    public UpdateProductHandler(ICatalogDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        // 1. Tìm sản phẩm theo ID
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == request.ProductId, cancellationToken);

        // 2. Nếu không tìm thấy -> Báo lỗi
        if (product == null)
        {
            return Result.Failure(new Error("Catalog.NotFound", $"Không tìm thấy món ăn với ID {request.ProductId}"));
        }

        // 3. Cập nhật thông tin
        product.Name = request.Name;
        product.Description = request.Description;
        product.Price = request.Price;
        product.ImageUrl = request.ImageUrl;

        // Cập nhật trạng thái kinh doanh (Bán/Ngưng)
        product.IsActive = request.IsActive;

        // product.LastModifiedAt = DateTime.UtcNow; // Nếu Entity bạn có trường này

        // 4. Lưu thay đổi
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}