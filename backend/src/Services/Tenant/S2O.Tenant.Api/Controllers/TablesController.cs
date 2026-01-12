using MediatR;
using Microsoft.AspNetCore.Mvc;
using S2O.Tenant.App.Features.Tables;

namespace S2O.Tenant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
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
    public async Task<IActionResult> GetTables()
    {
        var result = await _mediator.Send(new GetTablesQuery());
        return Ok(result);
    }
}