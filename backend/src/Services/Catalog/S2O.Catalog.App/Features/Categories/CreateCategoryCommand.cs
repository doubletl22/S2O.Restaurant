using MediatR;
using S2O.Catalog.App.Abstractions;
using S2O.Catalog.Domain.Entities;
using S2O.Shared.Kernel.Interfaces;
using S2O.Shared.Kernel.Results;

namespace S2O.Catalog.App.Features.Categories;

public record CreateCategoryCommand(string Name, string? Description) : IRequest<Result<Guid>>;

public class CreateCategoryHandler : IRequestHandler<CreateCategoryCommand, Result<Guid>>
{
    private readonly ICatalogDbContext _context;
    private readonly ITenantContext _tenantContext;

    public CreateCategoryHandler(ICatalogDbContext context, ITenantContext tenantContext)
    {
        _context = context;
        _tenantContext = tenantContext;
    }

    public async Task<Result<Guid>> Handle(CreateCategoryCommand request, CancellationToken ct)
    {
        var category = new Category
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            // Lấy TenantId từ Context giống như Product
            TenantId = _tenantContext.TenantId ?? throw new UnauthorizedAccessException("Không tìm thấy TenantId!")
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync(ct);

        return Result<Guid>.Success(category.Id);
    }
}