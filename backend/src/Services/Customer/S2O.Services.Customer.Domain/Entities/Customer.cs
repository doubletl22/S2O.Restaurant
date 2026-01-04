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
    }
}