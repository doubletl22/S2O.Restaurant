using MediatR;
using ErrorOr;
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
    [Consumes("multipart/form-data")] 
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
            request.Image.FileName
        );

        var result = await _sender.Send(command);

        return result.Match(
        id => Ok(new { ProductId = id }),
        errors => {
            // Lấy lỗi đầu tiên để hiển thị cho chi tiết
            var firstError = errors.FirstOrDefault();
            return Problem(
                statusCode: firstError.Type switch
                {
                    ErrorType.NotFound => StatusCodes.Status404NotFound,
                    ErrorType.Validation => StatusCodes.Status400BadRequest,
                    _ => StatusCodes.Status500InternalServerError
                },
                title: firstError.Description 
            );
        }
    );
    }
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        // Dùng MediatR gọi Query GetProductById
        var result = await _sender.Send(new GetProductByIdQuery(id));
        return result.IsSuccess ? Ok(result.Value) : NotFound(result.Error);
    }
}

// Model nhận dữ liệu từ Form
public record CreateProductRequest(
    string Name,
    string Description,
    decimal Price,
    Guid CategoryId,
    IFormFile Image);