namespace S2O.Identity.App.Features.Login;

using MediatR;
using S2O.Identity.App.Abstractions;
using S2O.Identity.Domain.Entities;
using S2O.Shared.Kernel.Abstractions;
using S2O.Shared.Kernel.Results;

// Đảm bảo interface này trả về Result<string>
public class LoginCommandHandler : ICommandHandler<LoginCommand, string>
{
    private readonly ITokenProvider _tokenProvider;
    // UserManager logic...

    public LoginCommandHandler(ITokenProvider tokenProvider)
    {
        _tokenProvider = tokenProvider;
    }

    // PHẢI CÓ: async Task<Result<string>>
    public async Task<Result<string>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        // Giả lập logic thành công
        await Task.Delay(1); // Để tránh cảnh báo 'async' nhưng không có 'await'

        string mockToken = "fake-jwt-token";

        // PHẢI CÓ: Trả về kiểu Result<string>
        return Result<string>.Success(mockToken);
    }
}