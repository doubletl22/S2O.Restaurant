namespace S2O.Shared.Kernel.Behaviors;
using S2O.Shared.Kernel.Results;
using FluentValidation;
using MediatR;
public class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
    where TResponse : Result
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators) => _validators = validators;

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        if (!_validators.Any()) return await next();

        var context = new ValidationContext<TRequest>(request);
        var validationFailures = await Task.WhenAll(_validators.Select(v => v.ValidateAsync(context, cancellationToken)));
        var errors = validationFailures.SelectMany(r => r.Errors).Where(f => f != null).ToList();

        if (errors.Any())
        {
            // Logic trả về lỗi chuẩn hóa
            return (TResponse)Result.Failure(new Error("Validation.Error", errors.First().ErrorMessage));
        }

        return await next();
    }
}