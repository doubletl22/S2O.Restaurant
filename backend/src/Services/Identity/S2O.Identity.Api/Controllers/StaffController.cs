using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using S2O.Identity.App.Features.Register;
using S2O.Identity.App.Features.Users.Commands;
using S2O.Identity.App.Features.Users.Queries;
using System.Net.Http.Headers;
using System.Text.Json;

namespace S2O.Identity.Api.Controllers;

[Route("api/v1/staff")]
[ApiController]
[Authorize(Roles = "RestaurantOwner, SystemAdmin")]
public class StaffController : ControllerBase
{
    private readonly ISender _sender;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;

    public StaffController(ISender sender, IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _sender = sender;
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
    }

    private bool TryGetCurrentTenantId(out Guid tenantId)
    {
        tenantId = Guid.Empty;

        var tenantClaim = User.FindFirst("tenant_id")?.Value;
        if (string.IsNullOrWhiteSpace(tenantClaim))
        {
            return false;
        }

        return Guid.TryParse(tenantClaim, out tenantId);
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] string? keyword = null, [FromQuery] Guid? branchId = null)
    {
        if (!TryGetCurrentTenantId(out var tenantId))
        {
            return BadRequest("Token không hợp lệ hoặc thiếu TenantId.");
        }

        var query = new GetOwnerStaffQuery(tenantId, branchId, keyword);

        var result = await _sender.Send(query);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] RegisterStaffCommand command)
    {
        if (!TryGetCurrentTenantId(out var tenantId))
        {
            return BadRequest("Token không hợp lệ hoặc thiếu TenantId.");
        }

        if (!await IsBranchValidForCurrentRequestAsync(command.BranchId, HttpContext.RequestAborted))
        {
            return BadRequest("Chi nhánh không tồn tại hoặc không thuộc tenant hiện tại.");
        }

        var safeCommand = command with { TenantId = tenantId };

        var result = await _sender.Send(safeCommand);
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateStaffCommand command)
    {
        if (id != command.UserId) return BadRequest("ID không khớp");

        if (!TryGetCurrentTenantId(out var tenantId))
        {
            return BadRequest("Token không hợp lệ hoặc thiếu TenantId.");
        }

        if (!await IsBranchValidForCurrentRequestAsync(command.BranchId, HttpContext.RequestAborted))
        {
            return BadRequest("Chi nhánh không tồn tại hoặc không thuộc tenant hiện tại.");
        }

        var safeCommand = command with { TenantId = tenantId }; 

        var result = await _sender.Send(safeCommand);
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        if (!TryGetCurrentTenantId(out var tenantId))
        {
            return BadRequest("Token không hợp lệ hoặc thiếu TenantId.");
        }

        var command = new DeleteStaffCommand(id, tenantId);

        var result = await _sender.Send(command);

        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    private async Task<bool> IsBranchValidForCurrentRequestAsync(Guid branchId, CancellationToken cancellationToken)
    {
        var authHeader = Request.Headers.Authorization.ToString();
        return await BranchExistsAsync(branchId, authHeader, cancellationToken);
    }

    private async Task<bool> BranchExistsAsync(Guid branchId, string authorizationHeader, CancellationToken cancellationToken)
    {
        if (branchId == Guid.Empty || string.IsNullOrWhiteSpace(authorizationHeader))
        {
            return false;
        }

        var baseUrl = _configuration["ExternalServices:TenantApiBaseUrl"];
        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            return false;
        }

        if (!AuthenticationHeaderValue.TryParse(authorizationHeader, out var parsedAuthorization) || parsedAuthorization is null)
        {
            return false;
        }

        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = parsedAuthorization;

        var url = $"{baseUrl.TrimEnd('/')}/api/v1/branches";
        using var response = await client.GetAsync(url, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            return false;
        }

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var document = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);

        if (!TryGetBranchArray(document.RootElement, out var branchArray))
        {
            return false;
        }

        foreach (var item in branchArray.EnumerateArray())
        {
            if (TryReadGuid(item, "id", out var id) || TryReadGuid(item, "Id", out id))
            {
                if (id == branchId) return true;
            }
        }

        return false;
    }

    private static bool TryReadGuid(JsonElement element, string propertyName, out Guid value)
    {
        value = Guid.Empty;

        if (!element.TryGetProperty(propertyName, out var prop) || prop.ValueKind != JsonValueKind.String)
        {
            return false;
        }

        return Guid.TryParse(prop.GetString(), out value);
    }

    private static bool TryGetBranchArray(JsonElement root, out JsonElement branchArray)
    {
        branchArray = default;

        if (root.ValueKind == JsonValueKind.Array)
        {
            branchArray = root;
            return true;
        }

        if (root.ValueKind == JsonValueKind.Object)
        {
            if (root.TryGetProperty("value", out var camelValue) && camelValue.ValueKind == JsonValueKind.Array)
            {
                branchArray = camelValue;
                return true;
            }

            if (root.TryGetProperty("Value", out var pascalValue) && pascalValue.ValueKind == JsonValueKind.Array)
            {
                branchArray = pascalValue;
                return true;
            }
        }

        return false;
    }
}