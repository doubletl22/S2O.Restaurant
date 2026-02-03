using MediatR;
using Microsoft.AspNetCore.Http;
using S2O.Shared.Kernel.Results;
using System.Text.Json.Serialization;

namespace S2O.Catalog.App.Features.Products.Commands;

public class UpdateProductCommand : IRequest<Result<Guid>>
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public Guid CategoryId { get; set; }
    public bool IsActive { get; set; }

    public IFormFile? ImageFile { get; set; }
}