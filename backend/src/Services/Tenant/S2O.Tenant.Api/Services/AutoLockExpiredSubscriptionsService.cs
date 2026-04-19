using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using S2O.Tenant.App.Features.Tenants.Commands;
using MediatR;
using Microsoft.EntityFrameworkCore;
using S2O.Tenant.Infra.Persistence;

namespace S2O.Tenant.Api.Services;

/// <summary>
/// Background service để:
/// - Auto-lock tenants có subscription hết hạn
/// - Auto-unlock tenants khi thời hạn khóa đã hết
/// Chạy mỗi 6 giờ.
/// </summary>
public class AutoLockExpiredSubscriptionsService : BackgroundService
{
    private readonly ILogger<AutoLockExpiredSubscriptionsService> _logger;
    private readonly IServiceProvider _serviceProvider;
    private readonly TimeSpan _checkInterval = TimeSpan.FromHours(6);

    public AutoLockExpiredSubscriptionsService(
        ILogger<AutoLockExpiredSubscriptionsService> logger,
        IServiceProvider serviceProvider)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("AutoLockExpiredSubscriptionsService started");

        // Chạy lần đầu sau 1 phút
        await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                _logger.LogInformation("Running tenant lock maintenance job at {Time}", DateTime.UtcNow);
                await CheckAndLockExpiredSubscriptionsAsync(stoppingToken);
                await CheckAndUnlockExpiredLocksAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AutoLockExpiredSubscriptionsService");
            }

            // Chờ 6 giờ trước lần check tiếp theo
            await Task.Delay(_checkInterval, stoppingToken);
        }

        _logger.LogInformation("AutoLockExpiredSubscriptionsService stopped");
    }

    private async Task CheckAndLockExpiredSubscriptionsAsync(CancellationToken stoppingToken)
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            try
            {
                var context = scope.ServiceProvider.GetRequiredService<TenantDbContext>();
                var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

                // Tìm các tenants:
                // - Có subscription hết hạn (SubscriptionExpiry <= now)
                // - Chưa bị khóa (IsLocked = false)
                var expiredTenants = await context.Tenants
                    .Where(t => t.SubscriptionExpiry > DateTime.MinValue
                                && t.SubscriptionExpiry <= DateTime.UtcNow
                                && !t.IsLocked)
                    .ToListAsync(stoppingToken);

                if (expiredTenants.Count == 0)
                {
                    _logger.LogInformation("No expired subscriptions found to auto-lock");
                    return;
                }

                _logger.LogInformation("Found {Count} tenants with expired subscriptions. Starting auto-lock...", expiredTenants.Count);

                foreach (var tenant in expiredTenants)
                {
                    try
                    {
                        var lockReason = "Gói dịch vụ đã hết hạn - Tự động khóa";
                        var durationDays = 365; // Khóa tạm thời 1 năm (admin có thể mở lại khi gia hạn)
                        
                        var result = await mediator.Send(new ToggleTenantLockCommand(
                            TenantId: tenant.Id,
                            IsLocked: true,
                            IsToggle: null,
                            LockReason: lockReason,
                            LockDurationDays: durationDays,
                            IsPermanent: false), 
                            stoppingToken);

                        if (result.IsSuccess)
                        {
                            _logger.LogInformation("Auto-locked tenant {TenantId} ({TenantName}) due to expired subscription", 
                                tenant.Id, tenant.Name);
                        }
                        else
                        {
                            _logger.LogWarning("Failed to auto-lock tenant {TenantId}: {Error}", 
                                tenant.Id, result.Error?.Description);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error auto-locking tenant {TenantId}", tenant.Id);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CheckAndLockExpiredSubscriptionsAsync");
            }
        }
    }

    private async Task CheckAndUnlockExpiredLocksAsync(CancellationToken stoppingToken)
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            try
            {
                var context = scope.ServiceProvider.GetRequiredService<TenantDbContext>();
                var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

                // Tìm các tenants đang bị khóa và đã quá hạn khóa
                var now = DateTime.UtcNow;
                var tenantsToUnlock = await context.Tenants
                    .Where(t => t.IsLocked && t.LockedUntilUtc.HasValue && t.LockedUntilUtc.Value <= now)
                    .ToListAsync(stoppingToken);

                if (tenantsToUnlock.Count == 0)
                {
                    _logger.LogInformation("No expired locks found to auto-unlock");
                    return;
                }

                _logger.LogInformation("Found {Count} expired locks. Starting auto-unlock...", tenantsToUnlock.Count);

                foreach (var tenant in tenantsToUnlock)
                {
                    try
                    {
                        var result = await mediator.Send(new ToggleTenantLockCommand(
                            TenantId: tenant.Id,
                            IsLocked: false),
                            stoppingToken);

                        if (result.IsSuccess)
                        {
                            _logger.LogInformation("Auto-unlocked tenant {TenantId} ({TenantName}) because lock duration expired",
                                tenant.Id, tenant.Name);
                        }
                        else
                        {
                            _logger.LogWarning("Failed to auto-unlock tenant {TenantId}: {Error}",
                                tenant.Id, result.Error?.Description);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error auto-unlocking tenant {TenantId}", tenant.Id);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CheckAndUnlockExpiredLocksAsync");
            }
        }
    }
}
