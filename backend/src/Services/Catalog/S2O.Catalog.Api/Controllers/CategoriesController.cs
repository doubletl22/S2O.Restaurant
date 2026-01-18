using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Catalog.App.Features.Categories.Commands;
using S2O.Catalog.App.Features.Categories.Queries; // (Bạn tự làm thêm phần Get List nhé)

namespace S2O.Catalog.Api.Controllers;

[Route("api/categories")]
[ApiController]
public class CategoriesController : ControllerBase
{
    private readonly ISender _sender;

    public CategoriesController(ISender sender)
    {
        _sender = sender;
    }

    // POST: api/categories (Chỉ Owner tạo được)
    [HttpPost]
    [Authorize(Roles = "Owner")]
    public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryCommand command)
    {
        var result = await _sender.Send(command);
        return result.IsSuccess ? Ok(new { CategoryId = result.Value }) : BadRequest(result.Error);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _sender.Send(new GetCategoriesQuery());
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }
}

public record CreateCategoryRequest(string Name, string? Description);