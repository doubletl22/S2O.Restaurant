using MediatR;
using Microsoft.AspNetCore.Mvc;
using S2O.Shared.Kernel.Results;

namespace S2O.Identity.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    protected readonly ISender Sender;

    protected BaseApiController(ISender sender) => Sender = sender;

    protected IActionResult HandleResult(Result result) =>
        result.IsSuccess ? Ok() : MapError(result.Error);

    protected IActionResult HandleResult<T>(Result<T> result) =>
        result.IsSuccess ? Ok(result.Value) : MapError(result.Error);

    private IActionResult MapError(Error error)
    {
        var code = error.Code ?? string.Empty;

        if (code.Contains("Forbidden", StringComparison.OrdinalIgnoreCase))
        {
            return StatusCode(StatusCodes.Status403Forbidden, error);
        }

        if (code.Contains("Unauthorized", StringComparison.OrdinalIgnoreCase))
        {
            return Unauthorized(error);
        }

        if (code.Contains("NotFound", StringComparison.OrdinalIgnoreCase))
        {
            return NotFound(error);
        }

        return BadRequest(error);
    }
}