using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Catalog.App.Abstractions;
using S2O.Catalog.App.Features.Plans;
using S2O.Catalog.Domain.Entities;
using S2O.Shared.Kernel.Interfaces;
using S2O.Shared.Kernel.Results;

namespace S2O.Catalog.App.Features.Categories.Commands;

public class CreateCategoryHandler : IRequestHandler<CreateCategoryCommand, Result<Guid>>
{
    // [2] Sử dụng Interface thay vì Class cụ thể
    private readonly ICatalogDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ITenantSubscriptionReader _subscriptionReader;

    public CreateCategoryHandler(
        ICatalogDbContext context,
        ICurrentUserService currentUserService,
        ITenantSubscriptionReader subscriptionReader)
    {
        _context = context;
        _currentUserService = currentUserService;
        _subscriptionReader = subscriptionReader;
    }

    public async Task<Result<Guid>> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
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

        var maxCategories = GetQuota(subscription.PlanType);
        if (maxCategories != int.MaxValue)
        {
            var currentCategories = await _context.Categories.CountAsync(c => c.TenantId == currentTenantId.Value, cancellationToken);
            if (currentCategories >= maxCategories)
            {
                return Result<Guid>.Failure(new Error("Quota.CategoriesExceeded", $"Gói {subscription.PlanType} cho phép tối đa {maxCategories} danh mục."));
            }
        }

        var normalizedName = (request.Name ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(normalizedName))
        {
            return Result<Guid>.Failure(new Error("Category.NameRequired", "Tên thực đơn không được để trống."));
        }

        var normalizedNameLower = normalizedName.ToLower();
        var duplicateExists = await _context.Categories.AnyAsync(
            c => c.TenantId == currentTenantId.Value && c.Name.ToLower() == normalizedNameLower,
            cancellationToken);

        if (duplicateExists)
        {
            return Result<Guid>.Failure(new Error("Category.DuplicateName", "Tên thực đơn đã tồn tại."));
        }

        var category = new Category
        {
            Id = Guid.NewGuid(),
            Name = normalizedName,
            Description = request.Description,
            IsActive = request.IsActive,
            TenantId = currentTenantId.Value
        };

        _context.Categories.Add(category);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(category.Id);
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