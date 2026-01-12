using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Catalog.App.Features.Categories;

namespace S2O.Catalog.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ISender _sender;

    public CategoriesController(ISender sender) => _sender = sender;

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCategoryRequest request)
    {
        var result = await _sender.Send(new CreateCategoryCommand(request.Name, request.Description));
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _sender.Send(new GetCategoriesQuery());
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }
}

public record CreateCategoryRequest(string Name, string? Description);