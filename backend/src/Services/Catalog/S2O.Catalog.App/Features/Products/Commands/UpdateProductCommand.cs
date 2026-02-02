using MediatR;
using Microsoft.AspNetCore.Http;
using S2O.Shared.Kernel.Results;
using System.Text.Json.Serialization;

namespace S2O.Catalog.App.Features.Products.Commands;

public record UpdateProductCommand(
    Guid ProductId,
    string Name,
    string Description,
    decimal Price,
    IFormFile? ImageFile, 
    bool IsActive
) : IRequest<Result>
{
    [JsonIgnore]
    public Guid TenantId { get; init; } // Cần TenantId để đảm bảo sửa đúng món của quán mình
}