using MediatR;
using S2O.Shared.Kernel.Results;
using S2O.Tenant.App.Abstractions;

namespace S2O.Tenant.App.Features.Tenants.Commands;

public record DeleteTenantCommand(Guid Id) : IRequest<Result<bool>>;

public class DeleteTenantHandler : IRequestHandler<DeleteTenantCommand, Result<bool>>
{
    private readonly ITenantDbContext _context;

    public DeleteTenantHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(DeleteTenantCommand request, CancellationToken ct)
    {
        var tenant = await _context.Tenants.FindAsync(new object[] { request.Id }, ct);
        if (tenant == null) return Result<bool>.Failure(new Error("Tenant.NotFound", "Không tìm thấy nhà hàng"));

        // Xóa cứng (Hard Delete) hoặc Soft Delete tùy nghiệp vụ. 
        // Ở đây làm xóa cứng để dọn sạch dữ liệu test.
        _context.Tenants.Remove(tenant);

        await _context.SaveChangesAsync(ct);
        return Result<bool>.Success(true);
    }
}