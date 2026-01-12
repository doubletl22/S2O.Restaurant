using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Payment.App.Features.Payments.Commands;

namespace S2O.Payment.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly ISender _sender;

    public PaymentsController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost]
    public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentCommand command)
    {
        var result = await _sender.Send(command);
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }
}