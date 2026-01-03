using MediatR;
using S2O.Shared.Kernel.Wrapper;

namespace S2O.Shared.Kernel.CQRS
{
    // Query luôn luôn phải trả về kết quả TResponse được bọc trong Result
    public interface IQuery<TResponse> : IRequest<Result<TResponse>> { }
}