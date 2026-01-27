using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Catalog.App.Features.Categories.Commands;
using S2O.Catalog.App.Features.Categories.Queries; // (Bạn tự làm thêm phần Get List nhé)
using S2O.Shared.Kernel.Interfaces;

namespace S2O.Catalog.Api.Controllers;

[Route("api/categories")]
[ApiController]
public class CategoriesController : ControllerBase
{
    private readonly ISender _sender;
    private readonly ITenantContext _tenantContext;

    public CategoriesController(ISender sender, ITenantContext tenantContext)
    {
        _sender = sender;
        _tenantContext = tenantContext;
    }

    [HttpPost]
// Sau khi debug xong thì mở lại dòng này
[Authorize(Roles = "RestaurantOwner, SystemAdmin")] 
public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryCommand command)
{
    // Inject ITenantContext vào Constructor trước nhé
    var tenantId = _tenantContext.TenantId; 

    if (tenantId == null || tenantId == Guid.Empty)
    {
        return BadRequest("Thiếu thông tin TenantId trong Token.");
    }

    // Gán TenantId vào command
    var commandWithTenant = command with { TenantId = tenantId.Value };

    var result = await _sender.Send(commandWithTenant);
    
    return result.IsSuccess 
        ? Ok(new { CategoryId = result.Value }) 
        : BadRequest(result.Error);
}

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _sender.Send(new GetCategoriesQuery());
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(Guid id)
    {
        var result = await _sender.Send(new DeleteCategoryCommand(id));
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }
}

public record CreateCategoryRequest(string Name, string? Description);