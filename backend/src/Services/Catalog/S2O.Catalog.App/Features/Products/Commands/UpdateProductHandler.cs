using MediatR;
using S2O.Catalog.App.Abstractions;
using Microsoft.EntityFrameworkCore;
using S2O.Shared.Kernel.Interfaces; // [1] Namespace chứa Interface của bạn
using S2O.Shared.Kernel.Results;

namespace S2O.Catalog.App.Features.Products.Commands;

public class UpdateProductHandler : IRequestHandler<UpdateProductCommand, Result<Guid>>
{
    private readonly ICatalogDbContext _context;
    private readonly IFileStorageService _fileService; // [2] Inject Service
    private readonly ICurrentUserService _currentUserService;

    public UpdateProductHandler(
        ICatalogDbContext context,
        IFileStorageService fileService,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _fileService = fileService;
        _currentUserService = currentUserService;
    }

    public async Task<Result<Guid>> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        var currentTenantId = _currentUserService.TenantId;
        if (!currentTenantId.HasValue || currentTenantId == Guid.Empty)
        {
            return Result<Guid>.Failure(new Error("Auth.NoTenant", "Không xác định được tenant của người dùng."));
        }

        // 1. Tìm món ăn theo mọi tenant để xử lý chéo tenant an toàn.
        var productAnyTenant = await _context.Products
            .IgnoreQueryFilters()
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (productAnyTenant == null)
        {
            return Result<Guid>.Failure(new Error("Product.NotFound", "Không tìm thấy món ăn"));
        }

        // Không lộ dữ liệu tenant khác: trả NotFound thay vì lỗi hệ thống.
        if (productAnyTenant.TenantId != currentTenantId.Value)
        {
            return Result<Guid>.Failure(new Error("Product.NotFound", "Không tìm thấy món ăn"));
        }

        var product = await _context.Products
            .FirstOrDefaultAsync(
                p => p.Id == request.Id && p.TenantId == currentTenantId.Value,
                cancellationToken);

        if (product == null)
        {
            return Result<Guid>.Failure(new Error("Product.NotFound", "Không tìm thấy món ăn"));
        }

        var normalizedName = (request.Name ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(normalizedName))
        {
            return Result<Guid>.Failure(new Error("Product.NameRequired", "Tên món không được để trống."));
        }

        var categoryExists = await _context.Categories.AnyAsync(
            c => c.Id == request.CategoryId && c.TenantId == currentTenantId.Value,
            cancellationToken);

        if (!categoryExists)
        {
            return Result<Guid>.Failure(new Error("Category.NotFound", "Không tìm thấy danh mục hợp lệ."));
        }

        // 2. Cập nhật thông tin text
        product.Name = normalizedName;
        product.Description = request.Description ?? string.Empty;
        product.Price = request.Price;
        product.CategoryId = request.CategoryId;
        product.IsActive = request.IsActive;

        // 3. XỬ LÝ ẢNH (Logic chính nằm ở đây)
        if (request.ImageFile != null && request.ImageFile.Length > 0)
        {
            try
            {
                // A. Xóa ảnh cũ trên Cloudinary (Nếu có)
                if (!string.IsNullOrEmpty(product.ImageUrl))
                {
                    var publicId = GetPublicIdFromUrl(product.ImageUrl);
                    if (!string.IsNullOrEmpty(publicId))
                    {
                        // Gọi hàm xóa của bạn
                        await _fileService.DeleteFileAsync(publicId);
                    }
                }

                // B. Upload ảnh mới
                using (var stream = request.ImageFile.OpenReadStream())
                {
                    // Gọi hàm upload của bạn
                    var newUrl = await _fileService.UploadFileAsync(stream, request.ImageFile.FileName);

                    // C. Cập nhật URL mới vào Entity
                    product.ImageUrl = newUrl;
                }
            }
            catch (Exception ex)
            {
                // Tùy chọn: Log lỗi nhưng không chặn việc update thông tin khác
                Console.WriteLine($"Lỗi upload ảnh: {ex.Message}");
            }
        }

        // 4. Lưu Database
        _context.Products.Update(product);
        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            return Result<Guid>.Failure(new Error("Product.UpdateFailed", "Không thể cập nhật món ăn."));
        }

        return Result<Guid>.Success(product.Id);
    }

    private string? GetPublicIdFromUrl(string url)
    {
        try
        {
            var uri = new Uri(url);
            var path = uri.AbsolutePath;
            // path = "/tên_cloud/image/upload/v1234/s2o_restaurant/products/guid.jpg"

            var segments = path.Split('/');
            var uploadIndex = Array.IndexOf(segments, "upload");

            if (uploadIndex != -1 && uploadIndex + 2 < segments.Length)
            {
                var publicIdParts = segments.Skip(uploadIndex + 2);
                var publicIdWithExt = string.Join("/", publicIdParts);
                return Path.ChangeExtension(publicIdWithExt, null);
            }
        }
        catch
        {
            return null;
        }
        return null;
    }
}