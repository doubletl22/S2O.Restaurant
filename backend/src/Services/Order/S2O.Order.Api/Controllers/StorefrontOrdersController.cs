﻿using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Order.App.Features.Orders.Commands;
using S2O.Order.App.Features.Orders.Queries;

namespace S2O.Order.Api.Controllers;

[Route("api/v1/storefront/orders")]
[ApiController]
public class StorefrontOrdersController : ControllerBase
{
    private readonly ISender _sender;

    public StorefrontOrdersController(ISender sender)
    {
        _sender = sender;
    }

    // POST: api/v1/storefront/orders/guest
    [HttpPost("guest")]
    [AllowAnonymous]
    public async Task<IActionResult> PlaceGuestOrder([FromBody] PlaceGuestOrderCommand command)
    {
        var result = await _sender.Send(command);
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    // GET: api/v1/storefront/orders/table/{tableId}
    // Dùng cho Guest/Customer tracking lịch sử + trạng thái
    [HttpGet("table/{tableId:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetByTable([FromRoute] Guid tableId)
    {
        var result = await _sender.Send(new GetGuestOrdersByTableQuery(tableId));
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    // POST: api/v1/storefront/orders/request-bill
    [HttpPost("request-bill")]
    [AllowAnonymous]
    public async Task<IActionResult> RequestBill([FromBody] RequestBillCommand command)
    {
        var result = await _sender.Send(command);
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }
}
