using S2O.Shared.Kernel.Primitives;
using S2O.Shared.Kernel.Wrapper;

namespace S2O.Services.Identity.Domain.Entities
{
    public class User : AggregateRoot<Guid>
    {
        public string UserName { get; private set; } = default!;
        public string Email { get; private set; } = default!;
        public string PasswordHash { get; private set; } = default!;
        public string Role { get; private set; } = "Customer"; // Thêm Role
        public bool IsActive { get; private set; } = true;

        private readonly List<RefreshToken> _refreshTokens = new();
        public IReadOnlyCollection<RefreshToken> RefreshTokens => _refreshTokens.AsReadOnly();

        private User() { }

        public static Result<User> Create(string userName, string email, string passwordHash, string role = "Customer")
        {
            return Result.Success(new User
            {
                Id = Guid.NewGuid(),
                UserName = userName,
                Email = email,
                PasswordHash = passwordHash,
                Role = role,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });
        }

        public void AddRefreshToken(RefreshToken token) => _refreshTokens.Add(token);
    }
}