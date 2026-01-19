using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Identity.App.Features.Login;
using S2O.Identity.App.Features.Register; // Nhớ using namespace chứa Command
using S2O.Identity.App.Features.SaaS;

namespace S2O.Identity.Api.Controllers;

[Route("api/auth")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly ISender _sender;

    public AuthController(ISender sender)
    {
        _sender = sender;
    }

    // 1. Đăng nhập (Dùng chung cho tất cả)
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginCommand command)
    {
        var result = await _sender.Send(command);
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }
    // 2. Tạo Staff (Chỉ Owner mới được gọi)
    // URL: POST /api/auth/staff
    [HttpPost("staff")]
    [Authorize(Roles = "RestaurantOwner")] 
    public async Task<IActionResult> RegisterStaff([FromBody] RegisterStaffCommand command)
    {
        var result = await _sender.Send(command);
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    // 3. Tạo Chủ quán mới (Chỉ SystemAdmin mới được gọi)
    // URL: POST /api/auth/create-tenant
    [HttpPost("create-tenant")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> CreateTenant([FromBody] RegisterTenantCommand command)
    {
        Console.WriteLine("=== ADMIN DEBUG CLAIMS ===");
        foreach (var claim in User.Claims)
        {
            Console.WriteLine($"Key: {claim.Type} | Value: {claim.Value}");
        }
        var result = await _sender.Send(command);
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }
}