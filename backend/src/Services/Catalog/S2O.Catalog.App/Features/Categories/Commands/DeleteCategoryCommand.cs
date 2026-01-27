using MediatR;
using S2O.Shared.Kernel.Results;
using S2O.Catalog.App.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace S2O.Catalog.App.Features.Categories.Commands;

public record DeleteCategoryCommand(Guid Id) : IRequest<Result<bool>>;

public class DeleteCategoryHandler : IRequestHandler<DeleteCategoryCommand, Result<bool>>
{
    private readonly ICatalogDbContext _context;

    public DeleteCategoryHandler(ICatalogDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(DeleteCategoryCommand request, CancellationToken ct)
    {
        var category = await _context.Categories.FindAsync(new object[] { request.Id }, ct);
        if (category == null) return Result<bool>.Failure(new Error("Category.NotFound", "Danh mục không tồn tại"));

        // Kiểm tra xem có món ăn nào đang dùng danh mục này không
        bool hasProducts = await _context.Products.AnyAsync(p => p.CategoryId == request.Id, ct);
        if (hasProducts)
        {
            return Result<bool>.Failure(new Error("Category.InUse", "Không thể xóa danh mục đang chứa món ăn."));
        }

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync(ct);
        return Result<bool>.Success(true);
    }
}