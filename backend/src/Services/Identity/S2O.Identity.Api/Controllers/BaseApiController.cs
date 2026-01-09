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

    // Helper để map Result sang HTTP Response
    protected IActionResult HandleResult(Result result) =>
        result.IsSuccess ? Ok() : BadRequest(result.Error);

    protected IActionResult HandleResult<T>(Result<T> result) =>
        result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
}