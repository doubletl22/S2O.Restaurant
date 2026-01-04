using S2O.Services.Ordering.Domain.Enums;
using S2O.Shared.Kernel.Primitives;
using S2O.Shared.Kernel.Wrapper;

namespace S2O.Services.Ordering.Domain.Entities
{
    public class Order : AggregateRoot<Guid>
    {
        // --- BỔ SUNG: RestaurantId để hỗ trợ Multi-tenant ---
        public Guid RestaurantId { get; private set; }
        public Guid CustomerId { get; private set; }
        public Guid TableId { get; private set; }
        public OrderStatus Status { get; private set; }
        public decimal TotalAmount { get; private set; }
        public string? Note { get; private set; } // Note chung cho cả đơn

        private readonly List<OrderItem> _items = new();
        public IReadOnlyCollection<OrderItem> Items => _items.AsReadOnly();

        private Order() { }

        // --- CẬP NHẬT: Thêm tham số restaurantId vào hàm Create ---
        public static Result<Order> Create(Guid restaurantId, Guid customerId, Guid tableId, string? note)
        {
            if (restaurantId == Guid.Empty) return Result.Failure<Order>("RestaurantId is required.");
            if (tableId == Guid.Empty) return Result.Failure<Order>("TableId is required.");

            return Result.Success(new Order
            {
                Id = Guid.NewGuid(),
                RestaurantId = restaurantId, // Set giá trị
                CustomerId = customerId,
                TableId = tableId,
                Status = OrderStatus.Pending,
                Note = note,
                TotalAmount = 0
            });
        }

        // --- CẬP NHẬT: Thêm tham số note vào hàm AddItem ---
        public void AddItem(Guid menuId, string productName, decimal price, int quantity, string? itemNote)
        {
            if (quantity <= 0) return;

            // Logic gộp món: Chỉ gộp nếu cùng MenuId VÀ cùng Note
            // Ví dụ: 1 Phở (không hành) và 1 Phở (nhiều hành) sẽ là 2 dòng khác nhau
            var existingItem = _items.FirstOrDefault(x => x.MenuId == menuId && x.Note == itemNote);

            if (existingItem != null)
            {
                existingItem.AddQuantity(quantity);
            }
            else
            {
                _items.Add(new OrderItem(this.Id, menuId, productName, price, quantity, itemNote));
            }
            CalculateTotal();
        }

        public void CalculateTotal()
        {
            TotalAmount = _items.Sum(x => x.TotalLineAmount);
        }

        // Các hàm thay đổi trạng thái
        public void ConfirmOrder() => Status = OrderStatus.Confirmed;
        public void MarkAsServed() => Status = OrderStatus.Served;
        public void MarkAsPaid() => Status = OrderStatus.Paid;
        public void CancelOrder() => Status = OrderStatus.Cancelled;
    }
}