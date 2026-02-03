using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Catalog.App.Features.Products.Commands;
using S2O.Catalog.App.Features.Products.Queries;

namespace S2O.Catalog.Api.Controllers;

[Route("api/v1/products")]
[ApiController]
public class ProductsController : ControllerBase
{
    private readonly ISender _sender;

    public ProductsController(ISender sender)
    {
        _sender = sender;
    }

    // ===============================
    // 1. Lấy danh sách món (Owner + Staff)
    // ===============================
    // GET: api/v1/products?page=1&size=10&keyword=pho&categoryId=...
    [HttpGet]
    [Authorize(Roles = "RestaurantOwner, Staff")]
    public async Task<IActionResult> GetProducts(
        [FromQuery] int page = 1,
        [FromQuery] int size = 10,
        [FromQuery] string? keyword = null,
        [FromQuery] Guid? categoryId = null)
    {
        var query = new GetOwnerProductsQuery(page, size, keyword, categoryId);
        var result = await _sender.Send(query);

        return result.IsSuccess 
            ? Ok(result.Value) 
            : BadRequest(result.Error);
    }

    // ===============================
    // 2. Lấy chi tiết món (CHO PHÉP GUEST + ORDER SERVICE)
    // ===============================
    // GET: api/v1/products/{id}
    [HttpGet("{id}")]
    [AllowAnonymous]   // 🔥 QUAN TRỌNG: bỏ login cho guest quét QR
    public async Task<IActionResult> GetProductById(Guid id)
    {
        var result = await _sender.Send(new GetProductByIdQuery(id));

        return result.IsSuccess 
            ? Ok(result.Value) 
            : NotFound(result.Error);
    }

    // ===============================
    // 3. Tạo món mới (Owner)
    // ===============================
    [HttpPost]
    [Authorize(Roles = "RestaurantOwner")]
    public async Task<IActionResult> CreateProduct([FromForm] CreateProductCommand command)
    {
        var result = await _sender.Send(command);

        return result.IsSuccess 
            ? Ok(result.Value) 
            : BadRequest(result.Error);
    }

    // ===============================
    // 4. Cập nhật món (Owner + Staff)
    // ===============================
    [HttpPut("{id}")]
    [Authorize(Roles = "RestaurantOwner, Staff")]
    public async Task<IActionResult> UpdateProduct(Guid id, [FromForm] UpdateProductCommand command)
    {
        if (id != command.Id)
            return BadRequest("Product ID mismatch");

        var result = await _sender.Send(command);

        return result.IsSuccess 
            ? Ok(result.Value) 
            : BadRequest(result.Error);
    }

    // ===============================
    // 5. Xóa món (Owner)
    // ===============================
    [HttpDelete("{id}")]
    [Authorize(Roles = "RestaurantOwner")]
    public async Task<IActionResult> DeleteProduct(Guid id)
    {
        var result = await _sender.Send(new DeleteProductCommand(id));

        return result.IsSuccess 
            ? NoContent() 
            : BadRequest(result.Error);
    }
}
