using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Catalog.App.Features.Products.Commands; // Namespace chứa Command tạo món
using S2O.Catalog.App.Features.Public;            // Namespace chứa Query xem menu

namespace S2O.Catalog.Api.Controllers;

[Route("api/products")] // Đổi Route chuẩn REST: /api/products
[ApiController]
public class ProductsController : ControllerBase
{
    private readonly ISender _sender;

    public ProductsController(ISender sender)
    {
        _sender = sender;
    }

    // 1. GET: Lấy Menu (Dành cho Khách & App đặt món)
    // URL: GET api/products/{tenantId}
    [HttpGet("{tenantId}")]
    [AllowAnonymous] 
    public async Task<IActionResult> GetMenu(Guid tenantId, [FromQuery] string? categoryId) 
    {
        var query = new GetPublicMenuQuery(tenantId, categoryId);
        var result = await _sender.Send(query);

        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    // 2. POST: Thêm món mới (Dành cho Chủ quán)
    // URL: POST api/products
    [HttpPost]
    [Authorize(Roles = "Owner")] // <-- Bắt buộc là Chủ quán
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductCommand command)
    {
        // Có thể lấy TenantId từ Token nếu muốn bảo mật hơn
        // var tenantId = User.FindFirst("tenant_id")?.Value;

        var result = await _sender.Send(command);

        return result.IsSuccess
            ? Ok(new { ProductId = result.Value })
            : BadRequest(result.Error);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Owner")] // Chỉ chủ quán mới được sửa
    public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] UpdateProductCommand command)
    {
        // Kiểm tra ID trên URL có khớp với ID trong Body không (Tránh gửi nhầm)
        if (id != command.ProductId)
        {
            return BadRequest("Mã sản phẩm trên URL không khớp với dữ liệu gửi lên.");
        }

        var result = await _sender.Send(command);

        // Nếu thành công trả về 200 OK (hoặc 204 No Content)
        return result.IsSuccess ? Ok() : BadRequest(result.Error);
    }
}