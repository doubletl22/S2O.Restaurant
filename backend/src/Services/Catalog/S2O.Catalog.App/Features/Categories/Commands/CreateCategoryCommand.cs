using MediatR;
using S2O.Shared.Kernel.Results;
using System.Text.Json.Serialization; // Để dùng JsonIgnore (Tùy chọn)

namespace S2O.Catalog.App.Features.Categories.Commands;

public record CreateCategoryCommand(
    string Name,
    string? Description,
    bool IsActive // <--- Thêm cái này
) : IRequest<Result<Guid>>;