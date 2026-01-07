using System.Diagnostics;
using MediatR;
using Microsoft.Extensions.Logging;

namespace S2O.Shared.Kernel.Behaviors;

public class LoggingBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ILogger<LoggingBehavior<TRequest, TResponse>> _logger;

    public LoggingBehavior(ILogger<LoggingBehavior<TRequest, TResponse>> logger)
    {
        _logger = logger;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;
        _logger.LogInformation("[START] Handling command {RequestName}", requestName);

        var timer = Stopwatch.StartNew();
        var response = await next();
        timer.Stop();

        if (timer.ElapsedMilliseconds > 500) // Cảnh báo nếu chạy quá 500ms
        {
            _logger.LogWarning("[PERFORMANCE] Long running request: {RequestName} ({ElapsedMilliseconds}ms)",
                requestName, timer.ElapsedMilliseconds);
        }

        _logger.LogInformation("[END] Handled {RequestName}", requestName);
        return response;
    }
}