using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Catalog.App.Abstractions;
using S2O.Shared.Kernel.Interfaces; // <-- Inject Service
using S2O.Shared.Kernel.Results;

namespace S2O.Catalog.App.Features.Products.Commands;

public class UpdateProductHandler : IRequestHandler<UpdateProductCommand, Result>
{
    private readonly ICatalogDbContext _context;
    private readonly IFileStorageService _fileStorage; // <-- Inject

    public UpdateProductHandler(ICatalogDbContext context, IFileStorageService fileStorage)
    {
        _context = context;
        _fileStorage = fileStorage;
    }

    public async Task<Result> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        // 1. Tìm sản phẩm (Thêm check TenantId nếu cần bảo mật kỹ)
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == request.ProductId, cancellationToken);

        if (product == null)
        {
            return Result.Failure(new Error("Catalog.NotFound", "Không tìm thấy món ăn này."));
        }

        // 2. Cập nhật thông tin cơ bản
        product.Name = request.Name;
        product.Description = request.Description;
        product.Price = request.Price;
        product.IsActive = request.IsActive;

        // 3. Xử lý ảnh (Chỉ cập nhật nếu có file mới)
        if (request.ImageFile != null && request.ImageFile.Length > 0)
        {
            // (Nâng cao: Có thể gọi hàm xóa ảnh cũ trên Cloudinary tại đây nếu muốn tiết kiệm dung lượng)
            // await _fileStorage.DeleteFileAsync(product.ImageUrl);

            using var stream = request.ImageFile.OpenReadStream();
            var newImageUrl = await _fileStorage.UploadFileAsync(stream, request.ImageFile.FileName);

            product.ImageUrl = newImageUrl; // Gán link mới
        }
        // Nếu ImageFile == null thì giữ nguyên product.ImageUrl cũ

        // 4. Lưu thay đổi
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}