using FluentValidation;
using MediatR;
using S2O.Shared.Kernel.Wrapper;

namespace S2O.Shared.Kernel.Behaviors
{
    public class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
        where TRequest : IRequest<TResponse>
        where TResponse : Result // Ràng buộc: Chỉ áp dụng nếu Response là Result
    {
        private readonly IEnumerable<IValidator<TRequest>> _validators;

        public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
        {
            _validators = validators;
        }

        public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
        {
            if (!_validators.Any()) return await next();

            var context = new ValidationContext<TRequest>(request);

            var validationResults = await Task.WhenAll(
                _validators.Select(v => v.ValidateAsync(context, cancellationToken)));

            var failures = validationResults
                .SelectMany(r => r.Errors)
                .Where(f => f != null)
                .ToList();

            if (failures.Count != 0)
            {
                // Gom lỗi lại thành một chuỗi hoặc object lỗi tùy ý
                var errorMessage = string.Join("; ", failures.Select(f => f.ErrorMessage));

                // Dùng Reflection để tạo đối tượng Result.Failure<T> vì TResponse là Generic
                // (Cách đơn giản hơn: ném ValidationException và dùng Middleware bắt ở API, 
                // nhưng ở đây ta muốn trả về Result pattern)
                var method = typeof(TResponse).GetMethod("Failure", new[] { typeof(string) });
                if (method != null)
                {
                    return (TResponse)method.Invoke(null, new object[] { errorMessage })!;
                }

                // Fallback nếu không tìm thấy method (thường không xảy ra nếu tuân thủ Result)
                throw new ValidationException(failures);
            }

            return await next();
        }
    }
}