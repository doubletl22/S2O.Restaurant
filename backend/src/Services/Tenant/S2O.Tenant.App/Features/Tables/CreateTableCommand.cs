using MediatR;
using S2O.Shared.Kernel.Results;
using S2O.Tenant.Domain.Entities;
using S2O.Tenant.App.Abstractions;
using S2O.Shared.Kernel.Interfaces;
using S2O.Shared.Kernel.IntegrationEvents;
using System.Net.Http.Json;

namespace S2O.Tenant.App.Features.Tables;

// 1. Thêm BranchId và Capacity vào Input
public record CreateTableCommand(
    Guid BranchId,
    string Name,
    int Capacity
) : IRequest<Result<Guid>>;

public class CreateTableHandler : IRequestHandler<CreateTableCommand, Result<Guid>>
{
    private readonly ITenantDbContext _context;
    private readonly ITenantContext _tenantContext;
    private readonly IPublisher _publisher;
    private readonly IHttpClientFactory _httpClientFactory;

    public CreateTableHandler(
        ITenantDbContext context,
        ITenantContext tenantContext,
        IPublisher publisher,
        IHttpClientFactory httpClientFactory)
    {
        _context = context;
        _tenantContext = tenantContext;
        _publisher = publisher;
        _httpClientFactory = httpClientFactory;
    }

    public async Task<Result<Guid>> Handle(CreateTableCommand request, CancellationToken ct)
    {
        if (_tenantContext.TenantId == null)
            return Result<Guid>.Failure(new Error("Auth.NoTenant", "Bạn chưa đăng nhập."));

        // Validate BranchId
        if (request.BranchId == Guid.Empty)
            return Result<Guid>.Failure(new Error("Table.BranchRequired", "Vui lòng chọn chi nhánh."));

        var tableId = Guid.NewGuid();

        var table = new Table
        {
            Id = tableId,
            Name = request.Name,
            Capacity = request.Capacity, // Gán Capacity
            TenantId = _tenantContext.TenantId.Value,
            BranchId = request.BranchId, // [QUAN TRỌNG] Gán BranchId để không bị null
            QrCodeUrl = tableId.ToString()
        };

        _context.Tables.Add(table);
        await _context.SaveChangesAsync(ct);

        try
        {
            var client = _httpClientFactory.CreateClient();
            var bookingUrl = "http://booking-api:8080/api/internal/tables/sync";

            var syncPayload = new
            {
                Id = table.Id,
                TenantId = table.TenantId.Value,
                BranchId = table.BranchId.Value,
                Name = table.Name,
                Capacity = table.Capacity
            };

            await client.PostAsJsonAsync(bookingUrl, syncPayload, ct);
        }
        catch (Exception ex)
        {
            // Log lỗi nhưng không chặn luồng chính (Fire and Forget)
            Console.WriteLine($"Lỗi đồng bộ sang Booking: {ex.Message}");
        }

        return Result<Guid>.Success(table.Id);
    }
}