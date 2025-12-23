using Microsoft.EntityFrameworkCore;
using S2O.AIService.Data;

namespace S2O.AIService.Services;

public sealed class RestaurantToolsService
{
    private readonly AppDbContext _db;

    public RestaurantToolsService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<string> GetOpenHoursJsonAsync(string tenantId, string restaurantId)
    {
        var r = await _db.Restaurants
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.TenantId == tenantId && x.RestaurantId == restaurantId);

        return r?.OpenHoursJson ?? "{}";
    }

    public async Task<object> CheckMenuAvailabilityAsync(string tenantId, string restaurantId, string message)
    {
        // demo: tìm món theo "contains" trong message
        var items = await _db.MenuItems.AsNoTracking()
            .Where(x => x.TenantId == tenantId && x.RestaurantId == restaurantId)
            .ToListAsync();

        var matched = items
            .Where(i => message.Contains(i.Name, StringComparison.OrdinalIgnoreCase))
            .Select(i => new { i.Name, i.IsAvailable, i.Price })
            .ToList();

        if (matched.Count == 0)
        {
            // nếu không detect được món -> trả danh sách món đang available (gọn)
            var availableTop = items.Where(i => i.IsAvailable).Take(10)
                .Select(i => new { i.Name, i.Price }).ToList();
            return new { matched = new List<object>(), suggestionAvailableTop10 = availableTop };
        }

        return new { matched };
    }

    public async Task<object> GetTableAvailabilityAsync(string tenantId, string restaurantId)
    {
        var counts = await _db.Tables.AsNoTracking()
            .Where(x => x.TenantId == tenantId && x.RestaurantId == restaurantId)
            .GroupBy(x => x.Status)
            .Select(g => new { Status = g.Key.ToString(), Count = g.Count() })
            .ToListAsync();

        return new { summary = counts };
    }

    public async Task<object> GetBestSellersAsync(string tenantId, string restaurantId, int rangeDays = 7)
    {
        var since = DateTime.UtcNow.AddDays(-rangeDays);

        var top = await _db.Orders.AsNoTracking()
            .Where(o => o.TenantId == tenantId && o.RestaurantId == restaurantId && o.CreatedAt >= since)
            .SelectMany(o => o.Items)
            .GroupBy(i => i.ItemName)
            .Select(g => new { ItemName = g.Key, Qty = g.Sum(x => x.Qty) })
            .OrderByDescending(x => x.Qty)
            .Take(5)
            .ToListAsync();

        return new { rangeDays, top5 = top };
    }
}
