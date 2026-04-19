using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Catalog.App.Abstractions;
using S2O.Catalog.Domain.Entities;
using S2O.Shared.Kernel.Interfaces;
using S2O.Shared.Kernel.Results;

namespace S2O.Catalog.App.Features.Categories.Commands;

public class UpdateCategoryHandler : IRequestHandler<UpdateCategoryCommand, Result<Guid>>
{
    private readonly ICatalogDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UpdateCategoryHandler(ICatalogDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<Guid>> Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
    {
        var currentTenantId = _currentUserService.TenantId;
        if (!currentTenantId.HasValue || currentTenantId == Guid.Empty)
        {
            return Result<Guid>.Failure(new Error("Auth.NoTenant", "Không xác định được tenant của người dùng."));
        }

        var category = await _context.Categories
            .FindAsync(new object[] { request.Id }, cancellationToken);

        if (category == null)
        {
            return Result<Guid>.Failure(new Error("Category.NotFound", "Không tìm thấy danh mục này"));
        }

        var normalizedName = (request.Name ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(normalizedName))
        {
            return Result<Guid>.Failure(new Error("Category.NameRequired", "Tên thực đơn không được để trống."));
        }

        var normalizedNameLower = normalizedName.ToLower();
        var duplicateExists = await _context.Categories.AnyAsync(
            c => c.TenantId == currentTenantId.Value
                 && c.Id != request.Id
                 && c.Name.ToLower() == normalizedNameLower,
            cancellationToken);

        if (duplicateExists)
        {
            return Result<Guid>.Failure(new Error("Category.DuplicateName", "Tên thực đơn đã tồn tại."));
        }

        category.Name = normalizedName;
        category.Description = request.Description;
        category.IsActive = request.IsActive;
        category.LastModifiedAtUtc = DateTime.UtcNow;

        _context.Categories.Update(category);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(category.Id);
    }
}