using MediatR;
using S2O.Shared.Kernel.Results;
using S2O.Catalog.App.Abstractions;
using Microsoft.EntityFrameworkCore;
using S2O.Shared.Kernel.Interfaces;

namespace S2O.Catalog.App.Features.Products.Commands;

public record DeleteProductCommand(Guid Id) : IRequest<Result<bool>>;

public class DeleteProductHandler : IRequestHandler<DeleteProductCommand, Result<bool>>
{
    private readonly ICatalogDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public DeleteProductHandler(ICatalogDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<bool>> Handle(DeleteProductCommand request, CancellationToken ct)
    {
        var currentTenantId = _currentUserService.TenantId;
        if (!currentTenantId.HasValue || currentTenantId == Guid.Empty)
        {
            return Result<bool>.Failure(new Error("Auth.NoTenant", "Không xác định được tenant của người dùng."));
        }

        var productAnyTenant = await _context.Products
            .IgnoreQueryFilters()
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.Id, ct);

        if (productAnyTenant == null)
            return Result<bool>.Failure(new Error("Product.NotFound", "Món ăn không tồn tại"));

        if (productAnyTenant.TenantId != currentTenantId.Value)
            return Result<bool>.Failure(new Error("Product.Forbidden", "Bạn không có quyền xóa món ăn của tenant khác."));

        var affectedRows = await _context.Products
            .Where(p => p.Id == request.Id && p.TenantId == currentTenantId.Value)
            .ExecuteDeleteAsync(ct);

        if (affectedRows == 0)
            return Result<bool>.Failure(new Error("Product.NotFound", "Món ăn không tồn tại"));

        return Result<bool>.Success(true);
    }
}