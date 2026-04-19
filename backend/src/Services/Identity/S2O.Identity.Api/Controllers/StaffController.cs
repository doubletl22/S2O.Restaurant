using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using S2O.Identity.App.Features.Register;
using S2O.Identity.App.Features.Users.Commands;
using S2O.Identity.App.Features.Users.Queries;
using S2O.Shared.Kernel.Results;
using System.Net.Http.Headers;
using System.Text.Json;

namespace S2O.Identity.Api.Controllers;

[Route("api/v1/staff")]
[ApiController]
[Authorize(Roles = "RestaurantOwner, SystemAdmin")]
public class StaffController : ControllerBase
{
    private enum BranchValidationState
    {
        Valid,
        Invalid,
        ServiceUnavailable
    }

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
            return Unauthorized(new Error("Auth.InvalidTenantClaim", "Token không hợp lệ hoặc thiếu TenantId."));
        }

        var query = new GetOwnerStaffQuery(tenantId, branchId, keyword);

        var result = await _sender.Send(query);
        return ToActionResult(result, value => Ok(value));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] RegisterStaffCommand command)
    {
        if (!TryGetCurrentTenantId(out var tenantId))
        {
            return Unauthorized(new Error("Auth.InvalidTenantClaim", "Token không hợp lệ hoặc thiếu TenantId."));
        }

        var branchValidation = await ValidateBranchForCurrentRequestAsync(command.BranchId, HttpContext.RequestAborted);
        if (branchValidation == BranchValidationState.ServiceUnavailable)
        {
            return StatusCode(StatusCodes.Status502BadGateway,
                new Error("Branch.ValidationUnavailable", "Không thể kiểm tra thông tin chi nhánh do dịch vụ tenant tạm thời không khả dụng."));
        }

        if (branchValidation == BranchValidationState.Invalid)
        {
            return BadRequest(new Error("Branch.NotFound", "Chi nhánh không tồn tại hoặc không thuộc tenant hiện tại."));
        }

        var safeCommand = command with { TenantId = tenantId };

        var result = await _sender.Send(safeCommand);
        return ToActionResult(result, value => Ok(value));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateStaffCommand command)
    {
        if (id != command.UserId)
        {
            return BadRequest(new Error("Staff.InvalidRequest", "ID không khớp"));
        }

        if (!TryGetCurrentTenantId(out var tenantId))
        {
            return Unauthorized(new Error("Auth.InvalidTenantClaim", "Token không hợp lệ hoặc thiếu TenantId."));
        }

        var branchValidation = await ValidateBranchForCurrentRequestAsync(command.BranchId, HttpContext.RequestAborted);
        if (branchValidation == BranchValidationState.ServiceUnavailable)
        {
            return StatusCode(StatusCodes.Status502BadGateway,
                new Error("Branch.ValidationUnavailable", "Không thể kiểm tra thông tin chi nhánh do dịch vụ tenant tạm thời không khả dụng."));
        }

        if (branchValidation == BranchValidationState.Invalid)
        {
            return BadRequest(new Error("Branch.NotFound", "Chi nhánh không tồn tại hoặc không thuộc tenant hiện tại."));
        }

        var safeCommand = command with { TenantId = tenantId }; 

        var result = await _sender.Send(safeCommand);
        return ToActionResult(result, value => Ok(value));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        if (!TryGetCurrentTenantId(out var tenantId))
        {
            return Unauthorized(new Error("Auth.InvalidTenantClaim", "Token không hợp lệ hoặc thiếu TenantId."));
        }

        var command = new DeleteStaffCommand(id, tenantId);

        var result = await _sender.Send(command);
        return ToActionResult(result, value => Ok(value));
    }

    private IActionResult ToActionResult<T>(Result<T> result, Func<T, IActionResult> onSuccess)
    {
        if (result.IsSuccess)
        {
            return onSuccess(result.Value);
        }

        return ErrorToActionResult(result.Error);
    }

    private IActionResult ErrorToActionResult(Error error)
    {
        var code = error.Code ?? string.Empty;

        if (code.Contains("Forbidden", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status403Forbidden, error);
        }

        if (code.Contains("Unauthorized", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status403Forbidden, error);
        }

        if (code.Contains("NotFound", StringComparison.OrdinalIgnoreCase))
        {
            return NotFound(error);
        }

        if (code.StartsWith("Auth.", StringComparison.OrdinalIgnoreCase))
        {
            return Unauthorized(error);
        }

        return BadRequest(error);
    }

    private async Task<BranchValidationState> ValidateBranchForCurrentRequestAsync(Guid branchId, CancellationToken cancellationToken)
    {
        var authHeader = Request.Headers.Authorization.ToString();
        return await ValidateBranchAsync(branchId, authHeader, cancellationToken);
    }

    private async Task<BranchValidationState> ValidateBranchAsync(Guid branchId, string authorizationHeader, CancellationToken cancellationToken)
    {
        if (branchId == Guid.Empty || string.IsNullOrWhiteSpace(authorizationHeader))
        {
            return BranchValidationState.Invalid;
        }

        var baseUrl = _configuration["ExternalServices:TenantApiBaseUrl"];
        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            return BranchValidationState.ServiceUnavailable;
        }

        if (!AuthenticationHeaderValue.TryParse(authorizationHeader, out var parsedAuthorization) || parsedAuthorization is null)
        {
            return BranchValidationState.Invalid;
        }

        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = parsedAuthorization;

        var url = $"{baseUrl.TrimEnd('/')}/api/v1/branches";
        using var response = await client.GetAsync(url, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            return BranchValidationState.ServiceUnavailable;
        }

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var document = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);

        if (!TryGetBranchArray(document.RootElement, out var branchArray))
        {
            return BranchValidationState.ServiceUnavailable;
        }

        foreach (var item in branchArray.EnumerateArray())
        {
            if (TryReadGuid(item, "id", out var id) || TryReadGuid(item, "Id", out id))
            {
                if (id == branchId) return BranchValidationState.Valid;
            }
        }

        return BranchValidationState.Invalid;
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