using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Shared.Kernel.Interfaces;
using S2O.Catalog.App.Features.Products.Commands; // Namespace chứa Command tạo món
using S2O.Catalog.App.Features.Public;            // Namespace chứa Query xem menu

namespace S2O.Catalog.Api.Controllers;

[Route("api/products")] // Đổi Route chuẩn REST: /api/products
[ApiController]
public class ProductsController : ControllerBase
{
    private readonly ISender _sender;
    private readonly ITenantContext _tenantContext;

    public ProductsController(ISender sender, ITenantContext tenantContext)
    {
        _sender = sender;
        _tenantContext = tenantContext;
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
    [Authorize(Roles = "RestaurantOwner")] 
    public async Task<IActionResult> CreateProduct([FromForm] CreateProductCommand command)
    {
        var tenantId = _tenantContext.TenantId;

        if (tenantId == null || tenantId == Guid.Empty)
        {
            return BadRequest("Thiếu thông tin TenantId trong Token.");
        }

        // 4. Gán TenantId vào Command
        var commandWithTenant = command with { TenantId = tenantId.Value };

        var result = await _sender.Send(commandWithTenant);

        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "RestaurantOwner")] // Chỉ chủ quán mới được sửa
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