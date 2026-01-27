using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Tenant.App.Features.Tables;

namespace S2O.Tenant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
//[Authorize]
public class TablesController : ControllerBase
{
    private readonly IMediator _mediator;

    public TablesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> CreateTable([FromBody] CreateTableCommand command)
    {
        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

 
    [HttpGet]
    public async Task<IActionResult> GetTables([FromQuery] Guid? branchId)
    {
        // Gửi Query sang Handler xử lý (GetTablesQuery.cs mà bạn đã có)
        var query = new GetTablesQuery(branchId);
        var result = await _mediator.Send(query);

        if (result.IsFailure)
        {
            return BadRequest(result.Error);
        }

        // Trả về đúng cấu trúc JSON mà Frontend đang đợi (có .value, .isSuccess)
        return Ok(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "RestaurantOwner, SystemAdmin")]
    public async Task<IActionResult> DeleteTable(Guid id)
    {
        var result = await _mediator.Send(new DeleteTableCommand(id));

        if (result.IsFailure)
        {
            return BadRequest(result.Error);
        }

        return Ok(new { Message = "Xóa bàn thành công." });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTable(Guid id, [FromBody] UpdateTableCommand command)
    {
        if (id != command.Id) return BadRequest();
        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

   
}
