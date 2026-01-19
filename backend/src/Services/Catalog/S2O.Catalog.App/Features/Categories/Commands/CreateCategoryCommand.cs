using MediatR;
using S2O.Shared.Kernel.Results;
using System.Text.Json.Serialization; // Để dùng JsonIgnore (Tùy chọn)

namespace S2O.Catalog.App.Features.Categories.Commands;

// Định nghĩa Command
public record CreateCategoryCommand(string Name, string Description) : IRequest<Result<Guid>>
{
    // Thêm thuộc tính này để Controller có thể gán (dùng 'with')
    // init: chỉ cho phép gán lúc khởi tạo
    [JsonIgnore] // Ẩn khỏi Swagger để FE không cần gửi trường này
    public Guid TenantId { get; init; }
}