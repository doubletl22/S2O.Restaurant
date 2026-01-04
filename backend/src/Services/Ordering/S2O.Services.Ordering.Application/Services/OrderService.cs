using S2O.Services.Ordering.Application.DTOs;
using S2O.Services.Ordering.Application.Interfaces;
using S2O.Services.Ordering.Domain.Entities;
using S2O.Shared.Kernel.Wrapper;

namespace S2O.Services.Ordering.Application.Services
{
    public interface IOrderService
    {
        Task<Result<Guid>> CreateOrderAsync(Guid customerId, CreateOrderRequest request);
        Task<Result<Order>> GetOrderByIdAsync(Guid orderId);
        Task<Result<List<Order>>> GetOrdersByRestaurantAsync(Guid restaurantId);
    }

    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;

        public OrderService(IOrderRepository orderRepository)
        {
            _orderRepository = orderRepository;
        }

        public async Task<Result<Guid>> CreateOrderAsync(Guid customerId, CreateOrderRequest request)
        {
            // 1. Tạo Order Aggregate
            var orderResult = Order.Create(request.RestaurantId, customerId, request.TableId, request.Note);
            if (orderResult.IsFailure) return Result.Failure<Guid>(orderResult.Error);

            var order = orderResult.Value;

            // 2. Add từng món vào Order (Logic tách món theo Note sẽ chạy trong Domain)
            foreach (var item in request.Items)
            {
                order.AddItem(item.MenuId, item.ProductName, item.UnitPrice, item.Quantity, item.Note);
            }

            // 3. Lưu xuống DB
            await _orderRepository.AddAsync(order);

            return Result.Success(order.Id);
        }

        public async Task<Result<Order>> GetOrderByIdAsync(Guid orderId)
        {
            var order = await _orderRepository.GetByIdAsync(orderId);
            if (order == null) return Result.Failure<Order>("Order not found");
            return Result.Success(order);
        }

        public async Task<Result<List<Order>>> GetOrdersByRestaurantAsync(Guid restaurantId)
        {
            var orders = await _orderRepository.GetByRestaurantAsync(restaurantId);
            return Result.Success(orders);
        }
    }
}