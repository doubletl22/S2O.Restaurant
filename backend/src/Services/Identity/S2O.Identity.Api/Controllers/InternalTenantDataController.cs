using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using S2O.Identity.Domain.Entities;
using S2O.Identity.Infra.Persistence;

namespace S2O.Identity.Api.Controllers;

[Route("api/internal/tenant-data")]
[ApiController]
[Authorize(Roles = "SystemAdmin")]
public class InternalTenantDataController : ControllerBase
{
    private readonly AuthDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public InternalTenantDataController(AuthDbContext context, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    [HttpDelete("{tenantId:guid}")]
    public async Task<IActionResult> DeleteByTenant(Guid tenantId, CancellationToken ct)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync(ct);

        try
        {
            var users = await _context.Users
                .Where(u => u.TenantId == tenantId)
                .ToListAsync(ct);

            if (users.Count == 0)
            {
                await transaction.CommitAsync(ct);
                return Ok(new { deletedUsers = 0, deletedUserBranches = 0 });
            }

            var userIds = users.Select(u => u.Id).ToList();

            var userBranches = await _context.UserBranches
                .Where(ub => userIds.Contains(ub.UserId))
                .ToListAsync(ct);

            if (userBranches.Count > 0)
            {
                _context.UserBranches.RemoveRange(userBranches);
                await _context.SaveChangesAsync(ct);
            }

            var failures = new List<object>();
            var deletedUsers = 0;

            foreach (var user in users)
            {
                var result = await _userManager.DeleteAsync(user);
                if (!result.Succeeded)
                {
                    failures.Add(new
                    {
                        userId = user.Id,
                        errors = result.Errors.Select(e => e.Description).ToList()
                    });
                    continue;
                }

                deletedUsers++;
            }

            if (failures.Count > 0)
            {
                await transaction.RollbackAsync(ct);
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    message = "Xóa dữ liệu người dùng theo tenant chưa hoàn tất.",
                    deletedUsers = 0,
                    failedUsers = failures
                });
            }

            await transaction.CommitAsync(ct);

            return Ok(new
            {
                deletedUsers,
                deletedUserBranches = userBranches.Count
            });
        }
        catch
        {
            await transaction.RollbackAsync(ct);
            throw;
        }
    }
}
