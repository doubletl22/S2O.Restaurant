using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Catalog.App.Abstractions;
using S2O.Catalog.App.DTOs;
using S2O.Shared.Kernel.Results;

namespace S2O.Catalog.App.Features.Categories;

public record GetCategoriesQuery() : IRequest<Result<List<CategoryResponse>>>;

public class GetCategoriesHandler : IRequestHandler<GetCategoriesQuery, Result<List<CategoryResponse>>>
{
    private readonly ICatalogDbContext _context;

    public GetCategoriesHandler(ICatalogDbContext context) => _context = context;

    public async Task<Result<List<CategoryResponse>>>Handle(GetCategoriesQuery request, CancellationToken ct)
    {
        // Global Query Filter cho TenantId đã được cấu hình trong CatalogDbContext
        var categories = await _context.Categories
            .AsNoTracking()
            .Select(c => new CategoryResponse(c.Id, c.Name, c.Description))
            .ToListAsync(ct);

        return Result<List<CategoryResponse>>.Success(categories);
    }
}