using MediatR;
using S2O.Shared.Kernel.Results;
using System.Text.Json.Serialization; // Để dùng JsonIgnore (Tùy chọn)

namespace S2O.Catalog.App.Features.Categories.Commands;

// Định nghĩa Command
public record CreateCategoryCommand(string Name, string Description) : IRequest<Result<Guid>>
{
    [JsonIgnore] 
    public Guid TenantId { get; init; }
}