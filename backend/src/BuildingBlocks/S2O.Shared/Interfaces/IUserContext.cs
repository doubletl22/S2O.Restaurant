namespace S2O.Shared.Interfaces;

public interface IUserContext
{
    // Lấy UserId của người đang đăng nhập (từ JWT)
    Guid? UserId { get; }

    // Có thể thêm Email hoặc các Claim khác nếu cần
    string? Email { get; }
}