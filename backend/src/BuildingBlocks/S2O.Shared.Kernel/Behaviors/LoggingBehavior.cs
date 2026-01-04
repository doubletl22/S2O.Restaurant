using MediatR;
using Microsoft.Extensions.Logging;
using System.Diagnostics;

namespace S2O.Shared.Kernel.Behaviors
{
    public class LoggingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
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
            _logger.LogInformation("S2O Request: {Name} {@Request}", requestName, request);

            var timer = Stopwatch.StartNew();
            var response = await next();
            timer.Stop();

            if (timer.ElapsedMilliseconds > 500) // Cảnh báo nếu xử lý chậm > 500ms
                _logger.LogWarning("S2O Long Request: {Name} ({ElapsedMilliseconds}ms) {@Request}", requestName, timer.ElapsedMilliseconds, request);

            return response;
        }
    }
}