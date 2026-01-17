using MediatR;
using Microsoft.AspNetCore.Mvc;
using S2O.Tenant.App.Features.Tables;
using System.Drawing.Imaging;
using QRCoder;
using System.Drawing;

namespace S2O.Tenant.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TablesController : ControllerBase
{
    private readonly IMediator _mediator;

    public TablesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> CreateTable([FromBody] CreateTableCommand command)
    {
        var result = await _mediator.Send(command);
        return result.IsSuccess ? Ok(result) : BadRequest(result.Error);
    }

    [HttpGet]
    public async Task<IActionResult> GetTables()
    {
        var result = await _mediator.Send(new GetTablesQuery());
        return Ok(result);
    }
    [HttpGet("{id}/qr")]
    public IActionResult GetTableQrCode(Guid id, [FromQuery] Guid tenantId, [FromQuery] Guid branchId)
    {
        // 1. Cấu trúc Link Frontend (Bạn thay domain thật vào đây)
        // Ví dụ Frontend chạy localhost:3000
        string frontendUrl = $"http://localhost:3000/menu?tenantId={tenantId}&branchId={branchId}&tableId={id}";

        // 2. Tạo QR Code
        using (QRCodeGenerator qrGenerator = new QRCodeGenerator())
        {
            QRCodeData qrCodeData = qrGenerator.CreateQrCode(frontendUrl, QRCodeGenerator.ECCLevel.Q);
            PngByteQRCode qrCode = new PngByteQRCode(qrCodeData);
            byte[] qrCodeBytes = qrCode.GetGraphic(20); // 20 là kích thước pixel

            // 3. Trả về file ảnh
            return File(qrCodeBytes, "image/png");
        }
    }
}
