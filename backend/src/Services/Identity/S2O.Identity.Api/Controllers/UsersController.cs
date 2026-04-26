using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using S2O.Identity.App.Features.Users.Commands;
using S2O.Identity.Domain.Entities;
using S2O.Identity.Infra.Persistence;
using S2O.Shared.Kernel.Results;
using System.IdentityModel.Tokens.Jwt;
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
    private const int MinPasswordLength = 6;
    private const int MaxPasswordLength = 50;

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

    public record ChangePasswordRequest(
        string CurrentPassword,
        string NewPassword,
        string ConfirmPassword
    );

    public record UpdateProfileRequest(
        string FullName,
        string? PhoneNumber
    );

    [HttpPost]
    [Authorize(Roles = "SystemAdmin,RestaurantOwner")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        var requesterTenantId = GetRequesterTenantId();
        var normalizedRole = NormalizeRole(request.Role);

        if (normalizedRole is null)
        {
            return BadRequest(new Error("Users.InvalidRequest", "Role không hợp lệ."));
        }

        Guid? targetTenantId;

        if (User.IsInRole("SystemAdmin"))
        {
            // --- TRƯỜNG HỢP SYSTEM ADMIN ---
            // SystemAdmin đang tạo tài khoản cho Chủ nhà hàng (RestaurantOwner)
            if (string.Equals(normalizedRole, "RestaurantOwner", StringComparison.OrdinalIgnoreCase))
            {
                if (request.TenantId == null)
                {
                    return BadRequest(new Error("Users.InvalidRequest", "Khi tạo chủ nhà hàng, bắt buộc phải nhập TenantId của nhà hàng đó."));
                }
                targetTenantId = request.TenantId;
            }
            // SystemAdmin tạo Admin khác
            else if (string.Equals(normalizedRole, "SystemAdmin", StringComparison.OrdinalIgnoreCase))
            {
                targetTenantId = null;
            }
            else
            {
                return BadRequest(new Error("Users.InvalidRequest", "SystemAdmin chỉ nên tạo RestaurantOwner hoặc SystemAdmin khác."));
            }
        }
        else // --- TRƯỜNG HỢP RESTAURANT OWNER ---
        {
            // Owner không được tạo SystemAdmin (Chống đảo chính :D)
            if (string.Equals(normalizedRole, "SystemAdmin", StringComparison.OrdinalIgnoreCase)
                || string.Equals(normalizedRole, "RestaurantOwner", StringComparison.OrdinalIgnoreCase))
            {
                return StatusCode(StatusCodes.Status403Forbidden, new Error("Users.Forbidden", "Bạn không đủ quyền để tạo Role này."));
            }

            // Owner bắt buộc phải tạo Staff/User thuộc cùng Tenant với mình
            if (!requesterTenantId.HasValue)
            {
                return BadRequest(new Error("Auth.InvalidTenantClaim", "Lỗi Token: Tài khoản của bạn bị thiếu TenantId."));
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
            return BadRequest(new Error("Users.CreateFailed", BuildIdentityErrorMessage(result.Errors)));
        }

        // 5. Gán Role
        var roleAssignResult = await _userManager.AddToRoleAsync(newUser, normalizedRole);
        if (!roleAssignResult.Succeeded)
        {
            // Best effort rollback để tránh tạo user không có role hợp lệ.
            await _userManager.DeleteAsync(newUser);
            return BadRequest(new Error("Users.CreateFailed", BuildIdentityErrorMessage(roleAssignResult.Errors)));
        }

        return Ok(new
        {
            Message = "Tạo tài khoản thành công!",
            UserId = newUser.Id,
            TenantId = newUser.TenantId,
            Role = normalizedRole
        });
    }

    [HttpPut("{id}/reset-password")]
    [Authorize(Roles = "SystemAdmin,RestaurantOwner")]
    public async Task<IActionResult> ResetPassword(Guid id, [FromBody] string newPassword)
    {
        var scopeError = await ValidateManagedUserScopeAsync(id);
        if (scopeError != null) return scopeError;

        var command = new AdminResetPasswordCommand(id, newPassword);
        var result = await _sender.Send(command);

        if (result.IsFailure) return BadRequest(result.Error);
        return Ok(result.Value);
    }

    [HttpPost("me/change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        if (request == null)
        {
            return BadRequest(new Error("User.InvalidRequest", "Payload không hợp lệ."));
        }

        var currentPassword = request.CurrentPassword?.Trim();
        var newPassword = request.NewPassword?.Trim();
        var confirmPassword = request.ConfirmPassword?.Trim();

        if (string.IsNullOrWhiteSpace(currentPassword) || string.IsNullOrWhiteSpace(newPassword))
        {
            return BadRequest(new Error("User.InvalidRequest", "Mật khẩu hiện tại và mật khẩu mới là bắt buộc."));
        }

        if (!string.Equals(newPassword, confirmPassword, StringComparison.Ordinal))
        {
            return BadRequest(new Error("User.PasswordMismatch", "Xác nhận mật khẩu không khớp."));
        }

        if (newPassword.Length < MinPasswordLength || newPassword.Length > MaxPasswordLength)
        {
            return BadRequest(new Error("User.PasswordInvalid", $"Mật khẩu phải có độ dài từ {MinPasswordLength} đến {MaxPasswordLength} ký tự."));
        }

        var requesterUserId = GetRequesterUserId();
        if (!requesterUserId.HasValue)
        {
            return Unauthorized(new Error("Auth.Unauthorized", "Không xác định được người dùng."));
        }

        var user = await _userManager.FindByIdAsync(requesterUserId.Value.ToString());
        if (user == null)
        {
            return Unauthorized(new Error("Auth.Unauthorized", "Không tìm thấy người dùng."));
        }

        var changeResult = await _userManager.ChangePasswordAsync(user, currentPassword, newPassword);
        if (!changeResult.Succeeded)
        {
            var hasMismatch = changeResult.Errors.Any(error => string.Equals(error.Code, "PasswordMismatch", StringComparison.OrdinalIgnoreCase));
            if (hasMismatch)
            {
                return BadRequest(new Error("Auth.InvalidPassword", "Mật khẩu hiện tại không đúng."));
            }

            return BadRequest(new Error("User.PasswordChangeFailed", BuildIdentityErrorMessage(changeResult.Errors)));
        }

        return Ok(new { Message = "Đổi mật khẩu thành công." });
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetProfile()
    {
        var requesterUserId = GetRequesterUserId();
        if (!requesterUserId.HasValue)
        {
            return Unauthorized(new Error("Auth.Unauthorized", "Không xác định được người dùng."));
        }

        var user = await _userManager.FindByIdAsync(requesterUserId.Value.ToString());
        if (user == null)
        {
            return Unauthorized(new Error("Auth.Unauthorized", "Không tìm thấy người dùng."));
        }

        var roles = await _userManager.GetRolesAsync(user);

        return Ok(new
        {
            user.Id,
            user.FullName,
            user.Email,
            user.PhoneNumber,
            Roles = roles
        });
    }

    [HttpPut("me")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        if (request == null)
        {
            return BadRequest(new Error("User.InvalidRequest", "Payload không hợp lệ."));
        }

        var fullName = request.FullName?.Trim();
        if (string.IsNullOrWhiteSpace(fullName))
        {
            return BadRequest(new Error("User.InvalidFullName", "Họ tên không hợp lệ."));
        }

        var requesterUserId = GetRequesterUserId();
        if (!requesterUserId.HasValue)
        {
            return Unauthorized(new Error("Auth.Unauthorized", "Không xác định được người dùng."));
        }

        var user = await _userManager.FindByIdAsync(requesterUserId.Value.ToString());
        if (user == null)
        {
            return Unauthorized(new Error("Auth.Unauthorized", "Không tìm thấy người dùng."));
        }

        user.FullName = fullName;
        var phoneNumber = request.PhoneNumber?.Trim();
        user.PhoneNumber = string.IsNullOrWhiteSpace(phoneNumber) ? null : phoneNumber;

        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            return BadRequest(new Error("User.ProfileUpdateFailed", BuildIdentityErrorMessage(updateResult.Errors)));
        }

        return Ok(new { Message = "Cập nhật hồ sơ thành công." });
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
        if (id != command.UserId) return BadRequest(new Error("Users.InvalidRequest", "ID không khớp"));

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
        if (user == null) return NotFound(new Error("Users.NotFound", "Không tìm thấy user"));

        // Khóa đến năm 9999
        var lockResult = await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.MaxValue);
        if (!lockResult.Succeeded)
        {
            var errors = string.Join(", ", lockResult.Errors.Select(e => e.Description));
            return BadRequest(new Error("Users.UpdateFailed", string.IsNullOrWhiteSpace(errors) ? "Không thể khóa tài khoản." : errors));
        }

        return Ok(new { Message = "Đã khóa tài khoản" });
    }

    [HttpPost("{id}/unlock")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> UnlockUser(Guid id)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user == null) return NotFound(new Error("Users.NotFound", "Không tìm thấy user"));

        var unlockResult = await _userManager.SetLockoutEndDateAsync(user, null);
        if (!unlockResult.Succeeded)
        {
            var errors = string.Join(", ", unlockResult.Errors.Select(e => e.Description));
            return BadRequest(new Error("Users.UpdateFailed", string.IsNullOrWhiteSpace(errors) ? "Không thể mở khóa tài khoản." : errors));
        }

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

    private Guid? GetRequesterUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? User.FindFirstValue("sub");

        return Guid.TryParse(userIdClaim, out var userId) ? userId : null;
    }

    private static string? NormalizeRole(string? role)
    {
        if (string.IsNullOrWhiteSpace(role))
        {
            return null;
        }

        var trimmed = role.Trim();
        return trimmed.Length == 0 ? null : trimmed;
    }

    private static string BuildIdentityErrorMessage(IEnumerable<IdentityError> errors)
    {
        var messages = errors
            .Select(error => error.Description)
            .Where(description => !string.IsNullOrWhiteSpace(description))
            .ToList();

        return messages.Count == 0 ? "Thao tác không thành công." : string.Join("; ", messages);
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
            return NotFound(new Error("Users.NotFound", "Không tìm thấy user"));
        }

        if (User.IsInRole("SystemAdmin"))
        {
            return null;
        }

        if (!User.IsInRole("RestaurantOwner"))
        {
            return StatusCode(StatusCodes.Status403Forbidden, new Error("Users.Forbidden", "Bạn không có quyền thao tác với tài khoản này."));
        }

        var requesterTenantId = GetRequesterTenantId();
        if (!requesterTenantId.HasValue)
        {
            return BadRequest(new Error("Auth.InvalidTenantClaim", "Lỗi Token: Tài khoản của bạn bị thiếu TenantId."));
        }

        if (targetUser.TenantId != requesterTenantId.Value)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new Error("Users.Forbidden", "Bạn không có quyền thao tác với tài khoản này."));
        }

        var targetRoles = await _userManager.GetRolesAsync(targetUser);
        if (targetRoles.Contains("SystemAdmin") || targetRoles.Contains("RestaurantOwner"))
        {
            return StatusCode(StatusCodes.Status403Forbidden, new Error("Users.Forbidden", "Bạn không đủ quyền thao tác với tài khoản này."));
        }

        if (string.Equals(nextRole, "SystemAdmin", StringComparison.OrdinalIgnoreCase)
            || string.Equals(nextRole, "RestaurantOwner", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status403Forbidden, new Error("Users.Forbidden", "Bạn không đủ quyền gán vai trò này."));
        }

        return null;
    }

}
