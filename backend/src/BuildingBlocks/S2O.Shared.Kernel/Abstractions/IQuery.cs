using MediatR;
namespace S2O.Shared.Kernel.Abstractions;
public interface IQuery<TResponse> : IRequest<Result<TResponse>> { }

public interface IQueryHandler<in TQuery, TResponse> : IRequestHandler<TQuery, Result<TResponse>>
    where TQuery : IQuery<TResponse>
{ }