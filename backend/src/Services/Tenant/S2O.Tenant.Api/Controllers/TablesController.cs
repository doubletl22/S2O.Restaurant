using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Tenant.App.Features.Tables; // Import namespace chứa Commands/Queries

namespace S2O.Tenant.Api.Controllers;

[Route("api/v1/tables")]
[ApiController]
public class TablesController : ControllerBase
{
    private readonly ISender _sender;

    public TablesController(ISender sender)
    {
        _sender = sender;
    }

    // GET: api/v1/tables
    [HttpGet]
    [Authorize(Roles = "RestaurantOwner, Staff")]
    public async Task<IActionResult> GetTables([FromQuery] Guid? branchId)
    {
        // Nên thêm filter theo BranchId nếu quán có nhiều chi nhánh
        var result = await _sender.Send(new GetTablesQuery(branchId));
        return Ok(result.Value);
    }

    // POST: api/v1/tables
    [HttpPost]
    [Authorize(Roles = "RestaurantOwner")]
    public async Task<IActionResult> CreateTable([FromBody] CreateTableCommand command)
    {
        var result = await _sender.Send(command);
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    // PUT: api/v1/tables/{id}
    [HttpPut("{id}")]
    [Authorize(Roles = "RestaurantOwner")]
    public async Task<IActionResult> UpdateTable(Guid id, [FromBody] UpdateTableCommand command)
    {
        if (id != command.Id) return BadRequest("ID không khớp");
        var result = await _sender.Send(command);
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    // DELETE: api/v1/tables/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "RestaurantOwner")]
    public async Task<IActionResult> DeleteTable(Guid id)
    {
        var result = await _sender.Send(new DeleteTableCommand(id));
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }
}