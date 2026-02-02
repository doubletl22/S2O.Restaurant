using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Identity.App.Features.Register;
using S2O.Identity.App.Features.Users.Commands;
using S2O.Identity.App.Features.Users.Queries;

namespace S2O.Identity.Api.Controllers;

// Resource: Staff
[Route("api/v1/staff")]
[ApiController]
[Authorize(Roles = "RestaurantOwner, SystemAdmin")] // Chỉ Chủ quán hoặc Admin hệ thống mới được quản lý nhân viên
public class StaffController : ControllerBase
{
    private readonly ISender _sender;

    public StaffController(ISender sender)
    {
        _sender = sender;
    }

    // 1. Lấy danh sách nhân viên
    // GET: api/v1/staff?keyword=...
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] string? keyword = null)
    {
        // Query này sẽ tự động lấy TenantId từ Token của người gọi (Owner)
        var result = await _sender.Send(new GetOwnerStaffQuery(keyword));
        return Ok(result.Value);
    }

    // 2. Tạo nhân viên mới
    // POST: api/v1/staff
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] RegisterStaffCommand command)
    {
        var result = await _sender.Send(command);
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    // 3. Cập nhật nhân viên (Chuyển từ UsersController sang đây cho đúng resource)
    // PUT: api/v1/staff/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateStaffCommand command)
    {
        if (id != command.UserId) return BadRequest("ID không khớp");

        var result = await _sender.Send(command);
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }
}