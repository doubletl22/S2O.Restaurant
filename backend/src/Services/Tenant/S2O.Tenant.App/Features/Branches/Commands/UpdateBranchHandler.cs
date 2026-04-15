using MediatR;
using S2O.Shared.Kernel.Results; 
using S2O.Tenant.App.Abstractions;

namespace S2O.Tenant.App.Features.Branches.Commands;

public class UpdateBranchHandler : IRequestHandler<UpdateBranchCommand, Result<Guid>>
{
    private readonly ITenantDbContext _context;

    public UpdateBranchHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Guid>> Handle(UpdateBranchCommand request, CancellationToken cancellationToken)
    {
        var branch = await _context.Branches.FindAsync(new object[] { request.Id }, cancellationToken);

        if (branch == null)
        {
            return Result<Guid>.Failure(new Error("Branch.NotFound", "Không tìm thấy chi nhánh"));
        }

        // Validate name
        var normalizedName = request.Name?.Trim();
        if (string.IsNullOrWhiteSpace(normalizedName))
        {
            return Result<Guid>.Failure(new Error("Branch.NameRequired", "Tên chi nhánh là bắt buộc."));
        }

        if (normalizedName.Length > 255)
        {
            return Result<Guid>.Failure(new Error("Branch.NameTooLong", "Tên chi nhánh chỉ được tối đa 255 ký tự."));
        }

        // Validate address
        var normalizedAddress = request.Address?.Trim();
        if (string.IsNullOrWhiteSpace(normalizedAddress))
        {
            return Result<Guid>.Failure(new Error("Branch.AddressRequired", "Địa chỉ chi nhánh là bắt buộc."));
        }

        if (normalizedAddress.Length > 500)
        {
            return Result<Guid>.Failure(new Error("Branch.AddressTooLong", "Địa chỉ chi nhánh chỉ được tối đa 500 ký tự."));
        }

        // Validate phone
        var normalizedPhone = request.Phone?.Trim();
        if (string.IsNullOrWhiteSpace(normalizedPhone))
        {
            return Result<Guid>.Failure(new Error("Branch.PhoneRequired", "Số điện thoại chi nhánh là bắt buộc."));
        }

        // Phone chỉ được chứa số (0-9)
        if (!System.Text.RegularExpressions.Regex.IsMatch(normalizedPhone, @"^[0-9]+$"))
        {
            return Result<Guid>.Failure(new Error("Branch.PhoneInvalid", "Số điện thoại chỉ được chứa số."));
        }

        // Kiểm tra độ dài số điện thoại (9-11 chữ số)
        if (normalizedPhone.Length < 9)
        {
            return Result<Guid>.Failure(new Error("Branch.PhoneTooShort", "Số điện thoại phải có tối thiểu 9 chữ số."));
        }

        if (normalizedPhone.Length > 11)
        {
            return Result<Guid>.Failure(new Error("Branch.PhoneTooLong", "Số điện thoại chỉ được có tối đa 11 chữ số."));
        }

        branch.Name = normalizedName;
        branch.Address = normalizedAddress;
        branch.PhoneNumber = normalizedPhone;
        branch.IsActive = request.IsActive;

        _context.Branches.Update(branch);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(branch.Id);
    }
}