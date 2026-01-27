using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Tenant.App.Features.Branches.Queries;

[Route("api/owner/branches")]
[ApiController]
[Authorize(Roles = "RestaurantOwner")]
public class OwnerBranchesController : ControllerBase
{
    private readonly ISender _sender;
    public OwnerBranchesController(ISender sender) => _sender = sender;

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var result = await _sender.Send(new GetOwnerBranchesQuery());
        return Ok(result.Value);
    }
}