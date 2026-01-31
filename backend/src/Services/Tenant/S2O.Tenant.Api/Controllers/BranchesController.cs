using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Tenant.App.Features.Branches.Commands;
using S2O.Tenant.App.Features.Branches.Queries;

namespace S2O.Tenant.Api.Controllers;

[Route("api/v1/branches")]
[ApiController]
public class BranchesController : ControllerBase
{
    private readonly ISender _sender;

    public BranchesController(ISender sender)
    {
        _sender = sender;
    }

    // GET: api/v1/branches
    [HttpGet]
    [Authorize(Roles = "RestaurantOwner, Staff")] // Cả chủ và nhân viên đều cần xem DS chi nhánh
    public async Task<IActionResult> GetBranches()
    {
        // Query tự lấy TenantId từ Token
        var result = await _sender.Send(new GetOwnerBranchesQuery());
        return Ok(result.Value);
    }

    // POST: api/v1/branches
    [HttpPost]
    [Authorize(Roles = "RestaurantOwner")]
    public async Task<IActionResult> CreateBranch([FromBody] CreateBranchCommand command)
    {
        var result = await _sender.Send(command);
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    // PUT: api/v1/branches/{id}
    [HttpPut("{id}")]
    [Authorize(Roles = "RestaurantOwner")]
    public async Task<IActionResult> UpdateBranch(Guid id, [FromBody] UpdateBranchCommand command)
    {
        if (id != command.Id) return BadRequest("ID không khớp");
        var result = await _sender.Send(command);
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    // DELETE: api/v1/branches/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "RestaurantOwner")]
    public async Task<IActionResult> DeleteBranch(Guid id)
    {
        var result = await _sender.Send(new DeleteBranchCommand(id));
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }
}