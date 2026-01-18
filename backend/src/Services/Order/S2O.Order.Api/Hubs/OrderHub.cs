using Microsoft.AspNetCore.SignalR;

namespace S2O.Order.Api.Hubs;

public class OrderHub : Hub
{
    // Frontend (Màn hình bếp) sẽ gọi hàm này để tham gia vào "Room" của chi nhánh mình
    public async Task JoinBranch(string branchId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, branchId);
        await Clients.Caller.SendAsync("ReceiveMessage", "System", $"Đã tham gia kênh thông báo chi nhánh: {branchId}");
    }
}