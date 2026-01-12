using MediatR;
using S2O.Shared.Kernel.Results;
using S2O.Tenant.Domain.Entities;
using S2O.Tenant.App.Abstractions;
using S2O.Shared.Kernel.Interfaces;

namespace S2O.Tenant.App.Features.Tables;

public record CreateTableCommand(string Name) : IRequest<Result<Guid>>;

public class CreateTableHandler : IRequestHandler<CreateTableCommand, Result<Guid>>
{
    private readonly ITenantDbContext _context;
    private readonly ITenantContext _tenantContext;

    public CreateTableHandler(ITenantDbContext context, ITenantContext tenantContext)
    {
        _context = context;
        _tenantContext = tenantContext;
    }

    public async Task<Result<Guid>> Handle(CreateTableCommand request, CancellationToken ct)
    {
        if (_tenantContext.TenantId == null)
            return Result<Guid>.Failure(new Error("Auth.NoTenant", "Bạn chưa đăng nhập hoặc không có TenantId"));

        var table = new Table
        {
            //Id = Guid.NewGuid(),
            Name = request.Name,
            TenantId = _tenantContext.TenantId.Value,
            // Tạo link QR giả lập (Frontend sẽ dùng link này để generate ảnh QR)
            QrCodeUrl = $"https://s2o-app.com/menu/{_tenantContext.TenantId.Value}/{Guid.NewGuid()}"
        };

        _context.Tables.Add(table);
        await _context.SaveChangesAsync(ct);

        return Result<Guid>.Success(table.Id);
    }
}