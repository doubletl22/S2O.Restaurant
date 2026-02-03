using MediatR;
using S2O.Catalog.App.Abstractions;
using S2O.Catalog.Domain.Entities;
using S2O.Shared.Kernel.Interfaces;
using S2O.Shared.Kernel.Results;

namespace S2O.Catalog.App.Features.Categories.Commands;

public class CreateCategoryHandler : IRequestHandler<CreateCategoryCommand, Result<Guid>>
{
    // [2] Sử dụng Interface thay vì Class cụ thể
    private readonly ICatalogDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public CreateCategoryHandler(ICatalogDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<Guid>> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
    {
        var currentTenantId = _currentUserService.TenantId;
        Console.WriteLine($"[DEBUG] Creating Category. TenantId form Token: {currentTenantId}");
        var category = new Category
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            IsActive = request.IsActive,
            TenantId = currentTenantId
        };

        _context.Categories.Add(category);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(category.Id);
    }
}