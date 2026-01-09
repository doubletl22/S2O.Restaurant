namespace S2O.Shared.Kernel.Abstractions; 
using S2O.Shared.Kernel.Results;
using MediatR;
public interface IQuery<TResponse> : IRequest<Result<TResponse>> { }

public interface IQueryHandler<in TQuery, TResponse> : IRequestHandler<TQuery, Result<TResponse>>
    where TQuery : IQuery<TResponse>
{ }