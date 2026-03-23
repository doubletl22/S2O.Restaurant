using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net.Http.Headers;
using System.Text.Json;
using S2O.Tenant.App.Abstractions; // Đảm bảo import đúng namespace DbContext

namespace S2O.Tenant.Api.Controllers;

[Route("api/v1/admin")]
[ApiController]
public class AdminController : ControllerBase
{
    private readonly ITenantDbContext _context;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;

    public AdminController(
        ITenantDbContext context,
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration)
    {
        _context = context;
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
    }

    // GET: api/v1/admin/stats
    [HttpGet("stats")]
    [Authorize(Roles = "SystemAdmin")]
    public async Task<IActionResult> GetStats()
    {
        var totalTenants = await _context.Tenants.CountAsync();
        var activeTenants = await _context.Tenants.CountAsync(t => t.IsActive && !t.IsLocked);
        var totalUsers = await GetTotalUsersAsync();

        var stats = new
        {
            TotalTenants = totalTenants,
            ActiveTenants = activeTenants,
            TotalRevenue = 0,
            TotalUsers = totalUsers
        };

        return Ok(new { IsSuccess = true, Value = stats });
    }

    private async Task<int> GetTotalUsersAsync()
    {
        try
        {
            var identityApiBaseUrl = _configuration["ExternalServices:IdentityApiBaseUrl"];
            if (string.IsNullOrWhiteSpace(identityApiBaseUrl))
            {
                return 0;
            }

            var token = Request.Headers.Authorization.ToString();
            if (string.IsNullOrWhiteSpace(token))
            {
                return 0;
            }

            var client = _httpClientFactory.CreateClient();
            client.BaseAddress = new Uri(identityApiBaseUrl);
            client.DefaultRequestHeaders.Authorization = AuthenticationHeaderValue.Parse(token);

            using var response = await client.GetAsync("/api/users?page=1&size=1");
            if (!response.IsSuccessStatusCode)
            {
                return 0;
            }

            await using var stream = await response.Content.ReadAsStreamAsync();
            var payload = await JsonSerializer.DeserializeAsync<UsersSummaryResponse>(
                stream,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            return payload?.TotalCount ?? 0;
        }
        catch
        {
            // Keep dashboard available even if Identity service is temporarily unreachable.
            return 0;
        }
    }

    private sealed class UsersSummaryResponse
    {
        public int TotalCount { get; set; }
    }
}