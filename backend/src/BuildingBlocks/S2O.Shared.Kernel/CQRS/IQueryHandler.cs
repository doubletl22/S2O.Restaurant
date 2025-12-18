using MediatR;
using S2O.Shared.Kernel.Wrapper;

namespace S2O.Shared.Kernel.CQRS;

// Handler cho Query (Luôn trả về Result<T>)
// Ví dụ: GetUserByIdHandler : IQueryHandler<GetUserByIdQuery, UserDto>
public interface IQueryHandler<in TQuery, TResponse>
    : IRequestHandler<TQuery, Result<TResponse>>
    where TQuery : IQuery<TResponse>
{
}