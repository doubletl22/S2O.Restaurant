using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net.Http.Headers;
using S2O.Tenant.Api.Contracts;
using S2O.Tenant.App.Features.Tenants.Commands;
using S2O.Tenant.App.Features.Tenants.Queries;
using S2O.Shared.Kernel.Results;

namespace S2O.Tenant.Api.Controllers;

[Route("api/v1/tenants")]
[ApiController]
public class TenantsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;

    public TenantsController(IMediator mediator, IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _mediator = mediator;
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
    }

    // GET: api/v1/tenants
    [HttpGet]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> GetAll([FromQuery] string? keyword)
    {
        var result = await _mediator.Send(new GetAllTenantsQuery(keyword));
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    // PATCH: api/v1/tenants/{id}/toggle-lock
    [HttpPatch("{id}/toggle-lock")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> ToggleLockPatch(Guid id, [FromQuery] bool? isLocked, [FromQuery] string? reason, [FromQuery] int? lockDurationDays)
    {
        // If isLocked is provided, set to that value; if not provided, toggle
        var result = await _mediator.Send(new ToggleTenantLockCommand(
            id,
            isLocked ?? false,
            isLocked == null,
            reason,
            lockDurationDays));
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    // POST: api/v1/tenants/{id}/lock
    [HttpPost("{id}/lock")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> ToggleLock(Guid id, [FromBody] LockTenantRequest request)
    {
        var result = await _mediator.Send(new ToggleTenantLockCommand(
            id,
            true,
            null,
            request.Reason,
            request.LockDurationDays,
            request.IsPermanent));
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    // POST: api/v1/tenants/{id}/unlock
    [HttpPost("{id}/unlock")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> Unlock(Guid id)
    {
        var result = await _mediator.Send(new ToggleTenantLockCommand(id, false));
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    // Internal endpoint - for other services to check tenant lock status during login
    [HttpGet("{id}/check-lock-status")]
    [AllowAnonymous]
    public async Task<IActionResult> CheckTenantLockStatus(Guid id)
    {
        var result = await _mediator.Send(new GetTenantStatusQuery(id));
        if (!result.IsSuccess)
        {
            return NotFound(result.Error);
        }

        return Ok(result);
    }

    // DEBUG endpoint - verify soft-delete (ignore query filters)
    [HttpGet("{id}/verify-delete")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> VerifyTenantDelete(Guid id)
    {
        var context = HttpContext.RequestServices.GetRequiredService<S2O.Tenant.Infra.Persistence.TenantDbContext>();
        var tenant = context.Tenants.IgnoreQueryFilters().FirstOrDefault(t => t.Id == id);
        
        if (tenant == null)
            return NotFound(new { Error = "Tenant not found in database" });
        
        return Ok(new
        {
            Value = new
            {
                Id = tenant.Id,
                Name = tenant.Name,
                IsDeleted = tenant.IsDeleted,
                DeletedAtUtc = tenant.DeletedAtUtc,
                IsLocked = tenant.IsLocked,
                LockReason = tenant.LockReason,
                LockedAtUtc = tenant.LockedAtUtc,
                LockedUntilUtc = tenant.LockedUntilUtc,
                CreatedAt = tenant.CreatedAt
            }
        });
    }

    // DEBUG endpoint - verify cascade deleted branches
    [HttpGet("{tenantId}/verify-branches-deleted")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> VerifyBranchesDeleted(Guid tenantId)
    {
        var context = HttpContext.RequestServices.GetRequiredService<S2O.Tenant.Infra.Persistence.TenantDbContext>();
        var branches = context.Branches
            .IgnoreQueryFilters()
            .Where(b => b.TenantId == tenantId)
            .Select(b => new
            {
                Id = b.Id,
                Name = b.Name,
                TenantId = b.TenantId,
                IsDeleted = b.IsDeleted,
                DeletedAtUtc = b.DeletedAtUtc
            })
            .ToList();
        
        return Ok(new { Value = branches });
    }

    // DEBUG endpoint - verify cascade deleted tables
    [HttpGet("{tenantId}/verify-tables-deleted")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> VerifyTablesDeleted(Guid tenantId)
    {
        var context = HttpContext.RequestServices.GetRequiredService<S2O.Tenant.Infra.Persistence.TenantDbContext>();
        var tables = context.Tables
            .IgnoreQueryFilters()
            .Where(t => t.TenantId == tenantId)
            .Select(t => new
            {
                Id = t.Id,
                Name = t.Name,
                TenantId = t.TenantId,
                IsDeleted = t.IsDeleted,
                DeletedAtUtc = t.DeletedAtUtc
            })
            .ToList();
        
        return Ok(new { Value = tables });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var cleanupResult = await CleanupExternalTenantDataAsync(id, HttpContext.RequestAborted);
        if (!cleanupResult.IsSuccess)
        {
            return StatusCode(StatusCodes.Status502BadGateway, new
            {
                Message = "Xóa dữ liệu liên service thất bại.",
                cleanupResult.Service,
                cleanupResult.Details
            });
        }

        var result = await _mediator.Send(new S2O.Tenant.App.Features.Tenants.Commands.DeleteTenantCommand(id));
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    private async Task<CleanupResult> CleanupExternalTenantDataAsync(Guid tenantId, CancellationToken ct)
    {
        var serviceUrls = new Dictionary<string, string?>
        {
            ["Identity"] = _configuration["ExternalServices:IdentityApiBaseUrl"],
            ["Catalog"] = _configuration["ExternalServices:CatalogApiBaseUrl"],
            ["Order"] = _configuration["ExternalServices:OrderApiBaseUrl"],
            ["Booking"] = _configuration["ExternalServices:BookingApiBaseUrl"],
            ["Payment"] = _configuration["ExternalServices:PaymentApiBaseUrl"]
        };

        foreach (var service in serviceUrls)
        {
            if (string.IsNullOrWhiteSpace(service.Value))
            {
                return CleanupResult.Failure(service.Key, "Thiếu cấu hình base URL.");
            }
        }

        var authHeader = Request.Headers.Authorization.ToString();
        if (string.IsNullOrWhiteSpace(authHeader))
        {
            return CleanupResult.Failure("Authorization", "Thiếu access token trong request.");
        }

        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = AuthenticationHeaderValue.Parse(authHeader);

        foreach (var service in serviceUrls)
        {
            var url = $"{service.Value!.TrimEnd('/')}/api/internal/tenant-data/{tenantId}";
            using var response = await client.DeleteAsync(url, ct);
            if (!response.IsSuccessStatusCode)
            {
                var details = await response.Content.ReadAsStringAsync(ct);
                return CleanupResult.Failure(service.Key, $"HTTP {(int)response.StatusCode}: {details}");
            }
        }

        return CleanupResult.Success();
    }

    private sealed record CleanupResult(bool IsSuccess, string? Service = null, string? Details = null)
    {
        public static CleanupResult Success() => new(true);
        public static CleanupResult Failure(string service, string details) => new(false, service, details);
    }
}