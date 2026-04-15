using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Shared.Kernel.Interfaces;
using S2O.Shared.Kernel.Results;
using S2O.Tenant.App.Abstractions;
using S2O.Tenant.App.Features.Plans;
using S2O.Tenant.Domain.Entities; // Đảm bảo đã có Entity Branch

namespace S2O.Tenant.App.Features.Branches.Commands;

public class CreateBranchHandler : IRequestHandler<CreateBranchCommand, Result<Guid>>
{
    private readonly ITenantDbContext _context;
    private readonly ITenantContext _tenantContext;

    public CreateBranchHandler(ITenantDbContext context, ITenantContext tenantContext)
    {
        _context = context;
        _tenantContext = tenantContext;
    }

    public async Task<Result<Guid>> Handle(CreateBranchCommand request, CancellationToken cancellationToken)
    {
        if (_tenantContext.TenantId == null || _tenantContext.TenantId == Guid.Empty)
        {
            return Result<Guid>.Failure(Error.Failure("Auth.NoTenant", "Không xác định được Tenant (Vui lòng đăng nhập lại)."));
        }

        // Validate branch name
        var normalizedName = request.Name?.Trim();
        if (string.IsNullOrWhiteSpace(normalizedName))
        {
            return Result<Guid>.Failure(Error.Failure("Branch.NameRequired", "Tên chi nhánh là bắt buộc."));
        }

        if (normalizedName.Length > 255)
        {
            return Result<Guid>.Failure(Error.Failure("Branch.NameTooLong", "Tên chi nhánh chỉ được tối đa 255 ký tự."));
        }

        // Validate address
        var normalizedAddress = request.Address?.Trim();
        if (string.IsNullOrWhiteSpace(normalizedAddress))
        {
            return Result<Guid>.Failure(Error.Failure("Branch.AddressRequired", "Địa chỉ chi nhánh là bắt buộc."));
        }

        if (normalizedAddress.Length > 500)
        {
            return Result<Guid>.Failure(Error.Failure("Branch.AddressTooLong", "Địa chỉ chi nhánh chỉ được tối đa 500 ký tự."));
        }

        // Validate phone
        var normalizedPhone = request.Phone?.Trim();
        if (string.IsNullOrWhiteSpace(normalizedPhone))
        {
            return Result<Guid>.Failure(Error.Failure("Branch.PhoneRequired", "Số điện thoại chi nhánh là bắt buộc."));
        }

        // Phone chỉ được chứa số (0-9)
        if (!System.Text.RegularExpressions.Regex.IsMatch(normalizedPhone, @"^[0-9]+$"))
        {
            return Result<Guid>.Failure(Error.Failure("Branch.PhoneInvalid", "Số điện thoại chỉ được chứa số."));
        }

        // Kiểm tra độ dài số điện thoại (9-11 chữ số)
        if (normalizedPhone.Length < 9)
        {
            return Result<Guid>.Failure(Error.Failure("Branch.PhoneTooShort", "Số điện thoại phải có tối thiểu 9 chữ số."));
        }

        if (normalizedPhone.Length > 11)
        {
            return Result<Guid>.Failure(Error.Failure("Branch.PhoneTooLong", "Số điện thoại chỉ được có tối đa 11 chữ số."));
        }

        // Check tenant status
        var tenantId = _tenantContext.TenantId.Value;
        var tenant = await _context.Tenants.FirstOrDefaultAsync(t => t.Id == tenantId, cancellationToken);
        if (tenant == null)
        {
            return Result<Guid>.Failure(Error.NotFound("Tenant.NotFound", "Không tìm thấy nhà hàng."));
        }

        if (tenant.IsLocked)
        {
            return Result<Guid>.Failure(Error.Conflict("Tenant.Locked", "Nhà hàng đã bị khóa."));
        }

        if (tenant.SubscriptionExpiry != default && tenant.SubscriptionExpiry < DateTime.UtcNow)
        {
            tenant.IsLocked = true;
            await _context.SaveChangesAsync(cancellationToken);
            return Result<Guid>.Failure(Error.Conflict("Tenant.SubscriptionExpired", "Gói dịch vụ đã hết hạn. Vui lòng gia hạn."));
        }

        if (!PlanPolicy.IsUnlimited(tenant.SubscriptionPlan))
        {
            var currentBranches = await _context.Branches.CountAsync(b => b.TenantId == tenantId, cancellationToken);
            var maxBranches = PlanPolicy.GetBranchesQuota(tenant.SubscriptionPlan);
            if (currentBranches >= maxBranches)
            {
                return Result<Guid>.Failure(Error.Conflict("Quota.BranchesExceeded", $"Gói {PlanPolicy.Normalize(tenant.SubscriptionPlan)} cho phép tối đa {maxBranches} chi nhánh."));
            }
        }

        // 1. Tạo Entity Branch mới
        var branch = new Branch
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = normalizedName,
            Address = normalizedAddress,
            PhoneNumber = normalizedPhone,
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow
        };

        // 2. Lưu vào DB
        _context.Branches.Add(branch);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(branch.Id);
    }
}