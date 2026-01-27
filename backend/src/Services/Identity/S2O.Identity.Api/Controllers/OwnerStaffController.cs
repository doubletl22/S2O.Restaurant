using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Identity.App.Features.Users.Queries;

[Route("api/owner/staff")]
[ApiController]
[Authorize(Roles = "RestaurantOwner")]
public class OwnerStaffController : ControllerBase
{
    private readonly ISender _sender;
    public OwnerStaffController(ISender sender) => _sender = sender;

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] string? keyword = null)
    {
        var result = await _sender.Send(new GetOwnerStaffQuery(keyword));
        return Ok(result.Value);
    }
}