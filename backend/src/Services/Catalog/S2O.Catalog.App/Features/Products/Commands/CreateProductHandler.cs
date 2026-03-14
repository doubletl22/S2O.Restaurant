using MediatR;
using S2O.Catalog.App.Abstractions;
using S2O.Catalog.Domain.Entities;
using S2O.Shared.Kernel.Results;
using S2O.Shared.Kernel.Interfaces;


namespace S2O.Catalog.App.Features.Products.Commands;

public class CreateProductHandler : IRequestHandler<CreateProductCommand, Result<Guid>>
{
    private readonly ICatalogDbContext _context;
    private readonly IFileStorageService _fileStorage;
    private readonly ICurrentUserService _currentUserService;

    public CreateProductHandler(ICatalogDbContext context, IFileStorageService fileStorage, ICurrentUserService currentUserService)
    {
        _context = context;
        _fileStorage = fileStorage;
        _currentUserService = currentUserService;
    }

    public async Task<Result<Guid>> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        // ✅ Upload Image
        string imageUrl = "https://placehold.co/600x400";

        if (request.ImageFile != null && request.ImageFile.Length > 0)
        {
            using var stream = request.ImageFile.OpenReadStream();
            imageUrl = await _fileStorage.UploadFileAsync(stream, request.ImageFile.FileName);
        }
        
        // ✅ Tạo Entity với đầy đủ required fields
        var product = new Product
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            CategoryId = request.CategoryId,
            ImageUrl = imageUrl,
            IsActive = request.IsActive,
            IsAvailable = true,  // ✅ Fix lỗi NOT NULL constraint
            TenantId = _currentUserService.TenantId,
            CreatedAtUtc = DateTime.UtcNow
        };

        // ✅ Lưu vào DB
        _context.Products.Add(product);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(product.Id);
    }
}