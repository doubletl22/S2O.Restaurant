using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using S2O.Identity.App.Features.Users.Commands;
using S2O.Identity.Domain.Entities;
using S2O.Identity.Infra.Persistence;
using System.Security.Claims; 

namespace S2O.Identity.Api.Controllers;

[Route("api/users")]
[ApiController]
[Authorize] 
public class UsersController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ISender _sender;
    private readonly AuthDbContext _context;

    public UsersController(UserManager<ApplicationUser> userManager, ISender sender, AuthDbContext context)
    {
        _userManager = userManager;
        _sender = sender;
        _context = context;
    }

    public record CreateUserRequest(
        string Email,
        string Password,
        string FullName,
        string Role,
        Guid? TenantId 
    );

    [HttpPost]
    [Authorize(Roles = "SystemAdmin,RestaurantOwner")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        var requesterTenantId = GetRequesterTenantId();

        Guid? targetTenantId;

        if (User.IsInRole("SystemAdmin"))
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
            if (!requesterTenantId.HasValue)
            {
                return BadRequest("Lỗi Token: Tài khoản của bạn bị thiếu TenantId.");
            }

            targetTenantId = requesterTenantId.Value;
        }

        // 3. Khởi tạo User
        var newUser = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FullName = request.FullName,
            TenantId = targetTenantId, 
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

    [HttpPut("{id}/reset-password")]
    [Authorize(Roles = "SystemAdmin,RestaurantOwner")]
    public async Task<IActionResult> ResetPassword(Guid id, [FromBody] string newPassword)
    {
        var scopeError = await ValidateManagedUserScopeAsync(id, newPassword);
        if (scopeError != null) return scopeError;

        var command = new AdminResetPasswordCommand(id, newPassword);
        var result = await _sender.Send(command);

        if (result.IsFailure) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    // DELETE: api/users/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "SystemAdmin,RestaurantOwner")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var scopeError = await ValidateManagedUserScopeAsync(id);
        if (scopeError != null) return scopeError;

        var command = new DeleteUserCommand(id);
        var result = await _sender.Send(command);

        if (result.IsFailure) return BadRequest(result.Error);
        return NoContent();
    }

    [HttpPut("{id}/role")]
    [Authorize(Roles = "SystemAdmin,RestaurantOwner")] 
    public async Task<IActionResult> UpdateUserRole(Guid id, [FromBody] UpdateUserRoleCommand command)
    {
        if (id != command.UserId) return BadRequest("ID không khớp");

        var scopeError = await ValidateManagedUserScopeAsync(id, command.NewRole);
        if (scopeError != null) return scopeError;

        var result = await _sender.Send(command);

        if (result.IsFailure) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    [HttpPost("{id}/lock")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> LockUser(Guid id)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user == null) return NotFound("Không tìm thấy user");

        // Khóa đến năm 9999
        await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.MaxValue);
        return Ok(new { Message = "Đã khóa tài khoản" });
    }

    [HttpPost("{id}/unlock")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> UnlockUser(Guid id)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user == null) return NotFound("Không tìm thấy user");

        await _userManager.SetLockoutEndDateAsync(user, null);
        return Ok(new { Message = "Đã mở khóa tài khoản" });
    }

    [HttpGet]
    [Authorize(Roles = "SystemAdmin")] // Chỉ SysAdmin mới xem được tất cả
    public async Task<IActionResult> GetUsers(
    [FromQuery] int page = 1,
    [FromQuery] int size = 20,
    [FromQuery] string? keyword = null)
    {
        var query = _context.Users.AsQueryable();

        if (!string.IsNullOrEmpty(keyword))
        {
            keyword = keyword.ToLower();
            query = query.Where(u =>
                (u.FullName != null && u.FullName.ToLower().Contains(keyword)) ||
                (u.Email != null && u.Email.ToLower().Contains(keyword)));
        }

        var totalCount = await query.CountAsync();
        var users = await query
            .OrderByDescending(u => u.CreatedOn)
            .Skip((page - 1) * size)
            .Take(size)
            .Select(u => new
            {
                u.Id,
                u.FullName,
                u.Email,
                u.PhoneNumber,
                u.IsActive,
                TenantId = u.TenantId,
                // Check xem user có đang bị lock không
                IsLocked = u.LockoutEnd != null && u.LockoutEnd > DateTimeOffset.UtcNow
            })
            .ToListAsync();

        // Lấy Roles cho từng user (Cần thiết để hiển thị SysAdmin/Owner/Staff)
        var userDtos = new List<object>();
        foreach (var u in users)
        {
            var appUser = await _userManager.FindByIdAsync(u.Id.ToString());
            if (appUser == null) continue;
            var roles = await _userManager.GetRolesAsync(appUser);

            userDtos.Add(new
            {
                u.Id,
                u.FullName,
                u.Email,
                u.PhoneNumber,
                u.IsActive,
                u.TenantId,
                u.IsLocked,
                Roles = roles // Trả về mảng roles
            });
        }

        return Ok(new
        {
            Items = userDtos,
            TotalCount = totalCount,
            Page = page,
            Size = size,
            TotalPages = (int)Math.Ceiling(totalCount / (double)size)
        });
    }

    private Guid? GetRequesterTenantId()
    {
        var tenantClaim = User.FindFirst("tenant_id")?.Value
            ?? User.FindFirst("tenantId")?.Value
            ?? User.FindFirst("TenantId")?.Value;

        return Guid.TryParse(tenantClaim, out var tenantId) ? tenantId : null;
    }

    private async Task<IActionResult?> ValidateManagedUserScopeAsync(Guid targetUserId, string? nextRole = null)
    {
        if (string.IsNullOrWhiteSpace(nextRole) == false)
        {
            nextRole = nextRole.Trim();
        }

        var targetUser = await _userManager.FindByIdAsync(targetUserId.ToString());
        if (targetUser == null)
        {
            return NotFound("Không tìm thấy user");
        }

        if (User.IsInRole("SystemAdmin"))
        {
            return null;
        }

        if (!User.IsInRole("RestaurantOwner"))
        {
            return Forbid();
        }

        var requesterTenantId = GetRequesterTenantId();
        if (!requesterTenantId.HasValue)
        {
            return BadRequest("Lỗi Token: Tài khoản của bạn bị thiếu TenantId.");
        }

        if (targetUser.TenantId != requesterTenantId.Value)
        {
            return Forbid();
        }

        var targetRoles = await _userManager.GetRolesAsync(targetUser);
        if (targetRoles.Contains("SystemAdmin") || targetRoles.Contains("RestaurantOwner"))
        {
            return StatusCode(StatusCodes.Status403Forbidden, "Bạn không đủ quyền thao tác với tài khoản này.");
        }

        if (string.Equals(nextRole, "SystemAdmin", StringComparison.OrdinalIgnoreCase)
            || string.Equals(nextRole, "RestaurantOwner", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status403Forbidden, "Bạn không đủ quyền gán vai trò này.");
        }

        return null;
    }

}