using S2O.Shared.Kernel.Primitives;

namespace S2O.Services.Restaurant.Domain.Entities
{
    public class Restaurant : AggregateRoot<Guid>
    {
        public string Name { get; private set; } = default!;
        public string Address { get; private set; } = default!;
        public string PhoneNumber { get; private set; } = default!;
        public bool IsActive { get; private set; } = true;

        // Chủ sở hữu (Liên kết với Identity Service)
        public Guid OwnerIdentityId { get; private set; }

        private Restaurant() { }

        public static Restaurant Create(Guid ownerId, string name, string address, string phone)
        {
            return new Restaurant
            {
                Id = Guid.NewGuid(),
                OwnerIdentityId = ownerId,
                Name = name,
                Address = address,
                PhoneNumber = phone,
                IsActive = true
            };
        }
    }
}