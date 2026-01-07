using MediatR;
using S2O.Shared.Kernel.Wrapper;

namespace S2O.Shared.Kernel.CQRS;

// 1. Command không trả về value (VD: DeleteUserCommand)
// Chỉ trả về trạng thái Success/Fail
public interface ICommand : IRequest<Result>
{
}

// 2. Command có trả về value (VD: CreateUserCommand -> trả về Guid)
public interface ICommand<TResponse> : IRequest<Result<TResponse>>
{
}