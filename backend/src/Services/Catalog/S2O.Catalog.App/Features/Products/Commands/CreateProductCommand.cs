using MediatR;
using S2O.Shared.Kernel.Results;
using Microsoft.AspNetCore.Http;
using System.Text.Json.Serialization;

namespace S2O.Catalog.App.Features.Products.Commands;

public record CreateProductCommand(
    string Name,
    string Description,
    decimal Price,
    Guid CategoryId, 
    IFormFile? ImageFile  
) : IRequest<Result<Guid>>
{
public Guid TenantId { get; init; }
}