using S2O.Services.Customer.Domain.Enums;
using S2O.Shared.Kernel.Primitives;
using S2O.Shared.Kernel.Wrapper;

namespace S2O.Services.Customer.Domain.Entities
{
    public class Customer : AggregateRoot<Guid>
    {
        public Guid IdentityId { get; private set; }
        public string FirstName { get; private set; } = default!;
        public string LastName { get; private set; } = default!;
        public string Email { get; private set; } = default!;
        public string PhoneNumber { get; private set; } = default!;

        // --- Nghiệp vụ: Feedback & Voucher ---
        private readonly List<CustomerFeedback> _feedbacks = new();
        public IReadOnlyCollection<CustomerFeedback> Feedbacks => _feedbacks.AsReadOnly();

        private readonly List<CustomerVoucher> _vouchers = new();
        public IReadOnlyCollection<CustomerVoucher> Vouchers => _vouchers.AsReadOnly();

        // --- Nghiệp vụ: Tích điểm & Hạng ---
        public int LoyaltyPoints { get; private set; } = 0;
        public MembershipTier Tier { get; private set; } = MembershipTier.Standard;

        // --- Nghiệp vụ: Yêu thích ---
        private readonly List<CustomerFavorite> _favorites = new();
        public IReadOnlyCollection<CustomerFavorite> Favorites => _favorites.AsReadOnly();

        private Customer() { }

        public static Result<Customer> Create(Guid identityId, string firstName, string lastName, string email, string phoneNumber)
        {
            if (string.IsNullOrWhiteSpace(email)) return Result.Failure<Customer>("Email is required.");

            return Result.Success(new Customer
            {
                Id = Guid.NewGuid(),
                IdentityId = identityId,
                FirstName = firstName,
                LastName = lastName,
                Email = email,
                PhoneNumber = phoneNumber,
                LoyaltyPoints = 0,
                Tier = MembershipTier.Standard
            });
        }

        public void AddLoyaltyPoints(int points)
        {
            if (points <= 0) return;
            LoyaltyPoints += points;
            UpdateTier();
        }

        private void UpdateTier()
        {
            var oldTier = Tier;
            Tier = LoyaltyPoints switch
            {
                >= 5000 => MembershipTier.Diamond,
                >= 2000 => MembershipTier.Gold,
                >= 500 => MembershipTier.Silver,
                _ => MembershipTier.Standard
            };

            // Có thể bắn Event Domain nếu muốn: if (Tier > oldTier) AddDomainEvent(...)
        }

        public void AddFavorite(Guid restaurantId)
        {
            if (_favorites.Any(x => x.RestaurantId == restaurantId)) return;
            _favorites.Add(new CustomerFavorite { CustomerId = Id, RestaurantId = restaurantId });
        }

        public void RemoveFavorite(Guid restaurantId)
        {
            var item = _favorites.FirstOrDefault(x => x.RestaurantId == restaurantId);
            if (item != null) _favorites.Remove(item);
        }

        public Result RedeemVoucher(string code, string description, int pointsCost, decimal discountAmount)
        {
            if (LoyaltyPoints < pointsCost)
                return Result.Failure("Không đủ điểm tích lũy để đổi voucher này.");

            // Trừ điểm
            LoyaltyPoints -= pointsCost;
            // (Lưu ý: Hạng thành viên thường tính trên tổng điểm tích lũy cả đời, 
            // nhưng ở đây ta làm đơn giản là trừ điểm khả dụng).

            // Thêm voucher vào ví
            _vouchers.Add(new CustomerVoucher
            {
                Id = Guid.NewGuid(),
                CustomerId = this.Id,
                Code = code,
                Description = description,
                DiscountAmount = discountAmount,
                IsUsed = false,
                ExpiryDate = DateTime.UtcNow.AddDays(30) // Hạn 30 ngày
            });

            return Result.Success();
        }

        // 2. Logic đánh giá
        public void AddFeedback(Guid restaurantId, int rating, string comment)
        {
            _feedbacks.Add(new CustomerFeedback
            {
                Id = Guid.NewGuid(),
                CustomerId = this.Id,
                RestaurantId = restaurantId,
                Rating = rating,
                Comment = comment,
                CreatedAt = DateTime.UtcNow
            });
        }
    }
}