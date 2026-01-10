using MediatR;
using S2O.Catalog.App.Features.Products;
using S2O.Catalog.Domain.Entities;
using S2O.Shared.Kernel.Interfaces;
using S2O.Shared.Kernel.Results;
using S2O.Catalog.App.Abstractions;

public class CreateProductHandler : IRequestHandler<CreateProductCommand, Result<Guid>>
{
    private readonly ICatalogDbContext _context;
    private readonly ITenantContext _tenantContext;
    private readonly IFileStorageService _fileService;

    public CreateProductHandler(ICatalogDbContext context, ITenantContext tenantContext, IFileStorageService fileService)
    {
        _context = context;
        _tenantContext = tenantContext;
        _fileService = fileService;
    }

    public async Task<Result<Guid>> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        // 1. Upload ảnh lên S3
        var imageUrl = await _fileService.UploadAsync(request.ImageStream, request.ImageName, request.ContentType);

        // 2. Khởi tạo Entity
        var product = new Product
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            CategoryId = request.CategoryId,
            ImageUrl = imageUrl,
            // TENANT ID: Lấy từ Context (đã được Middleware TenantResolver xử lý)
            TenantId = _tenantContext.TenantId ?? throw new UnauthorizedAccessException("Không tìm thấy TenantId!")
        };

        // 3. Lưu vào DB
        _context.Products.Add(product);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(product.Id);
    }
}