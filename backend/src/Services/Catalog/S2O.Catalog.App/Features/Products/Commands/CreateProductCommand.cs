using MediatR;
using S2O.Shared.Kernel.Results;

namespace S2O.Catalog.App.Features.Products.Commands;

public record CreateProductCommand(
    string Name,
    string Description,
    decimal Price,
    Guid CategoryId, // Món này thuộc nhóm nào (Khai vị, Món chính...)
    string ImageUrl  // Link ảnh (Tạm thời gửi link string, chưa làm upload file)
) : IRequest<Result<Guid>>;