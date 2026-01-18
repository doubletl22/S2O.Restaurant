using MediatR;
using S2O.Shared.Kernel.Results;

namespace S2O.Catalog.App.Features.Products.Commands;

public record UpdateProductCommand(
    Guid ProductId,       // ID món muốn sửa
    string Name,          // Tên mới
    string Description,   // Mô tả mới
    decimal Price,        // Giá mới
    string ImageUrl,      // Ảnh mới (nếu có thay đổi)
    bool IsActive         // <--- QUAN TRỌNG: True (Đang bán), False (Tạm ngưng/Ẩn)
) : IRequest<Result>;