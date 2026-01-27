using MediatR;
using S2O.Shared.Kernel.Results;
using S2O.Tenant.App.Abstractions;

namespace S2O.Tenant.App.Features.Tables;

public record UpdateTableCommand(Guid Id, string Name, int Capacity, bool IsActive) : IRequest<Result<Guid>>;

public class UpdateTableHandler : IRequestHandler<UpdateTableCommand, Result<Guid>>
{
    private readonly ITenantDbContext _context;

    public UpdateTableHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Guid>> Handle(UpdateTableCommand request, CancellationToken ct)
    {
        var table = await _context.Tables.FindAsync(new object[] { request.Id }, ct);
        if (table == null) return Result<Guid>.Failure(new Error("Table.NotFound", "Bàn không tồn tại"));

        table.Name = request.Name;
        table.Capacity = request.Capacity;
        table.IsActive = request.IsActive;

        await _context.SaveChangesAsync(ct);
        return Result<Guid>.Success(table.Id);
    }
}