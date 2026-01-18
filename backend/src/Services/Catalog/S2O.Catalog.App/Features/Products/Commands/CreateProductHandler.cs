using MediatR;
using S2O.Catalog.App.Abstractions;
using S2O.Catalog.Domain.Entities;
using S2O.Shared.Kernel.Results;

namespace S2O.Catalog.App.Features.Products.Commands;

public class CreateProductHandler : IRequestHandler<CreateProductCommand, Result<Guid>>
{
    private readonly ICatalogDbContext _context;

    public CreateProductHandler(ICatalogDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Guid>> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        // 1. Tạo Entity
        var product = new Product
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            CategoryId = request.CategoryId,
            ImageUrl = request.ImageUrl,
            IsActive = true // Mặc định bán luôn
        };

        // 2. Lưu vào DB
        _context.Products.Add(product);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(product.Id);
    }
}