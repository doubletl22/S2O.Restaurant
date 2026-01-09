using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using S2O.Catalog.App.Features.Products;

namespace S2O.Catalog.Api.Controllers;

[Authorize] // Chỉ những người đã đăng nhập mới được thao tác menu
[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly ISender _sender;

    public ProductsController(ISender sender) => _sender = sender;

    [HttpPost]
    [Consumes("multipart/form-data")] // Quan trọng để Swagger hiểu là có upload file
    public async Task<IActionResult> Create([FromForm] CreateProductRequest request)
    {
        // Chuyển từ Request sang Command
        using var stream = request.Image.OpenReadStream();
        var command = new CreateProductCommand(
            request.Name,
            request.Description,
            request.Price,
            request.CategoryId,
            stream,
            request.Image.FileName,
            request.Image.ContentType
        );

        var result = await _sender.Send(command);

        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }
}

// Model nhận dữ liệu từ Form
public record CreateProductRequest(
    string Name,
    string Description,
    decimal Price,
    Guid CategoryId,
    IFormFile Image);