using MediatR;
using S2O.Shared.Kernel.Results;

namespace S2O.Catalog.App.Features.Categories.Commands;

public class UpdateCategoryCommand : IRequest<Result<Guid>>
{
    public Guid Id { get; set; } // ID của danh mục cần sửa
    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
}