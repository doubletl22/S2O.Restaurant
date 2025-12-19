using FluentValidation;
using MediatR;
using S2O.Shared.Kernel.CQRS;
using S2O.Shared.Kernel.Wrapper;

namespace S2O.Shared.Kernel.Behaviors;

public class ValidationBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : ICommand<TResponse> // Chỉ áp dụng cho Command (Ghi)
    where TResponse : Result
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
    {
        _validators = validators;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        if (!_validators.Any())
        {
            return await next();
        }

        var context = new ValidationContext<TRequest>(request);

        var validationResults = await Task.WhenAll(
            _validators.Select(v => v.ValidateAsync(context, cancellationToken)));

        var failures = validationResults
            .Where(r => r.Errors.Any())
            .SelectMany(r => r.Errors)
            .ToList();

        if (failures.Any())
        {
            // Gom tất cả lỗi lại thành 1 chuỗi
            var errorMsg = string.Join("; ", failures.Select(f => f.ErrorMessage));

            // Trả về Result.Failure thay vì throw Exception (Code sạch hơn)
            // Lưu ý: Cần dùng Reflection hoặc dynamic vì TResponse là Generic
            // Ở đây mình giả định TResponse kế thừa Result

            // Cách đơn giản nhất để cast về Result pattern của chúng ta:
            var method = typeof(Result).GetMethods()
                .FirstOrDefault(m => m.Name == "Failure" && m.IsGenericMethod == (typeof(TResponse).IsGenericType));

            if (typeof(TResponse).IsGenericType) // Result<T>
            {
                var genericType = typeof(TResponse).GetGenericArguments()[0];
                var failureMethod = typeof(Result).GetMethod(nameof(Result.Failure), 1, [typeof(string)])!
                    .MakeGenericMethod(genericType);
                return (TResponse)failureMethod.Invoke(null, [errorMsg])!;
            }
            else // Result thường
            {
                return (TResponse)(object)Result.Failure(errorMsg);
            }
        }

        return await next();
    }
}