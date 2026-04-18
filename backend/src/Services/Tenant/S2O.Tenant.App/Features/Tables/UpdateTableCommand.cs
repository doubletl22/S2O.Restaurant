using MediatR;
using S2O.Shared.Kernel.Results;
using S2O.Tenant.App.Abstractions;

namespace S2O.Tenant.App.Features.Tables;

public record UpdateTableCommand(Guid Id, string Name, int Capacity, bool IsActive, bool IsOccupied = false) : IRequest<Result<Guid>>;

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

        // Validate Name
        if (string.IsNullOrWhiteSpace(request.Name))
            return Result<Guid>.Failure(new Error("Table.NameRequired", "Tên bàn không được để trống."));

        if (request.Name.Length > 50)
            return Result<Guid>.Failure(new Error("Table.NameTooLong", "Tên bàn không được quá 50 ký tự."));

        if (request.Capacity <= 0)
            return Result<Guid>.Failure(new Error("Table.CapacityInvalid", "Sức chứa phải lớn hơn 0."));

        table.Name = request.Name;
        table.Capacity = request.Capacity;
        table.IsActive = request.IsActive;
        table.IsOccupied = request.IsOccupied;

        await _context.SaveChangesAsync(ct);
        return Result<Guid>.Success(table.Id);
    }
}