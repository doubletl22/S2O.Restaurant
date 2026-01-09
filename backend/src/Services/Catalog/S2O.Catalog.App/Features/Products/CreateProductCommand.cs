using MediatR;
using S2O.Shared.Kernel.Results;

namespace S2O.Catalog.App.Features.Products;

public record CreateProductCommand(
    string Name,
    string Description,
    decimal Price,
    Guid CategoryId,
    Stream ImageStream,
    string ImageName,
    string ContentType
) : IRequest<Result<Guid>>;