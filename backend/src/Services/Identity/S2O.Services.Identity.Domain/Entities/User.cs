using S2O.Shared.Kernel.Primitives;
using S2O.Shared.Kernel.Wrapper;

namespace S2O.Services.Identity.Domain.Entities
{
    // 1. Kế thừa AggregateRoot<Guid>
    public class User : AggregateRoot<Guid>
    {
        // 2. Chuyển tất cả set thành private set để bảo vệ dữ liệu
        public string UserName { get; private set; } = string.Empty;
        public string Email { get; private set; } = string.Empty;
        public string PasswordHash { get; private set; } = string.Empty;
        public bool IsActive { get; private set; } = true;

        // RefreshTokens giữ nguyên nhưng nên dùng IReadOnlyCollection để chặn add bừa bãi
        private readonly List<RefreshToken> _refreshTokens = new();
        public IReadOnlyCollection<RefreshToken> RefreshTokens => _refreshTokens.AsReadOnly();

        // Constructor private (EF Core cần cái này)
        private User() { }

        // 3. Factory Method: Tạo User chuẩn chỉ, có kiểm tra hợp lệ ngay từ đầu
        public static Result<User> Create(string userName, string email, string passwordHash)
        {
            if (string.IsNullOrWhiteSpace(email))
                return Result.Failure<User>("Email không được để trống.");

            var user = new User
            {
                Id = Guid.NewGuid(),
                UserName = userName,
                Email = email,
                PasswordHash = passwordHash,
                IsActive = true,
                CreatedAt = DateTime.UtcNow // AggregateRoot đã có trường này, nhưng gán lại cho chắc
            };

            // Có thể thêm Event: AddDomainEvent(new UserRegisteredEvent(user.Id));
            return Result<User>.Success(user);
        }

        public void AddRefreshToken(RefreshToken token)
        {
            _refreshTokens.Add(token);
        }
    }
}