using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Booking.App.Features.Bookings.Commands;

namespace S2O.Booking.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly ISender _sender;

    public BookingsController(ISender sender)
    {
        _sender = sender;
    }

    // Guest tạo yêu cầu đặt bàn (Public hoặc Guest Auth)
    [HttpPost]
    [AllowAnonymous] // Cho phép khách vãng lai đặt
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingCommand command)
    {
        var result = await _sender.Send(command);
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    // TODO: Thêm API GetBookings cho chủ quán sau
}