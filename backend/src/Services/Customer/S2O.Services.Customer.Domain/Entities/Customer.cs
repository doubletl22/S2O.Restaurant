using S2O.Shared.Kernel.Primitives;
using S2O.Shared.Kernel.Wrapper;

namespace S2O.Services.Customer.Domain.Entities
{
    public class Customer : AggregateRoot<Guid>
    {
        public Guid IdentityId { get; private set; } // Link với tài khoản login
        public string FirstName { get; private set; } = default!;
        public string LastName { get; private set; } = default!;
        public string Email { get; private set; } = default!;
        public string PhoneNumber { get; private set; } = default!;
        public string Address { get; private set; } = default!;

        // Hạng thành viên & Điểm tích lũy (Yêu cầu đồ án)
        public int LoyaltyPoints { get; private set; } = 0;
        public string MembershipTier { get; private set; } = "Standard";

        // Constructor private cho EF Core
        private Customer() { }

        // Factory Method: Tạo mới khách hàng
        public static Result<Customer> Create(Guid identityId, string firstName, string lastName, string email, string phoneNumber)
        {
            // Validate dữ liệu ngay tại nguồn
            if (string.IsNullOrWhiteSpace(firstName)) return Result.Failure<Customer>("First name is required.");
            if (string.IsNullOrWhiteSpace(email)) return Result.Failure<Customer>("Email is required.");

            var customer = new Customer
            {
                Id = Guid.NewGuid(),
                IdentityId = identityId,
                FirstName = firstName,
                LastName = lastName,
                Email = email,
                PhoneNumber = phoneNumber,
                LoyaltyPoints = 0,
                MembershipTier = "Standard"
            };

            // Có thể thêm Event: AddDomainEvent(new CustomerCreatedEvent(customer.Id));
            return Result.Success(customer);
        }

        // Method nghiệp vụ: Cập nhật thông tin
        public void UpdateProfile(string address, string phoneNumber)
        {
            if (!string.IsNullOrEmpty(address)) Address = address;
            if (!string.IsNullOrEmpty(phoneNumber)) PhoneNumber = phoneNumber;
        }

        // Method nghiệp vụ: Tích điểm
        public void AddLoyaltyPoints(int points)
        {
            if (points <= 0) return;
            LoyaltyPoints += points;
            UpdateTier();
        }

        private void UpdateTier()
        {
            if (LoyaltyPoints > 1000) MembershipTier = "Gold";
            else if (LoyaltyPoints > 500) MembershipTier = "Silver";
        }
    }
}