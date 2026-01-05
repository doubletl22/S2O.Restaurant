using S2O.Shared.Kernel.Primitives;

namespace S2O.Services.Restaurant.Domain.Entities
{
    public class Restaurant : AggregateRoot<Guid>
    {
        public string Name { get; private set; }
        public string Address { get; private set; }
        public string PhoneNumber { get; private set; }
        public string? Description { get; private set; }
        public bool IsActive { get; private set; }
        public Guid OwnerId { get; private set; } // Liên kết với Identity Service

        private Restaurant() { } // Constructor cho EF Core

        public static Restaurant Create(Guid ownerId, string name, string address, string phone, string? desc)
        {
            // Validate logic nghiệp vụ tại đây nếu cần
            return new Restaurant
            {
                Id = Guid.NewGuid(),
                OwnerId = ownerId,
                Name = name,
                Address = address,
                PhoneNumber = phone,
                Description = desc,
                IsActive = true, // Mặc định mở
                CreatedBy = ownerId.ToString(),
                CreatedAt = DateTime.UtcNow
            };
        }

        public void UpdateInfo(string name, string address, string phone, string? desc)
        {
            Name = name;
            Address = address;
            PhoneNumber = phone;
            Description = desc;
            LastModified = DateTime.UtcNow;
        }
    }
}