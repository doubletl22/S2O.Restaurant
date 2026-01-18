using MediatR;
using S2O.Order.App.Abstractions;
using S2O.Order.Domain.Enums;
using S2O.Shared.Kernel.Interfaces;
using S2O.Shared.Kernel.Results;
using OrderEntity = S2O.Order.Domain.Entities.Order;
using OrderItemEntity = S2O.Order.Domain.Entities.OrderItem;

namespace S2O.Order.App.Features.Orders.Commands;

public class PlaceCustomerOrderHandler : IRequestHandler<PlaceCustomerOrderCommand, Result<Guid>>
{
    private readonly IOrderDbContext _context;
    private readonly IOrderNotifier _notifier;
    private readonly IUserContext _userContext;
    private readonly ITenantContext _tenantContext;
    private readonly ICatalogClient _catalogClient;

    public PlaceCustomerOrderHandler(
        IOrderDbContext context,
        IOrderNotifier notifier,
        IUserContext userContext,
        ITenantContext tenantContext,
        ICatalogClient catalogClient)
    {
        _context = context;
        _notifier = notifier;
        _userContext = userContext;
        _tenantContext = tenantContext;
        _catalogClient = catalogClient;
    }

    public async Task<Result<Guid>> Handle(PlaceCustomerOrderCommand request, CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId ?? throw new UnauthorizedAccessException("User ID is missing");
        var tenantId = _tenantContext.TenantId ?? throw new UnauthorizedAccessException("Tenant ID is missing");
        var branchId = _tenantContext.BranchId ?? throw new UnauthorizedAccessException("Branch ID is missing");

        var order = new OrderEntity
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,   
            BranchId = branchId,   
            TableId = request.TableId,
            UserId = userId,     
            Status = OrderStatus.Pending,
            CreatedAtUtc = DateTime.UtcNow,
            Note = $"Thành viên: {request.UserName}", 
            TotalAmount = 0
        };

        if (request.Items != null && request.Items.Any())
        {
            foreach (var itemDto in request.Items)
            {
                if (itemDto.Quantity <= 0)
                {
                    return Result<Guid>.Failure(Error.Validation("Order.InvalidQuantity", "Số lượng món ăn phải lớn hơn 0"));
                }
                var productInfo = await _catalogClient.GetProductAsync(itemDto.ProductId);

                if (productInfo == null)
                {
                    return Result<Guid>.Failure(Error.NotFound("Product.NotFound", $"Product with ID {itemDto.ProductId} not found"));
                }

                var orderItem = new OrderItemEntity
                {
                    Id = Guid.NewGuid(),
                    OrderId = order.Id,
                    ProductId = itemDto.ProductId,
                    Quantity = itemDto.Quantity,
                    UnitPrice = productInfo.Price // Lấy giá thực tế từ Database
                };

                order.TotalAmount += orderItem.UnitPrice * orderItem.Quantity;
                order.Items.Add(orderItem);
            }
        }

        _context.Orders.Add(order);
        await _context.SaveChangesAsync(cancellationToken);

        // Gửi thông báo realtime
        await _notifier.NotifyNewOrderAsync(order.BranchId, order.Id);

        return Result<Guid>.Success(order.Id);
    }
}