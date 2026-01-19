using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using S2O.Identity.Domain.Entities;
using System.Security.Claims;

namespace S2O.Identity.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize] 
public class UsersController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;

    public UsersController(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    // DTO: Khuôn mẫu dữ liệu gửi lên
    public record CreateUserRequest(
        string Email,
        string Password,
        string FullName,
        string Role,
        Guid? TenantId // Chỉ SystemAdmin mới cần điền cái này
    );

    [HttpPost]
    [Authorize(Roles = "SystemAdmin,RestaurantOwner")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        var requesterRole = User.FindFirst(ClaimTypes.Role)?.Value;
        var requesterTenantIdString = User.FindFirst("tenant_id")?.Value;

        Guid? targetTenantId;

        if (requesterRole == "SystemAdmin")
        {
            // --- TRƯỜNG HỢP SYSTEM ADMIN ---
            // SystemAdmin đang tạo tài khoản cho Chủ nhà hàng (RestaurantOwner)
            if (request.Role == "RestaurantOwner")
            {
                if (request.TenantId == null)
                {
                    return BadRequest("Khi tạo chủ nhà hàng, bắt buộc phải nhập TenantId của nhà hàng đó.");
                }
                targetTenantId = request.TenantId;
            }
            // SystemAdmin tạo Admin khác
            else if (request.Role == "SystemAdmin")
            {
                targetTenantId = null;
            }
            else
            {
                return BadRequest("SystemAdmin chỉ nên tạo RestaurantOwner hoặc SystemAdmin khác.");
            }
        }
        else // --- TRƯỜNG HỢP RESTAURANT OWNER ---
        {
            // Owner không được tạo SystemAdmin (Chống đảo chính :D)
            if (request.Role == "SystemAdmin" || request.Role == "RestaurantOwner")
            {
                return StatusCode(403, "Bạn không đủ quyền để tạo Role này.");
            }

            // Owner bắt buộc phải tạo Staff/User thuộc cùng Tenant với mình
            if (string.IsNullOrEmpty(requesterTenantIdString))
            {
                return BadRequest("Lỗi Token: Tài khoản của bạn bị thiếu TenantId.");
            }

            targetTenantId = Guid.Parse(requesterTenantIdString);
        }

        // 3. Khởi tạo User
        var newUser = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FullName = request.FullName,
            TenantId = targetTenantId, // Gán TenantId đã tính toán ở trên
            EmailConfirmed = true,
            IsActive = true
        };

        // 4. Lưu vào Database
        var result = await _userManager.CreateAsync(newUser, request.Password);
        if (!result.Succeeded)
        {
            return BadRequest(result.Errors);
        }

        // 5. Gán Role
        await _userManager.AddToRoleAsync(newUser, request.Role);

        return Ok(new
        {
            Message = "Tạo tài khoản thành công!",
            UserId = newUser.Id,
            TenantId = newUser.TenantId,
            Role = request.Role
        });
    }
}