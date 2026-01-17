using MediatR;
using Microsoft.AspNetCore.Mvc;
using S2O.Identity.App.Features.Login;
using S2O.Identity.App.Features.Register;

namespace S2O.Identity.Api.Controllers;

// Đảm bảo Route khớp với thiết kế API
[Route("api/auth")]
public class AuthController : BaseApiController
{
    // Constructor chuẩn, đẩy sender xuống class cha
    public AuthController(ISender sender) : base(sender) { }

    /// <summary>
    /// Đăng ký chủ nhà hàng mới (Tạo Tenant + User + Branch mặc định)
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

    /// <summary>
    /// Đăng ký khách hàng thành viên (Gán vào Tenant có sẵn)
    /// </summary>
    [HttpPost("register-customer")]
    public async Task<IActionResult> RegisterCustomer([FromBody] RegisterCustomerCommand command)
    {
        // SỬA 1: Dùng 'Sender' (của class cha) thay vì '_sender' (không tồn tại)
        var result = await Sender.Send(command);

        // SỬA 2: Dùng hàm Helper 'HandleResult' cho gọn và đồng bộ với các hàm trên
        return HandleResult(result);
    }

    [HttpPost("firebase-login")]
    public async Task<IActionResult> FirebaseLogin([FromBody] LoginWithFirebaseCommand command)
    {
        var result = await Sender.Send(command);

        if (result.IsFailure) return BadRequest(result.Error);

        // Trả về Token S2O để Frontend dùng gọi API Order, Booking...
        return Ok(new { Token = result.Value });
    }
}