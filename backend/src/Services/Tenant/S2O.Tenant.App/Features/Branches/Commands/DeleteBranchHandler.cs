using MediatR;
using Microsoft.EntityFrameworkCore; // Cần cái này để dùng .Where
using S2O.Shared.Kernel.Results;
using S2O.Tenant.App.Abstractions;

namespace S2O.Tenant.App.Features.Branches.Commands;

public class DeleteBranchHandler : IRequestHandler<DeleteBranchCommand, Result<Guid>>
{
    private readonly ITenantDbContext _context; // Đổi thành ITenantDbContext

    public DeleteBranchHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Guid>> Handle(DeleteBranchCommand request, CancellationToken cancellationToken)
    {
        // 1. Tìm chi nhánh cần xóa
        var branch = await _context.Branches.FindAsync(new object[] { request.Id }, cancellationToken);

        if (branch == null)
        {
            return Result<Guid>.Failure(new Error("Branch.NotFound", "Không tìm thấy chi nhánh"));
        }

        // [QUAN TRỌNG] 2. Xóa tất cả Bàn (Tables) thuộc chi nhánh này trước
        // Nếu không xóa Tables, Database sẽ báo lỗi Foreign Key Constraint (Lỗi 500)
        var tables = _context.Tables.Where(t => t.BranchId == request.Id);
        _context.Tables.RemoveRange(tables);

        // [MỞ RỘNG] Nếu Chi nhánh có Nhân viên (Employees), bạn cũng cần xóa hoặc vô hiệu hóa họ ở đây
        // var employees = _context.Employees.Where(e => e.BranchId == request.Id);
        // _context.Employees.RemoveRange(employees);

        // 3. Sau khi dọn sạch dữ liệu con, mới xóa Chi nhánh
        _context.Branches.Remove(branch);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(request.Id);
    }
}