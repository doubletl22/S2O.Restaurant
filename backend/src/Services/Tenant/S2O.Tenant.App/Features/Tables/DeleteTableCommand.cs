using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Shared.Kernel.Interfaces;
using S2O.Shared.Kernel.Results;
using S2O.Tenant.App.Abstractions;
using System.Net.Http.Json;

namespace S2O.Tenant.App.Features.Tables;

public record DeleteTableCommand(Guid Id) : IRequest<Result>;

public class DeleteTableHandler : IRequestHandler<DeleteTableCommand, Result>
{
    private readonly ITenantDbContext _context;
    private readonly ITenantContext _tenantContext;
    private readonly IHttpClientFactory _httpClientFactory;

    public DeleteTableHandler(
        ITenantDbContext context,
        ITenantContext tenantContext,
        IHttpClientFactory httpClientFactory)
    {
        _context = context;
        _tenantContext = tenantContext;
        _httpClientFactory = httpClientFactory;
    }

    public async Task<Result> Handle(DeleteTableCommand request, CancellationToken ct)
    {
        // 1. Kiểm tra quyền truy cập Tenant
        if (_tenantContext.TenantId == null)
            return Result.Failure(new Error("Auth.NoTenant", "Bạn chưa đăng nhập."));

        // 2. Tìm bàn thuộc sở hữu của Tenant hiện tại
        var table = await _context.Tables
            .FirstOrDefaultAsync(t => t.Id == request.Id && t.TenantId == _tenantContext.TenantId.Value, ct);

        if (table == null)
            return Result.Failure(new Error("Table.NotFound", "Không tìm thấy bàn hoặc bạn không có quyền xóa."));

        // 3. Xóa bàn khỏi Database của Tenant Service
        _context.Tables.Remove(table);
        await _context.SaveChangesAsync(ct);

        // 4. Đồng bộ xóa sang Booking Service (Fire and Forget)
        try
        {
            var client = _httpClientFactory.CreateClient();

            // Gọi API xóa nội bộ bên Booking
            var syncDeleteUrl = $"http://booking-api:8080/api/internal/tables/sync/{request.Id}";

            // Sử dụng DeleteAsync để thông báo cho Booking xóa bàn tương ứng
            await client.DeleteAsync(syncDeleteUrl, ct);
        }
        catch (Exception ex)
        {
            // Chỉ log lỗi, không làm sập luồng chính nếu Booking Service bận
            Console.WriteLine($"Lỗi đồng bộ xóa sang Booking: {ex.Message}");
        }

        return Result.Success();
    }
}