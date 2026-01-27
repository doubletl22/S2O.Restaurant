using MediatR;
using S2O.Shared.Kernel.Results;
using S2O.Catalog.App.Abstractions;

namespace S2O.Catalog.App.Features.Products.Commands;

public record DeleteProductCommand(Guid Id) : IRequest<Result<bool>>;

public class DeleteProductHandler : IRequestHandler<DeleteProductCommand, Result<bool>>
{
    private readonly ICatalogDbContext _context;

    public DeleteProductHandler(ICatalogDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(DeleteProductCommand request, CancellationToken ct)
    {
        var product = await _context.Products.FindAsync(new object[] { request.Id }, ct);
        if (product == null) return Result<bool>.Failure(new Error("Product.NotFound", "Món ăn không tồn tại"));

        // Xóa cứng (hoặc đổi IsActive = false tùy nghiệp vụ)
        _context.Products.Remove(product);

        await _context.SaveChangesAsync(ct);
        return Result<bool>.Success(true);
    }
}