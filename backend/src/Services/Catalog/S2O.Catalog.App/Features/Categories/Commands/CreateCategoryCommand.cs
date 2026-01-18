using MediatR;
using S2O.Shared.Kernel.Results;

namespace S2O.Catalog.App.Features.Categories.Commands;

public record CreateCategoryCommand(
    string Name,        // Ví dụ: "Đồ uống"
    string Description  // Ví dụ: "Các loại nước ngọt, bia"
) : IRequest<Result<Guid>>;