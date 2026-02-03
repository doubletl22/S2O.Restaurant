using MediatR;
using S2O.Catalog.App.Abstractions;
using S2O.Catalog.Domain.Entities;
using S2O.Shared.Kernel.Results;

namespace S2O.Catalog.App.Features.Categories.Commands;

public class UpdateCategoryHandler : IRequestHandler<UpdateCategoryCommand, Result<Guid>>
{
    private readonly ICatalogDbContext _context;

    public UpdateCategoryHandler(ICatalogDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Guid>> Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await _context.Categories
            .FindAsync(new object[] { request.Id }, cancellationToken);

        if (category == null)
        {
            return Result<Guid>.Failure(new Error("Category.NotFound", "Không tìm thấy danh mục này"));
        }

        category.Name = request.Name;
        category.Description = request.Description;
        category.IsActive = request.IsActive;
        category.LastModifiedAtUtc = DateTime.UtcNow;

        _context.Categories.Update(category);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(category.Id);
    }
}