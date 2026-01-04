using S2O.Services.Ordering.Domain.Enums;
using S2O.Shared.Kernel.Primitives;
using S2O.Shared.Kernel.Wrapper;

namespace S2O.Services.Ordering.Domain.Entities
{
    public class Order : AggregateRoot<Guid>
    {
        public Guid CustomerId { get; private set; } // Người đặt
        public Guid TableId { get; private set; }    // Bàn số mấy
        public OrderStatus Status { get; private set; }
        public decimal TotalAmount { get; private set; }
        public string? Note { get; private set; }

        private readonly List<OrderItem> _items = new();
        public IReadOnlyCollection<OrderItem> Items => _items.AsReadOnly();

        private Order() { } // Cho EF Core

        public static Result<Order> Create(Guid customerId, Guid tableId, string? note)
        {
            return Result.Success(new Order
            {
                Id = Guid.NewGuid(),
                CustomerId = customerId,
                TableId = tableId,
                Status = OrderStatus.Pending,
                Note = note,
                TotalAmount = 0
            });
        }

        public void AddItem(Guid menuId, string productName, decimal price, int quantity)
        {
            if (quantity <= 0) return;

            var existingItem = _items.FirstOrDefault(x => x.MenuId == menuId);
            if (existingItem != null)
            {
                existingItem.Quantity += quantity;
            }
            else
            {
                _items.Add(new OrderItem
                {
                    Id = Guid.NewGuid(),
                    OrderId = this.Id,
                    MenuId = menuId,
                    ProductName = productName,
                    UnitPrice = price,
                    Quantity = quantity
                });
            }
            CalculateTotal();
        }

        private void CalculateTotal()
        {
            TotalAmount = _items.Sum(x => x.UnitPrice * x.Quantity);
        }
    }
}