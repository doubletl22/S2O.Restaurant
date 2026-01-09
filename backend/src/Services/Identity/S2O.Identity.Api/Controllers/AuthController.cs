using MediatR;
using Microsoft.AspNetCore.Mvc;
using S2O.Identity.App.Features.Login;
using S2O.Identity.App.Features.Register;

namespace S2O.Identity.Api.Controllers;

public class AuthController : BaseApiController
{
    public AuthController(ISender sender) : base(sender) { }

    /// <summary>
    /// Đăng ký chủ nhà hàng mới (Khởi tạo TenantId mới)
    /// </summary>
    [HttpPost("register-owner")]
    public async Task<IActionResult> RegisterOwner([FromBody] RegisterOwnerCommand command)
    {
        var result = await Sender.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Đăng nhập và lấy JWT Token
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginCommand command)
    {
        var result = await Sender.Send(command);
        return HandleResult(result);
    }
}