using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Catalog.App.Features.Categories.Commands;
using S2O.Catalog.App.Features.Categories.Queries;

namespace S2O.Catalog.Api.Controllers;

[Route("api/v1/categories")]
[ApiController]
public class CategoriesController : ControllerBase
{
    private readonly ISender _sender;

    public CategoriesController(ISender sender)
    {
        _sender = sender;
    }

    // GET: api/v1/categories
    [HttpGet]
    [Authorize(Roles = "RestaurantOwner, Staff")]
    public async Task<IActionResult> GetCategories()
    {
        var result = await _sender.Send(new GetCategoriesQuery());
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    // POST: api/v1/categories
    [HttpPost]
    [Authorize(Roles = "RestaurantOwner")]
    public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryCommand command)
    {
        var result = await _sender.Send(command);
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    // DELETE: api/v1/categories/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "RestaurantOwner")]
    public async Task<IActionResult> DeleteCategory(Guid id)
    {
        var result = await _sender.Send(new DeleteCategoryCommand(id));
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }
    // PUT: api/v1/categories/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] UpdateCategoryCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest("ID in URL does not match ID in body");
        }

        var result = await _sender.Send(command);
        if (result.IsSuccess) return Ok(result);
        return BadRequest(result.Error);
    }
}