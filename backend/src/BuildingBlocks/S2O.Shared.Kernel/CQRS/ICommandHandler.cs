using MediatR;
using S2O.Shared.Kernel.Wrapper;

namespace S2O.Shared.Kernel.CQRS;

// 1. Handler cho Command không trả về value (chỉ trả về Result success/fail)
// Ví dụ: DeleteUserHandler : ICommandHandler<DeleteUserCommand>
public interface ICommandHandler<in TCommand>
    : IRequestHandler<TCommand, Result>
    where TCommand : ICommand
{
}

// 2. Handler cho Command CÓ trả về value
// Ví dụ: CreateUserHandler : ICommandHandler<CreateUserCommand, Guid>
public interface ICommandHandler<in TCommand, TResponse>
    : IRequestHandler<TCommand, Result<TResponse>>
    where TCommand : ICommand<TResponse>
{
}