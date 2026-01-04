using MediatR;
using S2O.Shared.Kernel.Wrapper;

namespace S2O.Shared.Kernel.CQRS
{
    // Command không trả về dữ liệu (chỉ trả về Success/Failure)
    public interface ICommand : IRequest<Result> { }

    // Command có trả về dữ liệu (VD: trả về ID vừa tạo)
    public interface ICommand<TResponse> : IRequest<Result<TResponse>> { }
}