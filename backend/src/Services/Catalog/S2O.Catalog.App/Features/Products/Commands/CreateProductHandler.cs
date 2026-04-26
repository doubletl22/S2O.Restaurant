using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Catalog.App.Abstractions;
using S2O.Catalog.App.Features.Plans;
using S2O.Catalog.Domain.Entities;
using S2O.Shared.Kernel.Results;
using S2O.Shared.Kernel.Interfaces;


namespace S2O.Catalog.App.Features.Products.Commands;

public class CreateProductHandler : IRequestHandler<CreateProductCommand, Result<Guid>>
{
    private readonly ICatalogDbContext _context;
    private readonly IFileStorageService _fileStorage;
    private readonly ICurrentUserService _currentUserService;
    private readonly ITenantSubscriptionReader _subscriptionReader;

    public CreateProductHandler(
        ICatalogDbContext context,
        IFileStorageService fileStorage,
        ICurrentUserService currentUserService,
        ITenantSubscriptionReader subscriptionReader)
    {
        _context = context;
        _fileStorage = fileStorage;
        _currentUserService = currentUserService;
        _subscriptionReader = subscriptionReader;
    }

    public async Task<Result<Guid>> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        var currentTenantId = _currentUserService.TenantId;
        if (!currentTenantId.HasValue || currentTenantId == Guid.Empty)
        {
            return Result<Guid>.Failure(new Error("Auth.NoTenant", "Không xác định được tenant của người dùng."));
        }

        var subscriptionResult = await _subscriptionReader.GetTenantSubscriptionAsync(currentTenantId.Value, cancellationToken);
        if (subscriptionResult.IsFailure)
        {
            return Result<Guid>.Failure(subscriptionResult.Error!);
        }

        var subscription = subscriptionResult.Value;
        if (subscription.IsLocked || !subscription.IsActive || subscription.IsSubscriptionExpired)
        {
            return Result<Guid>.Failure(new Error("Tenant.SubscriptionBlocked", "Gói dịch vụ đã hết hạn hoặc tenant đang bị khóa."));
        }

        var maxProducts = GetQuota(subscription.PlanType);
        if (maxProducts != int.MaxValue)
        {
            var currentProducts = await _context.Products.CountAsync(p => p.TenantId == currentTenantId.Value, cancellationToken);
            if (currentProducts >= maxProducts)
            {
                return Result<Guid>.Failure(new Error("Quota.ProductsExceeded", $"Gói {subscription.PlanType} cho phép tối đa {maxProducts} sản phẩm."));
            }
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

        // ✅ Upload Image
        string imageUrl = string.Empty;

        if (request.ImageFile != null && request.ImageFile.Length > 0)
        {
            try
            {
                using var stream = request.ImageFile.OpenReadStream();
                imageUrl = await _fileStorage.UploadFileAsync(stream, request.ImageFile.FileName);
            }
            catch
            {
                imageUrl = string.Empty;
            }
        }
        
        // ✅ Tạo Entity với đầy đủ required fields
        var product = new Product
        {
            Id = Guid.NewGuid(),
            Name = normalizedName,
            Description = request.Description ?? string.Empty,
            Price = request.Price,
            CategoryId = request.CategoryId,
            ImageUrl = imageUrl,
            IsActive = request.IsActive,
            IsAvailable = true,  // ✅ Fix lỗi NOT NULL constraint
            TenantId = currentTenantId.Value,
            CreatedAtUtc = DateTime.UtcNow
        };

        // ✅ Lưu vào DB
        _context.Products.Add(product);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(product.Id);
    }

    private static int GetQuota(string planType)
    {
        return planType switch
        {
            "Premium" => 100,
            "Enterprise" => int.MaxValue,
            _ => 10
        };
    }
}