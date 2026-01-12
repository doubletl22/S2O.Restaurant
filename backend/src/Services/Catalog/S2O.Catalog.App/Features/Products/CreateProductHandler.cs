using ErrorOr;
using MediatR;
using S2O.Catalog.App.Abstractions; 
using S2O.Catalog.Domain.Entities;
using S2O.Kernel.Interfaces;
using S2O.Shared.Kernel.Interfaces; 


namespace S2O.Catalog.App.Features.Products.Handlers;

public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, ErrorOr<Guid>>
{
    private readonly ICatalogDbContext _context;
    private readonly IFileStorageService _fileStorageService;
    public CreateProductCommandHandler(
        ICatalogDbContext context,
        IFileStorageService fileStorageService)
    {
        _context = context;
        _fileStorageService = fileStorageService;
    }

    public async Task<ErrorOr<Guid>> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        // 1. Kiểm tra Category có tồn tại không
        var category = await _context.Categories
            .FindAsync(new object[] { request.CategoryId }, cancellationToken);

        if (category == null)
        {
            return ErrorOr.Error.NotFound("Category.NotFound", "Danh mục không tồn tại.");
        }

        string imageUrl = string.Empty;

        try
        {
            // 2. Upload ảnh lên Cloudinary thông qua StorageService
            if (request.ImageStream != null && request.ImageStream.Length > 0)
            {
                imageUrl = await _fileStorageService.UploadFileAsync(
                    request.ImageStream,
                    request.FileName
                );
            }
        }
        catch (Exception ex)
        {
            return ErrorOr.Error.Failure("Image.UploadError", $"Lỗi khi tải ảnh lên: {ex.Message}");
        }
        finally
        {
            // Luôn đóng stream để giải phóng bộ nhớ hệ thống
            request.ImageStream?.Close();
        }

        // 3. Khởi tạo Entity Product
        var product = new Product
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            CategoryId = request.CategoryId,
            ImageUrl = imageUrl
        };

        // 4. Lưu vào Database (PostgreSQL)
        _context.Products.Add(product);
        await _context.SaveChangesAsync(cancellationToken);

        return product.Id;
    }
}