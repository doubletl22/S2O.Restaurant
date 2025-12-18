using MediatR;
using S2O.Shared.Kernel.Wrapper;

namespace S2O.Shared.Kernel.CQRS;

// Query BẮT BUỘC phải trả về value (VD: GetUserByIdQuery -> trả về UserDto)
// Không bao giờ có chuyện Query trả về void (IRequest<Result>)
public interface IQuery<TResponse> : IRequest<Result<TResponse>>
{
}