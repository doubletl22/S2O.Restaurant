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

    // 1. Lấy danh sách món (Dùng chung cho Owner và Staff)
    // GET: api/v1/products?page=1&size=10&keyword=pho&categoryId=...
    [HttpGet]
    [Authorize(Roles = "RestaurantOwner, Staff")]
    public async Task<IActionResult> GetProducts(
        [FromQuery] int page = 1,
        [FromQuery] int size = 10,
        [FromQuery] string? keyword = null,
        [FromQuery] Guid? categoryId = null)
    {
        // Bạn nên kiểm tra lại xem trong code App của bạn đang dùng GetProductsQuery hay GetOwnerProductsQuery.
        // Tốt nhất là dùng GetOwnerProductsQuery (hoặc đổi tên nó thành GetProductsQuery) để tái sử dụng logic lọc.
        var query = new GetOwnerProductsQuery(page, size, keyword, categoryId);
        var result = await _sender.Send(query);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    // 2. Lấy chi tiết món
    // GET: api/v1/products/{id}
    [HttpGet("{id}")]
    [Authorize(Roles = "RestaurantOwner, Staff")]
    public async Task<IActionResult> GetProductById(Guid id)
    {
        var result = await _sender.Send(new GetProductByIdQuery(id));
        return result.IsSuccess ? Ok(result.Value) : NotFound(result.Error);
    }

    // 3. Tạo món mới
    // POST: api/v1/products
    [HttpPost]
    [Authorize(Roles = "RestaurantOwner")] // Chỉ chủ quán được tạo
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductCommand command)
    {
        var result = await _sender.Send(command);
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    // 4. Cập nhật món
    // PUT: api/v1/products/{id}
    [HttpPut("{id}")]
    [Authorize(Roles = "RestaurantOwner")]
    public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] UpdateProductCommand command)
    {
        if (id != command.ProductId) return BadRequest("ID không khớp");
        var result = await _sender.Send(command);
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    // 5. Xóa món
    // DELETE: api/v1/products/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "RestaurantOwner")]
    public async Task<IActionResult> DeleteProduct(Guid id)
    {
        var result = await _sender.Send(new DeleteProductCommand(id));
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }
}